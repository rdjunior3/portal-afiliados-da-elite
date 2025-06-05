# 🔧 CORREÇÃO DO UPLOAD DE AVATARES

## 📝 Problema Identificado
**Erro:** "Bucket 'profiles' não configurado. Entre em contato com o administrador para configurar o upload de imagens."

**Causa:** O bucket de storage não foi criado corretamente no Supabase Storage.

---

## 🛠️ Soluções (Execute em Ordem)

### ✅ **SOLUÇÃO 1: Script SQL (Recomendado)**

1. **Execute o script:** `fix_storage_bucket.sql`
2. **No Supabase Dashboard:**
   - Vá em `SQL Editor` 
   - Cole o conteúdo do arquivo `fix_storage_bucket.sql`
   - Clique em `Run`

### ✅ **SOLUÇÃO 2: Console do Navegador**

1. **Acesse:** https://supabase.com/dashboard/project/[SEU_PROJECT_ID]
2. **Abra o Console:** Pressione `F12` → Aba `Console`
3. **Execute o script:** Cole o conteúdo de `setup_storage_buckets.js` e pressione Enter

### ✅ **SOLUÇÃO 3: Interface Gráfica (Manual)**

1. **Acesse:** Supabase Dashboard → **Storage** → **Buckets**
2. **Clique:** `New bucket`
3. **Configure:**
   ```
   Bucket name: profiles
   ✅ Public bucket
   File size limit: 2 MB
   Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
   ```
4. **Clique:** `Create bucket`

### ✅ **SOLUÇÃO 4: Bucket Alternativo (Temporário)**

O código foi atualizado para usar o bucket `avatars` como alternativa:
- **Arquivo alterado:** `src/pages/dashboard/Settings.tsx`
- **Mudança:** `bucket="profiles"` → `bucket="avatars"`

---

## 🧪 **TESTANDO A CORREÇÃO**

### Teste no Console do Supabase:
```javascript
// Verificar bucket
const { data, error } = await _supabaseClient.storage.getBucket('profiles');
console.log('Bucket profiles:', { data, error });

// Listar todos os buckets
const { data: buckets } = await _supabaseClient.storage.listBuckets();
console.log('Buckets disponíveis:', buckets?.map(b => b.id));
```

### Teste na Aplicação:
1. **Acesse:** Configurações → Editar Perfil
2. **Clique:** Upload de foto
3. **Selecione:** Uma imagem (JPG, PNG, WEBP, GIF)
4. **Aguarde:** Upload completar
5. **Verifique:** Imagem aparece na prévia

---

## 🔍 **DIAGNÓSTICO DE PROBLEMAS**

### Se ainda não funcionar:

#### 1. **Verificar Buckets:**
```javascript
// No console do Supabase
const { data: buckets } = await _supabaseClient.storage.listBuckets();
console.log('Buckets:', buckets);
```

#### 2. **Verificar Políticas RLS:**
```sql
-- No SQL Editor do Supabase
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';
```

#### 3. **Verificar Permissões:**
```javascript
// Testar upload simples
const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
const { data, error } = await _supabaseClient.storage
  .from('profiles')
  .upload('test/test.txt', testFile);
console.log('Teste upload:', { data, error });
```

---

## 📊 **ESTRUTURA ESPERADA**

### Buckets Necessários:
- ✅ **profiles** - Para avatares de usuários
- ✅ **avatars** - Backup para avatares
- ✅ **products** - Para imagens de produtos

### Políticas RLS:
- ✅ Upload permitido para usuários autenticados
- ✅ Leitura pública para todos
- ✅ Usuários podem gerenciar próprios arquivos

---

## 🚀 **APÓS A CORREÇÃO**

### 1. **Reverter mudança temporária:**
Em `src/pages/dashboard/Settings.tsx`, volte para:
```typescript
bucket="profiles"  // ao invés de "avatars"
folder="avatars"   // ao invés de "profiles"
```

### 2. **Testar funcionalidades:**
- ✅ Upload de avatar
- ✅ Visualização da imagem
- ✅ Atualização do perfil
- ✅ Remoção de imagem antiga

### 3. **Sincronizar código:**
```bash
git add .
git commit -m "fix: correção do upload de avatares - bucket storage configurado"
git push origin main
```

---

## 📞 **SUPORTE**

Se o problema persistir:

1. **Verifique logs do console do navegador**
2. **Confirme configurações do Supabase**
3. **Execute diagnósticos fornecidos**
4. **Documente erro específico para análise**

---

## 🎯 **RESULTADO ESPERADO**

Após aplicar as correções:
- ✅ Upload de avatar funcionando
- ✅ Sem erro de "bucket não configurado" 
- ✅ Imagens sendo salvas e exibidas corretamente
- ✅ Sistema de profiles completamente funcional

---

**⚡ Status:** Pronto para execução  
**🔧 Complexidade:** Média  
**⏱️ Tempo estimado:** 5-10 minutos  
**📋 Prioridade:** Alta - funcionalidade principal 