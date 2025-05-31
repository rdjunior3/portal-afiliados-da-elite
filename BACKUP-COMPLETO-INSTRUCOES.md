# 🔐 BACKUP COMPLETO - Portal Afiliados da Elite

## 📋 RESUMO DO BACKUP

Este backup completo contém:
- ✅ Estrutura completa de arquivos e pastas
- ✅ Configurações do projeto (package.json, vite.config.ts, etc.)
- ✅ Código fonte principal
- ✅ Scripts de banco de dados
- ✅ Migrações SQL
- ✅ Variáveis de ambiente necessárias
- ✅ Documentação

## 🗂️ ARQUIVOS DE BACKUP CRIADOS

1. **backup-projeto.md** - Estrutura e configurações do projeto
2. **backup-codigo-principal.md** - Código fonte principal
3. **BACKUP-COMPLETO-INSTRUCOES.md** - Este arquivo com instruções

## 🚀 COMO RESTAURAR O PROJETO

### Passo 1: Preparar Ambiente
```bash
# Criar pasta do projeto
mkdir portal-afiliados-restaurado
cd portal-afiliados-restaurado

# Inicializar Git
git init
```

### Passo 2: Recriar Estrutura
Use o arquivo `backup-projeto.md` como referência para recriar a estrutura de pastas:

```bash
# Criar estrutura de pastas principais
mkdir -p public scripts src/{components/{ui,auth,dashboard,products},config,contexts,hooks,layouts,lib,pages/{dashboard},providers,services,types} supabase/migrations
```

### Passo 3: Restaurar Arquivos

1. **Arquivos de Configuração**: Copie de `backup-projeto.md`:
   - package.json
   - vite.config.ts
   - tsconfig.json
   - tailwind.config.ts
   - .gitignore

2. **Código Fonte**: Copie de `backup-codigo-principal.md`:
   - src/App.tsx
   - src/main.tsx
   - src/lib/supabase.ts
   - src/config/env.ts
   - Outros arquivos documentados

3. **Scripts e SQL**: Copie de ambos os arquivos de backup

### Passo 4: Instalar Dependências
```bash
npm install
```

### Passo 5: Configurar Variáveis de Ambiente

Criar arquivo `.env`:
```env
# Supabase
VITE_SUPABASE_URL=https://rbqzddsserknaedojuex.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJicXpkZHNzZXJrbmFlZG9qdWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MjE4NjYsImV4cCI6MjA2NDE5Nzg2Nn0.HU4i2JyLdV6c3CGUp5Ww-9doAELnReyFab7JPpiQWb4

# App
VITE_APP_TITLE=Portal Afiliados da Elite
VITE_APP_DESCRIPTION=Plataforma de afiliados premium

# Para executar scripts de banco (obter no Supabase Dashboard)
SUPABASE_SERVICE_KEY=your_service_key_here
```

### Passo 6: Configurar Banco de Dados

1. **Acessar Supabase**:
   - Projeto: https://supabase.com/dashboard/project/rbqzddsserknaedojuex

2. **Executar Migrações** (se novo projeto):
   ```bash
   npm run setup-db
   ```

3. **Popular Dados de Exemplo**:
   ```bash
   npm run seed-db
   ```

### Passo 7: Iniciar Desenvolvimento
```bash
npm run dev
```

O projeto estará disponível em http://localhost:8080

## 🔧 SCRIPT DE BACKUP AUTOMÁTICO

Crie um arquivo `create-backup.js` para automatizar backups futuros:

```javascript
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = `backup-${timestamp}`;
  
  console.log(`📦 Criando backup em ${backupDir}...`);
  
  // Criar diretório de backup
  fs.mkdirSync(backupDir, { recursive: true });
  
  // Lista de arquivos/pastas para backup
  const itemsToBackup = [
    'src',
    'public',
    'scripts',
    'supabase',
    'package.json',
    'package-lock.json',
    'vite.config.ts',
    'tsconfig.json',
    'tsconfig.app.json',
    'tsconfig.node.json',
    'tailwind.config.ts',
    'postcss.config.js',
    'eslint.config.js',
    'components.json',
    'vercel.json',
    'index.html',
    '.gitignore',
    'README.md'
  ];
  
  // Copiar arquivos
  itemsToBackup.forEach(item => {
    const sourcePath = path.join(process.cwd(), item);
    const destPath = path.join(backupDir, item);
    
    if (fs.existsSync(sourcePath)) {
      if (fs.lstatSync(sourcePath).isDirectory()) {
        // Copiar diretório recursivamente
        execSync(`cp -r "${sourcePath}" "${destPath}"`);
      } else {
        // Copiar arquivo
        fs.copyFileSync(sourcePath, destPath);
      }
      console.log(`✅ Copiado: ${item}`);
    } else {
      console.log(`⚠️  Não encontrado: ${item}`);
    }
  });
  
  // Criar arquivo ZIP (opcional)
  try {
    execSync(`zip -r "${backupDir}.zip" "${backupDir}"`);
    console.log(`\n📦 Backup criado: ${backupDir}.zip`);
  } catch (error) {
    console.log(`\n📁 Backup criado em: ${backupDir}`);
  }
}

// Executar backup
createBackup();
```

## 📝 CHECKLIST DE RESTAURAÇÃO

- [ ] Pasta do projeto criada
- [ ] Git inicializado
- [ ] Estrutura de pastas recriada
- [ ] Arquivos de configuração restaurados
- [ ] Código fonte restaurado
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` configurado
- [ ] Banco de dados configurado
- [ ] Migrações aplicadas
- [ ] Dados de exemplo populados (opcional)
- [ ] Projeto rodando (`npm run dev`)

## ⚠️ ARQUIVOS QUE PRECISAM SER OBTIDOS SEPARADAMENTE

Alguns arquivos grandes ou gerados não estão incluídos no backup:
- `node_modules/` - Será recriado com `npm install`
- `dist/` - Será gerado com `npm run build`
- `.env` - Deve ser criado manualmente por segurança
- Componentes UI individuais em `src/components/ui/` (50+ arquivos)

## 🔒 INFORMAÇÕES SENSÍVEIS

**Projeto Supabase ID**: rbqzddsserknaedojuex
**URL do Projeto**: https://rbqzddsserknaedojuex.supabase.co

⚠️ **IMPORTANTE**: Nunca commitar a `SUPABASE_SERVICE_KEY` no Git!

## 💡 DICAS ADICIONAIS

1. **Backup Regular**: Execute backups semanalmente
2. **Versionamento**: Use Git tags para marcar versões estáveis
3. **Documentação**: Mantenha este arquivo atualizado
4. **Testes**: Sempre teste a restauração em ambiente separado
5. **Segurança**: Armazene backups em local seguro

---

**Backup criado com sucesso!** 🎉

Para suporte ou dúvidas sobre restauração, consulte a documentação ou entre em contato. 