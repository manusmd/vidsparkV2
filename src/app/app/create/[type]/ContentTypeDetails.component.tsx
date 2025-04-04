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
      <div className="md:flex items-start gap-4 mb-6">
        <div className="flex-shrink-0 mb-4 md:mb-0">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Video className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div>
          <div className="flex flex-wrap gap-2 items-center mb-2">
            <h1 className="text-2xl font-bold">{contentType.title}</h1>
          </div>
          <p className="text-muted-foreground max-w-xl">{contentType.description}</p>
        </div>
      </div>

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
