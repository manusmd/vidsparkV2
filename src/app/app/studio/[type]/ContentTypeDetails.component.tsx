"use client";

import { Card } from "@/components/ui/card";
import { ContentType } from "@/app/types";
import { Loader2, BookOpen, Info, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <header className="max-w-2xl mx-auto text-center mb-8 space-y-4">
        {contentType.imageUrl ? (
          <div className="mx-auto w-24 h-24 rounded-lg overflow-hidden mb-4">
            <img
              src={contentType.imageUrl}
              alt={contentType.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <Video className="mx-auto w-12 h-12 text-primary" />
        )}
        <h1 className="text-3xl font-bold tracking-tight">{contentType.title}</h1>
        <p className="text-muted-foreground">{contentType.description}</p>
      </header>

      <Card className="p-6 bg-card/50 border border-border/50 backdrop-blur-sm">
        <div className="flex items-center mb-3 text-primary">
          <BookOpen className="h-5 w-5 mr-2" />
          <h3 className="text-base font-medium">Example Stories</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          {contentType.examples.map((example: string, index: number) => (
            <div 
              key={index}
              className="relative bg-muted/40 rounded-lg p-4 text-sm text-muted-foreground border border-border/50"
            >
              <Badge variant="outline" className="absolute -top-2 -left-2 text-xs bg-background">
                Example {index + 1}
              </Badge>
              {example}
            </div>
          ))}
        </div>
        
        <div className="mt-4 flex items-center text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5 mr-1" />
          <span>These examples show the type of content that can be created</span>
        </div>
      </Card>
    </motion.div>
  );
}
