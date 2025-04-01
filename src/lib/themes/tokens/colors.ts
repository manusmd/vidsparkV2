export const colors = {
  // Base neutral scale (blacks, whites, grays)
  neutral: {
    0: 'oklch(0.985 0 0)', // Almost white
    50: 'oklch(0.95 0 0)',
    100: 'oklch(0.9 0 0)',
    200: 'oklch(0.8 0 0)',
    300: 'oklch(0.7 0 0)',
    400: 'oklch(0.6 0 0)',
    500: 'oklch(0.5 0 0)',
    600: 'oklch(0.4 0 0)',
    700: 'oklch(0.3 0 0)',
    800: 'oklch(0.2 0 0)',
    900: 'oklch(0.15 0 0)',
    950: 'oklch(0.11 0 0)',
    1000: 'oklch(0.05 0 0)' // Almost black
  },
  
  // Primary purple scale
  purple: {
    50: 'oklch(0.95 0.03 290)',
    100: 'oklch(0.9 0.05 290)',
    200: 'oklch(0.83 0.1 290)',
    300: 'oklch(0.76 0.14 290)',
    400: 'oklch(0.65 0.18 290)',
    500: 'oklch(0.55 0.21 290)',  // Main brand purple - close to #7559ff
    600: 'oklch(0.48 0.24 264.376)', // Existing sidebar purple
    700: 'oklch(0.4 0.2 290)',
    800: 'oklch(0.3 0.15 290)',
    900: 'oklch(0.2 0.1 290)',
    950: 'oklch(0.12 0.08 290)' // Deep purple for dark backgrounds
  },
  
  // Accent colors for charts and visualizations
  violet: {
    400: 'oklch(0.62 0.26 303)',
    500: 'oklch(0.627 0.265 303.9)' // Existing chart color (pink)
  },
  
  teal: {
    500: 'oklch(0.696 0.17 162.48)' // Existing chart color
  },
  
  orange: {
    500: 'oklch(0.769 0.188 70.08)' // Existing chart color
  },
  
  red: {
    400: 'oklch(0.637 0.237 25.331)', // Existing destructive foreground
    500: 'oklch(0.645 0.246 16.439)', // Existing chart color
    600: 'oklch(0.396 0.141 25.723)' // Existing destructive background
  },
  
  // Expanded chart colors (preserving existing)
  chart: {
    1: 'oklch(0.488 0.243 264.376)', // Purple
    2: 'oklch(0.696 0.17 162.48)',   // Teal
    3: 'oklch(0.769 0.188 70.08)',   // Orange
    4: 'oklch(0.627 0.265 303.9)',   // Pink
    5: 'oklch(0.645 0.246 16.439)'   // Red
  }
}; 