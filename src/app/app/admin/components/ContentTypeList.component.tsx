"use client";

import React from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash, Pencil, GripVertical } from "lucide-react";
import type { ContentType } from "@/app/types";

interface DraggableContentTypeListProps {
  contentTypes: ContentType[];
  voices: { id: string; name: string }[];
  onEdit: (content: ContentType) => void;
  onDelete: (id: string) => void;
  onOrderUpdate: (updatedTypes: ContentType[]) => void;
}

interface SortableItemProps {
  content: ContentType;
  voices: { id: string; name: string }[];
  onEdit: (content: ContentType) => void;
  onDelete: (id: string) => void;
}

function SortableItem({
  content,
  voices,
  onEdit,
  onDelete,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: content.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="relative flex flex-row items-center border border-border rounded-lg hover:bg-muted/10 transition w-full mx-auto"
    >
      {/* Drag handle on the far left */}
      <div
        {...attributes}
        {...listeners}
        className="p-4 cursor-grab flex items-center"
      >
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </div>

      {/* Main content */}
      <div className="flex flex-col space-y-1 w-full overflow-hidden p-4">
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

      {/* Edit and Delete Buttons (top-right) */}
      <div className="absolute top-2 right-2 flex gap-2">
        <Button variant="outline" size="icon" onClick={() => onEdit(content)}>
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
  );
}

export function DraggableContentTypeList({
  contentTypes,
  voices,
  onEdit,
  onDelete,
  onOrderUpdate,
}: DraggableContentTypeListProps) {
  // Sort by 'order' so the lowest order is at the top
  const sortedTypes = [...contentTypes].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedTypes.findIndex((item) => item.id === active.id);
    const newIndex = sortedTypes.findIndex((item) => item.id === over.id);

    const reordered = arrayMove(sortedTypes, oldIndex, newIndex);
    // Reassign order property from 0..N
    const updated = reordered.map((ct, index) => ({
      ...ct,
      order: index,
    }));
    onOrderUpdate(updated);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedTypes.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {sortedTypes.map((content) => (
            <SortableItem
              key={content.id}
              content={content}
              voices={voices}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
