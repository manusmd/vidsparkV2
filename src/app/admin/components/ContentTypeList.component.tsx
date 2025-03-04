"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash, Pencil } from "lucide-react";
import { ContentType } from "@/app/types";

interface ContentTypeListProps {
  contentTypes: ContentType[];
  voices: { id: string; name: string }[];
  onEdit: (content: ContentType) => void;
  onDelete: (id: string) => void;
}

export function ContentTypeList({
  contentTypes,
  voices,
  onEdit,
  onDelete,
}: ContentTypeListProps) {
  return (
    <div className="space-y-4">
      {contentTypes.map((content) => (
        <Card
          key={content.id}
          className="p-4 flex justify-between items-center border border-border rounded-lg hover:bg-muted/10 transition w-full mx-auto"
        >
          <div className="flex flex-col space-y-1 w-full overflow-hidden">
            <h4 className="font-semibold text-lg truncate">{content.title}</h4>
            <p
              className="text-sm text-muted-foreground truncate"
              title={content.description}
            >
              {content.description}
            </p>
            {content.examples.length > 0 && (
              <p
                className="text-xs text-muted-foreground truncate"
                title={content.examples.join(", ")}
              >
                <strong>Examples:</strong> {content.examples.join(", ")}
              </p>
            )}
            {content.prompt && (
              <p
                className="text-xs text-muted-foreground truncate"
                title={content.prompt}
              >
                <strong>Prompt:</strong> {content.prompt}
              </p>
            )}
            {content.recommendedVoiceId && (
              <p className="text-xs text-muted-foreground">
                <strong>Recommended Voice:</strong>{" "}
                {voices.find((v) => v.id === content.recommendedVoiceId)?.name}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit(content)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => onDelete(content.id)}
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
