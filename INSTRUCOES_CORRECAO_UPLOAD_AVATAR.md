# 🚨 CORREÇÃO URGENTE: Upload de Avatar em Loop

## 📋 **PROBLEMAS IDENTIFICADOS**

### 🔴 **Problema 1: Perfil não encontrado (Erro 406)**
- Usuário `99a703eb-9db2-48cd-affa-90fb4527c3da` existe no `auth.users` mas **NÃO** tem perfil na tabela `profiles`
- Isso causa erro 406 e código PGRST116 ao tentar buscar o perfil
- O trigger automático de criação de perfis não funcionou

### 🔴 **Problema 2: Upload com timeout (60+ segundos)**
- Upload está sendo feito para `avatars/public/99a703eb-9db2-48cd-affa-90fb4527c3da/arquivo.png`
- Timeout após 60 segundos indica problema de políticas RLS bloqueando o upload
- Bucket existe mas políticas estão restritivas demais

## 🛠️ **SOLUÇÃO**

### **1. Aplicar o script SQL de correção**

```bash
# No dashboard do Supabase, vá em SQL Editor e execute:
```

Copie e cole o conteúdo do arquivo `CORRECAO_UPLOAD_AVATAR_URGENTE.sql` no SQL Editor do Supabase.

### **2. O que o script faz:**

✅ **Cria o perfil faltante** para o usuário `04junior.silva09@gmail.com`  
✅ **Configura o bucket "avatars"** com limite de 5MB  
✅ **Aplica políticas RLS ultra permissivas** para evitar timeouts  
✅ **Verifica se tudo foi aplicado corretamente**  

### **3. Resultados esperados:**

Após executar o script, você deve ver:

```
=== DIAGNÓSTICO INICIAL ===
Usuário existe no auth.users: true
Email do usuário: 04junior.silva09@gmail.com
Perfil existe na tabela profiles: false
Bucket avatars existe: true
================================

📝 Criando perfil com dados:
   Email: 04junior.silva09@gmail.com
   Nome completo: [nome extraído do Google]
   Primeiro nome: [primeiro nome]
   Último nome: [último nome]
   Avatar URL: [URL do Google se disponível]

✅ PERFIL CRIADO COM SUCESSO para: 04junior.silva09@gmail.com

=== VERIFICAÇÃO FINAL ===
Perfis encontrados: 1
Buckets avatars: 1
Políticas avatars: 2

🎉 CORREÇÃO APLICADA COM SUCESSO!
✅ Perfil criado
✅ Bucket avatars configurado  
✅ Políticas RLS aplicadas

📱 PRÓXIMOS PASSOS:
1. Recarregue a página do dashboard
2. Tente fazer upload do avatar novamente
3. O upload deve funcionar sem timeout
```

## 🧪 **TESTE APÓS APLICAÇÃO**

1. **Recarregue a página** do dashboard (`Ctrl+F5` ou `Cmd+Shift+R`)
2. **Vá em Configurações** → aba "Pessoal"
3. **Clique em "Alterar" foto de perfil**
4. **Selecione uma imagem** (recomendado: quadrada, até 800x800px)
5. **Verifique se o upload funciona** sem loop infinito

## 🔍 **VERIFICAÇÃO DE SUCESSO**

### ✅ **Sinais de que funcionou:**
- Página carrega sem erro 406
- Nome e dados do perfil aparecem corretamente
- Upload de avatar completa em menos de 10 segundos
- Imagem aparece imediatamente após upload

### ❌ **Se ainda não funcionar:**
- Verifique os logs do console (F12)
- Execute o script novamente
- Limpe cache do navegador (`Ctrl+Shift+Delete`)

## 📞 **SUPORTE**

Se ainda houver problemas após aplicar esta correção, compartilhe:
1. Logs do console após recarregar a página
2. Screenshot da execução do script SQL
3. Mensagens de erro específicas durante o upload 