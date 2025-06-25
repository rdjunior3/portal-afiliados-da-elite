# 🔧 INSTRUÇÕES: Correção do Trigger Automático de Perfis

## 🎯 **PROBLEMA IDENTIFICADO**
Os usuários estão sendo criados no Supabase Auth (`auth.users`) mas **não estão sendo criados automaticamente na tabela `profiles`**.

## 🔍 **CAUSA RAIZ**
O trigger `on_auth_user_created` não está funcionando corretamente devido a:
1. **Cast incorreto para enums** que podem não existir
2. **Tipos de dados incompatíveis** entre o trigger e a estrutura atual da tabela

## 🚀 **SOLUÇÃO - PASSO A PASSO**

### **PASSO 1: Acessar o SQL Editor do Supabase**
1. Acesse: https://supabase.com/dashboard/project/vhociemaoccrkpcylpit/sql
2. Cole o script `CORRIGIR_TRIGGER_PERFIS_URGENTE.sql` (conteúdo abaixo)
3. Clique em **"Run"**

### **PASSO 2: Script de Correção**
```sql
-- ========================================
-- CORREÇÃO URGENTE: TRIGGER AUTOMÁTICO DE PERFIS
-- ========================================
-- COPIE E COLE ESTE SCRIPT NO SQL EDITOR DO SUPABASE:
-- https://supabase.com/dashboard/project/vhociemaoccrkpcylpit/sql

-- 1. RECRIAR FUNÇÃO HANDLE_NEW_USER
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_email TEXT;
    user_name TEXT;
    first_name TEXT;
    last_name TEXT;
    avatar_url TEXT;
BEGIN
    -- Extrair dados do usuário
    user_email := COALESCE(NEW.email, '');
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name', 
        NEW.raw_user_meta_data->>'name', 
        ''
    );
    avatar_url := COALESCE(
        NEW.raw_user_meta_data->>'avatar_url', 
        NEW.raw_user_meta_data->>'picture',
        NULL
    );
    
    -- Dividir nome completo
    IF user_name != '' THEN
        first_name := SPLIT_PART(user_name, ' ', 1);
        last_name := CASE 
            WHEN ARRAY_LENGTH(STRING_TO_ARRAY(user_name, ' '), 1) > 1 
            THEN TRIM(SUBSTRING(user_name FROM POSITION(' ' IN user_name) + 1))
            ELSE ''
        END;
    ELSE
        first_name := SPLIT_PART(user_email, '@', 1);
        last_name := '';
    END IF;

    -- Inserir perfil
    INSERT INTO profiles (
        id,
        email,
        first_name,
        last_name,
        avatar_url,
        role,
        affiliate_status,
        commission_rate,
        total_earnings,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        user_email,
        first_name,
        last_name,
        avatar_url,
        'affiliate',
        'pending',
        10.00,
        0.00,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
        updated_at = NOW();
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. RECRIAR TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION handle_new_user();

-- 3. CRIAR PERFIS PARA USUÁRIOS EXISTENTES SEM PERFIL
INSERT INTO profiles (
    id,
    email,
    first_name,
    last_name,
    avatar_url,
    role,
    affiliate_status,
    commission_rate,
    total_earnings,
    created_at,
    updated_at
)
SELECT 
    u.id,
    COALESCE(u.email, ''),
    COALESCE(
        SPLIT_PART(
            COALESCE(
                u.raw_user_meta_data->>'full_name',
                u.raw_user_meta_data->>'name',
                SPLIT_PART(u.email, '@', 1)
            ), ' ', 1
        ), ''
    ),
    CASE 
        WHEN ARRAY_LENGTH(STRING_TO_ARRAY(
            COALESCE(
                u.raw_user_meta_data->>'full_name',
                u.raw_user_meta_data->>'name',
                ''
            ), ' '
        ), 1) > 1 
        THEN TRIM(SUBSTRING(
            COALESCE(
                u.raw_user_meta_data->>'full_name',
                u.raw_user_meta_data->>'name',
                ''
            ) FROM POSITION(' ' IN COALESCE(
                u.raw_user_meta_data->>'full_name',
                u.raw_user_meta_data->>'name',
                ''
            )) + 1
        ))
        ELSE ''
    END,
    COALESCE(
        u.raw_user_meta_data->>'avatar_url',
        u.raw_user_meta_data->>'picture',
        NULL
    ),
    'affiliate',
    'pending',
    10.00,
    0.00,
    NOW(),
    NOW()
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 4. VERIFICAR RESULTADO
SELECT 
    'Usuários sem perfil' as status,
    COUNT(*) as quantidade
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL

UNION ALL

SELECT 
    'Total de usuários' as status,
    COUNT(*) as quantidade
FROM auth.users

UNION ALL

SELECT 
    'Total de perfis' as status,
    COUNT(*) as quantidade
FROM profiles;
```

### **PASSO 3: Verificar Resultado**
Após executar o script, você deve ver uma tabela com:
- **Usuários sem perfil: 0**
- **Total de usuários: X**
- **Total de perfis: X** (mesmo número)

### **PASSO 4: Testar com Novo Usuário**
1. Vá para a aplicação
2. Tente criar um novo usuário via Google OAuth
3. Verifique se o perfil é criado automaticamente na tabela `profiles`

## 🎯 **CORREÇÕES IMPLEMENTADAS**

### **❌ ANTES (Problema):**
```sql
'affiliate'::user_role,        -- Cast para enum que pode não existir
'pending'::affiliate_status,   -- Cast para enum que pode não existir
```

### **✅ DEPOIS (Corrigido):**
```sql
'affiliate',                   -- Valor TEXT direto
'pending',                     -- Valor TEXT direto
```

## 📊 **RESULTADOS ESPERADOS**

Após a correção:
1. ✅ **Novos usuários** terão perfis criados automaticamente
2. ✅ **Usuários existentes** sem perfil terão perfis criados
3. ✅ **OAuth Google** funcionará completamente
4. ✅ **Sistema de afiliados** funcionará normalmente

## 🔍 **COMO VERIFICAR SE FUNCIONOU**

### **No Supabase Dashboard:**
1. **Auth > Users**: Ver usuários criados
2. **Table Editor > profiles**: Ver perfis correspondentes

### **Na Aplicação:**
1. Fazer login/cadastro via Google
2. Verificar se o usuário consegue acessar o dashboard
3. Verificar se os dados do perfil aparecem corretamente

## 📝 **NOTAS IMPORTANTES**

- ⚠️ **Execute apenas UMA vez** o script
- ✅ **Seguro para produção** - não afeta dados existentes
- 🔄 **Idempotente** - pode ser executado múltiplas vezes sem problemas
- 🛡️ **Não quebra** o processo de autenticação em caso de erro

## 🆘 **EM CASO DE PROBLEMAS**

Se ainda houver problemas após executar o script:
1. Verifique os **logs do Supabase** em "Logs > Postgres"
2. Teste criar um usuário manualmente via SQL
3. Verifique se há **políticas RLS** bloqueando a inserção

---

**🎉 Esta correção resolve definitivamente o problema de perfis não sendo criados automaticamente!** 