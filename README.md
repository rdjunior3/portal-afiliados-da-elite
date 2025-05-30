# Portal Afiliados da Elite

Uma plataforma moderna e escalável para gerenciamento de afiliados, construída com React, TypeScript, Supabase e Tailwind CSS.

## 🚀 Características

- **Autenticação Segura**: Sistema completo de autenticação com Supabase Auth
- **Dashboard Interativo**: Interface moderna com métricas em tempo real
- **Gestão de Links**: Criação e monitoramento de links de afiliados
- **Sistema de Comissões**: Rastreamento automático de conversões e pagamentos
- **Analytics Avançado**: Relatórios detalhados de performance
- **Design Responsivo**: Interface otimizada para todos os dispositivos

## 🏗️ Arquitetura

### Estrutura de Pastas Otimizada

```
src/
├── components/           # Componentes reutilizáveis
│   ├── ui/              # Componentes base (shadcn/ui)
│   ├── dashboard/       # Componentes específicos do dashboard
│   ├── products/        # Componentes de produtos
│   └── auth/           # Componentes de autenticação
├── layouts/            # Layouts da aplicação
│   ├── DashboardLayout.tsx
│   └── AuthLayout.tsx
├── pages/              # Páginas da aplicação
├── hooks/              # Hooks personalizados
│   ├── useAffiliateData.ts
│   ├── useProductData.ts
│   └── useAnalytics.ts
├── services/           # Camada de serviços/APIs
│   ├── api.service.ts
│   ├── affiliate.service.ts
│   ├── product.service.ts
│   └── commission.service.ts
├── types/              # Definições de tipos TypeScript
│   ├── affiliate.types.ts
│   ├── product.types.ts
│   └── commission.types.ts
├── config/             # Configurações
│   └── env.ts
└── lib/                # Utilitários
    └── utils.ts
```

### Tecnologias Utilizadas

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui, Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Estado**: TanStack Query (React Query)
- **Roteamento**: React Router DOM
- **Formulários**: React Hook Form + Zod
- **Gráficos**: Recharts

## 🛠️ Configuração

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

### Instalação

1. **Clone o repositório**
```bash
git clone <YOUR_GIT_URL>
cd portal-afiliados-da-elite
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do Supabase:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_TITLE="Portal Afiliados da Elite"
```

4. **Configure o banco de dados**
```bash
npm run setup-db
```

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

- **profiles**: Perfis de usuários/afiliados
- **products**: Produtos disponíveis para afiliação
- **categories**: Categorias de produtos
- **affiliate_links**: Links de afiliados
- **commissions**: Comissões geradas
- **payments**: Pagamentos realizados
- **link_analytics**: Analytics de cliques
- **notifications**: Sistema de notificações

### Funcionalidades do Banco

- **RLS (Row Level Security)**: Segurança a nível de linha
- **Triggers Automáticos**: Atualização de contadores e estatísticas
- **Funções Otimizadas**: Consultas complexas para relatórios
- **Índices de Performance**: Otimização para consultas frequentes

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento

# Build
npm run build           # Gera build de produção
npm run preview         # Preview do build

# Banco de Dados
npm run setup-db        # Aplica migrações
npm run seed-db         # Popula dados de exemplo

# Qualidade de Código
npm run lint            # Executa ESLint
```

## 📈 Funcionalidades

### Para Afiliados

- **Dashboard Personalizado**: Métricas e KPIs em tempo real
- **Gestão de Links**: Criação e monitoramento de links únicos
- **Relatórios**: Analytics detalhados de performance
- **Comissões**: Acompanhamento de ganhos e pagamentos
- **Perfil**: Gerenciamento de dados pessoais e bancários

### Para Administradores

- **Gestão de Produtos**: CRUD completo de produtos
- **Aprovações**: Sistema de aprovação de afiliados
- **Pagamentos**: Processamento de comissões
- **Analytics**: Relatórios globais da plataforma

## 🔒 Segurança

- **Autenticação JWT**: Tokens seguros via Supabase Auth
- **RLS**: Políticas de segurança a nível de banco
- **Validação**: Validação rigorosa de dados com Zod
- **HTTPS**: Comunicação criptografada
- **Sanitização**: Prevenção contra XSS e SQL Injection

## 🚀 Deploy

### Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute as migrações em `supabase/migrations/`
3. Configure as variáveis de ambiente

### Frontend

O projeto pode ser deployado em qualquer plataforma que suporte aplicações React:

- **Vercel**: Deploy automático via Git
- **Netlify**: Build e deploy contínuo
- **AWS S3 + CloudFront**: Hospedagem estática

## 📝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🤝 Suporte

Para suporte, entre em contato através do email: suporte@portalafiliados.com

---

**Portal Afiliados da Elite** - Transformando afiliados em parceiros de sucesso! 🚀
