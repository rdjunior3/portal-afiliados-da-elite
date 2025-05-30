
// Copy of main.tsx content for public folder structure
// Main JavaScript file for Afiliados da Elite

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Afiliados da Elite - Portal carregado com sucesso!');
    
    // Initialize all functionality
    initializeThemeToggle();
    initializeMobileMenu();
    initializeScrollEffects();
    initializeInteractiveElements();
    initializePlaceholderLogin();
});

// Theme Toggle Functionality
function initializeThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const themeIcon = themeToggle.querySelector('i');
    
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    
    // Apply saved theme
    if (savedTheme === 'light') {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        themeIcon.className = 'fas fa-sun';
    } else {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        themeIcon.className = 'fas fa-moon';
    }
    
    // Theme toggle event listener
    themeToggle.addEventListener('click', function() {
        const isCurrentlyDark = body.classList.contains('dark-theme');
        
        if (isCurrentlyDark) {
            // Switch to light theme
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            themeIcon.className = 'fas fa-sun';
            localStorage.setItem('theme', 'light');
            
            // Add transition effect
            body.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                body.style.transition = '';
            }, 300);
            
            console.log('🌞 Tema claro ativado');
        } else {
            // Switch to dark theme
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            themeIcon.className = 'fas fa-moon';
            localStorage.setItem('theme', 'dark');
            
            // Add transition effect
            body.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                body.style.transition = '';
            }, 300);
            
            console.log('🌙 Tema escuro ativado');
        }
    });
}

// Mobile Menu Functionality
function initializeMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!hamburger || !navMenu) return;
    
    hamburger.addEventListener('click', function() {
        const isOpen = navMenu.classList.contains('mobile-open');
        
        if (isOpen) {
            navMenu.classList.remove('mobile-open');
            hamburger.classList.remove('active');
        } else {
            navMenu.classList.add('mobile-open');
            hamburger.classList.add('active');
        }
        
        console.log('📱 Menu mobile alternado');
    });
    
    // Close menu when clicking on nav links
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('mobile-open');
            hamburger.classList.remove('active');
        });
    });
}

// Scroll Effects
function initializeScrollEffects() {
    const header = document.querySelector('.header');
    let lastScrollY = window.scrollY;
    
    // Header scroll effect
    window.addEventListener('scroll', function() {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Hide/show header on scroll
        if (currentScrollY > lastScrollY && currentScrollY > 200) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollY = currentScrollY;
    });
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = header.offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                console.log(`🎯 Navegando para: ${targetId}`);
            }
        });
    });
}

// Interactive Elements
function initializeInteractiveElements() {
    // Add hover effects to cards
    const cards = document.querySelectorAll('.resource-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Button click effects
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
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
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Animate dashboard stats
    animateDashboardStats();
}

// Dashboard Stats Animation
function animateDashboardStats() {
    const performanceValues = document.querySelectorAll('.performance-value');
    
    performanceValues.forEach(value => {
        const targetText = value.textContent;
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
}

// Placeholder Login Functionality
function initializePlaceholderLogin() {
    const googleLoginBtn = document.querySelector('.btn-primary[href*="google"], .btn-primary:has(.fa-google)');
    const emailLoginBtn = document.querySelector('.btn-secondary[href*="email"], .btn-secondary:has(.fa-envelope)');
    const accessAreaBtns = document.querySelectorAll('.btn-primary:not(:has(.fa-google)):not(:has(.fa-envelope))');
    
    // Google Login placeholder
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showLoginModal('google');
        });
    }
    
    // Email Login placeholder
    if (emailLoginBtn) {
        emailLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showLoginModal('email');
        });
    }
    
    // Access Area buttons
    accessAreaBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            showLoginModal('access');
        });
    });
}

// Login Modal (Placeholder)
function showLoginModal(type) {
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
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
        }
        
        .modal-content {
            background: var(--bg-card);
            border: 1px solid var(--border-primary);
            border-radius: 16px;
            max-width: 400px;
            width: 100%;
            backdrop-filter: blur(20px);
            animation: slideIn 0.3s ease;
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 1px solid var(--border-secondary);
        }
        
        .modal-header h3 {
            margin: 0;
            color: var(--text-primary);
            font-family: var(--font-primary);
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: var(--text-secondary);
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
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
            padding: 1.5rem;
        }
        
        .modal-body p {
            color: var(--text-secondary);
            margin-bottom: 1.5rem;
            line-height: 1.6;
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
                transform: translateY(-20px) scale(0.95);
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
    
    closeBtn.addEventListener('click', closeModal);
    okBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeModal();
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    console.log(`💡 Modal de ${type} exibido`);
}

// Add additional CSS for ripple animation
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
    
    .header.scrolled {
        background: var(--bg-card);
        box-shadow: var(--shadow-secondary);
    }
    
    @media (max-width: 768px) {
        .nav-menu {
            position: fixed;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--bg-card);
            backdrop-filter: blur(20px);
            border-top: 1px solid var(--border-primary);
            flex-direction: column;
            padding: 1rem;
            gap: 1rem;
            transform: translateY(-100%);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        
        .nav-menu.mobile-open {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
        }
        
        .hamburger.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .hamburger.active span:nth-child(2) {
            opacity: 0;
        }
        
        .hamburger.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
    }
`;

document.head.appendChild(rippleStyle);

// Console welcome message
console.log(`
🚀 AFILIADOS DA ELITE - PORTAL EXCLUSIVO
========================================
✨ Design futurista carregado com sucesso!
🎨 Tema: ${document.body.classList.contains('dark-theme') ? 'Dark Mode' : 'Light Mode'}
📱 Responsividade: Ativa
🔥 Interatividade: 100%

Recursos disponíveis:
- 🌙 Alternância de tema (Dark/Light)
- 📱 Menu mobile responsivo
- 🎯 Navegação suave
- ⚡ Efeitos interativos
- 🔐 Modais de login (placeholder)
- 📊 Animações do dashboard

Desenvolvido com amor para a comunidade de afiliados! 💚
`);
