"use client";
import React from "react";

interface ShimmeringTextProps {
  text: string;
  className?: string;
}

export const ShimmeringText: React.FC<ShimmeringTextProps> = ({ 
  text, 
  className = "" 
}) => {
  return (
    <span 
      className={`bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text font-extrabold ${className}`}
    >
      {text}
    </span>
  );
};

export default ShimmeringText;
