// Elite Design System - Estilos padronizados para o Portal Afiliados da Elite

export const EliteCard = {
  // Card principal com backdrop blur
  primary: "bg-slate-800/60 border-slate-700/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300",
  
  // Card secundário mais sutil
  secondary: "bg-slate-700/40 border-slate-600/50 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300",
  
  // Card com accent laranja
  accent: "bg-gradient-to-br from-orange-500/15 to-orange-600/10 border-orange-500/30 shadow-lg shadow-orange-500/10",
  
  // Card para stats/métricas
  stats: "bg-gradient-to-br from-slate-800/80 to-slate-700/60 border-slate-600/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300",
  
  // Card de destaque
  featured: "bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-orange-500/30 shadow-xl shadow-orange-500/20"
} as const;

export const EliteButton = {
  // Botão principal laranja
  primary: "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white shadow-lg hover:shadow-orange-500/30 transition-all duration-300 transform hover:scale-105",
  
  // Botão secundário
  secondary: "bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 hover:border-slate-500 transition-all duration-300",
  
  // Botão ghost
  ghost: "text-orange-300 hover:text-orange-200 hover:bg-orange-500/10 transition-all duration-300",
  
  // Botão outline
  outline: "border border-orange-500/50 text-orange-300 hover:bg-orange-500/10 hover:border-orange-400/50 transition-all duration-300",
  
  // Botão de perigo
  danger: "bg-red-600/80 hover:bg-red-600 text-white border border-red-500/50 hover:border-red-400 transition-all duration-300"
} as const;

export const EliteHover = {
  // Efeito de escala
  scale: "hover:scale-[1.02] transition-transform duration-300",
  
  // Efeito de elevação
  lift: "hover:-translate-y-1 transition-transform duration-300",
  
  // Efeito de brilho
  glow: "hover:shadow-orange-500/20 transition-shadow duration-300",
  
  // Efeito combinado
  enhanced: "hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-300"
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

export const EliteText = {
  // Título principal
  title: "text-2xl sm:text-3xl font-bold text-white",
  
  // Subtítulo
  subtitle: "text-lg font-semibold text-white",
  
  // Descrição
  description: "text-slate-300",
  
  // Texto pequeno
  small: "text-sm text-slate-400",
  
  // Texto com destaque
  accent: "text-orange-300 font-medium",
  
  // Texto de sucesso
  success: "text-green-300 font-medium",
  
  // Texto de erro
  error: "text-red-300 font-medium"
} as const;

export const EliteInput = {
  // Input padrão
  default: "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-300",
  
  // Input com busca
  search: "pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-300"
} as const;

export const EliteBadge = {
  // Badge padrão
  default: "bg-slate-700/60 text-slate-200 border-slate-600/50",
  
  // Badge laranja
  orange: "bg-orange-500/20 text-orange-300 border-orange-400/50",
  
  // Badge de sucesso
  success: "bg-green-500/20 text-green-300 border-green-400/50",
  
  // Badge de aviso
  warning: "bg-yellow-500/20 text-yellow-300 border-yellow-400/50",
  
  // Badge de erro
  error: "bg-red-500/20 text-red-300 border-red-400/50",
  
  // Badge premium
  premium: "bg-gradient-to-r from-orange-500/30 to-orange-600/20 text-orange-200 border-orange-400/50"
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