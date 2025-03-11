"use client";

import React, { JSX, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TextDesignVariant } from "./textDesigns";
import { textDesignVariants, TextDesignFonts } from "./textDesigns";
import { useTextDesign } from "@/hooks/useTextDesign";

// Example font options:
import type { TextDesignFontsType } from "./textDesigns";

const fontOptions: Array<{
  value: TextDesignFontsType;
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
const sampleText = "Sample Text";

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
    transition: "filter 0.2s",
  };
}

function getFontStyle(fontValue: string | undefined): React.CSSProperties {
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
    transition: "filter 0.2s",
  };
}
function getCombinedPreviewStyle(
  variantKey: TextDesignVariant,
  fontValue: TextDesignFontsType,
): React.CSSProperties {
  const baseVariantStyle = getVariantStyle(variantKey);
  const baseFontStyle = getFontStyle(fontValue);
  return {
    ...baseVariantStyle,
    fontFamily: baseFontStyle.fontFamily,
  };
}

export function TextDesignSelector(): JSX.Element {
  // Get context setters and values
  const { variant, font, setVariant, setFont } = useTextDesign();

  const variantKeys = Object.keys(textDesignVariants) as TextDesignVariant[];

  // Convert current values to indices
  const currentVariantIndex = variantKeys.indexOf(variant);
  const currentFontIndex = fontOptions.findIndex((f) => f.value === font) || 0;

  // Local state for popover open states
  const [variantPopoverOpen, setVariantPopoverOpen] = useState(false);
  const [fontPopoverOpen, setFontPopoverOpen] = useState(false);

  // Handlers for variant
  const handleVariantLeft = () => {
    const newIndex =
      (currentVariantIndex - 1 + variantKeys.length) % variantKeys.length;
    setVariant(variantKeys[newIndex]);
  };
  const handleVariantRight = () => {
    const newIndex = (currentVariantIndex + 1) % variantKeys.length;
    setVariant(variantKeys[newIndex]);
  };

  // Handlers for font
  const handleFontLeft = () => {
    const newIndex =
      (currentFontIndex - 1 + fontOptions.length) % fontOptions.length;
    setFont(fontOptions[newIndex].value);
  };
  const handleFontRight = () => {
    const newIndex = (currentFontIndex + 1) % fontOptions.length;
    setFont(fontOptions[newIndex].value);
  };

  // Get selected styles
  const selectedVariantKey = variant;
  const selectedFont =
    fontOptions.find((f) => f.value === font) || fontOptions[0];
  const combinedPreviewStyle = getCombinedPreviewStyle(
    selectedVariantKey,
    selectedFont.value,
  );

  return (
    <Card className="w-full ">
      <CardHeader>
        <CardTitle>Design</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Variant Selector */}
        <div className="flex flex-col w-full gap-2 mb-2">
          <div className="flex items-center justify-between w-full">
            <button
              className="p-2 hover:bg-muted rounded-md"
              onClick={handleVariantLeft}
              aria-label="Previous Variant"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <Popover
              open={variantPopoverOpen}
              onOpenChange={setVariantPopoverOpen}
            >
              <PopoverTrigger asChild>
                <div className={"flex flex-col items-center"}>
                  <p className={"text-md"}>Variant</p>
                  <button
                    className="flex-1 rounded bg-muted hover:bg-muted/80 text-xl font-semibold mx-2 w-full"
                    onClick={() => setVariantPopoverOpen(!variantPopoverOpen)}
                    style={getVariantStyle(selectedVariantKey)}
                  >
                    {selectedVariantKey.charAt(0).toUpperCase() +
                      selectedVariantKey.slice(1)}
                  </button>
                </div>
              </PopoverTrigger>
              <PopoverContent
                className="p-6 w-full"
                align="center"
                sideOffset={8}
              >
                <div className="grid grid-cols-3 gap-4 w-full">
                  {variantKeys.map((key) => (
                    <button
                      key={key}
                      style={getVariantStyle(key)}
                      className={`rounded text-lg px-4 py-2 ${
                        key === selectedVariantKey
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted hover:text-muted-foreground"
                      }`}
                      onClick={() => setVariant(key)}
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <button
              className="p-2 hover:bg-muted rounded-md"
              onClick={handleVariantRight}
              aria-label="Next Variant"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>
        </div>

        {/* Font Selector */}
        <div className="flex flex-col w-full gap-2">
          <div className="flex items-center justify-between w-full">
            <button
              className="p-2 hover:bg-muted rounded-md"
              onClick={handleFontLeft}
              aria-label="Previous Font"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <Popover open={fontPopoverOpen} onOpenChange={setFontPopoverOpen}>
              <PopoverTrigger asChild>
                <div className={"flex flex-col items-center"}>
                  <p className={"text-md"}>Font</p>
                  <button
                    onClick={() => setFontPopoverOpen(!fontPopoverOpen)}
                    style={getFontStyle(selectedFont.value)}
                    className="flex-1 rounded hover:bg-muted/40 text-xl font-semibold mx-2 w-full"
                  >
                    {selectedFont.label}
                  </button>
                </div>
              </PopoverTrigger>
              <PopoverContent
                className="p-6 w-full"
                align="center"
                sideOffset={8}
              >
                <div className="grid grid-cols-2 gap-4 w-full">
                  {fontOptions.map((fontOpt) => (
                    <button
                      key={fontOpt.value}
                      style={getFontStyle(fontOpt.value)}
                      className={`rounded text-lg px-4 py-2 ${
                        fontOpt.value === selectedFont.value
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted hover:text-muted-foreground"
                      }`}
                      onClick={() => setFont(fontOpt.value)}
                    >
                      {fontOpt.label}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <button
              className="p-2 hover:bg-muted rounded-md"
              onClick={handleFontRight}
              aria-label="Next Font"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>
        </div>

        {/* Combined Preview */}
        <div className="mt-6 flex justify-center w-full">
          <div
            className="w-full flex items-center justify-center"
            style={{
              ...combinedPreviewStyle,
              fontSize: "2rem",
              padding: "1rem 2rem",
            }}
          >
            {sampleText}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
