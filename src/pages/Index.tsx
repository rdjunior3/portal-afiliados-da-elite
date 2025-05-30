
import ThemeToggle from '../components/ThemeToggle';
import { useEffect } from 'react';

const Index = () => {
  useEffect(() => {
    // Initialize dark theme on component mount
    document.body.classList.add('dark-theme');
    
    // Initialize interactive effects
    const initializeEffects = () => {
      // Add ripple effect to buttons
      const buttons = document.querySelectorAll('.btn');
      buttons.forEach(button => {
        button.addEventListener('click', function(e: any) {
          const ripple = document.createElement('span');
          const rect = this.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height);
          const x = e.clientX - rect.left - size / 2;
          const y = e.clientY - rect.top - size / 2;
          
          ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
          `;
          
          (this as HTMLElement).style.position = 'relative';
          (this as HTMLElement).style.overflow = 'hidden';
          (this as HTMLElement).appendChild(ripple);
          
          setTimeout(() => {
            ripple.remove();
          }, 600);
        });
      });

      // Animate stats numbers
      const performanceValues = document.querySelectorAll('.performance-value');
      performanceValues.forEach(value => {
        const targetText = value.textContent || '';
        const isPrice = targetText.includes('R$');
        const targetNumber = parseFloat(targetText.replace(/[R$,\s]/g, ''));
        
        if (!isNaN(targetNumber)) {
          let currentNumber = 0;
          const increment = targetNumber / 50;
          const interval = setInterval(() => {
            currentNumber += increment;
            
            if (currentNumber >= targetNumber) {
              currentNumber = targetNumber;
              clearInterval(interval);
            }
            
            const formattedNumber = isPrice 
              ? `R$ ${currentNumber.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
              : currentNumber.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
            
            value.textContent = formattedNumber;
          }, 50);
        }
      });

      console.log('🚀 Afiliados da Elite - Efeitos interativos carregados!');
    };

    // Add modal functionality for login buttons
    const showLoginModal = (type: string) => {
      const modal = document.createElement('div');
      modal.className = 'login-modal';
      
      let title, content;
      
      switch(type) {
        case 'google':
          title = '🔐 Login com Google';
          content = 'Em breve! Integração com OAuth2 Google será implementada.';
          break;
        case 'email':
          title = '📧 Cadastro com Email';
          content = 'Sistema de cadastro em desenvolvimento. Aguarde!';
          break;
        default:
          title = '🚀 Área Exclusiva';
          content = 'Portal em desenvolvimento! Em breve você terá acesso a conteúdos exclusivos.';
      }
      
      modal.innerHTML = `
        <div class="modal-overlay">
          <div class="modal-content">
            <div class="modal-header">
              <h3>${title}</h3>
              <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
              <p>${content}</p>
              <div class="modal-actions">
                <button class="btn btn-primary">Entendi</button>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Add modal styles
      const style = document.createElement('style');
      style.textContent = `
        .login-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 10000;
          animation: fadeIn 0.3s ease;
        }
        
        .modal-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(16px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        
        .modal-content {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: 20px;
          max-width: 450px;
          width: 100%;
          backdrop-filter: blur(24px);
          animation: slideIn 0.3s ease;
          box-shadow: var(--shadow-secondary);
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.75rem;
          border-bottom: 1px solid var(--border-secondary);
        }
        
        .modal-header h3 {
          margin: 0;
          color: var(--text-primary);
          font-family: var(--font-primary);
          font-size: 1.25rem;
          font-weight: 700;
        }
        
        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s ease;
        }
        
        .modal-close:hover {
          color: var(--accent-primary);
          background: var(--bg-secondary);
        }
        
        .modal-body {
          padding: 1.75rem;
        }
        
        .modal-body p {
          color: var(--text-secondary);
          margin-bottom: 1.75rem;
          line-height: 1.7;
          font-size: 1rem;
        }
        
        .modal-actions {
          display: flex;
          justify-content: center;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: translateY(-30px) scale(0.9);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `;
      
      document.head.appendChild(style);
      document.body.appendChild(modal);
      
      // Close modal events
      const closeBtn = modal.querySelector('.modal-close');
      const overlay = modal.querySelector('.modal-overlay');
      const okBtn = modal.querySelector('.btn-primary');
      
      function closeModal() {
        modal.style.animation = 'fadeIn 0.3s ease reverse';
        setTimeout(() => {
          modal.remove();
          style.remove();
        }, 300);
      }
      
      closeBtn?.addEventListener('click', closeModal);
      okBtn?.addEventListener('click', closeModal);
      overlay?.addEventListener('click', function(e) {
        if (e.target === overlay) {
          closeModal();
        }
      });
      
      // Close on Escape key
      const escapeHandler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closeModal();
          document.removeEventListener('keydown', escapeHandler);
        }
      };
      document.addEventListener('keydown', escapeHandler);
    };

    // Add click handlers for login buttons
    const addLoginHandlers = () => {
      const accessButtons = document.querySelectorAll('.btn-primary:not(.modal-close)');
      const emailButton = document.querySelector('.btn-secondary');
      
      accessButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const hasGoogleIcon = btn.querySelector('.fa-google');
          showLoginModal(hasGoogleIcon ? 'google' : 'access');
        });
      });

      emailButton?.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginModal('email');
      });
    };

    // Initialize everything
    setTimeout(() => {
      initializeEffects();
      addLoginHandlers();
    }, 100);

    return () => {
      // Cleanup event listeners if needed
    };
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="header">
        <nav className="nav">
          <div className="nav-brand">
            <i className="fas fa-crown brand-icon"></i>
            <span className="brand-text">Afiliados da Elite</span>
          </div>
          
          <ul className="nav-menu">
            <li><a href="#home" className="nav-link">Home</a></li>
            <li><a href="#recursos" className="nav-link">Recursos</a></li>
            <li><a href="#suporte" className="nav-link">Suporte</a></li>
            <li><a href="#contato" className="nav-link">Contato</a></li>
          </ul>
          
          <div className="nav-actions">
            <ThemeToggle />
            <button className="btn btn-primary">Acessar Área</button>
          </div>
          
          <div className="hamburger" id="hamburger">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="hero" id="home">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Sua Jornada de <span className="highlight">Elite</span><br />
                no Marketing de <span className="highlight">Afiliados</span>
              </h1>
              <p className="hero-subtitle">
                Acesse conteúdos educacionais premium, estratégias avançadas, criativos exclusivos, 
                suporte 24h e uma comunidade de elite. Tudo <strong>100% GRATUITO</strong> para membros selecionados.
              </p>
              
              <div className="hero-stats">
                <div className="stat-item">
                  <i className="fas fa-users"></i>
                  <span className="stat-number">2,847</span>
                  <span className="stat-label">Membros Ativos</span>
                </div>
                <div className="stat-item">
                  <i className="fas fa-chart-line"></i>
                  <span className="stat-number">R$ 12.5M</span>
                  <span className="stat-label">Comissões Geradas</span>
                </div>
              </div>
              
              <div className="hero-actions">
                <button className="btn btn-primary btn-large">
                  <i className="fas fa-rocket"></i>
                  Entrar na Área Exclusiva
                </button>
                <button className="btn btn-secondary btn-large">
                  <i className="fas fa-play"></i>
                  Saiba Mais
                </button>
              </div>
            </div>
            
            <div className="hero-visual">
              <div className="dashboard-mockup">
                <div className="dashboard-header">
                  <div className="dashboard-title">Dashboard Performance</div>
                  <div className="dashboard-status online">
                    <div className="status-dot"></div>
                    ONLINE
                  </div>
                </div>
                
                <div className="performance-card">
                  <div className="performance-item">
                    <span className="performance-label">Vendas Hoje</span>
                    <span className="performance-value">R$ 4,847</span>
                    <span className="performance-change positive">+15.2%</span>
                  </div>
                  <div className="performance-item">
                    <span className="performance-label">Comissão</span>
                    <span className="performance-value">R$ 1,454</span>
                    <span className="performance-change positive">+8.7%</span>
                  </div>
                </div>
                
                <div className="chart-placeholder">
                  <div className="chart-line"></div>
                  <div className="chart-points">
                    <div className="chart-point"></div>
                    <div className="chart-point"></div>
                    <div className="chart-point active"></div>
                    <div className="chart-point"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Resources Section */}
        <section className="resources" id="recursos">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Recursos de <span className="highlight">Alta Performance</span></h2>
              <p className="section-subtitle">Ferramentas e conteúdos exclusivos para maximizar seus resultados como afiliado de elite</p>
            </div>
            
            <div className="resources-grid">
              <div className="resource-card featured">
                <div className="card-header">
                  <i className="fas fa-graduation-cap"></i>
                  <span className="card-badge">PREMIUM</span>
                </div>
                <h3 className="card-title">Conteúdo Educacional</h3>
                <p className="card-description">
                  Treinamentos avançados, webinars exclusivos e materiais didáticos 
                  criados por especialistas da indústria para acelerar seu crescimento.
                </p>
                <button className="card-action">
                  Explorar Conteúdo <i className="fas fa-arrow-right"></i>
                </button>
              </div>
              
              <div className="resource-card">
                <div className="card-header">
                  <i className="fas fa-headset"></i>
                </div>
                <h3 className="card-title">Suporte 24/7</h3>
                <p className="card-description">
                  Atendimento especializado disponível 24 horas por dia 
                  para resolver suas dúvidas e otimizar suas campanhas em tempo real.
                </p>
                <button className="card-action">
                  Falar com Suporte <i className="fas fa-arrow-right"></i>
                </button>
              </div>
              
              <div className="resource-card">
                <div className="card-header">
                  <i className="fas fa-users"></i>
                </div>
                <h3 className="card-title">Comunidade Elite</h3>
                <p className="card-description">
                  Conecte-se com outros afiliados de alto nível, 
                  compartilhe estratégias vencedoras e forme parcerias lucrativas.
                </p>
                <button className="card-action">
                  Entrar na Comunidade <i className="fas fa-arrow-right"></i>
                </button>
              </div>
              
              <div className="resource-card">
                <div className="card-header">
                  <i className="fas fa-chart-line"></i>
                </div>
                <h3 className="card-title">Analytics Avançado</h3>
                <p className="card-description">
                  Dashboard completo com métricas em tempo real, 
                  relatórios detalhados e insights acionáveis para maximizar conversões.
                </p>
                <button className="card-action">
                  Ver Dashboard <i className="fas fa-arrow-right"></i>
                </button>
              </div>

              <div className="resource-card featured">
                <div className="card-header">
                  <i className="fas fa-palette"></i>
                  <span className="card-badge">EXCLUSIVO</span>
                </div>
                <h3 className="card-title">Material de Apoio</h3>
                <p className="card-description">
                  Banco completo de criativos validados, templates de alta conversão 
                  e materiais de apoio testados por afiliados top performers.
                </p>
                <button className="card-action">
                  Acessar Materiais <i className="fas fa-arrow-right"></i>
                </button>
              </div>

              <div className="resource-card featured">
                <div className="card-header">
                  <i className="fas fa-tools"></i>
                  <span className="card-badge">PRO</span>
                </div>
                <h3 className="card-title">Ferramentas Exclusivas</h3>
                <p className="card-description">
                  Suite completa de ferramentas proprietárias: link rotators, 
                  spy tools, calculadoras de ROI e automações para afiliados profissionais.
                </p>
                <button className="card-action">
                  Explorar Ferramentas <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2 className="cta-title">Pronto para se tornar um <span className="highlight">Afiliado de Elite</span>?</h2>
              <p className="cta-subtitle">Junte-se a milhares de afiliados que já transformaram seus resultados com nossa plataforma</p>
              
              <div className="cta-actions">
                <button className="btn btn-primary btn-large">
                  <i className="fab fa-google"></i>
                  Entrar com Google
                </button>
                <button className="btn btn-secondary btn-large">
                  <i className="fas fa-envelope"></i>
                  Cadastrar com Email
                </button>
              </div>
              
              <p className="cta-note">
                <i className="fas fa-shield-check"></i>
                100% seguro e gratuito • Sem compromisso • Acesso imediato
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <i className="fas fa-crown brand-icon"></i>
              <span className="brand-text">Afiliados da Elite</span>
            </div>
            <p className="footer-text">
              © 2024 Afiliados da Elite. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
