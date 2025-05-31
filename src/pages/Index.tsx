import ThemeToggle from '../components/ThemeToggle';
import { LoadingScreen } from '../components/ui/loading';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize dark theme
    document.body.classList.add('dark-theme');
    
    // Animate counters
    const animateCounters = () => {
      const counters = document.querySelectorAll('.counter');
      counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target') || '0');
        const increment = target / 100;
        let current = 0;
        
        const updateCounter = () => {
          if (current < target) {
            current += increment;
            counter.textContent = Math.ceil(current).toLocaleString();
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target.toLocaleString();
          }
        };
        
        updateCounter();
      });
    };

    // Initialize animations
    setTimeout(animateCounters, 1000);
  }, []);

  const handleAuthAction = (mode: 'login' | 'signup') => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate(mode === 'login' ? '/login' : '/signup');
    }
  };

  if (loading) {
    return <LoadingScreen message="Carregando Portal da Elite..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(249,115,22,0.03)_0%,transparent_50%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(249,115,22,0.02)_0%,transparent_50%)] pointer-events-none"></div>
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-orange-500/20 shadow-lg shadow-orange-500/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Brand Section */}
            <div className="flex items-center gap-3 slide-in-left">
              <div className="relative group cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md transition-all duration-300 hover:shadow-lg">
                  {/* Trophy Emoji */}
                  <span className="text-xl">🏆</span>
                </div>
              </div>
              
              {/* Brand Text */}
              <div className="flex flex-col">
                <span className="text-xl font-bold text-orange-400 tracking-tight">
                  AFILIADOS DA ELITE
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Portal Premium de Marketing Digital
                </span>
              </div>
            </div>
            
            {/* Navigation Actions */}
            <div className="flex items-center gap-2 sm:gap-3 slide-in-right">
              {user ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="hidden sm:block">
                    <ThemeToggle />
                  </div>
                  <button 
                    className="group relative overflow-hidden bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-300 hover:to-orange-400 text-slate-900 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold shadow-lg hover:shadow-orange-500/30 transition-all duration-300 transform hover:scale-105 border border-orange-300/30"
                    onClick={() => navigate('/dashboard')}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center gap-1.5 sm:gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="hidden sm:inline">Dashboard</span>
                    </div>
                  </button>
                  <div className="sm:hidden">
                    <ThemeToggle />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 sm:gap-3">
                  <button 
                    className="group relative text-slate-300 hover:text-white px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 font-medium hover:bg-slate-800/50 backdrop-blur-sm"
                    onClick={() => handleAuthAction('login')}
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span className="hidden sm:inline">Entrar</span>
                    </div>
                  </button>
                  <button 
                    className="group relative overflow-hidden bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-300 hover:to-orange-400 text-slate-900 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold shadow-lg hover:shadow-orange-500/30 transition-all duration-300 transform hover:scale-105 border border-orange-300/30"
                    onClick={() => handleAuthAction('signup')}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center gap-1.5 sm:gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <span className="hidden sm:inline">Cadastrar Grátis</span>
                      <span className="sm:hidden">Cadastrar</span>
                    </div>
                  </button>
                  <div className="hidden sm:block">
                    <ThemeToggle />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 min-h-screen flex items-center relative" id="home">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8 slide-in-left text-center lg:text-left">
              <div className="space-y-6">
                <h1 className="text-3xl lg:text-5xl font-bold leading-tight">
                  Área de Membros <span className="text-orange-400 text-glow">Exclusiva e Premium</span><br />
                  para Afiliados Elite
                </h1>
              </div>
              
              <p className="text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light">
                Central completa para gerenciar seu desempenho como afiliado. Acesse conteúdos exclusivos, 
                materiais de marketing premium, comunidade ativa e acompanhe suas comissões em tempo real.
              </p>
              
              {/* Benefits Cards - Horizontal Layout with Smaller Font */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-5 max-w-5xl mx-auto lg:mx-0 mt-6">
                <div className="flex items-center gap-2 group cursor-default">
                  <div className="w-8 h-8 rounded-full bg-orange-400/10 flex items-center justify-center group-hover:bg-orange-400/20 transition-all duration-300">
                    <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">Conteúdo Exclusivo</div>
                    <div className="text-slate-400 text-xs">Videoaulas & Materiais</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 group cursor-default">
                  <div className="w-8 h-8 rounded-full bg-orange-400/10 flex items-center justify-center group-hover:bg-orange-400/20 transition-all duration-300">
                    <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">Comunidade Elite</div>
                    <div className="text-slate-400 text-xs">Chat & Networking</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 group cursor-default">
                  <div className="w-8 h-8 rounded-full bg-orange-400/10 flex items-center justify-center group-hover:bg-orange-400/20 transition-all duration-300">
                    <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">Dashboard Avançado</div>
                    <div className="text-slate-400 text-xs">Comissões & Performance</div>
                  </div>
                </div>
              </div>
              
              {/* CTAs */}
              <div className="flex flex-col gap-4 justify-center lg:justify-start max-w-md mx-auto lg:mx-0">
                {!user ? (
                  <>
                    {/* Primary CTA - Cadastro */}
                    <button 
                      className="group relative overflow-hidden bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 hover:from-orange-300 hover:via-orange-400 hover:to-orange-500 text-slate-900 font-bold py-4 px-8 rounded-2xl shadow-2xl shadow-orange-500/30 hover:shadow-orange-400/40 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-400/30"
                      onClick={() => handleAuthAction('signup')}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative flex items-center justify-center gap-3">
                        <svg className="w-6 h-6 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="text-xl">Acessar Área de Membros</span>
                        <div className="bg-yellow-400 text-slate-900 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                          🔥 ELITE
                        </div>
                      </div>
                    </button>
                    
                    {/* Secondary CTA - Login */}
                    <button 
                      className="group relative bg-slate-800/50 hover:bg-slate-700/50 border-2 border-slate-600 hover:border-orange-400/50 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
                      onClick={() => handleAuthAction('login')}
                    >
                      <div className="flex items-center justify-center gap-3">
                        <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        <span className="text-lg">Já sou afiliado - Entrar</span>
                      </div>
                    </button>
                  </>
                ) : (
                  <button 
                    className="group relative overflow-hidden bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 hover:from-orange-300 hover:via-orange-400 hover:to-orange-500 text-slate-900 font-bold py-4 px-8 rounded-2xl shadow-2xl shadow-orange-500/30 hover:shadow-orange-400/40 transition-all duration-300 transform hover:scale-105"
                    onClick={() => navigate('/dashboard')}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center justify-center gap-3">
                      <svg className="w-6 h-6 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="text-xl">Acessar Meu Dashboard</span>
                    </div>
                  </button>
                )}
              </div>
              
              {/* Trust indicators */}
              <div className="flex flex-wrap gap-6 text-sm text-slate-400 justify-center lg:justify-start">
                <div className="flex items-center gap-2 scale-hover">
                  <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Acesso Gratuito
                </div>
                <div className="flex items-center gap-2 scale-hover">
                  <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Seguro & Privado
                </div>
                <div className="flex items-center gap-2 scale-hover">
                  <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Disponível 24/7
                </div>
              </div>
            </div>
            
            {/* Right Side - Laptop Mockup */}
            <div className="lg:flex justify-center hidden slide-in-right">
              <div className="relative">
                {/* Laptop Frame */}
                <div className="relative laptop-mockup">
                  {/* Screen */}
                  <div className="bg-slate-800 rounded-t-xl p-1 border-2 border-slate-700 shadow-2xl">
                    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 rounded-lg overflow-hidden h-96 w-[540px] relative">
                      {/* Browser Chrome */}
                      <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-slate-700/50">
                        <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-400"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                          <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                        </div>
                        <div className="flex-1 bg-slate-700/50 rounded px-3 py-1 mx-4">
                          <span className="text-xs text-slate-400">app.afiliadosdaelite.com/dashboard</span>
                        </div>
                      </div>
                      
                      {/* Dashboard Preview */}
                      <div className="p-6 space-y-4 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-white font-bold text-lg">Olá, Afiliado Elite! 👋</h3>
                            <p className="text-slate-400 text-sm">Bem-vindo ao seu dashboard elite</p>
                          </div>
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-slate-900 text-sm font-bold">E</span>
                          </div>
                        </div>
                        
                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                            <div className="text-orange-400 text-xl font-bold">R$ 2.847</div>
                            <div className="text-slate-400 text-xs">Comissões</div>
                          </div>
                          <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                            <div className="text-orange-400 text-xl font-bold">1.234</div>
                            <div className="text-slate-400 text-xs">Cliques</div>
                          </div>
                          <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                            <div className="text-orange-400 text-xl font-bold">89%</div>
                            <div className="text-slate-400 text-xs">Taxa Conv.</div>
                          </div>
                        </div>
                        
                        {/* Content Sections */}
                        <div className="space-y-3">
                          <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/50">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 bg-orange-400 rounded flex items-center justify-center">
                                <svg className="w-4 h-4 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-10-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div>
                                <div className="text-white text-sm font-medium">Videoaulas Exclusivas</div>
                                <div className="text-slate-400 text-xs">12 novos conteúdos</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/50">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-400 rounded flex items-center justify-center">
                                <svg className="w-4 h-4 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                </svg>
                              </div>
                              <div>
                                <div className="text-white text-sm font-medium">Chat Comunidade</div>
                                <div className="text-slate-400 text-xs">5 mensagens não lidas</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Performance Chart Preview */}
                        <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/50">
                          <div className="text-white text-sm font-medium mb-2">Performance (7 dias)</div>
                          <div className="h-16 relative">
                            <svg className="w-full h-full" viewBox="0 0 200 40">
                              <defs>
                                <linearGradient id="chartGradientMockup" x1="0%" y1="0%" x2="0%" y2="100%">
                                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.4"/>
                                  <stop offset="100%" stopColor="#f97316" stopOpacity="0"/>
                                </linearGradient>
                              </defs>
                              <path 
                                d="M 5 30 Q 25 20 50 15 T 100 10 T 150 8 T 195 5" 
                                stroke="#f97316" 
                                strokeWidth="2" 
                                fill="none"
                                className="animate-pulse"
                                filter="drop-shadow(0 0 4px rgba(249, 115, 22, 0.3))"
                              />
                              <path 
                                d="M 5 30 Q 25 20 50 15 T 100 10 T 150 8 T 195 5 L 195 40 L 5 40 Z" 
                                fill="url(#chartGradientMockup)"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Laptop Base */}
                  <div className="h-4 bg-gradient-to-b from-slate-700 to-slate-800 rounded-b-xl border-2 border-t-0 border-slate-700 relative">
                    <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-slate-600 rounded-full"></div>
                  </div>
                </div>
                
                {/* Floating Elements - Enhanced */}
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-orange-400 to-orange-500 text-slate-900 px-3 py-1.5 rounded-full text-xs font-bold animate-pulse shadow-lg border border-orange-300/30">
                  ✨ ONLINE
                </div>
                <div className="absolute -bottom-3 -left-3 bg-gradient-to-r from-blue-400 to-blue-500 text-slate-900 px-3 py-1.5 rounded-full text-xs font-bold float-animation shadow-lg border border-blue-300/30">
                  💬 Chat Ativo
                </div>
                <div className="absolute top-1/2 -right-4 bg-gradient-to-r from-purple-400 to-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold transform -rotate-12 float-delay-2 shadow-lg border border-purple-300/30">
                  🔥 ELITE
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 glass-effect">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 slide-in-up">
            <h2 className="text-4xl font-bold mb-6">
              Por que <span className="text-orange-400 text-glow">Afiliados de Elite</span><br />
              escolhem nossa plataforma?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
            {[
              { 
                title: "Estratégias Vencedoras", 
                desc: "Acesso exclusivo às estratégias que geram milhões em vendas.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                )
              },
              { 
                title: "Oferecemos os melhores produtos do mercado para afiliados", 
                desc: "Produtos premium selecionados com alta taxa de conversão e comissões atrativas.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                )
              },
              { 
                title: "Criativos de Alta Conversão", 
                desc: "Biblioteca premium com materiais testados e otimizados.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4" />
                  </svg>
                )
              },
              { 
                title: "Analytics Avançado", 
                desc: "Dashboard completo com métricas em tempo real.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )
              },
              { 
                title: "Networking Elite", 
                desc: "Conecte-se com outros afiliados de alto nível.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )
              },
              { 
                title: "Suporte Premium 24/7", 
                desc: "Atendimento prioritário com especialistas.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )
              }
            ].map((item, index) => (
              <div key={index} className="glass-effect card-hover rounded-xl p-6 group">
                <div className="w-12 h-12 bg-orange-400/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-400/20 transition-colors scale-hover">
                  <div className="text-orange-400 icon-hover">{item.icon}</div>
                </div>
                <h3 className="font-bold text-lg mb-3">{item.title}</h3>
                <p className="text-slate-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400/5 to-orange-500/5 rounded-3xl"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <div className="slide-in-up">
            <h2 className="text-4xl font-bold mb-6">
              Pronto para se tornar um <span className="text-orange-400 text-glow">Afiliado de Elite</span>?
            </h2>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              Transforme sua vida financeira com nossa metodologia exclusiva. 
              Acesso 100% gratuito e sem compromisso.
            </p>
            
            <div className="free-badge text-white text-xl font-bold px-8 py-4 rounded-full inline-block mb-12">
              🎯 TOTALMENTE GRATUITO - R$ 0,00 - SEM TAXAS OCULTAS
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12 stagger-children">
            <div className="glass-effect card-hover rounded-xl p-6">
              <div className="text-3xl font-bold mb-2">R$ <span className="counter gradient-text" data-target="2800000">2.8M</span></div>
              <div className="text-slate-400">Em comissões geradas</div>
            </div>
            <div className="glass-effect card-hover rounded-xl p-6">
              <div className="text-3xl font-bold mb-2"><span className="counter gradient-text" data-target="457">457</span>+</div>
              <div className="text-slate-400">Afiliados ativos</div>
            </div>
            <div className="glass-effect card-hover rounded-xl p-6">
              <div className="text-3xl font-bold mb-2"><span className="counter gradient-text" data-target="89">89</span>%</div>
              <div className="text-slate-400">Aumento médio de faturamento</div>
            </div>
          </div>
          
          <div className="space-y-4 slide-in-up">
            <button 
              className="btn-primary bg-gradient-to-r from-orange-400 to-orange-500 text-slate-900 px-8 py-4 rounded-lg font-bold text-lg inline-flex items-center gap-3 focus-ring"
              onClick={() => handleAuthAction('signup')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Quero ser um Afiliado de Elite
            </button>
            <div>
              <button 
                className="text-slate-300 hover:text-orange-400 transition-colors underline scale-hover focus-ring"
                onClick={() => handleAuthAction('login')}
              >
                Já sou membro - Fazer Login
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
