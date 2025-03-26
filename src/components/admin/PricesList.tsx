import React, { useState, useEffect } from "react";
import { useStripeProducts, StripePrice, StripeProduct } from "@/contexts/StripeProductsContext";
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
import { Edit, Trash2, Plus, ArrowLeft, Loader2 } from "lucide-react";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

interface PricesListProps {
  product: StripeProduct;
  onBack: () => void;
  onAddPrice: () => void;
  onEditPrice: (price: StripePrice) => void;
}

export function PricesList({ product, onBack, onAddPrice, onEditPrice }: PricesListProps) {
  const { getProductPrices, deletePrice } = useStripeProducts();
  const [prices, setPrices] = useState<StripePrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [deletingPriceId, setDeletingPriceId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [priceToDelete, setPriceToDelete] = useState<StripePrice | null>(null);

  // Fetch prices for the product
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedPrices = await getProductPrices(product.id);
        setPrices(fetchedPrices);
      } catch (err) {
        console.error("Error fetching prices:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, [product.id, getProductPrices]);

  // Handle price deletion
  const handleDeleteClick = (price: StripePrice) => {
    setPriceToDelete(price);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!priceToDelete) return;
    
    try {
      setDeletingPriceId(priceToDelete.id);
      await deletePrice(priceToDelete.id);
      
      // Remove the deleted price from the list
      setPrices(prices.filter(p => p.id !== priceToDelete.id));
    } catch (error) {
      console.error("Error deleting price:", error);
      throw error; // Let the modal handle the error
    } finally {
      setDeletingPriceId(null);
      setPriceToDelete(null);
    }
  };

  // Format currency amount
  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100);
  };

  // Format interval
  const formatInterval = (price: StripePrice) => {
    if (price.type !== 'recurring' || !price.recurring) return 'One-time';
    
    const { interval, interval_count } = price.recurring;
    const intervalStr = interval_count === 1 ? interval : `${interval_count} ${interval}s`;
    
    return `${intervalStr}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading prices...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
        <p className="font-semibold">Error loading prices</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onBack}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
          <CardTitle>Prices for {product.name}</CardTitle>
          <CardDescription>
            Manage pricing options for this product
          </CardDescription>
        </div>
        <Button className="flex items-center gap-1" onClick={onAddPrice}>
          <Plus className="h-4 w-4" />
          <span>Add Price</span>
        </Button>
      </CardHeader>
      <CardContent>
        {prices.length === 0 ? (
          <div className="text-center py-8 border border-dashed rounded-md">
            <p className="text-muted-foreground">No prices found for this product</p>
            <Button className="mt-4" variant="outline" onClick={onAddPrice}>
              <Plus className="h-4 w-4 mr-2" />
              Create your first price
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prices.map((price) => (
                <TableRow key={price.id}>
                  <TableCell className="font-medium">
                    {formatAmount(price.unit_amount, price.currency)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {formatInterval(price)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={price.active ? "default" : "secondary"}
                      className={price.active ? "bg-green-500" : "bg-gray-500"}
                    >
                      {price.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(price.created * 1000).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        title="Edit Price"
                        onClick={() => onEditPrice(price)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        title="Delete Price"
                        onClick={() => handleDeleteClick(price)}
                        disabled={deletingPriceId === price.id}
                      >
                        {deletingPriceId === price.id ? (
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Price"
        description={`Are you sure you want to delete this price? This will archive the price in Stripe and it will no longer be available for purchase.`}
        isDeleting={!!deletingPriceId}
      />
    </Card>
  );
}