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
      className="relative flex flex-row items-center bg-zinc-900/60 border-zinc-800 rounded-lg hover:bg-zinc-800/60 transition-all duration-200 w-full mx-auto overflow-hidden group"
    >
      {/* Drag handle on the far left */}
      <div
        {...attributes}
        {...listeners}
        className="p-4 cursor-grab flex items-center"
      >
        <GripVertical className="w-5 h-5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
      </div>

      {/* Image thumbnail (if available) */}
      {content.imageUrl && (
        <div className="relative h-32 w-56 shrink-0 overflow-hidden bg-zinc-950/60 mr-5 rounded border border-zinc-800 shadow-md">
          <img
            src={content.imageUrl}
            alt={content.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col space-y-1 w-full overflow-hidden p-4">
        <h4 className="font-medium text-lg text-white truncate">{content.title}</h4>
        <p
          className="text-sm text-zinc-400 truncate"
          title={content.description}
        >
          {content.description}
        </p>
        {content.examples.length > 0 && (
          <p
            className="text-xs text-zinc-500 truncate"
            title={content.examples.join(", ")}
          >
            <span className="text-zinc-400">Examples:</span> {content.examples.join(", ")}
          </p>
        )}
        {content.prompt && (
          <p
            className="text-xs text-zinc-500 truncate"
            title={content.prompt}
          >
            <span className="text-zinc-400">Prompt:</span> {content.prompt}
          </p>
        )}
        {content.recommendedVoiceId && (
          <p className="text-xs text-zinc-500">
            <span className="text-zinc-400">Voice:</span>{" "}
            {voices.find((v) => v.id === content.recommendedVoiceId)?.name}
          </p>
        )}
      </div>

      {/* Edit and Delete Buttons */}
      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => onEdit(content)}
          className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-white h-8 w-8"
        >
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => onDelete(content.id)}
          className="bg-red-900/50 hover:bg-red-900 text-white border-none h-8 w-8"
        >
          <Trash className="w-3.5 h-3.5" />
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
