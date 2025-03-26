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
import { ArrowLeft, ListPlus, Loader2, Trash2 } from "lucide-react";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import Stripe from "stripe";

interface FeaturesListProps {
  product: StripeProduct;
  onBack: () => void;
}

export function FeaturesList({ product, onBack }: FeaturesListProps) {
  const {
    getProductFeatures,
    deleteProductFeature,
    getAllFeatures,
    assignFeatureToProduct,
  } = useStripeProducts();
  const [features, setFeatures] =
    useState<Stripe.ApiList<Stripe.ProductFeature> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [deletingFeatureId, setDeletingFeatureId] = useState<string | null>(
    null,
  );

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [featureToDelete, setFeatureToDelete] =
    useState<Stripe.ProductFeature | null>(null);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [allFeatures, setAllFeatures] = useState<Stripe.Entitlements.Feature[]>(
    [],
  );
  const [loadingAllFeatures, setLoadingAllFeatures] = useState(false);
  const [assigningFeature, setAssigningFeature] = useState(false);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedFeatures = await getProductFeatures(product.id);
        setFeatures(fetchedFeatures);
      } catch (err) {
        console.error("Error fetching features:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchFeatures();
  }, [product.id, getProductFeatures]);

  const handleDeleteClick = (feature: Stripe.ProductFeature) => {
    setFeatureToDelete(feature);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!featureToDelete) return;

    try {
      setDeletingFeatureId(featureToDelete.id);
      await deleteProductFeature(product.id, featureToDelete.id);

      if (features && features.data) {
        setFeatures({
          ...features,
          data: features.data.filter((f) => f.id !== featureToDelete.id),
        });
      }
    } catch (error) {
      console.error("Error deleting feature:", error);
      throw error; // Let the modal handle the error
    } finally {
      setDeletingFeatureId(null);
      setFeatureToDelete(null);
    }
  };

  const handleAssignFeatureClick = async () => {
    try {
      setLoadingAllFeatures(true);
      const fetchedFeatures = await getAllFeatures();
      setAllFeatures(fetchedFeatures);
      setAssignModalOpen(true);
    } catch (err) {
      console.error("Error fetching all features:", err);
      alert("Failed to load features. Please try again.");
    } finally {
      setLoadingAllFeatures(false);
    }
  };

  const handleAssignFeature = async (featureId: string) => {
    try {
      setAssigningFeature(true);
      await assignFeatureToProduct(product.id, featureId);

      const fetchedFeatures = await getProductFeatures(product.id);
      setFeatures(fetchedFeatures);

      setAssignModalOpen(false);
    } catch (err) {
      console.error("Error assigning feature to product:", err);
      alert("Failed to assign feature to product. Please try again.");
    } finally {
      setAssigningFeature(false);
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <Button variant="outline" size="sm" onClick={onBack} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
          <CardTitle>Features for {product.name}</CardTitle>
          <CardDescription>Manage features for this product</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            className="flex items-center gap-1"
            variant="outline"
            onClick={handleAssignFeatureClick}
          >
            <ListPlus className="h-4 w-4" />
            <span>Assign Feature</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!features || !features.data || features.data.length === 0 ? (
          <div className="text-center py-8 border border-dashed rounded-md">
            <p className="text-muted-foreground">
              No features found for this product
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {features &&
                features.data &&
                features.data.map((feature) => (
                  <TableRow key={feature.id}>
                    <TableCell className="font-medium">
                      {feature.entitlement_feature?.name}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          title="Delete Feature"
                          onClick={() => handleDeleteClick(feature)}
                          disabled={deletingFeatureId === feature.id}
                        >
                          {deletingFeatureId === feature.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Feature"
        description={`Are you sure you want to delete the feature "${featureToDelete?.entitlement_feature?.name || ""}"? This action cannot be undone.`}
        isDeleting={!!deletingFeatureId}
      />

      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Feature to {product.name}</DialogTitle>
            <DialogDescription>
              Select a feature to assign to this product
            </DialogDescription>
          </DialogHeader>

          {loadingAllFeatures ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Loading features...</span>
            </div>
          ) : (
            <div className="grid gap-4 py-4 max-h-[400px] overflow-y-auto">
              {allFeatures.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  No features available to assign
                </p>
              ) : (
                allFeatures.map((feature) => (
                  <Button
                    key={feature.id}
                    variant="outline"
                    className="justify-start"
                    onClick={() => handleAssignFeature(feature.id)}
                    disabled={assigningFeature}
                  >
                    {feature.name}
                    {feature.lookup_key && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({feature.lookup_key})
                      </span>
                    )}
                  </Button>
                ))
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignModalOpen(false)}
              disabled={assigningFeature}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
