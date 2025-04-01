export const radius = {
  // Base border radius scale
  none: '0',
  sm: '0.225rem',    // base - 4px
  DEFAULT: '0.425rem', // base - 2px
  md: '0.425rem',    // base - 2px
  lg: '0.625rem',    // base
  xl: '1.025rem',    // base + 4px
  '2xl': '1.425rem', // Larger radius
  '3xl': '1.825rem', // Even larger radius
  full: '9999px',    // Circular/pill shape
};

// Border radius for component types
export const componentRadius = {
  button: 'var(--radius)',
  card: 'calc(var(--radius) + 2px)',
  input: 'var(--radius)',
  panel: 'var(--radius)',
  badge: 'calc(var(--radius) - 2px)',
  avatar: 'var(--radius-full)',
}; 