
import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    // Remove previous theme classes
    body.classList.remove('dark-theme', 'light-theme');
    
    // Add current theme class
    body.classList.add(`${theme}-theme`);
    
    // Store theme preference
    localStorage.setItem('theme', theme);
    
    console.log(`🎨 Tema ${theme === 'dark' ? 'escuro' : 'claro'} ativado`);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return { theme, toggleTheme };
};
