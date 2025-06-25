# 👑 CONFIGURAR ADMIN PRINCIPAL

## 🎯 **OBJETIVO**
Configurar o email `04junior.silva09@gmail.com` como **admin principal** do sistema.

## 🚀 **INSTRUÇÕES**

### **PASSO 1: Acessar SQL Editor**
https://supabase.com/dashboard/project/vhociemaoccrkpcylpit/sql

### **PASSO 2: Executar Script**
1. **Copiar** todo o conteúdo do arquivo `CONFIGURAR_ADMIN_PRINCIPAL.sql`
2. **Colar** no SQL Editor
3. **Clicar** em "Run"

### **PASSO 3: Verificar Resultado**
Após executar, você deve ver:
- ✅ **"ADMIN PRINCIPAL CONFIGURADO COM SUCESSO!"**
- 📊 **Dados do usuário** com role = 'admin'
- 👑 **Lista de administradores** no sistema

## ⚠️ **IMPORTANTE**

### **Se o usuário não existir:**
1. O usuário `04junior.silva09@gmail.com` deve **fazer login** pelo menos uma vez
2. Executar primeiro o script `CORRIGIR_TRIGGER_PERFIS_URGENTE.sql`
3. Depois executar este script de admin

### **Se já existir:**
- O script irá **atualizar** automaticamente para admin
- Não há risco de perder dados

## 🎉 **RESULTADO**
Após a execução:
- ✅ Email configurado como **admin principal**
- ✅ Acesso a **todas as funcionalidades** administrativas
- ✅ Permissões completas no sistema 