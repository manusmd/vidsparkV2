"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  TextDesignFonts,
  TextDesignFontsType,
  TextDesignVariant,
} from "@/components/remotion/textDesigns";

interface TextDesignContextType {
  variant: TextDesignVariant;
  font: TextDesignFontsType;
  setVariant: (variant: TextDesignVariant) => void;
  setFont: (font: TextDesignFontsType) => void;
}

const TextDesignContext = createContext<TextDesignContextType | undefined>(
  undefined,
);

export const TextDesignProvider = ({
  children,
  initialVariant = "default",
  initialFont = TextDesignFonts.ROBOTO,
}: {
  children: ReactNode;
  initialVariant?: TextDesignVariant;
  initialFont?: TextDesignFontsType;
}) => {
  const [variant, setVariant] = useState<TextDesignVariant>(initialVariant);
  const [font, setFont] = useState<TextDesignFontsType>(initialFont);

  return (
    <TextDesignContext.Provider value={{ variant, font, setVariant, setFont }}>
      {children}
    </TextDesignContext.Provider>
  );
};

export const useTextDesign = (): TextDesignContextType => {
  const context = useContext(TextDesignContext);
  if (!context) {
    throw new Error("useTextDesign must be used within a TextDesignProvider");
  }
  return context;
};
