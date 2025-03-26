import React, { useEffect, useState } from "react";
import {
  StripeProduct,
  useStripeProducts,
} from "@/contexts/StripeProductsContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit, Loader2, Plus } from "lucide-react";
import { FeatureForm } from "./FeatureForm";
import Stripe from "stripe";

export function AllFeaturesList() {
  const {
    getAllFeatures,
    products,
    createProductFeature,
    updateProductFeature,
    createGeneralFeature,
    updateGeneralFeature,
    assignFeatureToProduct,
  } = useStripeProducts();

  const [allFeatures, setAllFeatures] = useState<Stripe.Entitlements.Feature[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // State for feature form
  const [featureFormOpen, setFeatureFormOpen] = useState(false);
  const [editingFeature, setEditingFeature] =
    useState<Stripe.Entitlements.Feature | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<StripeProduct | null>(
    null,
  );
  const [isSubmittingFeature, setIsSubmittingFeature] = useState(false);
  const [isCreatingGeneralFeature, setIsCreatingGeneralFeature] =
    useState(false);
  const [featureTypeModalOpen, setFeatureTypeModalOpen] = useState(false);

  // State for assigning feature to product
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [featureToAssign, setFeatureToAssign] =
    useState<Stripe.Entitlements.Feature | null>(null);
  const [isAssigningFeature, setIsAssigningFeature] = useState(false);

  // Fetch all features when the component mounts
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        setLoading(true);
        setError(null);
        const features = await getAllFeatures();
        setAllFeatures(features);
      } catch (err) {
        console.error("Error fetching all features:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchFeatures();
  }, [getAllFeatures]);

  // Handler for adding a new feature
  const handleAddFeature = () => {
    setEditingFeature(null);
    setSelectedProduct(null);
    setIsCreatingGeneralFeature(true);
    setFeatureFormOpen(true);
  };

  // Handler for creating a general feature
  const handleCreateGeneralFeature = () => {
    setIsCreatingGeneralFeature(true);
    setFeatureTypeModalOpen(false);
    setFeatureFormOpen(true);
  };

  // Handler for creating a product-specific feature
  const handleCreateProductFeature = () => {
    setIsCreatingGeneralFeature(false);
    setFeatureTypeModalOpen(false);
    setFeatureFormOpen(true);
  };

  // Handler for editing a feature
  const handleEditFeature = (feature: Stripe.Entitlements.Feature) => {
    setEditingFeature(feature);

    // Find the product that contains this feature
    const productWithFeature = products.find((product) =>
      product.features?.some((f) => f.id === feature.id),
    );

    setSelectedProduct(productWithFeature || null);
    setFeatureFormOpen(true);
  };

  // Handler for feature form submission
  const handleFeatureSubmit = async (data: Record<string, unknown>) => {
    try {
      setIsSubmittingFeature(true);

      if (editingFeature && selectedProduct) {
        // Update existing product feature
        await updateProductFeature(selectedProduct.id, editingFeature.id, data);
      } else if (editingFeature) {
        // Update existing general feature
        await updateGeneralFeature(editingFeature.id, data);
      } else if (isCreatingGeneralFeature) {
        // Create new general feature
        await createGeneralFeature(data);
      } else if (selectedProduct) {
        // Create new product feature
        await createProductFeature(selectedProduct.id, data);
      } else {
        throw new Error(
          "No product selected and not creating a general feature",
        );
      }

      // Refresh features
      const features = await getAllFeatures();
      setAllFeatures(features);

      // Close form
      setFeatureFormOpen(false);
    } catch (err) {
      console.error("Error saving feature:", err);
      alert(
        `Failed to ${editingFeature ? "update" : "create"} feature. Please try again.`,
      );
    } finally {
      setIsSubmittingFeature(false);
    }
  };

  // Handler for assigning a feature to a product
  const handleAssignFeature = (feature: Stripe.Entitlements.Feature) => {
    setFeatureToAssign(feature);
    setAssignModalOpen(true);
  };

  // Handler for assigning feature to product confirmation
  const handleAssignFeatureConfirm = async (productId: string) => {
    if (!featureToAssign) return;

    try {
      setIsAssigningFeature(true);
      await assignFeatureToProduct(productId, featureToAssign.id);

      // Refresh features
      const features = await getAllFeatures();
      setAllFeatures(features);

      // Close modal
      setAssignModalOpen(false);
    } catch (err) {
      console.error("Error assigning feature to product:", err);
      alert("Failed to assign feature to product. Please try again.");
    } finally {
      setIsAssigningFeature(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading features...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
        <p className="font-semibold">Error loading features</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>All Product Features</CardTitle>
          <CardDescription>
            A list of all features across all products
          </CardDescription>
        </div>
        <Button className="flex items-center gap-1" onClick={handleAddFeature}>
          <Plus className="h-4 w-4" />
          <span>Add Feature</span>
        </Button>
      </CardHeader>
      <CardContent>
        {allFeatures.length === 0 ? (
          <div className="text-center py-8 border border-dashed rounded-md">
            <p className="text-muted-foreground">
              No features found across all products
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allFeatures.map((feature) => (
                <TableRow key={feature.id}>
                  <TableCell className="font-medium">{feature.name}</TableCell>
                  <TableCell>{feature.lookup_key}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        title="Assign to Product"
                        onClick={() => handleAssignFeature(feature)}
                      >
                        <Plus className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        title="Edit Feature"
                        onClick={() => handleEditFeature(feature)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Feature Form Modal */}
      {(selectedProduct || isCreatingGeneralFeature) && (
        <FeatureForm
          isOpen={featureFormOpen}
          onClose={() => setFeatureFormOpen(false)}
          onSubmit={handleFeatureSubmit}
          feature={editingFeature || undefined}
          product={selectedProduct || undefined}
          isSubmitting={isSubmittingFeature}
          title={editingFeature ? "Edit Feature" : "Add Feature"}
        />
      )}

      {/* Feature Type Selection Modal */}
      <Dialog
        open={featureTypeModalOpen}
        onOpenChange={setFeatureTypeModalOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Feature</DialogTitle>
            <DialogDescription>
              Choose the type of feature you want to create
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button
              variant="outline"
              className="justify-start"
              onClick={handleCreateGeneralFeature}
            >
              Create General Feature
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={handleCreateProductFeature}
            >
              Create Product-Specific Feature
            </Button>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFeatureTypeModalOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Selection Modal for Adding Feature */}
      {featureFormOpen && !selectedProduct && !isCreatingGeneralFeature && (
        <Dialog open={featureFormOpen} onOpenChange={setFeatureFormOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Select Product</DialogTitle>
              <DialogDescription>
                Select a product to add a feature to
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {products.map((product) => (
                <Button
                  key={product.id}
                  variant="outline"
                  className="justify-start"
                  onClick={() => setSelectedProduct(product)}
                >
                  {product.name}
                </Button>
              ))}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setFeatureFormOpen(false)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Assign Feature to Product Modal */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Feature to Product</DialogTitle>
            <DialogDescription>
              Select a product to assign the feature &quot;
              {featureToAssign?.name}&quot; to
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {products.map((product) => (
              <Button
                key={product.id}
                variant="outline"
                className="justify-start"
                onClick={() => handleAssignFeatureConfirm(product.id)}
                disabled={isAssigningFeature}
              >
                {product.name}
              </Button>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignModalOpen(false)}
              disabled={isAssigningFeature}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
