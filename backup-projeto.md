# BACKUP - Portal Afiliados da Elite
Data: ${new Date().toISOString()}

## 📁 ESTRUTURA DO PROJETO

```
PORTAL AFILIADOS DA ELITE/
├── public/
│   ├── .htaccess
│   ├── _redirects
│   ├── 404.html
│   ├── favicon.ico
│   ├── manifest.json
│   ├── placeholder.svg
│   ├── robots.txt
│   └── sw.js
├── scripts/
│   ├── apply-migrations.js
│   └── seed-database.js
├── src/
│   ├── components/
│   │   ├── ui/ (50+ componentes shadcn/ui)
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── CreateLinkModal.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── ThemeToggle.tsx
│   ├── config/
│   │   └── env.ts
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   ├── index.ts
│   │   ├── use-mobile.tsx
│   │   ├── use-toast.ts
│   │   ├── useAffiliateData.ts
│   │   ├── useAffiliateLinks.ts
│   │   ├── useAnalytics.ts
│   │   ├── useCache.ts
│   │   ├── useProductData.ts
│   │   ├── useProducts.ts
│   │   └── useTheme.ts
│   ├── layouts/
│   │   └── DashboardLayout.tsx
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── utils.ts
│   ├── pages/
│   │   ├── dashboard/
│   │   │   ├── Analytics.tsx
│   │   │   ├── Commissions.tsx
│   │   │   ├── Links.tsx
│   │   │   ├── Notifications.tsx
│   │   │   ├── Payments.tsx
│   │   │   ├── Products.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── Reports.tsx
│   │   │   └── Settings.tsx
│   │   ├── Auth.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Index.tsx
│   │   ├── Login.tsx
│   │   ├── NotFound.tsx
│   │   └── Signup.tsx
│   ├── providers/
│   │   └── QueryProvider.tsx
│   ├── services/
│   │   └── api.service.ts
│   ├── types/
│   │   ├── affiliate.types.ts
│   │   ├── commission.types.ts
│   │   ├── database.types.ts
│   │   ├── index.ts
│   │   └── product.types.ts
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── supabase/
│   ├── migrations/
│   ├── complete-migration.sql
│   ├── config.toml
│   ├── consolidated-migrations.sql
│   └── seed-data.sql
├── .gitignore
├── bun.lockb
├── components.json
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vercel.json
└── vite.config.ts
```

## 🔧 ARQUIVOS DE CONFIGURAÇÃO

### package.json
```json
{
  "name": "portal-afiliados-da-elite",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "apply-migrations": "node scripts/apply-migrations.js",
    "setup-db": "npm run apply-migrations",
    "seed-db": "node scripts/seed-database.js",
    "setup-complete": "npm run apply-migrations && npm run seed-db"
  },
  "dependencies": {
    "@clerk/clerk-react": "^5.31.8",
    "@hookform/resolvers": "^3.9.0",
    "@radix-ui/react-accordion": "^1.2.0",
    "@radix-ui/react-alert-dialog": "^1.1.1",
    "@radix-ui/react-aspect-ratio": "^1.1.0",
    "@radix-ui/react-avatar": "^1.1.0",
    "@radix-ui/react-checkbox": "^1.1.1",
    "@radix-ui/react-collapsible": "^1.1.0",
    "@radix-ui/react-context-menu": "^2.2.1",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-dropdown-menu": "^2.1.1",
    "@radix-ui/react-hover-card": "^1.1.1",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-menubar": "^1.1.1",
    "@radix-ui/react-navigation-menu": "^1.2.0",
    "@radix-ui/react-popover": "^1.1.1",
    "@radix-ui/react-progress": "^1.1.0",
    "@radix-ui/react-radio-group": "^1.2.0",
    "@radix-ui/react-scroll-area": "^1.1.0",
    "@radix-ui/react-select": "^2.1.1",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-slider": "^1.2.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-switch": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-toast": "^1.2.1",
    "@radix-ui/react-toggle": "^1.1.0",
    "@radix-ui/react-toggle-group": "^1.1.0",
    "@radix-ui/react-tooltip": "^1.1.4",
    "@supabase/supabase-js": "^2.49.8",
    "@tanstack/react-query": "^5.56.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.0.0",
    "date-fns": "^3.6.0",
    "embla-carousel-react": "^8.3.0",
    "input-otp": "^1.2.4",
    "lucide-react": "^0.462.0",
    "next-themes": "^0.3.0",
    "react": "^18.3.1",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.53.0",
    "react-resizable-panels": "^2.1.3",
    "react-router-dom": "^6.26.2",
    "recharts": "^2.12.7",
    "sonner": "^1.5.0",
    "tailwind-merge": "^2.5.2",
    "tailwindcss-animate": "^1.0.7",
    "vaul": "^0.9.3",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@eslint/js": "^9.9.0",
    "@tailwindcss/typography": "^0.5.15",
    "@types/node": "^22.5.5",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react-swc": "^3.5.0",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.9.0",
    "eslint-plugin-react-hooks": "^5.1.0-rc.0",
    "eslint-plugin-react-refresh": "^0.4.9",
    "globals": "^15.9.0",
    "lovable-tagger": "^1.1.7",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.11",
    "typescript": "^5.5.3",
    "typescript-eslint": "^8.0.1",
    "vite": "^5.4.1"
  }
}
```

### vite.config.ts
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
```

### tsconfig.json
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### tailwind.config.ts
```typescript
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... mais configurações de cores
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;

export default config;
```

### .env (exemplo)
```env
# Supabase
VITE_SUPABASE_URL=https://rbqzddsserknaedojuex.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App
VITE_APP_TITLE=Portal Afiliados da Elite
VITE_APP_DESCRIPTION=Plataforma de afiliados premium
VITE_BASE_URL=http://localhost:8080

# Analytics (opcional)
VITE_GOOGLE_ANALYTICS_ID=GA-XXXXXX
```

## 📚 DOCUMENTAÇÃO DE RESTAURAÇÃO

### Como restaurar este backup:

1. **Criar nova pasta do projeto**
```bash
mkdir portal-afiliados-restaurado
cd portal-afiliados-restaurado
```

2. **Inicializar Git**
```bash
git init
```

3. **Copiar estrutura de arquivos**
- Use este documento como referência para recriar a estrutura
- Os arquivos principais estão documentados abaixo

4. **Instalar dependências**
```bash
npm install
```

5. **Configurar variáveis de ambiente**
- Criar arquivo `.env` com as variáveis necessárias

6. **Configurar Supabase**
- Criar projeto no Supabase
- Executar migrações: `npm run setup-db`
- Popular dados: `npm run seed-db`

7. **Iniciar desenvolvimento**
```bash
npm run dev
```

## 🗄️ BANCO DE DADOS

### Estrutura Principal (consolidated-migrations.sql)
- Extensões: uuid-ossp, pgcrypto
- Enums: affiliate_status, event_type, payment_method, notification_type, commission_status
- Tabelas: profiles, categories, products, affiliate_links, commissions, payments, etc.
- Triggers: update_updated_at, generate_affiliate_id, generate_short_code
- Funções: update_click_counters, update_conversion_counters, get_affiliate_stats

## 📝 NOTAS IMPORTANTES

1. **Projeto ID Supabase**: rbqzddsserknaedojuex
2. **Funcionalidades Incompletas**: Página de Produtos (src/pages/dashboard/Products.tsx)
3. **Dependências não utilizadas**: @clerk/clerk-react
4. **Porta padrão desenvolvimento**: 8080
5. **Build tool**: Vite com React SWC

---

Backup criado com sucesso!
Para backup dos arquivos de código específicos, solicite individualmente. 