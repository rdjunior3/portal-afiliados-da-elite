# Portal Afiliados da Elite 🚀

Sistema de gerenciamento de afiliados com foco em produtos digitais, construído com React, Vite, TypeScript e Supabase.

## 🌟 Funcionalidades

- ✅ Gerenciamento de produtos para afiliação
- 📊 Calculadora de ganhos em tempo real
- 🖼️ Upload de imagens para produtos
- 👤 Perfil personalizado com avatar
- 📈 Métricas de performance
- 🔒 Sistema de autenticação seguro

## 🛠️ Tecnologias

- **Frontend:**
  - React 18
  - TypeScript
  - Vite
  - TailwindCSS
  - Radix UI
  - React Query

- **Backend:**
  - Supabase
  - PostgreSQL
  - Storage Buckets
  - Row Level Security (RLS)

## 📦 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase

## 🚀 Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/portal-afiliados-da-elite.git
   cd portal-afiliados-da-elite
   ```

2. **Instale as dependências**
   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   ```
   Edite o arquivo `.env` com suas credenciais do Supabase:
   ```env
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima
   ```

4. **Execute as migrações do banco**
   ```bash
   npm run setup-db
   ```

5. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

## 🗄️ Estrutura do Banco

### Tabelas Principais

- `products`: Produtos disponíveis para afiliação
- `profiles`: Perfis de usuários e afiliados
- `categories`: Categorias de produtos

### Storage Buckets

- `products`: Imagens de produtos
- `avatars`: Fotos de perfil

## 🔒 Segurança

- Autenticação via Supabase Auth
- Row Level Security (RLS) em todas as tabelas
- Políticas de acesso granular
- Validação de dados no frontend e backend

## 📚 Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Compila o projeto para produção
- `npm run lint`: Executa o linter
- `npm run setup-db`: Configura o banco de dados
- `npm run setup-complete`: Configuração completa com seed

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Convenções de Código

- **Commits:** Seguimos o padrão Conventional Commits
- **Branches:**
  - `main`: Produção
  - `develop`: Desenvolvimento
  - `feature/*`: Novas funcionalidades
  - `fix/*`: Correções
  - `hotfix/*`: Correções urgentes

## 🔧 Configuração do Supabase

1. Crie um projeto no Supabase
2. Execute os scripts de migração em `supabase/migrations`
3. Configure as políticas RLS conforme `supabase/policies`
4. Crie os buckets de storage necessários

## 📱 Responsividade

O sistema é totalmente responsivo e testado em:
- 📱 Dispositivos móveis (>= 320px)
- 💻 Tablets (>= 768px)
- 🖥️ Desktops (>= 1024px)

## ⚙️ Variáveis de Ambiente

```env
# Supabase
VITE_SUPABASE_URL=sua_url
VITE_SUPABASE_ANON_KEY=sua_chave

# App
VITE_APP_URL=http://localhost:5173
VITE_APP_NAME="Portal Afiliados da Elite"

# Configurações
VITE_MAX_UPLOAD_SIZE=10485760
VITE_ALLOWED_IMAGE_TYPES="image/jpeg,image/png,image/webp"
```

## 🐛 Debugging

Para logs detalhados, use:
```javascript
console.log('🚀 [saveMutation]', data);
console.log('✅ [validation]', result);
console.log('❌ [error]', error);
```

## 📈 Monitoramento

- Logs detalhados no console
- Mensagens de erro amigáveis
- Toast notifications para feedback
- Indicadores de loading

## 🔍 Testes

1. **Cadastro de Produtos**
   - Criar produto
   - Upload de imagem
   - Calculadora de ganhos

2. **Perfil**
   - Upload de avatar
   - Edição de informações
   - Salvamento de configurações

## 📞 Suporte

Para suporte, abra uma issue ou contate a equipe de desenvolvimento.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**Portal Afiliados da Elite** - Transformando afiliados em parceiros de sucesso! 🚀

# Deploy trigger

# Deploy Trigger - Repositório Público
