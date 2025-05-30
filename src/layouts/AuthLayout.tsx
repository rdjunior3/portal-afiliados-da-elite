import React from 'react';
import ThemeToggle from '@/components/ThemeToggle';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title = "Portal Afiliados da Elite",
  subtitle = "Plataforma de afiliados premium"
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="absolute top-4 right-4">
        <ThemeToggle />
      </header>

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Logo/Brand */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary mb-2">
              {title}
            </h1>
            <p className="text-muted-foreground">
              {subtitle}
            </p>
          </div>

          {/* Auth Form */}
          <div className="bg-card border rounded-lg shadow-lg p-6">
            {children}
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024 Portal Afiliados da Elite. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout; 