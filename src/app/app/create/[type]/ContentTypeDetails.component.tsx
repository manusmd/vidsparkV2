"use client";

import { Card } from "@/components/ui/card";
import { ContentType } from "@/app/types";
import { Loader2 } from "lucide-react";

export function ContentTypeDetails({
  contentType,
}: {
  contentType: ContentType | null;
}) {
  if (!contentType) {
    return (
      <Card className="p-6 flex items-center justify-center">
        <Loader2 className="animate-spin w-6 h-6" />
        <span className="ml-2">Loading content type...</span>
      </Card>
    );
  }

  return (
    <>
      <h1 className="text-4xl font-bold">{contentType.title}</h1>
      <p className="text-lg text-muted-foreground">{contentType.description}</p>
      {/* Examples */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold">Example Stories</h3>
        <ul className="list-disc pl-4 text-sm text-muted-foreground">
          {contentType.examples.map((example: string, index: number) => (
            <li key={index}>{example}</li>
          ))}
        </ul>
      </Card>
    </>
  );
}
