// Component-specific tokens that extend the base theme

// Button component tokens
export const buttonTokens = {
  // Default button
  default: {
    background: 'var(--primary)',
    foreground: 'var(--primary-foreground)',
    border: 'var(--primary)',
    hoverBackground: 'var(--primary)/90',
    hoverForeground: 'var(--primary-foreground)',
    focusRing: 'var(--ring)',
    disabledBackground: 'var(--primary)/50',
    disabledForeground: 'var(--primary-foreground)/50',
  },
  // Secondary button
  secondary: {
    background: 'var(--secondary)',
    foreground: 'var(--secondary-foreground)',
    border: 'var(--secondary)',
    hoverBackground: 'var(--secondary)/80',
    hoverForeground: 'var(--secondary-foreground)',
    focusRing: 'var(--ring)',
    disabledBackground: 'var(--secondary)/50',
    disabledForeground: 'var(--secondary-foreground)/50',
  },
  // Outline button
  outline: {
    background: 'transparent',
    foreground: 'var(--foreground)',
    border: 'var(--border)',
    hoverBackground: 'var(--accent)',
    hoverForeground: 'var(--accent-foreground)',
    focusRing: 'var(--ring)',
    disabledBackground: 'transparent',
    disabledForeground: 'var(--muted-foreground)',
    disabledBorder: 'var(--border)',
  },
  // Ghost button
  ghost: {
    background: 'transparent',
    foreground: 'var(--foreground)',
    border: 'transparent',
    hoverBackground: 'var(--accent)',
    hoverForeground: 'var(--accent-foreground)',
    focusRing: 'var(--ring)',
    disabledBackground: 'transparent',
    disabledForeground: 'var(--muted-foreground)',
  },
  // Destructive button
  destructive: {
    background: 'var(--destructive)',
    foreground: 'var(--destructive-foreground)',
    border: 'var(--destructive)',
    hoverBackground: 'var(--destructive)/90',
    hoverForeground: 'var(--destructive-foreground)',
    focusRing: 'var(--destructive)',
    disabledBackground: 'var(--destructive)/50',
    disabledForeground: 'var(--destructive-foreground)/50',
  },
};

// Card component tokens
export const cardTokens = {
  background: 'var(--card)',
  foreground: 'var(--card-foreground)',
  border: 'var(--border)',
  shadow: 'var(--shadow-md)',
  hoverShadow: 'var(--shadow-lg)',
  header: {
    background: 'var(--card)',
    foreground: 'var(--card-foreground)',
    border: 'var(--border)',
  },
  footer: {
    background: 'var(--muted)',
    foreground: 'var(--muted-foreground)',
    border: 'var(--border)',
  },
};

// Input component tokens
export const inputTokens = {
  background: 'transparent',
  foreground: 'var(--foreground)',
  border: 'var(--input)',
  focusBorder: 'var(--ring)',
  focusRing: 'var(--ring)/20',
  placeholder: 'var(--muted-foreground)',
  disabled: {
    background: 'var(--muted)',
    foreground: 'var(--muted-foreground)',
    border: 'var(--input)/50',
  },
  invalid: {
    border: 'var(--destructive)',
    focusRing: 'var(--destructive)/20',
  },
};

// Dialog/Modal component tokens
export const dialogTokens = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    background: 'var(--background)',
    foreground: 'var(--foreground)',
    border: 'var(--border)',
    shadow: 'var(--shadow-lg)',
  },
  header: {
    background: 'transparent',
    foreground: 'var(--foreground)',
    border: 'var(--border)',
  },
  footer: {
    background: 'transparent',
    foreground: 'var(--foreground)',
    border: 'var(--border)',
  },
};

// Navigation component tokens
export const navigationTokens = {
  background: 'transparent',
  foreground: 'var(--foreground)',
  border: 'var(--border)',
  hover: {
    background: 'var(--accent)',
    foreground: 'var(--accent-foreground)',
  },
  active: {
    background: 'var(--accent)',
    foreground: 'var(--accent-foreground)',
    border: 'var(--accent-foreground)',
  },
  indicator: 'var(--primary)',
};

// Background components tokens
export const backgroundTokens = {
  lines: {
    colors: [
      'var(--chart-1)',
      'var(--chart-2)',
      'var(--chart-3)',
      'var(--chart-4)',
      'var(--chart-5)',
      'var(--brand-primary)',
      'var(--brand-secondary)',
      'var(--brand-accent)',
    ],
    stroke: '2.3',
  },
  gradient: {
    start: 'var(--brand-primary)',
    mid: 'var(--brand-secondary)',
    end: 'var(--brand-accent)',
    background: 'radial-gradient(circle at top right, var(--brand-primary), transparent), radial-gradient(circle at bottom left, var(--brand-secondary), transparent)',
  },
  aurora: {
    primaryGradient: 'repeating-linear-gradient(100deg, var(--brand-primary) 10%, var(--brand-secondary) 15%, var(--brand-accent) 20%, var(--chart-4) 25%, var(--chart-1) 30%)',
  },
};

// Chart tokens
export const chartTokens = {
  axis: {
    line: 'rgba(255, 255, 255, 0.1)',
    text: 'rgba(255, 255, 255, 0.65)',
  },
  grid: 'rgba(255, 255, 255, 0.1)',
  tooltip: {
    background: 'var(--background)/95',
    border: 'var(--border)',
  },
  colors: [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
  ],
  bar: {
    gradient: {
      start: 'var(--chart-1)',
      end: 'var(--chart-2)',
    },
  },
  line: {
    stroke: 'var(--chart-1)',
    fill: 'var(--chart-1)/30',
  },
  area: {
    stroke: 'var(--chart-2)',
    fill: 'var(--chart-2)/20',
  },
}; 