export const shadows = {
  // Base shadows
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',
  
  // Colored shadows (with purple accent)
  'purple-sm': '0 1px 2px 0 rgb(117 89 255 / 0.05)',
  'purple-md': '0 4px 6px -1px rgb(117 89 255 / 0.1), 0 2px 4px -2px rgb(117 89 255 / 0.1)',
  'purple-lg': '0 10px 15px -3px rgb(117 89 255 / 0.1), 0 4px 6px -4px rgb(117 89 255 / 0.1)',
  'purple-xl': '0 20px 25px -5px rgb(117 89 255 / 0.15), 0 8px 10px -6px rgb(117 89 255 / 0.15)',
  
  // Component-specific shadows
  card: 'var(--shadow-md)',
  'card-hover': 'var(--shadow-lg)',
  dropdown: 'var(--shadow-lg)',
  'button-hover': 'var(--shadow-sm)',
  'button-active': 'var(--shadow-inner)',
}; 