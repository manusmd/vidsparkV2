import { createContext, useContext, useEffect } from "react";
import { applyThemeToRoot } from "@/lib/themes/utils";

type ThemeProviderProps = {
  children: React.ReactNode;
};

type ThemeProviderState = {
  theme: "dark";
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined
);

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  useEffect(() => {
    // Apply dark theme CSS variables
    const root = window.document.documentElement;
    root.classList.add("dark");
    root.setAttribute("data-theme", "dark");
    
    // Apply theme CSS variables
    applyThemeToRoot();
  }, []);

  const value = {
    theme: "dark" as const,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
}; 