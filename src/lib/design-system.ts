// Design System Elite - Tokens e configurações para UI moderna e futurista
export const designTokens = {
  // Paleta de cores Elite - ATUALIZADA PARA AZUL ESCURO + GRADIENTES
  colors: {
    // Cores primárias (Elite Dark Blue - NOVO)
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#1e40af', // Azul escuro principal (era #0ea5e9)
      600: '#1d4ed8',
      700: '#1e3a8a',
      800: '#1e293b', // Azul muito escuro
      900: '#0f172a', // Azul quase preto
      950: '#0c1629', // Azul Elite ultra escuro
    },
    
    // Cores secundárias (Elite Orange - MANTIDO)
    secondary: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316', // Laranja Elite
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
      950: '#431407',
    },
    
    // Cores de acento (Neon Green - REDUZIDO)
    accent: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e', // Verde Elite - apenas para states
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16',
    },
    
    // Cores neutras (Dark Mode Elite - ATUALIZADO)
    neutral: {
      0: '#ffffff',
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b', // Dark Elite
      850: '#172033', 
      900: '#0f172a', // Elite background
      950: '#0c1629', // Elite ultra dark
    },
    
    // Estados e feedback
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#1e40af', // Mudado para azul escuro
    
    // Gradientes Elite - NOVOS GRADIENTES AZUL ESCURO
    gradients: {
      // Gradiente principal: azul escuro → azul médio
      primary: 'linear-gradient(135deg, #0c1629 0%, #1e40af 50%, #1d4ed8 100%)',
      // Gradiente secundário: azul escuro → laranja
      secondary: 'linear-gradient(135deg, #1e293b 0%, #f97316 100%)',
      // Gradiente de destaque: azul escuro → laranja → azul
      elite: 'linear-gradient(135deg, #0c1629 0%, #1e40af 30%, #f97316 70%, #1e40af 100%)',
      // Gradiente sutil para cards
      card: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      // Gradiente escuro para backgrounds
      dark: 'linear-gradient(135deg, #0c1629 0%, #0f172a 50%, #1e293b 100%)',
      // Gradiente glass effect
      glass: 'linear-gradient(135deg, rgba(30, 64, 175, 0.1) 0%, rgba(249, 115, 22, 0.05) 100%)',
      // Gradiente para botões principais
      button: 'linear-gradient(135deg, #1e40af 0%, #f97316 100%)',
      // Gradiente para borders
      border: 'linear-gradient(135deg, rgba(30, 64, 175, 0.3) 0%, rgba(249, 115, 22, 0.3) 100%)',
    }
  },
  
  // Tipografia Elite
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
      display: ['Inter', 'system-ui', 'sans-serif'],
    },
    
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
      '6xl': '3.75rem',  // 60px
      '7xl': '4.5rem',   // 72px
    },
    
    fontWeight: {
      thin: '100',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
    
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    }
  },
  
  // Spacing Elite
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
  },
  
  // Border radius Elite
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },
  
  // Shadows Elite - ATUALIZADAS PARA AZUL ESCURO
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: '0 0 #0000',
    
    // Shadows especiais Elite - NOVO AZUL ESCURO
    cyber: '0 0 20px rgba(30, 64, 175, 0.4), 0 0 40px rgba(30, 64, 175, 0.2)',
    elite: '0 8px 32px rgba(12, 22, 41, 0.6), 0 0 0 1px rgba(30, 64, 175, 0.1)',
    glass: '0 8px 32px rgba(12, 22, 41, 0.4), inset 0 1px 0 rgba(30, 64, 175, 0.1)',
    neon: '0 0 5px currentColor, 0 0 20px currentColor, 0 0 35px currentColor',
    glow: '0 0 30px rgba(249, 115, 22, 0.3), 0 0 60px rgba(30, 64, 175, 0.2)',
  },
  
  // Animações e transições
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '1000ms',
    },
    
    easing: {
      ease: 'ease',
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      elastic: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
    }
  },
  
  // Breakpoints responsivos
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Z-index layers
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  }
};

// Classes utilitárias para componentes Elite - ATUALIZADAS
export const eliteClasses = {
  // Layout containers
  container: {
    base: 'mx-auto px-4 sm:px-6 lg:px-8',
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  },
  
  // Cards Elite - NOVOS ESTILOS AZUL ESCURO
  card: {
    base: 'rounded-xl border border-slate-700/30 bg-gradient-to-br from-slate-900/90 to-slate-800/60 backdrop-blur-sm shadow-elite',
    glass: 'rounded-xl border border-primary-500/20 bg-gradient-to-br from-primary-950/40 to-primary-900/20 backdrop-blur-md shadow-glass',
    cyber: 'rounded-xl border border-primary-500/40 bg-gradient-to-br from-primary-950/80 to-primary-900/60 shadow-cyber',
    gradient: 'rounded-xl border-0 bg-gradient-to-br from-primary-950 via-primary-900 to-slate-900 shadow-xl',
    elite: 'rounded-xl border border-orange-500/20 bg-gradient-to-br from-primary-950/90 to-primary-900/70 shadow-glow',
  },
  
  // Buttons Elite - NOVOS GRADIENTES AZUL ESCURO + LARANJA
  button: {
    primary: 'bg-gradient-to-r from-primary-700 via-primary-600 to-secondary-600 hover:from-primary-600 hover:via-primary-500 hover:to-secondary-500 text-white shadow-lg hover:shadow-cyber transition-all duration-300 border border-primary-500/20',
    secondary: 'bg-gradient-to-r from-secondary-600 to-secondary-700 hover:from-secondary-500 hover:to-secondary-600 text-white shadow-lg transition-all duration-300',
    accent: 'bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-500 hover:to-accent-600 text-white shadow-lg transition-all duration-300',
    ghost: 'bg-transparent hover:bg-primary-500/10 border border-primary-500/20 hover:border-primary-500/40 text-primary-300 hover:text-primary-200 transition-all duration-300',
    cyber: 'bg-transparent border-2 border-primary-500/50 text-primary-400 hover:bg-gradient-to-r hover:from-primary-600/20 hover:to-secondary-500/20 hover:text-primary-200 shadow-neon hover:shadow-cyber transition-all duration-300',
    elite: 'bg-gradient-to-r from-primary-800 via-primary-700 to-secondary-600 hover:from-primary-700 hover:via-primary-600 hover:to-secondary-500 text-white shadow-glow hover:shadow-elite transition-all duration-300 border border-orange-500/30',
  },
  
  // Inputs Elite - TEMA AZUL ESCURO
  input: {
    base: 'bg-primary-950/60 border-primary-700/50 text-primary-100 placeholder:text-primary-400/70 focus:border-primary-500 focus:ring-primary-500/30 transition-all duration-300',
    cyber: 'bg-primary-950/80 border-primary-500/40 text-primary-100 placeholder:text-primary-300/60 focus:border-secondary-500 focus:ring-secondary-500/30 focus:shadow-cyber transition-all duration-300',
    glass: 'bg-primary-500/5 border-primary-500/20 text-primary-100 placeholder:text-primary-200/50 focus:border-primary-400/50 focus:ring-primary-400/20 backdrop-blur-sm transition-all duration-300',
  },
  
  // Text styles Elite - ATUALIZADOS
  text: {
    gradient: 'bg-gradient-to-r from-primary-400 via-primary-300 to-secondary-400 bg-clip-text text-transparent',
    cyber: 'text-primary-400 drop-shadow-sm',
    elite: 'text-primary-100 font-medium',
    muted: 'text-primary-300/70',
    accent: 'text-secondary-400',
    brand: 'bg-gradient-to-r from-primary-300 to-secondary-400 bg-clip-text text-transparent font-bold',
  },
  
  // Animations Elite
  animate: {
    fadeIn: 'animate-in fade-in duration-500',
    slideIn: 'animate-in slide-in-from-bottom-4 duration-500',
    scaleIn: 'animate-in zoom-in-95 duration-300',
    float: 'animate-pulse',
    glow: 'animate-pulse',
  },
  
  // Hover effects - ATUALIZADOS
  hover: {
    lift: 'hover:transform hover:-translate-y-1 hover:scale-[1.02] transition-transform duration-300',
    glow: 'hover:shadow-glow transition-shadow duration-300',
    cyber: 'hover:shadow-cyber hover:border-primary-400/50 transition-all duration-300',
    elite: 'hover:shadow-elite hover:border-secondary-400/50 transition-all duration-300',
  }
};

// Theme configuration Elite - ATUALIZADO PARA AZUL ESCURO
export const eliteTheme = {
  dark: {
    background: designTokens.colors.primary[950], // Azul ultra escuro
    foreground: designTokens.colors.primary[100],
    card: designTokens.colors.primary[900], // Azul escuro para cards
    cardForeground: designTokens.colors.primary[100],
    primary: designTokens.colors.primary[600], // Azul principal
    primaryForeground: designTokens.colors.neutral[0],
    secondary: designTokens.colors.secondary[500], // Laranja mantido
    secondaryForeground: designTokens.colors.neutral[0],
    accent: designTokens.colors.accent[500],
    accentForeground: designTokens.colors.neutral[0],
    muted: designTokens.colors.primary[900],
    mutedForeground: designTokens.colors.primary[400],
    border: designTokens.colors.primary[700],
    input: designTokens.colors.primary[900],
    ring: designTokens.colors.primary[500],
  }
};

// Utility functions para design system
export const ds = {
  // Gerar classes com tokens
  space: (size: keyof typeof designTokens.spacing) => designTokens.spacing[size],
  color: (color: string) => designTokens.colors[color as keyof typeof designTokens.colors],
  radius: (size: keyof typeof designTokens.borderRadius) => designTokens.borderRadius[size],
  shadow: (size: keyof typeof designTokens.boxShadow) => designTokens.boxShadow[size],
  
  // Combinar classes Elite
  clsx: (...classes: (string | undefined | false)[]) => {
    return classes.filter(Boolean).join(' ');
  },
  
  // Gerar gradientes
  gradient: (direction: string, colors: string[]) => {
    return `linear-gradient(${direction}, ${colors.join(', ')})`;
  },
  
  // Responsive utilities
  responsive: {
    sm: (classes: string) => `sm:${classes}`,
    md: (classes: string) => `md:${classes}`,
    lg: (classes: string) => `lg:${classes}`,
    xl: (classes: string) => `xl:${classes}`,
    '2xl': (classes: string) => `2xl:${classes}`,
  }
};

export default { designTokens, eliteClasses, eliteTheme, ds }; 