"use client";
import React, { useState } from "react";
import { useCredits } from "@/hooks/useCredits";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReloadIcon } from "@radix-ui/react-icons";
import { BsCreditCard } from "react-icons/bs";
import { formatDistanceToNow } from "date-fns";

export default function CreditsPage() {
  const { credits, transactions, packages, isLoading, purchaseCredits } =
    useCredits();
  const [purchasingPackageId, setPurchasingPackageId] = useState<string | null>(
    null,
  );

  // Handle credit purchase
  const handlePurchase = async (packageId: string) => {
    try {
      setPurchasingPackageId(packageId);
      const checkoutUrl = await purchaseCredits(packageId);
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Error purchasing credits:", error);
      alert("Failed to initiate purchase. Please try again.");
    } finally {
      setPurchasingPackageId(null);
    }
  };

  // Format transaction date
  const formatTransactionDate = (
    timestamp: { toDate?: () => Date } | Date | number | string,
  ) => {
    if (!timestamp) return "Unknown";

    let date: Date;

    if (
      typeof timestamp === "object" &&
      "toDate" in timestamp &&
      typeof timestamp.toDate === "function"
    ) {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === "number" || typeof timestamp === "string") {
      date = new Date(timestamp);
    } else {
      // Fallback for any other case
      date = new Date();
    }

    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Get transaction type display
  const getTransactionTypeDisplay = (type: string) => {
    switch (type) {
      case "purchase":
        return "Purchase";
      case "usage":
        return "Usage";
      case "refund":
        return "Refund";
      case "expiration":
        return "Expiration";
      case "plan_allocation":
        return "Plan Allocation";
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <ReloadIcon className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Credits Management</h1>

      {/* Credits Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Credits</CardTitle>
          <CardDescription>
            Use credits to create and publish videos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
              <BsCreditCard className="h-8 w-8 text-white" />
            </div>
            <div>
              <div className="text-3xl font-bold">
                {credits?.availableCredits || 0} Credits
              </div>
              <div className="text-sm text-muted-foreground">
                Lifetime: {credits?.lifetimeCredits || 0} Credits
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Packages and Transactions */}
      <Tabs defaultValue="packages" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="packages">Buy Credits</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
        </TabsList>

        {/* Credit Packages */}
        <TabsContent value="packages">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <Card key={pkg.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  <CardTitle>{pkg.name}</CardTitle>
                  <CardDescription className="text-white opacity-90">
                    {pkg.credits} Credits
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold mb-2">
                    ${(pkg.price / 100).toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground mb-4">
                    ${(pkg.price / 100 / pkg.credits).toFixed(2)} per credit
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={purchasingPackageId === pkg.id}
                  >
                    {purchasingPackageId === pkg.id ? (
                      <>
                        <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Purchase"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Transaction History */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Your recent credit transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No transactions yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((transaction) => (
                      <TableRow key={transaction.paymentId}>
                        <TableCell>
                          {formatTransactionDate(transaction.createdAt)}
                        </TableCell>
                        <TableCell>
                          {getTransactionTypeDisplay(transaction.type)}
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell
                          className={`text-right ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {transaction.amount > 0 ? "+" : ""}
                          {transaction.amount}
                        </TableCell>
                        <TableCell className="text-right">
                          {transaction.balance}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
