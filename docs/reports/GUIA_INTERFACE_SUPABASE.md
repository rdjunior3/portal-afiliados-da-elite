# 🎯 GUIA: Configurar Storage via Interface Supabase

## ⚠️ **PROBLEMA IDENTIFICADO**
O erro `42501: must be owner of table objects` significa que precisamos configurar as políticas via **interface do Supabase** ao invés de SQL.

---

## 🔧 **PASSO 2 ATUALIZADO:**

### **Execute este script primeiro:**
```sql
-- Cole e execute: fix_storage_policies_supabase_hosted.sql
```

**Este script vai:**
- ✅ Promover você para admin automaticamente
- ✅ Mostrar o status atual das políticas
- ✅ Dar instruções específicas do que fazer

---

## 🖱️ **CONFIGURAÇÃO VIA INTERFACE:**

### **1. Acessar Políticas de Storage:**
1. 🌐 Vá para: https://supabase.com/dashboard/project/kmwfgkzdcktpwqmdjcwx/storage/policies
2. 📂 Procure pela seção **"objects"** (não buckets)
3. 🔍 Verifique se já existem políticas de **INSERT**

---

### **2. Criar Política para PRODUCTS (Admins):**

**Se NÃO existir política INSERT para products:**

1. **Clique em "New Policy"** na seção objects
2. **Escolha "Custom policy"**
3. **Preencha os campos:**

```
Policy name: products_upload_by_admins
Allowed operation: INSERT
Target roles: authenticated

Policy definition (USING expression):
true

WITH CHECK expression:
bucket_id = 'products' AND EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = ANY(ARRAY['admin'::user_role, 'super_admin'::user_role])
)
```

4. **Clique "Create policy"**

---

### **3. Criar Política para AVATARS (Usuários):**

**Se NÃO existir política INSERT para avatars:**

1. **Clique em "New Policy"** novamente
2. **Escolha "Custom policy"**
3. **Preencha os campos:**

```
Policy name: avatars_upload_by_users
Allowed operation: INSERT
Target roles: authenticated

Policy definition (USING expression):
true

WITH CHECK expression:
bucket_id = 'avatars'
```

4. **Clique "Create policy"**

---

### **4. Verificar Buckets Públicos:**

1. 🌐 Vá para: https://supabase.com/dashboard/project/kmwfgkzdcktpwqmdjcwx/storage/buckets
2. 📂 Para cada bucket (products, avatars):
   - Clique nos três pontos (⋮)
   - Escolha "Edit bucket"
   - ✅ **Marque "Public bucket"**
   - Clique "Save"

---

## ✅ **VALIDAÇÃO:**

### **Execute este comando para verificar:**
```sql
-- Execute novamente: fix_storage_policies_supabase_hosted.sql
```

**Resultado esperado:**
- ✅ Políticas INSERT para products: EXISTE
- ✅ Políticas INSERT para avatars: EXISTE  
- ✅ Seu perfil: É ADMIN
- ✅ Buckets: Públicos

---

## 🧪 **TESTE IMEDIATO:**

### **1. Teste Complete Profile:**
- Vá para Complete Profile
- Preencha nome, sobrenome, telefone
- Clique "Completar Perfil Elite"
- ✅ Deve salvar e redirecionar

### **2. Teste Upload Avatar:**
- No Complete Profile
- Clique para adicionar foto
- ✅ Deve permitir upload

### **3. Teste Upload Produto:**
- Vá em Products → Cadastrar Produto
- Tente fazer upload de imagem
- ✅ Deve funcionar (se você for admin)

---

## 🆘 **SE AINDA NÃO FUNCIONAR:**

### **Verificar no Console F12:**
1. Pressione **F12** → aba **Console**
2. Tente fazer upload
3. **Anote os erros exatos**
4. Me envie os erros para diagnóstico

### **Comandos de Debug:**
```sql
-- Verificar seu role atual:
SELECT role FROM profiles WHERE id = auth.uid();

-- Verificar políticas:
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'objects';

-- Teste manual de upload:
INSERT INTO storage.objects (bucket_id, name, owner) 
VALUES ('avatars', 'teste.jpg', auth.uid());
```

---

## ⚡ **RESUMO RÁPIDO:**

1. ✅ Execute `fix_storage_policies_supabase_hosted.sql` 
2. 🖱️ Configure políticas via interface (se necessário)
3. ✅ Marque buckets como públicos
4. 🧪 Teste Complete Profile + Upload
5. 🎉 Aplicativo funcionando!

**A configuração via interface é necessária devido às limitações de permissão do Supabase hospedado. Após isso, tudo funcionará perfeitamente!** 🚀 