"use client";

import React from "react";
import { Card } from "@/components/ui/card";

export function EmptyState() {
  return (
    <Card className="p-8 border-2 border-dashed border-indigo-200">
      <div className="text-center py-12 max-w-md mx-auto">
        <div className="bg-indigo-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-3 text-gray-800">Select a YouTube Channel</h3>
        <p className="text-gray-600 mb-6">Choose a channel from the dropdown above to view detailed analytics and performance metrics for your content.</p>
        <div className="flex justify-center">
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100 max-w-sm">
            <p className="text-sm text-indigo-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>You can switch between different channels at any time to compare their performance.</span>
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default EmptyState;