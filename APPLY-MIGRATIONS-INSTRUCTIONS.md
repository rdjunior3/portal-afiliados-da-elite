# 🚀 INSTRUÇÕES PARA APLICAR MIGRAÇÕES - Portal Afiliados da Elite

## 📋 RESUMO DAS MELHORIAS IMPLEMENTADAS

✅ **Chat da Comunidade Melhorado** - Interface moderna com reações, replies e design aprimorado
✅ **Sistema de Upload de Materiais** - Suporte a Google Drive, Dropbox e upload direto
✅ **Gerenciamento de Roles** - Sistema completo de permissões e promoção de usuários
✅ **Sistema de Roles e Permissões** - Super Admin, Admin, Moderador, Afiliado, Usuário
✅ **Integração com Serviços Externos** - Google Drive, Dropbox, OneDrive, APIs de pagamento
✅ **Analytics Avançado** - Tracking de eventos personalizados e UTM parameters
✅ **Sistema de Webhooks** - Para integrações com plataformas externas

## 🔧 CORREÇÃO APLICADA

**Problema corrigido**: Erro de sintaxe na função `promote_user_role`
- **Erro anterior**: `GET DIAGNOSTICS user_found = FOUND;`
- **Correção**: `GET DIAGNOSTICS rows_affected = ROW_COUNT;`

## 🗄️ PASSO 1: APLICAR MIGRAÇÕES NO SUPABASE

### Opção A: Via Dashboard do Supabase (Recomendado)

1. **Acesse o Dashboard do Supabase**
   - URL: https://supabase.com/dashboard/project/rbqzddsserknaedojuex
   - Vá para SQL Editor

2. **Execute o arquivo de migração corrigido**
   - Copie todo o conteúdo do arquivo `supabase/enhanced-migrations.sql` (já corrigido)
   - Cole no SQL Editor
   - Execute a query

### Opção B: Via CLI do Supabase

```bash
# 1. Instalar Supabase CLI
npm install -g supabase

# 2. Fazer login
supabase login

# 3. Link com o projeto
supabase link --project-ref rbqzddsserknaedojuex

# 4. Aplicar migração
supabase db push
```

## 👤 PASSO 2: PROMOVER USUÁRIO PARA SUPER ADMIN

### Via SQL Editor:

```sql
-- Promover o usuário específico para super_admin
UPDATE profiles 
SET role = 'super_admin', 
    updated_at = NOW()
WHERE email = '04junior.silva09@gmail.com';

-- Verificar se foi aplicado
SELECT email, role, updated_at 
FROM profiles 
WHERE email = '04junior.silva09@gmail.com';
```

## 🔧 PASSO 3: CONFIGURAR STORAGE BUCKET

### 3.1 Criar Bucket para Uploads

1. **No Dashboard do Supabase**, vá para Storage
2. **Criar novo bucket**:
   - Nome: `uploads`
   - Público: `Sim`
   - Tamanho máximo: `10MB`

### 3.2 Configurar Políticas de Storage

```sql
-- Política para upload de arquivos
CREATE POLICY "Usuários podem fazer upload"
ON storage.objects FOR INSERT
WITH CHECK (
  auth.uid() = (storage.foldername(name))[1]::uuid
);

-- Política para visualizar arquivos públicos
CREATE POLICY "Arquivos públicos são visíveis"
ON storage.objects FOR SELECT
USING (bucket_id = 'uploads');

-- Política para atualizar próprios arquivos
CREATE POLICY "Usuários podem atualizar próprios arquivos"
ON storage.objects FOR UPDATE
USING (auth.uid() = (storage.foldername(name))[1]::uuid);

-- Política para deletar próprios arquivos
CREATE POLICY "Usuários podem deletar próprios arquivos"
ON storage.objects FOR DELETE
USING (auth.uid() = (storage.foldername(name))[1]::uuid);
```

## 🎯 PASSO 4: ATUALIZAR APLICAÇÃO

### 4.1 Atualizar Rotas no App.tsx

Adicione as novas rotas ao arquivo `src/App.tsx`:

```typescript
// ... existing imports ...
import UserRoleManager from './components/admin/UserRoleManager';
import MaterialsUploadManager from './components/MaterialsUploadManager';

// Adicionar na seção de rotas do dashboard:
<Route path="admin/users" element={<UserRoleManager />} />
<Route path="chat" element={<ChatPage />} />
```

### 4.2 Atualizar Navigation

Adicione links para as novas funcionalidades na navegação:

```typescript
// Para usuários admin/super_admin
{
  title: "Gerenciar Usuários",
  href: "/dashboard/admin/users",
  icon: Users,
  role: ["admin", "super_admin"]
},
{
  title: "Chat da Comunidade", 
  href: "/dashboard/chat",
  icon: MessageSquare
}
```

## 🔐 PASSO 5: CONFIGURAR VARIÁVEIS DE AMBIENTE

Atualize seu arquivo `.env`:

```env
# Supabase (existentes)
VITE_SUPABASE_URL=https://rbqzddsserknaedojuex.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Novas configurações
VITE_ENABLE_FILE_UPLOADS=true
VITE_MAX_FILE_SIZE=10485760
VITE_ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,mp4,mov,avi

# Integrações externas (opcional)
VITE_GOOGLE_DRIVE_API_KEY=your_google_drive_key
VITE_DROPBOX_APP_KEY=your_dropbox_key

# Analytics (opcional)
VITE_GOOGLE_ANALYTICS_ID=GA-XXXXXX
```

## 📱 PASSO 6: TESTAR FUNCIONALIDADES

### 6.1 Teste o Sistema de Roles

1. **Login como super admin** (04junior.silva09@gmail.com)
2. **Acesse** `/dashboard/admin/users`
3. **Teste promover** um usuário para moderador
4. **Verifique** se as permissões estão funcionando

### 6.2 Teste o Chat Melhorado

1. **Acesse** `/dashboard/chat`
2. **Teste enviar** mensagens
3. **Teste reações** nos emojis
4. **Verifique** se as salas estão sendo carregadas

### 6.3 Teste Upload de Materiais

1. **Acesse uma página de produto**
2. **Clique em** "Adicionar Material"
3. **Teste upload** de arquivo
4. **Teste link** do Google Drive
5. **Verifique** se aparece na lista

## 🔍 PASSO 7: VERIFICAR IMPLEMENTAÇÃO

Execute estas queries para verificar se tudo foi criado:

```sql
-- Verificar novas tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'file_uploads', 
  'external_integrations', 
  'webhooks', 
  'custom_events',
  'message_reactions',
  'chat_room_members'
);

-- Verificar roles
SELECT role, COUNT(*) as count 
FROM profiles 
GROUP BY role;

-- Verificar usuário super admin
SELECT email, role, is_verified 
FROM profiles 
WHERE role = 'super_admin';

-- Verificar salas de chat
SELECT name, description, is_active 
FROM chat_rooms;

-- Testar função corrigida
SELECT promote_user_role('04junior.silva09@gmail.com', 'super_admin');
```

## 🚨 POSSÍVEIS PROBLEMAS E SOLUÇÕES

### ✅ Problema RESOLVIDO: "unrecognized GET DIAGNOSTICS item"
**Causa**: Sintaxe incorreta na função `promote_user_role`
**Solução**: Corrigido para usar `ROW_COUNT` em vez de `FOUND`

### Problema: "relation does not exist"
**Solução**: Executar as migrações na ordem correta. Algumas tabelas dependem de outras.

### Problema: Permissões negadas no Storage
**Solução**: Verificar se as políticas RLS foram aplicadas corretamente.

### Problema: Chat não carrega mensagens
**Solução**: Verificar se as tabelas `chat_rooms` e `messages` foram criadas.

### Problema: Upload falha
**Solução**: 
1. Verificar se o bucket `uploads` foi criado
2. Verificar políticas de storage
3. Verificar tamanho máximo dos arquivos

## 🔍 VERIFICAÇÃO FINAL

Após aplicar a migração, execute este comando para verificar se a função foi criada corretamente:

```sql
SELECT routine_name, routine_type, routine_body 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'promote_user_role';
```

A função deve retornar resultados sem erros.

## 🎉 FUNCIONALIDADES IMPLEMENTADAS

### ✅ Sistema de Roles Avançado
- Super Admin: Controle total
- Admin: Gerenciamento de usuários e produtos  
- Moderador: Moderação de conteúdo e suporte
- Afiliado: Promoção de produtos
- Usuário: Acesso básico

### ✅ Chat da Comunidade Melhorado
- Interface moderna e responsiva
- Reações com emojis
- Sistema de reply/resposta
- Status online em tempo real
- Salas temáticas organizadas

### ✅ Sistema de Upload Avançado
- Upload direto de arquivos
- Integração com Google Drive
- Integração com Dropbox/OneDrive
- Preview de materiais
- Sistema de aprovação
- Tracking de downloads

### ✅ Analytics Avançado
- Eventos personalizados
- UTM parameters automáticos
- Tracking de origem de tráfego
- Relatórios detalhados

### ✅ Sistema de Integrações
- Webhooks para plataformas externas
- APIs de pagamento
- Email marketing
- Notificações push

## 📞 SUPORTE

Se encontrar problemas durante a implementação:

1. **Verifique os logs** do Supabase Dashboard
2. **Teste uma migração** de cada vez
3. **Backup do banco** antes de aplicar
4. **Entre em contato** se precisar de ajuda específica

---

**🎯 A migração foi corrigida e está pronta para aplicação! Todas as funcionalidades foram projetadas para escalabilidade e facilidade de manutenção! 🚀** 