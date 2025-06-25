# 🔧 CORREÇÃO: Trigger Automático de Perfis

## 🎯 **PROBLEMA**
Usuários criados via Google OAuth não têm perfis criados automaticamente na tabela `profiles`.

## 🚀 **SOLUÇÃO**

### **1. Acessar SQL Editor**
https://supabase.com/dashboard/project/vhociemaoccrkpcylpit/sql

### **2. Copiar e Colar o Script**
Use o arquivo: `CORRIGIR_TRIGGER_PERFIS_URGENTE.sql`

### **3. Executar**
Clique em **"Run"** no SQL Editor

### **4. Verificar**
Deve mostrar:
- ✅ Usuários sem perfil: **0**
- ✅ Total de usuários: **X**  
- ✅ Total de perfis: **X** (mesmo número)

## 🎉 **RESULTADO**
Novos usuários terão perfis criados automaticamente! 