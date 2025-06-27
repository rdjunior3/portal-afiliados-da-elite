// Elite Design System - Estilos padronizados para o Portal Afiliados da Elite
// ATUALIZADO PARA AZUL ESCURO + GRADIENTES + LARANJA

export const EliteCard = {
  // Card principal com backdrop blur - NOVO AZUL ESCURO
  primary: "bg-gradient-to-br from-slate-900/90 to-slate-800/70 border-slate-700/30 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300",
  
  // Card secundário mais sutil - AZUL ESCURO
  secondary: "bg-gradient-to-br from-slate-800/70 to-slate-700/50 border-slate-600/40 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300",
  
  // Card com accent laranja - NOVO GRADIENTE
  accent: "bg-gradient-to-br from-blue-950/80 via-blue-900/60 to-orange-500/20 border-orange-500/30 shadow-lg shadow-orange-500/10",
  
  // Card para stats/métricas - AZUL ESCURO ELITE
  stats: "bg-gradient-to-br from-blue-950/90 via-blue-900/70 to-slate-800/60 border-blue-700/40 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300",
  
  // Card de destaque - GRADIENTE ELITE AZUL + LARANJA
  featured: "bg-gradient-to-br from-blue-950/90 via-blue-800/60 to-orange-500/30 border-orange-500/40 shadow-xl shadow-orange-500/20",

  // Card glassmorphism - NOVO ESTILO
  glass: "bg-gradient-to-br from-blue-950/40 to-blue-900/20 border-blue-500/20 backdrop-blur-md shadow-lg",

  // Card cyber - EFEITO NEON AZUL
  cyber: "bg-gradient-to-br from-blue-950/80 to-blue-900/60 border-blue-500/40 shadow-lg shadow-blue-500/20",
} as const;

export const EliteButton = {
  // Botão principal - GRADIENTE AZUL ESCURO + LARANJA
  primary: "bg-gradient-to-r from-blue-800 via-blue-700 to-orange-600 hover:from-blue-700 hover:via-blue-600 hover:to-orange-500 text-white shadow-lg hover:shadow-orange-500/30 transition-all duration-300 transform hover:scale-105 border border-blue-500/20",
  
  // Botão secundário - AZUL ESCURO
  secondary: "bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white border border-slate-600/50 hover:border-slate-500/50 transition-all duration-300",
  
  // Botão ghost - TEMA AZUL
  ghost: "text-blue-300 hover:text-blue-200 hover:bg-blue-500/10 border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300",
  
  // Botão outline - AZUL + LARANJA
  outline: "border border-blue-500/50 text-blue-300 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-orange-500/10 hover:border-orange-400/50 hover:text-orange-300 transition-all duration-300",
  
  // Botão de perigo - MANTIDO
  danger: "bg-red-600/80 hover:bg-red-600 text-white border border-red-500/50 hover:border-red-400 transition-all duration-300",

  // Botão Elite - GRADIENTE ESPECIAL
  elite: "bg-gradient-to-r from-blue-900 via-blue-700 to-orange-600 hover:from-blue-800 hover:via-blue-600 hover:to-orange-500 text-white shadow-xl shadow-blue-500/20 hover:shadow-orange-500/30 transition-all duration-300 transform hover:scale-105 border border-orange-500/30",

  // Botão Cyber - EFEITO NEON
  cyber: "bg-transparent border-2 border-blue-500/50 text-blue-400 hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-orange-500/20 hover:text-blue-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-400/40 transition-all duration-300",
} as const;

export const EliteHover = {
  // Efeito de escala
  scale: "hover:scale-[1.02] transition-transform duration-300",
  
  // Efeito de elevação
  lift: "hover:-translate-y-1 transition-transform duration-300",
  
  // Efeito de brilho - AZUL + LARANJA
  glow: "hover:shadow-lg hover:shadow-blue-500/20 hover:shadow-orange-500/10 transition-shadow duration-300",
  
  // Efeito combinado - ELITE
  enhanced: "hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/30 hover:shadow-orange-500/20 transition-all duration-300",

  // Efeito cyber
  cyber: "hover:shadow-lg hover:shadow-blue-400/40 hover:border-blue-400/50 transition-all duration-300",
} as const;

export const EliteBackground = {
  // Background principal - AZUL ESCURO GRADIENTE
  primary: "bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900",
  
  // Background secundário - SUTIL
  secondary: "bg-gradient-to-br from-blue-950/50 to-slate-900/70",
  
  // Background glass - TRANSPARENTE
  glass: "bg-gradient-to-br from-blue-950/30 to-blue-900/10 backdrop-blur-sm",
  
  // Background hero - DESTAQUE
  hero: "bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden",

  // Background card
  card: "bg-gradient-to-br from-blue-950/40 to-slate-900/60",
} as const;

export const EliteText = {
  // Título principal - GRADIENTE AZUL + LARANJA
  title: "text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-300 via-blue-200 to-orange-300 bg-clip-text text-transparent",
  
  // Subtítulo - AZUL CLARO
  subtitle: "text-lg font-semibold text-blue-100",
  
  // Descrição - AZUL SUAVE
  description: "text-blue-200/80",
  
  // Texto pequeno - AZUL MUTED
  small: "text-sm text-blue-300/70",
  
  // Texto com destaque - LARANJA
  accent: "text-orange-300 font-medium",
  
  // Texto de sucesso - VERDE
  success: "text-green-300 font-medium",
  
  // Texto de erro - VERMELHO
  error: "text-red-300 font-medium",

  // Texto de marca - GRADIENTE ELITE
  brand: "bg-gradient-to-r from-blue-300 to-orange-400 bg-clip-text text-transparent font-bold",

  // Texto cyber - NEON AZUL
  cyber: "text-blue-400 drop-shadow-sm",

  // Texto muted - AZUL ESCURO
  muted: "text-blue-300/60",
} as const;

export const EliteBorder = {
  // Border padrão - AZUL ESCURO
  default: "border-blue-700/40",
  
  // Border sutil - TRANSPARENTE
  subtle: "border-blue-600/20",
  
  // Border accent - LARANJA
  accent: "border-orange-500/40",
  
  // Border glow - EFEITO NEON
  glow: "border-blue-500/50 shadow-sm shadow-blue-500/20",

  // Border gradiente
  gradient: "border-transparent bg-gradient-to-r from-blue-500/30 to-orange-500/30 bg-clip-border",
} as const;

export const EliteBadge = {
  // Badge padrão - AZUL ESCURO
  default: "bg-blue-900/60 text-blue-200 border-blue-700/50",
  
  // Badge laranja - MANTIDO
  orange: "bg-orange-500/20 text-orange-300 border-orange-400/50",
  
  // Badge de sucesso
  success: "bg-green-500/20 text-green-300 border-green-400/50",
  
  // Badge de aviso
  warning: "bg-yellow-500/20 text-yellow-300 border-yellow-400/50",
  
  // Badge de erro
  error: "bg-red-500/20 text-red-300 border-red-400/50",
  
  // Badge premium - GRADIENTE ELITE
  premium: "bg-gradient-to-r from-blue-500/30 via-blue-600/20 to-orange-500/30 text-blue-200 border-orange-400/50",

  // Badge cyber - NEON
  cyber: "bg-blue-500/10 text-blue-400 border-blue-500/40 shadow-sm shadow-blue-500/20",
} as const;

export const EliteSpacing = {
  // Container principal
  container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  
  // Espaçamento de página
  pageY: "py-8",
  
  // Espaçamento de seção
  sectionY: "space-y-8",
  
  // Espaçamento de card
  cardY: "space-y-6",
  
  // Espaçamento de itens
  itemY: "space-y-4",
  
  // Espaçamento pequeno
  smallY: "space-y-2"
} as const;

export const EliteGrid = {
  // Grid de stats (4 colunas)
  stats: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6",
  
  // Grid de produtos
  products: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
  
  // Grid de cursos
  courses: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
  
  // Grid de configurações
  settings: "grid grid-cols-1 lg:grid-cols-2 gap-6",
  
  // Grid de 2 colunas
  twoCol: "grid grid-cols-1 lg:grid-cols-2 gap-8",
  
  // Grid de 3 colunas
  threeCol: "grid grid-cols-1 lg:grid-cols-3 gap-8"
} as const;

export const EliteInput = {
  // Input padrão
  default: "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-300",
  
  // Input com busca
  search: "pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-300"
} as const;

export const EliteAnimation = {
  // Fade in
  fadeIn: "animate-fade-in",
  
  // Slide in da esquerda
  slideInLeft: "animate-slide-in-left",
  
  // Slide in da direita
  slideInRight: "animate-slide-in-right",
  
  // Slide in de baixo
  slideInUp: "animate-slide-in-up",
  
  // Pulse suave
  pulse: "animate-pulse"
} as const;

// Função helper para combinar estilos
export const combineStyles = (...styles: string[]) => {
  return styles.filter(Boolean).join(' ');
};

// Função helper para estilos condicionais
export const conditionalStyle = (condition: boolean, trueStyle: string, falseStyle: string = '') => {
  return condition ? trueStyle : falseStyle;
}; 