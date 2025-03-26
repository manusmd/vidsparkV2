"use client";

import React, { useState } from "react";
import {
  StripePrice,
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, ListChecks, Loader2, Plus, Tag, Trash2 } from "lucide-react";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { ProductForm } from "./ProductForm";
import { PricesList } from "./PricesList";
import { PriceForm } from "./PriceForm";
import { FeaturesList } from "./FeaturesList";
import { AllFeaturesList } from "./AllFeaturesList";

export default function ProductsList() {
  const {
    products,
    loading,
    error,
    deleteProduct,
    createProduct,
    updateProduct,
    createPrice,
    updatePrice,
  } = useStripeProducts();

  // State for product operations
  const [deletingProductId, setDeletingProductId] = useState<string | null>(
    null,
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<StripeProduct | null>(
    null,
  );
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StripeProduct | null>(
    null,
  );
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  // State for price operations
  const [viewingPricesForProduct, setViewingPricesForProduct] =
    useState<StripeProduct | null>(null);
  const [priceFormOpen, setPriceFormOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<StripePrice | null>(null);
  const [isSubmittingPrice, setIsSubmittingPrice] = useState(false);

  // State for feature operations
  const [viewingFeaturesForProduct, setViewingFeaturesForProduct] =
    useState<StripeProduct | null>(null);

  // Handle product deletion
  const handleDeleteClick = (product: StripeProduct) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      setDeletingProductId(productToDelete.id);
      await deleteProduct(productToDelete.id);
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error; // Let the modal handle the error
    } finally {
      setDeletingProductId(null);
      setProductToDelete(null);
    }
  };

  // Handle product form operations
  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductFormOpen(true);
  };

  const handleEditProduct = (product: StripeProduct) => {
    setEditingProduct(product);
    setProductFormOpen(true);
  };

  const handleProductSubmit = async (data: Record<string, unknown>) => {
    try {
      setIsSubmittingProduct(true);
      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
      } else {
        await createProduct(data);
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert(
        `Failed to ${editingProduct ? "update" : "create"} product. Please try again.`,
      );
      throw error;
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  // Handle price operations
  const handleViewPrices = (product: StripeProduct) => {
    setViewingPricesForProduct(product);
    setViewingFeaturesForProduct(null);
  };

  const handleBackToProdcuts = () => {
    setViewingPricesForProduct(null);
    setEditingPrice(null);
    setPriceFormOpen(false);
    setViewingFeaturesForProduct(null);
  };

  const handleAddPrice = () => {
    setEditingPrice(null);
    setPriceFormOpen(true);
  };

  const handleEditPrice = (price: StripePrice) => {
    setEditingPrice(price);
    setPriceFormOpen(true);
  };

  const handlePriceSubmit = async (data: Record<string, unknown>) => {
    if (!viewingPricesForProduct) return;

    try {
      setIsSubmittingPrice(true);
      if (editingPrice) {
        await updatePrice(editingPrice.id, data);
      } else {
        await createPrice(viewingPricesForProduct.id, data);
      }
    } catch (error) {
      console.error("Error saving price:", error);
      alert(
        `Failed to ${editingPrice ? "update" : "create"} price. Please try again.`,
      );
      throw error;
    } finally {
      setIsSubmittingPrice(false);
    }
  };

  // Handle feature operations
  const handleViewFeatures = (product: StripeProduct) => {
    setViewingFeaturesForProduct(product);
    setViewingPricesForProduct(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading products...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
        <p className="font-semibold">Error loading products</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  // If viewing prices for a specific product
  if (viewingPricesForProduct) {
    return (
      <>
        <PricesList
          product={viewingPricesForProduct}
          onBack={handleBackToProdcuts}
          onAddPrice={handleAddPrice}
          onEditPrice={handleEditPrice}
        />

        {/* Price Form Modal */}
        {viewingPricesForProduct && (
          <PriceForm
            isOpen={priceFormOpen}
            onClose={() => setPriceFormOpen(false)}
            onSubmit={handlePriceSubmit}
            price={editingPrice || undefined}
            product={viewingPricesForProduct}
            isSubmitting={isSubmittingPrice}
            title={editingPrice ? "Edit Price" : "Add Price"}
          />
        )}
      </>
    );
  }

  // If viewing features for a specific product
  if (viewingFeaturesForProduct) {
    return (
      <>
        <FeaturesList
          product={viewingFeaturesForProduct}
          onBack={handleBackToProdcuts}
        />
      </>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Products</CardTitle>
            <CardDescription>
              Manage your Stripe products and their prices
            </CardDescription>
          </div>
          <Button
            className="flex items-center gap-1"
            onClick={handleAddProduct}
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </Button>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-md">
              <p className="text-muted-foreground">No products found</p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={handleAddProduct}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create your first product
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prices</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <React.Fragment key={product.id}>
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{product.name}</span>
                          {product.description && (
                            <span className="text-xs text-muted-foreground">
                              {product.description}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={product.active ? "default" : "secondary"}
                          className={
                            product.active ? "bg-green-500" : "bg-gray-500"
                          }
                        >
                          {product.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {product.prices?.length || 0} price(s)
                      </TableCell>
                      <TableCell>
                        {new Date(product.created * 1000).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            title="View Prices"
                            onClick={() => handleViewPrices(product)}
                          >
                            <Tag className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            title="View Features"
                            onClick={() => handleViewFeatures(product)}
                          >
                            <ListChecks className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            title="Edit Product"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            title="Delete Product"
                            onClick={() => handleDeleteClick(product)}
                            disabled={deletingProductId === product.id}
                          >
                            {deletingProductId === product.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-destructive" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* All Features List */}
      <AllFeaturesList />

      {/* Product Form Modal */}
      <ProductForm
        isOpen={productFormOpen}
        onClose={() => setProductFormOpen(false)}
        onSubmit={handleProductSubmit}
        product={editingProduct || undefined}
        isSubmitting={isSubmittingProduct}
        title={editingProduct ? "Edit Product" : "Add Product"}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        description={`Are you sure you want to delete ${productToDelete?.name || "this product"}? This will archive the product in Stripe and it will no longer be available for purchase.`}
        isDeleting={!!deletingProductId}
      />
    </>
  );
}
