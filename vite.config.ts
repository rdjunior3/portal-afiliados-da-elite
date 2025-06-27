import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Warmup arquivos críticos para melhor performance (Vite 5.1+)
    warmup: {
      clientFiles: [
        './src/components/dashboard/DashboardContent.tsx',
        './src/components/business/ProductCard.tsx',
        './src/pages/Index.tsx',
        './src/layouts/DashboardLayout.tsx',
        './src/lib/design-system.ts',
        './src/lib/elite-styles.ts',
      ],
    },
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Otimizações de CSS (Vite 5.1+)
  css: {
    preprocessorMaxWorkers: true, // CSS em threads separadas (40% mais rápido)
  },
  // Otimizações de dependências 
  optimizeDeps: {
    holdUntilCrawlEnd: false, // Melhor para cold starts em projetos grandes
    include: [
      '@supabase/supabase-js',
      '@tanstack/react-query',
      'react-router-dom',
      'framer-motion',
      'lucide-react',
    ],
  },
  // Otimizações de build
  build: {
    target: 'es2022', // Browsers modernos com ES2022
    reportCompressedSize: false, // Melhora performance do build
    chunkSizeWarningLimit: 1000, // Aumenta limite para chunks grandes
    cssCodeSplit: true, // Split CSS para melhor cache
    cssMinify: 'esbuild', // Minificação CSS rápida
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          supabase: ['@supabase/supabase-js'],
          query: ['@tanstack/react-query'],
        },
      },
    },
  },
  // Performance para desenvolvimento
  esbuild: {
    target: 'esnext',
    platform: 'browser',
  },
}));
