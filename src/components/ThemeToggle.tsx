import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className={cn(
        "text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200",
        "h-8 w-8 p-0", // Compacto para mobile
        "focus:ring-2 focus:ring-orange-400/20 focus:outline-none"
      )}
      aria-label={`Alternar para modo ${theme === 'dark' ? 'claro' : 'escuro'}`}
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 transition-transform duration-200 hover:rotate-12" />
      ) : (
        <Moon className="h-4 w-4 transition-transform duration-200 hover:-rotate-12" />
      )}
    </Button>
  );
};

export default ThemeToggle;
