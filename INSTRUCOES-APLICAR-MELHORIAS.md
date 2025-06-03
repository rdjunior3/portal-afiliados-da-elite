# 🔧 Instruções para Aplicar Melhorias - Portal Afiliados da Elite

## 📋 Resumo das Melhorias Implementadas

### ✅ Problemas Corrigidos:
1. **Upload de Imagem** - Configuração de buckets do Supabase Storage
2. **Fluxo de Cadastro** - Página de completar perfil obrigatória
3. **Status do Afiliado** - Alteração automática para "Ativo" após completar perfil  
4. **Chat Bloqueado** - Acesso condicionado ao status aprovado
5. **Páginas Desnecessárias** - Remoção/simplificação de funcionalidades de comissões

### 🚀 Novas Funcionalidades:
- Página de onboarding (`/complete-profile`)
- Upload de avatar com validação melhorada
- Proteção de rotas baseada no status do perfil
- Dashboard simplificado focado em produtos
- Sistema de preparação para webhooks futuros

---

## 🗄️ 1. APLICAR MIGRATION DO STORAGE (OBRIGATÓRIO)

### Via Interface do Supabase:
1. Acesse o Dashboard do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Execute o seguinte comando SQL:

```sql
-- Criação dos buckets de storage necessários para a aplicação

-- Bucket para avatars de usuários
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB em bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
) ON CONFLICT (id) DO NOTHING;

-- Bucket para imagens de produtos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  true,
  10485760, -- 10MB em bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
) ON CONFLICT (id) DO NOTHING;

-- Bucket para imagens de cursos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'courses',
  'courses',
  true,
  10485760, -- 10MB em bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
) ON CONFLICT (id) DO NOTHING;

-- Bucket para uploads gerais de materiais
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  true,
  52428800, -- 50MB em bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'video/mp4', 'video/webm', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para o bucket avatars
CREATE POLICY "Usuários podem ver avatars públicos" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Usuários podem fazer upload de seus avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuários podem atualizar seus avatars" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuários podem deletar seus avatars" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Políticas de storage para o bucket products
CREATE POLICY "Usuários podem ver imagens de produtos" ON storage.objects
  FOR SELECT USING (bucket_id = 'products');

CREATE POLICY "Admins podem fazer upload de imagens de produtos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'products' AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins podem atualizar imagens de produtos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'products' AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins podem deletar imagens de produtos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'products' AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Políticas de storage para o bucket courses
CREATE POLICY "Usuários podem ver imagens de cursos" ON storage.objects
  FOR SELECT USING (bucket_id = 'courses');

CREATE POLICY "Admins podem fazer upload de imagens de cursos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'courses' AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins podem atualizar imagens de cursos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'courses' AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins podem deletar imagens de cursos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'courses' AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Políticas de storage para o bucket uploads
CREATE POLICY "Usuários podem ver uploads públicos" ON storage.objects
  FOR SELECT USING (bucket_id = 'uploads');

CREATE POLICY "Usuários podem fazer upload de materiais" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuários podem atualizar seus uploads" ON storage.objects
  FOR UPDATE USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuários podem deletar seus uploads" ON storage.objects
  FOR DELETE USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### ✅ Verificar Sucesso:
1. Vá em **Storage** no painel do Supabase
2. Verifique se os buckets foram criados: `avatars`, `products`, `courses`, `uploads`
3. Teste o upload de uma imagem no perfil

---

## 🔄 2. ATUALIZAR PERFIS EXISTENTES (OPCIONAL)

Para usuários que já existem no sistema, execute este comando para garantir compatibilidade:

```sql
-- Atualizar perfis existentes sem full_name
UPDATE profiles 
SET full_name = TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))
WHERE full_name IS NULL OR full_name = '';

-- Gerar affiliate_code para usuários que não têm
UPDATE profiles 
SET affiliate_code = LOWER(CONCAT(
  COALESCE(SUBSTRING(first_name, 1, 3), ''),
  COALESCE(SUBSTRING(last_name, 1, 3), ''),
  FLOOR(RANDOM() * 1000)::text
))
WHERE affiliate_code IS NULL OR affiliate_code = '';
```

---

## 🧪 3. TESTAR AS MELHORIAS

### ✅ Lista de Testes:

1. **Upload de Imagem:**
   - ✅ Fazer login
   - ✅ Ir para `/complete-profile` ou perfil
   - ✅ Tentar fazer upload de uma imagem
   - ✅ Verificar se a imagem aparece corretamente

2. **Fluxo de Onboarding:**
   - ✅ Criar um novo usuário
   - ✅ Verificar se é redirecionado para `/complete-profile`
   - ✅ Preencher todos os campos obrigatórios
   - ✅ Verificar se status muda para "approved"
   - ✅ Verificar se é redirecionado para dashboard

3. **Chat Bloqueado:**
   - ✅ Com usuário incompleto, tentar acessar `/dashboard/chat`
   - ✅ Verificar se mostra a tela de bloqueio
   - ✅ Com usuário completo, verificar se acessa o chat

4. **Páginas Simplificadas:**
   - ✅ Verificar dashboard principal
   - ✅ Verificar página de relatórios
   - ✅ Confirmar foco em produtos e preparação para webhook

---

## 🔍 4. VERIFICAR FUNCIONALIDADES REMOVIDAS

### ❌ Elementos Removidos/Simplificados:
- Funcionalidades de gerenciar comissões manuais
- Páginas de pagamentos internos  
- Relatórios de comissões detalhados
- Downloads de relatórios que não existem

### ✅ Mantido para o Futuro:
- Estrutura de tabelas de comissões (para webhook)
- Campos de perfil relacionados a afiliação
- Sistema base de produtos e links

---

## 🚀 5. PRÓXIMOS PASSOS

### Integração com Webhook (Braip):
1. **Configurar endpoint de webhook** na aplicação
2. **Mapear dados** recebidos para as tabelas existentes
3. **Implementar sincronização** de vendas e comissões
4. **Ativar relatórios** em tempo real
5. **Testar integração** com dados reais

### Melhorias Futuras:
- Sistema de notificações push
- Relatórios customizáveis
- Dashboard de analytics avançado
- Sistema de referral automático

---

## ⚠️ IMPORTANTE - BACKUP

Antes de aplicar qualquer mudança:
```bash
# Fazer backup do banco (se usando localmente)
pg_dump your_database > backup_before_improvements.sql

# Ou usar o backup automático do Supabase
```

---

## 📞 SUPORTE

Se encontrar algum problema:
1. Verificar console do navegador para erros
2. Verificar logs do Supabase
3. Confirmar se as migrations foram aplicadas
4. Testar com usuário novo vs. usuário existente

**Status:** ✅ Melhorias implementadas e prontas para aplicação 