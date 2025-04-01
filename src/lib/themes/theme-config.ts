import { colors } from './tokens/colors';

export type ThemeMode = 'dark';

// Dark theme with purple accents
export const defaultTheme = {
  background: colors.neutral[900],
  foreground: colors.neutral[0],
  
  card: colors.neutral[900],
  'card-foreground': colors.neutral[0],
  
  popover: colors.neutral[900],
  'popover-foreground': colors.neutral[0],
  
  primary: colors.neutral[0],
  'primary-foreground': colors.neutral[900],
  
  secondary: colors.purple[600],
  'secondary-foreground': colors.neutral[0],
  
  muted: colors.neutral[800],
  'muted-foreground': colors.neutral[300],
  
  accent: colors.neutral[800],
  'accent-foreground': colors.neutral[0],
  
  destructive: colors.red[600],
  'destructive-foreground': colors.red[400],
  
  border: colors.neutral[700],
  input: colors.neutral[700],
  ring: colors.purple[600],
  
  // Brand colors
  'brand-primary': colors.purple[500],
  'brand-secondary': colors.purple[600],
  'brand-accent': colors.violet[500],
  
  // Chart colors
  'chart-1': colors.chart[1],
  'chart-2': colors.chart[2],
  'chart-3': colors.chart[3],
  'chart-4': colors.chart[4],
  'chart-5': colors.chart[5]
};

// Function to generate theme CSS variables
export const generateThemeVars = (theme = defaultTheme) => {
  return {
    '--background': theme.background,
    '--foreground': theme.foreground,
    '--card': theme.card,
    '--card-foreground': theme['card-foreground'],
    '--popover': theme.popover,
    '--popover-foreground': theme['popover-foreground'],
    '--primary': theme.primary,
    '--primary-foreground': theme['primary-foreground'],
    '--secondary': theme.secondary,
    '--secondary-foreground': theme['secondary-foreground'],
    '--muted': theme.muted,
    '--muted-foreground': theme['muted-foreground'],
    '--accent': theme.accent,
    '--accent-foreground': theme['accent-foreground'],
    '--destructive': theme.destructive,
    '--destructive-foreground': theme['destructive-foreground'],
    '--border': theme.border,
    '--input': theme.input,
    '--ring': theme.ring,
    '--brand-primary': theme['brand-primary'],
    '--brand-secondary': theme['brand-secondary'],
    '--brand-accent': theme['brand-accent'],
    '--chart-1': theme['chart-1'],
    '--chart-2': theme['chart-2'],
    '--chart-3': theme['chart-3'],
    '--chart-4': theme['chart-4'],
    '--chart-5': theme['chart-5'],
  };
}; 