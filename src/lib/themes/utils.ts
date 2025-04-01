import { generateThemeVars, defaultTheme, ThemeMode } from './theme-config';

/**
 * Applies theme CSS variables to an HTML element
 */
export const applyTheme = (element: HTMLElement, theme = defaultTheme) => {
  const themeVars = generateThemeVars(theme);
  Object.entries(themeVars).forEach(([property, value]) => {
    element.style.setProperty(property, value);
  });
};

/**
 * Applies theme CSS variables to the document root
 */
export const applyThemeToRoot = (theme = defaultTheme) => {
  if (typeof document !== 'undefined') {
    applyTheme(document.documentElement, theme);
  }
};

/**
 * Gets the current theme mode (always dark)
 */
export const getThemeMode = (): ThemeMode => {
  return 'dark';
};

/**
 * Safely gets a CSS variable value
 */
export const getCssVar = (name: string, fallback?: string): string => {
  if (typeof window === 'undefined') return fallback || '';
  
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
    
  return value || fallback || '';
};

/**
 * Creates a function to check if a color is dark
 */
export const isDarkColor = (color: string): boolean => {
  // Simple implementation - for OKLCH we're checking lightness
  if (color.startsWith('oklch')) {
    // Extract lightness value (first value in OKLCH)
    const match = color.match(/oklch\(\s*([0-9.]+)/);
    if (match && match[1]) {
      const lightness = parseFloat(match[1]);
      return lightness < 0.5;
    }
  }
  
  // For hex
  if (color.startsWith('#')) {
    // Convert hex to RGB and check brightness
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
  }
  
  return true; // Default to assuming dark
}; 