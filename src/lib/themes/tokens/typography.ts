export const typography = {
  // Font families
  fontFamily: {
    sans: ['var(--font-geist-sans)'],
    mono: ['var(--font-geist-mono)'],
  },
  
  // Font sizes with line heights
  fontSize: {
    xs: ['0.75rem', '1rem'],        // 12px, 16px line height
    sm: ['0.875rem', '1.25rem'],    // 14px, 20px line height
    base: ['1rem', '1.5rem'],       // 16px, 24px line height
    lg: ['1.125rem', '1.75rem'],    // 18px, 28px line height
    xl: ['1.25rem', '1.75rem'],     // 20px, 28px line height
    '2xl': ['1.5rem', '2rem'],      // 24px, 32px line height
    '3xl': ['1.875rem', '2.25rem'], // 30px, 36px line height
    '4xl': ['2.25rem', '2.5rem'],   // 36px, 40px line height
    '5xl': ['3rem', '1'],           // 48px, 1 line height
    '6xl': ['3.75rem', '1'],        // 60px, 1 line height
    '7xl': ['4.5rem', '1'],         // 72px, 1 line height
    '8xl': ['6rem', '1'],           // 96px, 1 line height
    '9xl': ['8rem', '1'],           // 128px, 1 line height
  },
  
  // Font weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  
  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
  
  // Line height
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  
  // Component typography presets
  heading: {
    h1: 'text-4xl font-bold tracking-tight',
    h2: 'text-3xl font-semibold tracking-tight',
    h3: 'text-2xl font-semibold tracking-tight',
    h4: 'text-xl font-semibold tracking-tight',
    h5: 'text-lg font-semibold tracking-tight',
    h6: 'text-base font-semibold tracking-tight',
  },
  
  paragraph: {
    lead: 'text-xl text-muted-foreground',
    base: 'text-base text-foreground',
    small: 'text-sm text-muted-foreground',
    muted: 'text-sm text-muted-foreground',
  },
}; 