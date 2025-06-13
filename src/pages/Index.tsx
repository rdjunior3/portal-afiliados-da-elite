import ThemeToggle from '../components/ThemeToggle';
import { LoadingScreen } from '../components/ui/loading';
import EliteLogo from '../components/ui/EliteLogo';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(249,115,22,0.05)_0%,transparent_50%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(249,115,22,0.03)_0%,transparent_50%)] pointer-events-none"></div>
      
      {/* Navigation melhorada */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-950/90 border-b border-orange-500/30 shadow-2xl shadow-orange-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Brand Section melhorada - Design Clean */}
            <div className="slide-in-left">
              <div className="relative group">
                {/* Logo clean sem container - Mobile simplificado */}
                <div className="relative flex items-center gap-3">
                  {/* Ícone Troféu Elite - Apenas no desktop */}
                  <div className="relative hidden sm:block">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                      <svg className="w-7 h-7 text-slate-100" fill="currentColor" viewBox="0 0 24 24">
                        {/* Base/Pedestal escuro */}
                        <rect x="7" y="19" width="10" height="2.5" rx="0.5" fill="rgba(0,0,0,0.7)"/>
                        <rect x="8" y="18.5" width="8" height="1" fill="rgba(0,0,0,0.5)"/>
                        
                        {/* Haste */}
                        <rect x="10.5" y="16" width="3" height="3" fill="currentColor"/>
                        
                        {/* Copa Principal - Formato mais largo */}
                        <path d="M6 4C6 3.45 6.45 3 7 3H17C17.55 3 18 3.45 18 4V9C18 12.31 15.31 15 12 15C8.69 15 6 12.31 6 9V4Z" fill="currentColor"/>
                        
                        {/* Detalhes da Copa - linhas decorativas */}
                        <rect x="7" y="4" width="10" height="0.5" fill="rgba(255,255,255,0.3)"/>
                        <rect x="7" y="6" width="10" height="0.3" fill="rgba(255,255,255,0.2)"/>
                        
                        {/* Alças Laterais mais visíveis */}
                        <ellipse cx="5" cy="7.5" rx="1.5" ry="2" fill="currentColor"/>
                        <ellipse cx="19" cy="7.5" rx="1.5" ry="2" fill="currentColor"/>
                        <ellipse cx="5" cy="7.5" rx="0.8" ry="1.3" fill="rgba(255,255,255,0.2)"/>
                        <ellipse cx="19" cy="7.5" rx="0.8" ry="1.3" fill="rgba(255,255,255,0.2)"/>
                        
                        {/* Número 1 Central - mais proeminente */}
                        <text x="12" y="11" fontFamily="Arial, sans-serif" fontSize="6" fontWeight="bold" textAnchor="middle" fill="rgba(255,255,255,0.95)">1</text>
                        
                        {/* Estrelas ao redor do número 1 */}
                        <g fill="rgba(255,255,255,0.9)">
                          <polygon points="9,8 9.2,8.6 9.8,8.6 9.3,9 9.5,9.6 9,9.2 8.5,9.6 8.7,9 8.2,8.6 8.8,8.6"></polygon>
                          <polygon points="15,8 15.2,8.6 15.8,8.6 15.3,9 15.5,9.6 15,9.2 14.5,9.6 14.7,9 14.2,8.6 14.8,8.6"></polygon>
                          <polygon points="10.5,6 10.6,6.4 11,6.4 10.7,6.7 10.8,7.1 10.5,6.9 10.2,7.1 10.3,6.7 10,6.4 10.4,6.4"></polygon>
                          <polygon points="13.5,6 13.6,6.4 14,6.4 13.7,6.7 13.8,7.1 13.5,6.9 13.2,7.1 13.3,6.7 13,6.4 13.4,6.4"></polygon>
                          <polygon points="12,5 12.1,5.4 12.5,5.4 12.2,5.7 12.3,6.1 12,5.9 11.7,6.1 11.8,5.7 11.5,5.4 11.9,5.4"></polygon>
                        </g>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Texto da Marca */}
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-white tracking-tight">
                      AFILIADOS DA ELITE
                    </span>
                    <span className="text-xs text-orange-400 font-semibold tracking-wide">
                      PORTAL PREMIUM
                    </span>
                  </div>
              </div>
              </div>
            </div>
            
            {/* Navigation Actions melhoradas */}
            <div className="flex items-center gap-3 slide-in-right">
              {!loading && (
                <>
                  {user ? (
                    <div className="flex items-center gap-3">
                      <button 
                        className="group relative overflow-hidden bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 hover:from-orange-300 hover:via-orange-400 hover:to-orange-500 text-slate-100 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold shadow-xl hover:shadow-orange-500/40 transition-all duration-300 transform hover:scale-105 border-2 border-orange-300/40"
                        onClick={() => navigate('/dashboard')}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative flex items-center gap-2">
                          <svg className="w-4 h-4 hidden sm:inline" fill="#1e293b" viewBox="0 0 24 24">
                            <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
                            <circle cx="12" cy="8" r="1.5" fill="#f97316"/>
                            <circle cx="8.5" cy="10.5" r="0.8" fill="#f97316"/>
                            <circle cx="15.5" cy="10.5" r="0.8" fill="#f97316"/>
                            <circle cx="7" cy="13.5" r="0.6" fill="#f97316"/>
                            <circle cx="17" cy="13.5" r="0.6" fill="#f97316"/>
                          </svg>
                          <span className="hidden sm:inline">Dashboard Elite</span>
                          <span className="sm:hidden">Dashboard</span>
                        </div>
                      </button>
                      <ThemeToggle />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button 
                        className="group relative text-slate-300 hover:text-white px-3 sm:px-4 py-2.5 rounded-lg transition-all duration-300 font-semibold hover:bg-slate-800/60 backdrop-blur-sm border border-transparent hover:border-orange-500/30"
                        onClick={() => handleAuthAction('login')}
                      >
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 transition-transform group-hover:scale-110 hidden sm:inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                          <span className="hidden sm:inline">Entrar</span>
                          <span className="sm:hidden">Entrar</span>
                        </div>
                      </button>
                      <button 
                        className="group relative overflow-hidden bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 hover:from-orange-300 hover:via-orange-400 hover:to-orange-500 text-slate-100 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold shadow-xl hover:shadow-orange-500/40 transition-all duration-300 transform hover:scale-105 border-2 border-orange-300/40"
                        onClick={() => handleAuthAction('signup')}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative flex items-center gap-2">
                           <svg className="w-4 h-4 hidden sm:inline" fill="#1e293b" viewBox="0 0 24 24">
                            <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
                            <circle cx="12" cy="8" r="1.5" fill="#f97316"/>
                            <circle cx="8.5" cy="10.5" r="0.8" fill="#f97316"/>
                            <circle cx="15.5" cy="10.5" r="0.8" fill="#f97316"/>
                            <circle cx="7" cy="13.5" r="0.6" fill="#f97316"/>
                            <circle cx="17" cy="13.5" r="0.6" fill="#f97316"/>
                          </svg>
                          <span className="hidden sm:inline">Cadastrar Elite</span>
                          <span className="sm:hidden">Cadastrar</span>
                        </div>
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

      {/* Hero Section Clean e Alinhada - Espaçamento Mobile Ajustado */}
      <section className="pt-24 sm:pt-32 pb-16 min-h-screen flex items-center relative" id="home">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content - Organizado e Clean */}
            <div className="space-y-6 sm:space-y-8 slide-in-left text-center lg:text-left flex flex-col justify-center">
              {/* Título Principal - Espaçamento mobile ajustado */}
              <div className="space-y-4 mt-5 sm:mt-0">
                <h1 className="text-3xl lg:text-5xl font-bold leading-tight">
                  Área de Membros <span className="text-orange-400 text-glow">Exclusiva e Premium</span><br />
                  para <span className="text-white">Afiliados Elite</span>
                </h1>
                <p className="text-lg lg:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light">
                Central completa para gerenciar seu desempenho como afiliado. Acesse conteúdos exclusivos, 
                materiais de marketing premium, comunidade ativa e acompanhe suas comissões em tempo real.
              </p>
              </div>
              
              {/* Benefits Badges - Compactos e Alinhados */}
              <div className="w-full max-w-2xl mx-auto lg:mx-0">
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                  {/* Badge 1 - Conteúdo Exclusivo */}
                  <div className="group flex items-center gap-2 bg-slate-800/40 backdrop-blur-sm border border-orange-500/20 rounded-lg px-2.5 py-1.5 hover:border-orange-400/40 hover:bg-slate-800/60 transition-all duration-300 transform hover:scale-[1.02]">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-sm">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[11px] font-medium text-white leading-tight">Conteúdo Exclusivo</h3>
                    </div>
                  </div>
                  
                  {/* Badge 2 - Comunidade Elite */}
                  <div className="group flex items-center gap-2 bg-slate-800/40 backdrop-blur-sm border border-blue-500/20 rounded-lg px-2.5 py-1.5 hover:border-blue-400/40 hover:bg-slate-800/60 transition-all duration-300 transform hover:scale-[1.02]">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[11px] font-medium text-white leading-tight">Comunidade Elite</h3>
                    </div>
                  </div>
                  
                  {/* Badge 3 - Dashboard Avançado */}
                  <div className="group flex items-center gap-2 bg-slate-800/40 backdrop-blur-sm border border-green-500/20 rounded-lg px-2.5 py-1.5 hover:border-green-400/40 hover:bg-slate-800/60 transition-all duration-300 transform hover:scale-[1.02]">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-sm">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[11px] font-medium text-white leading-tight">Dashboard Avançado</h3>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Call-to-Action - Alinhados e Mobile-Friendly */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                    <button 
                  className="group relative overflow-hidden bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 hover:from-orange-300 hover:via-orange-400 hover:to-orange-500 text-slate-100 w-full sm:w-auto px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-orange-500/40 transition-all duration-300 transform hover:scale-105 border-2 border-orange-300/40"
                      onClick={() => handleAuthAction('signup')}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="#1e293b" viewBox="0 0 24 24">
                      <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
                      <circle cx="12" cy="8" r="1.5" fill="#f97316"/>
                      <circle cx="8.5" cy="10.5" r="0.8" fill="#f97316"/>
                      <circle cx="15.5" cy="10.5" r="0.8" fill="#f97316"/>
                      <circle cx="7" cy="13.5" r="0.6" fill="#f97316"/>
                      <circle cx="17" cy="13.5" r="0.6" fill="#f97316"/>
                    </svg>
                    <span>Tornar-se um Afiliado Elite</span>
                      </div>
                    </button>
                    <button 
                  className="group relative text-slate-300 hover:text-white w-full sm:w-auto px-8 py-4 rounded-lg transition-all duration-300 font-semibold hover:bg-slate-800/60 backdrop-blur-sm border border-transparent hover:border-orange-500/30"
                      onClick={() => handleAuthAction('login')}
                    >
                      <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                    <span>Já sou membro</span>
                    </div>
                  </button>
              </div>
            </div>
            
            {/* Right Side - Laptop Mockup Responsivo */}
            <div className="flex justify-center slide-in-right">
              <div className="relative">
                {/* Laptop Frame - Adaptativo */}
                <div className="relative laptop-mockup">
                  {/* Screen */}
                  <div className="bg-slate-800 rounded-t-xl p-1 border-2 border-slate-700 shadow-2xl">
                    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 rounded-lg overflow-hidden h-48 w-80 sm:h-64 sm:w-96 lg:h-96 lg:w-[520px] relative">
                      {/* Browser Chrome */}
                      <div className="flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-3 bg-slate-800/50 border-b border-slate-700/50">
                        <div className="flex gap-1 lg:gap-2">
                          <div className="w-2 h-2 lg:w-3 lg:h-3 rounded-full bg-red-400"></div>
                          <div className="w-2 h-2 lg:w-3 lg:h-3 rounded-full bg-yellow-400"></div>
                          <div className="w-2 h-2 lg:w-3 lg:h-3 rounded-full bg-orange-400"></div>
                        </div>
                        <div className="flex-1 bg-slate-700/50 rounded px-2 lg:px-3 py-0.5 lg:py-1 mx-2 lg:mx-4">
                          <span className="text-xs text-slate-400">app.afiliadoselite.com/dashboard</span>
                        </div>
                      </div>
                      
                      {/* Dashboard Preview Responsivo */}
                      <div className="p-3 lg:p-5 space-y-2 lg:space-y-4 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-white font-bold text-xs lg:text-base flex items-center gap-1 lg:gap-2">
                              <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="#f97316" viewBox="0 0 24 24">
                                <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
                                <circle cx="12" cy="8" r="1.5" fill="#fbbf24"/>
                                <circle cx="8.5" cy="10.5" r="0.8" fill="#fbbf24"/>
                                <circle cx="15.5" cy="10.5" r="0.8" fill="#fbbf24"/>
                                <circle cx="7" cy="13.5" r="0.6" fill="#fbbf24"/>
                                <circle cx="17" cy="13.5" r="0.6" fill="#fbbf24"/>
                              </svg>
                              <span className="hidden sm:inline">Olá, Afiliado Elite!</span>
                              <span className="sm:hidden">Elite Dashboard</span>
                            </h3>
                            <p className="text-orange-400 text-xs lg:text-sm hidden sm:block">Bem-vindo ao seu dashboard premium</p>
                          </div>

                        </div>
                        
                        {/* Stats Grid Responsivo */}
                        <div className="grid grid-cols-3 gap-1.5 lg:gap-2.5">
                          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-lg p-1.5 lg:p-2.5 border border-orange-500/30">
                            <div className="text-orange-300 text-sm lg:text-lg font-bold">R$ 2.487</div>
                            <div className="text-orange-400 text-xs font-medium hidden lg:block">Comissões</div>
                            <div className="text-orange-400 text-xs font-medium lg:hidden">Com.</div>
                          </div>
                          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-lg p-1.5 lg:p-2.5 border border-blue-500/30">
                            <div className="text-blue-300 text-sm lg:text-lg font-bold">1.842</div>
                            <div className="text-blue-400 text-xs font-medium hidden lg:block">Cliques</div>
                            <div className="text-blue-400 text-xs font-medium lg:hidden">Clicks</div>
                          </div>
                          <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-lg p-1.5 lg:p-2.5 border border-green-500/30">
                            <div className="text-green-300 text-sm lg:text-lg font-bold">8.2%</div>
                            <div className="text-green-400 text-xs font-medium">Conv.</div>
                          </div>
                        </div>
                        
                        {/* Content Sections Compactas */}
                        <div className="space-y-1.5 lg:space-y-2.5">
                          <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/5 rounded-lg p-1.5 lg:p-2.5 border border-orange-500/20">
                            <div className="flex items-center gap-1.5 lg:gap-2.5">
                              <div className="w-5 h-5 lg:w-7 lg:h-7 bg-orange-400 rounded flex items-center justify-center">
                                <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="#1e293b" viewBox="0 0 24 24">
                                  <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
                                  <circle cx="12" cy="8" r="1.5" fill="#f97316"/>
                                  <circle cx="8.5" cy="10.5" r="0.8" fill="#f97316"/>
                                  <circle cx="15.5" cy="10.5" r="0.8" fill="#f97316"/>
                                  <circle cx="7" cy="13.5" r="0.6" fill="#f97316"/>
                                  <circle cx="17" cy="13.5" r="0.6" fill="#f97316"/>
                                </svg>
                              </div>
                              <div>
                                <div className="text-white text-xs lg:text-sm font-medium">
                                  <span className="hidden sm:inline">Videoaulas Elite</span>
                                  <span className="sm:hidden">Aulas Elite</span>
                                </div>
                                <div className="text-orange-400 text-xs">
                                  <span className="hidden lg:inline">12 novos conteúdos premium</span>
                                  <span className="lg:hidden">12 novos</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/5 rounded-lg p-1.5 lg:p-2.5 border border-blue-500/20">
                            <div className="flex items-center gap-1.5 lg:gap-2.5">
                              <div className="w-5 h-5 lg:w-7 lg:h-7 bg-blue-400 rounded flex items-center justify-center">
                                <span className="text-slate-100 font-bold text-xs">💬</span>
                              </div>
                              <div>
                                <div className="text-white text-xs lg:text-sm font-medium">Chat Elite</div>
                                <div className="text-blue-400 text-xs">
                                  <span className="hidden lg:inline">5 mensagens premium</span>
                                  <span className="lg:hidden">5 novas</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Performance Chart Compacto */}
                        <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/5 rounded-lg p-1.5 lg:p-2.5 border border-purple-500/20">
                          <div className="text-white text-xs lg:text-sm font-medium mb-1 lg:mb-2 flex items-center gap-1 lg:gap-2">
                            <svg className="w-2 h-2 lg:w-3 lg:h-3" fill="#f97316" viewBox="0 0 24 24">
                              <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
                              <circle cx="12" cy="8" r="1.5" fill="#fbbf24"/>
                              <circle cx="8.5" cy="10.5" r="0.8" fill="#fbbf24"/>
                              <circle cx="15.5" cy="10.5" r="0.8" fill="#fbbf24"/>
                              <circle cx="7" cy="13.5" r="0.6" fill="#fbbf24"/>
                              <circle cx="17" cy="13.5" r="0.6" fill="#fbbf24"/>
                            </svg>
                            <span className="hidden sm:inline">Performance Elite (7 dias)</span>
                            <span className="sm:hidden">Performance</span>
                          </div>
                          <div className="h-8 lg:h-12 relative">
                            <svg className="w-full h-full" viewBox="0 0 200 30">
                              <defs>
                                <linearGradient id="chartGradientMockup" x1="0%" y1="0%" x2="0%" y2="100%">
                                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.6"/>
                                  <stop offset="100%" stopColor="#f97316" stopOpacity="0"/>
                                </linearGradient>
                              </defs>
                              <path 
                                d="M 5 25 Q 25 15 50 10 T 100 8 T 150 6 T 195 3" 
                                stroke="#f97316" 
                                strokeWidth="2" 
                                fill="none"
                                className="animate-pulse"
                                filter="drop-shadow(0 0 4px rgba(249, 115, 22, 0.4))"
                              />
                              <path 
                                d="M 5 25 Q 25 15 50 10 T 100 8 T 150 6 T 195 3 L 195 30 L 5 30 Z" 
                                fill="url(#chartGradientMockup)"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Laptop Base */}
                  <div className="h-3 lg:h-4 bg-gradient-to-b from-slate-700 to-slate-800 rounded-b-xl border-2 border-t-0 border-slate-700 relative">
                    <div className="absolute top-0.5 lg:top-1 left-1/2 transform -translate-x-1/2 w-12 lg:w-16 h-0.5 lg:h-1 bg-slate-600 rounded-full"></div>
                  </div>
                </div>
                
                {/* Floating Elements - Apenas CHAT mantido */}
                                  <div className="absolute -bottom-2 lg:-bottom-4 -left-2 lg:-left-4 bg-gradient-to-r from-blue-400 to-blue-500 text-slate-100 px-2 lg:px-4 py-1 lg:py-2 rounded-full text-xs font-bold float-animation shadow-xl border-2 border-blue-300/50 transform -rotate-2">
                  <div className="flex items-center gap-1">
                    <span className="text-xs lg:text-sm">💬</span>
                    <span className="hidden sm:inline">CHAT ATIVO</span>
                    <span className="sm:hidden">CHAT</span>
                  </div>
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
              🏆 TOTALMENTE GRATUITO - R$ 0,00 - SEM TAXAS OCULTAS
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12 stagger-children">
            <div className="glass-effect card-hover rounded-xl p-6">
              <div className="text-3xl font-bold mb-2">R$ <span className="counter gradient-text" data-target="47892">0</span></div>
              <div className="text-slate-400">Comissões da plataforma</div>
            </div>
            <div className="glass-effect card-hover rounded-xl p-6">
              <div className="text-3xl font-bold mb-2"><span className="counter gradient-text" data-target="237">0</span>+</div>
              <div className="text-slate-400">Afiliados ativos</div>
            </div>
            <div className="glass-effect card-hover rounded-xl p-6">
              <div className="text-3xl font-bold mb-2"><span className="counter gradient-text" data-target="96">0</span>%</div>
              <div className="text-slate-400">Taxa de satisfação</div>
            </div>
          </div>
          
          <div className="space-y-4 slide-in-up">
            <button 
              className="btn-primary bg-gradient-to-r from-orange-400 to-orange-500 text-slate-100 px-8 py-4 rounded-lg font-bold text-lg inline-flex items-center gap-3 focus-ring"
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

      {/* Footer */}
      <footer className="bg-slate-950/80 border-t border-orange-500/20 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} Afiliados da Elite. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
