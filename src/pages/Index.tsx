import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { CheckCircle, Sparkles, Trophy, Users, DollarSign, Book, MessageSquare, Star } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import BrandIcon from '@/components/ui/BrandIcon';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-x-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-slate-100" />
      
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-white/95 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Brand Section */}
            <div className="slide-in-left">
              <div className="relative group">
                <div className="relative flex items-center gap-3">
                  {/* Logo Elite */}
                  <div className="relative hidden sm:block">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-orange-500 rounded-lg flex items-center justify-center shadow-sm">
                      <BrandIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  {/* Brand Text */}
                  <div className="space-y-1">
                    <h1 className="text-lg sm:text-xl font-bold gradient-text">
                      AFILIADOS DA ELITE
                    </h1>
                    <p className="text-xs text-gray-600 font-medium hidden sm:block">
                      Portal Premium de Marketing Digital
                    </p>
                  </div>
              </div>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center gap-3 slide-in-right">
              {!loading && (
                <>
                  {user ? (
                    <div className="flex items-center gap-3">
                      <button 
                        className="btn-primary text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium"
                        onClick={() => navigate('/dashboard')}
                      >
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 hidden sm:inline" />
                          <span className="hidden sm:inline">Dashboard Elite</span>
                          <span className="sm:hidden">Dashboard</span>
                        </div>
                      </button>
                      <ThemeToggle />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button 
                        className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                        onClick={() => navigate('/login')}
                      >
                        Entrar
                      </button>
                      <button 
                        className="btn-primary text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium"
                        onClick={() => navigate('/signup')}
                      >
                        <span className="hidden sm:inline">Criar Conta Elite</span>
                          <span className="sm:hidden">Cadastrar</span>
                      </button>
                      <ThemeToggle />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-16 min-h-screen flex items-center relative" id="home">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 sm:space-y-8 slide-in-left text-center lg:text-left flex flex-col justify-center">
              {/* Elite Badge */}
              <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-200 rounded-full px-4 py-2 text-sm font-medium text-blue-700 w-fit mx-auto lg:mx-0">
                <Sparkles className="w-4 h-4" />
                Portal Premium Exclusivo
              </div>

              {/* Main Title */}
              <div className="space-y-4 mt-5 sm:mt-0">
                <h1 className="text-3xl lg:text-5xl font-bold leading-tight text-gray-900">
                  Área de Membros <span className="gradient-text">Exclusiva e Premium</span><br />
                  para <span className="text-gray-900">Afiliados Elite</span>
                </h1>
                <p className="text-lg lg:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light">
                Central completa para gerenciar seu desempenho como afiliado. Acesse conteúdos exclusivos, 
                materiais de marketing premium, comunidade ativa e acompanhe suas comissões em tempo real.
              </p>
              </div>
              
              {/* Benefits Badges */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 text-sm">
                <div className="flex items-center gap-2 bg-elite-primary-900/40 border border-elite-accent-500/30 rounded-full px-3 py-1.5 text-elite-accent-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>100% Gratuito</span>
                  </div>
                <div className="flex items-center gap-2 bg-elite-primary-900/40 border border-elite-secondary-500/30 rounded-full px-3 py-1.5 text-elite-secondary-400">
                  <Star className="w-4 h-4" />
                  <span>Acesso Vitalício</span>
                  </div>
                <div className="flex items-center gap-2 bg-elite-primary-900/40 border border-elite-primary-500/30 rounded-full px-3 py-1.5 text-elite-primary-400">
                  <Trophy className="w-4 h-4" />
                  <span>Suporte Premium</span>
                </div>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button 
                  className="group relative overflow-hidden bg-elite-button text-white px-8 py-4 rounded-xl font-bold text-lg shadow-glow hover:shadow-elite transition-all duration-300 transform hover:scale-105 border border-elite-secondary-500/40"
                  onClick={() => navigate('/signup')}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative flex items-center justify-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Começar Agora - Elite
                      </div>
                    </button>
                
                    <button 
                  className="group bg-transparent border-2 border-elite-primary-500/50 text-elite-primary-300 hover:bg-elite-primary-500/10 hover:border-elite-secondary-500/50 hover:text-elite-secondary-400 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300"
                  onClick={() => navigate('/login')}
                    >
                      <div className="flex items-center justify-center gap-2">
                    <Users className="w-5 h-5" />
                    Já Sou Membro
                    </div>
                  </button>
              </div>
            </div>
            
            {/* Right Content - Dashboard Preview */}
            <div className="flex justify-center slide-in-right">
              <div className="relative">
                {/* Laptop Frame */}
                <div className="relative laptop-mockup">
                  {/* Screen */}
                  <div className="bg-elite-primary-800 rounded-t-xl p-1 border-2 border-elite-primary-700 shadow-elite">
                    <div className="bg-elite-card rounded-lg overflow-hidden h-48 w-80 sm:h-64 sm:w-96 lg:h-96 lg:w-[520px] relative">
                      {/* Browser Chrome */}
                      <div className="flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-3 bg-elite-primary-800/50 border-b border-elite-primary-700/50">
                        <div className="flex gap-1 lg:gap-2">
                          <div className="w-2 h-2 lg:w-3 lg:h-3 rounded-full bg-red-400"></div>
                          <div className="w-2 h-2 lg:w-3 lg:h-3 rounded-full bg-yellow-400"></div>
                          <div className="w-2 h-2 lg:w-3 lg:h-3 rounded-full bg-elite-secondary-400"></div>
                        </div>
                        <div className="flex-1 bg-elite-primary-700/50 rounded px-2 lg:px-3 py-0.5 lg:py-1 mx-2 lg:mx-4">
                          <span className="text-xs text-elite-primary-400">app.afiliadoselite.com/dashboard</span>
                        </div>
                      </div>
                      
                      {/* Dashboard Preview */}
                      <div className="p-3 lg:p-5 space-y-2 lg:space-y-4 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-elite-primary-100 font-bold text-xs lg:text-base flex items-center gap-1 lg:gap-2">
                              <BrandIcon className="w-3 h-3 lg:w-4 lg:h-4" />
                              <span className="hidden sm:inline">Olá, Afiliado Elite!</span>
                              <span className="sm:hidden">Elite Dashboard</span>
                            </h3>
                            <p className="text-elite-secondary-400 text-xs lg:text-sm hidden sm:block">Bem-vindo ao seu dashboard premium</p>
                          </div>
                        </div>
                        
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-2 lg:gap-3">
                          <div className="bg-elite-primary-900/50 border border-elite-secondary-500/20 rounded-lg p-2 lg:p-3">
                            <div className="text-elite-secondary-400 text-xs lg:text-sm font-medium">Comissões</div>
                            <div className="text-elite-primary-100 text-sm lg:text-lg font-bold">R$ 2.847</div>
                          </div>
                          <div className="bg-elite-primary-900/50 border border-elite-accent-500/20 rounded-lg p-2 lg:p-3">
                            <div className="text-elite-accent-400 text-xs lg:text-sm font-medium">Vendas</div>
                            <div className="text-elite-primary-100 text-sm lg:text-lg font-bold">47</div>
                          </div>
                        </div>
                        
                        {/* Features List */}
                        <div className="space-y-1 lg:space-y-2">
                          <div className="flex items-center gap-2 text-xs lg:text-sm">
                            <div className="w-2 h-2 bg-elite-secondary-400 rounded-full"></div>
                            <span className="text-elite-primary-200">Produtos Exclusivos</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs lg:text-sm">
                            <div className="w-2 h-2 bg-elite-accent-400 rounded-full"></div>
                            <span className="text-elite-primary-200">Chat Tempo Real</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs lg:text-sm">
                            <div className="w-2 h-2 bg-elite-primary-400 rounded-full"></div>
                            <span className="text-elite-primary-200">Materiais Premium</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Laptop Base */}
                  <div className="h-4 lg:h-6 bg-elite-primary-700 rounded-b-xl border-2 border-t-0 border-elite-primary-600"></div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 lg:-top-6 lg:-right-6 bg-elite-button rounded-full p-2 lg:p-3 shadow-glow animate-float">
                  <DollarSign className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                  </div>
                <div className="absolute -bottom-4 -left-4 lg:-bottom-6 lg:-left-6 bg-elite-accent-500 rounded-full p-2 lg:p-3 shadow-glow animate-float" style={{animationDelay: '1s'}}>
                  <MessageSquare className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-elite-primary-100 mb-4">
              Tudo que você precisa para <span className="bg-gradient-to-r from-elite-secondary-400 to-elite-secondary-500 bg-clip-text text-transparent">maximizar seus resultados</span>
            </h2>
            <p className="text-lg text-elite-primary-200/80 max-w-3xl mx-auto">
              Uma plataforma completa desenvolvida exclusivamente para afiliados que querem alcançar o próximo nível
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            {[
              {
                icon: Book,
                title: "Produtos Exclusivos",
                description: "Acesso a produtos de alta conversão com comissões atrativas"
              },
              {
                icon: Users,
                title: "Comunidade Elite",
                description: "Network com os melhores afiliados e trocas de experiências"
              },
              {
                icon: DollarSign,
                title: "Acompanhamento em Tempo Real",
                description: "Dashboard completo com métricas e performance detalhada"
              },
              {
                icon: MessageSquare,
                title: "Chat Exclusivo",
                description: "Suporte direto e comunicação instantânea com a equipe"
              },
              {
                icon: Trophy,
                title: "Materiais Premium",
                description: "Criativos, scripts e materiais de marketing profissionais"
              },
              {
                icon: Star,
                title: "Suporte Personalizado",
                description: "Atendimento VIP com consultoria especializada"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-elite-primary-900/40 backdrop-blur-sm border border-elite-primary-700/30 rounded-xl p-6 hover:border-elite-secondary-500/40 transition-all duration-300 hover:shadow-glow"
              >
                <div className="w-12 h-12 bg-elite-secondary-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-elite-secondary-400" />
                </div>
                <h3 className="text-xl font-semibold text-elite-primary-100 mb-2">{feature.title}</h3>
                <p className="text-elite-primary-200/80">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 relative">
        <div className="absolute inset-0 bg-elite-button opacity-10" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-4xl font-bold text-elite-primary-100">
                Pronto para se tornar um <span className="bg-gradient-to-r from-elite-secondary-400 to-elite-secondary-500 bg-clip-text text-transparent">Afiliado Elite</span>?
            </h2>
              <p className="text-lg lg:text-xl text-elite-primary-200/80 max-w-2xl mx-auto">
                Junte-se a centenas de afiliados que já estão maximizando seus resultados conosco
            </p>
          </div>
          
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
                className="group relative overflow-hidden bg-elite-button text-white px-8 py-4 rounded-xl font-bold text-lg shadow-glow hover:shadow-elite transition-all duration-300 transform hover:scale-105 border border-elite-secondary-500/40"
                onClick={() => navigate('/signup')}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Começar Gratuitamente
                </div>
            </button>
              
              <button 
                className="group bg-transparent border-2 border-elite-primary-500/50 text-elite-primary-300 hover:bg-elite-primary-500/10 hover:border-elite-secondary-500/50 hover:text-elite-secondary-400 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300"
                onClick={() => navigate('/login')}
              >
                <div className="flex items-center justify-center gap-2">
                  <Users className="w-5 h-5" />
                  Fazer Login
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-elite-primary-700/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <BrandIcon className="w-8 h-8" />
              <div>
                <div className="font-bold text-elite-primary-100">Afiliados da Elite</div>
                <div className="text-sm text-elite-primary-400">Portal Premium de Marketing Digital</div>
              </div>
            </div>
            <div className="text-sm text-elite-primary-400">
              © 2025 Afiliados da Elite. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
