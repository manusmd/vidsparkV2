"use client";
import React from "react";
import PricingTable from "@/components/sections/PricingTable.component";
import { Card } from "@/components/ui/card";

export default function PricingSection() {
  return (
    <div
      id={"pricing"}
      className="w-full flex justify-center items-center py-12"
    >
      <Card className="w-full max-w-6xl bg-gray-900 text-white shadow-lg rounded-xl p-8">
        <PricingTable />
      </Card>
    </div>
  );
}
