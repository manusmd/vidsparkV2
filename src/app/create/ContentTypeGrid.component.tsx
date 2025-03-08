"use client";
import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Ghost, Scale, History, Brain } from "lucide-react";
import { ContentType } from "@/app/types";

interface ContentTypeGridProps {
  contentTypes: ContentType[];
}

export default function ContentTypeGrid({
  contentTypes,
}: ContentTypeGridProps) {
  return (
    <div className="grid gap-6 w-full">
      {/* Predefined Content Types */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {contentTypes.map((type) => {
          const Icon =
            {
              horror: Ghost,
              "true-crime": Scale,
              history: History,
              facts: Brain,
            }[type.id] || Ghost;
          return (
            <Link key={type.id} href={`/create/${type.id}`} className="group">
              <Card className="relative overflow-hidden p-6 bg-card text-card-foreground hover:border-primary transition-colors cursor-pointer flex flex-col justify-between h-full min-h-[220px]">
                <div className="flex flex-col items-center text-center flex-1">
                  <Icon className="w-12 h-12 group-hover:text-primary transition-colors" />
                  <div className="mt-4">
                    <h3 className="font-semibold">{type.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                      {type.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
      {/* Separator */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase text-muted-foreground">
          <span className="bg-background px-2">Or</span>
        </div>
      </div>
      {/* Custom Story Input (Always Visible) */}
      <Card className="p-6 bg-card text-card-foreground border border-border shadow-md">
        <form
          action="/create/custom"
          method="GET"
          className="flex flex-col gap-4"
        >
          <div>
            <h3 className="font-semibold mb-2">Custom Story Prompt</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Describe the type of story you want to create. Be specific about
              the theme, style, and mood.
            </p>
            <Textarea
              name="prompt"
              placeholder="E.g., A mysterious urban legend about a haunted smartphone app..."
              className="w-full h-24 resize-none bg-background text-foreground border-border"
            />
          </div>
          <Button type="submit" className="self-start">
            Create
          </Button>
        </form>
      </Card>
    </div>
  );
}
