"use client";

import React, { JSX, useState } from "react";
import { ChevronLeft, ChevronRight, Check, Type, Palette } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TextDesignVariant } from "./textDesigns";
import { TextDesignFonts, textDesignVariants } from "./textDesigns";
import { useTextDesign } from "@/hooks/useTextDesign";
import { z } from "zod";
import { TextDesignSchema } from "@/components/remotion/types/constants";
import { cn } from "@/lib/utils";

const fontOptions: Array<{
  value: string;
  label: string;
  style: React.CSSProperties;
}> = [
  {
    value: TextDesignFonts.ROBOTO,
    label: "Roboto",
    style: { fontFamily: "Roboto, sans-serif" },
  },
  {
    value: TextDesignFonts.LATO,
    label: "Lato",
    style: { fontFamily: "Lato, sans-serif" },
  },
  {
    value: TextDesignFonts.CAVEAT,
    label: "Caveat",
    style: { fontFamily: "Caveat, cursive" },
  },
  {
    value: TextDesignFonts.PLAYFAIR,
    label: "Playfair Display",
    style: { fontFamily: "Playfair Display, serif" },
  },
  {
    value: TextDesignFonts.DANCINGSCRIPT,
    label: "Dancing Script",
    style: { fontFamily: "Dancing Script, cursive" },
  },
];

const sampleText = "Your Video Text";

function getVariantStyle(variantKey: TextDesignVariant): React.CSSProperties {
  const variantStyle = textDesignVariants[variantKey];
  return {
    display: "inline-block",
    padding: "1rem",
    borderRadius: "0.5rem",
    textAlign: "center",
    fontWeight: "bold",
    cursor: "pointer",
    color: variantStyle.color,
    background: variantStyle.background,
    textShadow: variantStyle.textShadow,
    boxShadow: variantStyle.boxShadow,
    border: variantStyle.border,
    WebkitTextStroke: `1px ${variantStyle.stroke || "transparent"}`,
    fontSize: "1.5rem",
    transition: "filter 0.2s, transform 0.2s",
  };
}

function getFontStyle(fontValue: string): React.CSSProperties {
  const fontObj =
    fontOptions.find((f) => f.value === fontValue) || fontOptions[0];
  return {
    display: "inline-block",
    padding: "1rem",
    borderRadius: "0.5rem",
    textAlign: "center",
    fontWeight: "bold",
    cursor: "pointer",
    fontFamily: fontObj.style.fontFamily,
    fontSize: "1.5rem",
    transition: "filter 0.2s, transform 0.2s",
  };
}

function getCombinedPreviewStyle(
  variantKey: TextDesignVariant,
  fontValue: string,
): React.CSSProperties {
  const baseVariantStyle = getVariantStyle(variantKey);
  const baseFontStyle = getFontStyle(fontValue);
  return {
    ...baseVariantStyle,
    fontFamily: baseFontStyle.fontFamily,
  };
}

interface TextDesignSelectorProps {
  disabled?: boolean;
  initialDesign?: {
    font: string;
    variant: string;
  };
  onChange?: (design: { font: string; variant: string }) => void;
}

export function TextDesignSelector({
  disabled = false,
  initialDesign,
  onChange,
}: TextDesignSelectorProps): JSX.Element {
  const { styling: contextStyling, updateStyling } = useTextDesign();
  type FontType = z.infer<typeof TextDesignSchema>["font"];
  
  // Fallback to defaults if styling is not yet loaded
  // Use initialDesign if provided, otherwise use context styling
  const styling = initialDesign || contextStyling || { variant: "default", font: TextDesignFonts.ROBOTO };
  
  const currentVariant = (styling?.variant || "default") as TextDesignVariant;
  const currentFont = (styling?.font || TextDesignFonts.ROBOTO) as FontType;

  const variantKeys = Object.keys(textDesignVariants) as TextDesignVariant[];
  const currentVariantIndex = variantKeys.indexOf(currentVariant);
  const currentFontIndex =
    fontOptions.findIndex((f) => f.value === currentFont) || 0;

  const [activeTab, setActiveTab] = useState<string>("variant");

  // Handle style updates based on whether we're using internal or external state
  const handleStyleUpdate = (variant: TextDesignVariant, font: FontType) => {
    if (onChange) {
      // If onChange is provided, use it for external state management
      onChange({ 
        variant: variant || "default", 
        font: font || TextDesignFonts.ROBOTO 
      });
    } else {
      // Otherwise use the context's updateStyling
      updateStyling(variant, font).catch((err) => {
        console.error(err);
      });
    }
  };

  const handleVariantLeft = () => {
    if (disabled) return;
    const newIndex =
      (currentVariantIndex - 1 + variantKeys.length) % variantKeys.length;
    const newVariant = variantKeys[newIndex];
    handleStyleUpdate(newVariant, currentFont);
  };

  const handleVariantRight = () => {
    if (disabled) return;
    const newIndex = (currentVariantIndex + 1) % variantKeys.length;
    const newVariant = variantKeys[newIndex];
    handleStyleUpdate(newVariant, currentFont);
  };

  const handleFontLeft = () => {
    if (disabled) return;
    const newIndex =
      (currentFontIndex - 1 + fontOptions.length) % fontOptions.length;
    const newFont: FontType = fontOptions[newIndex].value as FontType;
    handleStyleUpdate(currentVariant, newFont);
  };

  const handleFontRight = () => {
    if (disabled) return;
    const newIndex = (currentFontIndex + 1) % fontOptions.length;
    const newFont: FontType = fontOptions[newIndex].value as FontType;
    handleStyleUpdate(currentVariant, newFont);
  };

  const selectedVariantKey = currentVariant;
  const selectedFont =
    fontOptions.find((f) => f.value === currentFont) || fontOptions[0];
  const combinedPreviewStyle = getCombinedPreviewStyle(
    selectedVariantKey,
    selectedFont.value,
  );

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">Text Design</CardTitle>
            <CardDescription>Customize the look of your video text</CardDescription>
          </div>
          <Badge className="bg-primary/20 text-primary hover:bg-primary/30 font-normal">
            <span className="capitalize">{selectedVariantKey}</span> Style
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Preview Area - Always visible at the top */}
        <div className="p-6 pt-3 pb-5 bg-gradient-to-b from-muted/50 to-background/50 border-y border-border/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0.01)_89.5%)] opacity-70"></div>
          
          {/* Simple text preview */}
          <div className="rounded-lg bg-muted/20 py-8 px-4 flex items-center justify-center shadow-sm backdrop-blur-[1px]">
            <div 
              style={{
                ...combinedPreviewStyle,
                fontSize: "2rem",
                padding: 0,
                width: "100%",
                textAlign: "center",
              }}
            >
              {sampleText}
            </div>
          </div>
        </div>
        
        {/* Tabs for Variant and Font selection */}
        <div className="px-4 pb-4 pt-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="variant" className="flex items-center justify-center gap-1.5">
                <Palette className="h-3.5 w-3.5" />
                Style
              </TabsTrigger>
              <TabsTrigger value="font" className="flex items-center justify-center gap-1.5">
                <Type className="h-3.5 w-3.5" />
                Font
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="variant" className="mt-0 pt-0 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <button
                  className="p-2 hover:bg-muted rounded-md transition-colors"
                  onClick={handleVariantLeft}
                  aria-label="Previous Variant"
                  disabled={disabled}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="font-medium text-sm">
                  {currentVariantIndex + 1} of {variantKeys.length}
                </div>
                <button
                  className="p-2 hover:bg-muted rounded-md transition-colors"
                  onClick={handleVariantRight}
                  aria-label="Next Variant"
                  disabled={disabled}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {variantKeys.map((key) => (
                  <div
                    key={key}
                    className={cn(
                      "group rounded-lg border cursor-pointer transition-all duration-200 relative overflow-hidden",
                      key === selectedVariantKey 
                        ? "border-primary shadow-sm" 
                        : "border-border/50 hover:border-border"
                    )}
                    onClick={() => {
                      if (!disabled) {
                        handleStyleUpdate(key, currentFont);
                      }
                    }}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(0,0,0,0.05)_0%,rgba(0,0,0,0.02)_89.5%)] opacity-70"></div>
                    
                    <div className="p-2.5 text-center">
                      <span
                        style={getVariantStyle(key)}
                        className="text-sm px-2 py-1 inline-block"
                      >
                        {key}
                      </span>
                    </div>
                    
                    {key === selectedVariantKey && (
                      <div className="absolute top-1 right-1">
                        <div className="bg-primary text-primary-foreground h-4 w-4 rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="font" className="mt-0 pt-0 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <button
                  className="p-2 hover:bg-muted rounded-md transition-colors"
                  onClick={handleFontLeft}
                  aria-label="Previous Font"
                  disabled={disabled}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="font-medium text-sm">
                  {currentFontIndex + 1} of {fontOptions.length}
                </div>
                <button
                  className="p-2 hover:bg-muted rounded-md transition-colors"
                  onClick={handleFontRight}
                  aria-label="Next Font"
                  disabled={disabled}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {fontOptions.map((fontOpt) => (
                  <div
                    key={fontOpt.value}
                    className={cn(
                      "group rounded-lg border py-2.5 px-3 cursor-pointer transition-all duration-200 flex items-center justify-between",
                      fontOpt.value === selectedFont.value
                        ? "border-primary shadow-sm bg-primary/5"
                        : "border-border/50 hover:border-border hover:bg-muted/50"
                    )}
                    onClick={() => {
                      if (!disabled) {
                        handleStyleUpdate(
                          currentVariant,
                          fontOpt.value as FontType,
                        );
                      }
                    }}
                  >
                    <span
                      style={{ fontFamily: fontOpt.style.fontFamily }}
                      className="text-base font-medium"
                    >
                      {fontOpt.label}
                    </span>
                    
                    {fontOpt.value === selectedFont.value ? (
                      <div className="bg-primary text-primary-foreground h-5 w-5 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3" />
                      </div>
                    ) : (
                      <div className="h-5 w-5"></div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
