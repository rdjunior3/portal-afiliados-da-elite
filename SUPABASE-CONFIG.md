# 🔧 Configuração do Supabase para OAuth Google

## 🚨 PROBLEMA ATUAL
O redirecionamento do Google OAuth está apontando para `localhost:3000` em vez da URL correta do projeto.

## ✅ SOLUÇÃO: Configurar URLs no Painel Supabase

### 📍 **Passo 1: Acessar Configurações**
1. Acesse: [supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto: **Portal Afiliados da Elite**
3. Vá para: **Authentication → Settings**

### 📍 **Passo 2: Configurar Site URL**
Na seção **General settings**:
```
Site URL: https://portal-afiliados-da-elite.vercel.app
```

### 📍 **Passo 3: Configurar Redirect URLs**
Na seção **Redirect URLs**, adicione todas essas URLs:

```
https://portal-afiliados-da-elite.vercel.app/dashboard
https://portal-afiliados-da-elite.vercel.app/**
http://localhost:8080/dashboard
http://localhost:8080/**
```

### 📍 **Passo 4: Configurar OAuth Providers**
Na seção **Providers**:

#### Google OAuth:
1. **Enabled**: ✅ Ativado
2. **Client ID**: (seu Client ID do Google)
3. **Client Secret**: (seu Client Secret do Google)
4. **Redirect URL**: Use esta URL no Google Console:
   ```
   https://rbqzddsserknaedojuex.supabase.co/auth/v1/callback
   ```

### 📍 **Passo 5: Google Cloud Console**
1. Acesse: [console.cloud.google.com](https://console.cloud.google.com)
2. Vá para: **APIs & Services → Credentials**
3. Edite seu OAuth 2.0 Client
4. **Authorized redirect URIs**, adicione:
   ```
   https://rbqzddsserknaedojuex.supabase.co/auth/v1/callback
   ```

### 📍 **Passo 6: Testar**
1. Salve todas as configurações
2. Aguarde 5-10 minutos para propagação
3. Teste o login com Google em:
   - **Produção**: https://portal-afiliados-da-elite.vercel.app
   - **Local**: http://localhost:8080

## 🎯 **URLs Corretas por Ambiente**

### Produção (Vercel):
- **Site URL**: `https://portal-afiliados-da-elite.vercel.app`
- **Redirect**: `https://portal-afiliados-da-elite.vercel.app/dashboard`

### Desenvolvimento:
- **Site URL**: `http://localhost:8080`
- **Redirect**: `http://localhost:8080/dashboard`

## 🔄 **Se ainda não funcionar:**

1. **Limpe o cache** do navegador
2. **Teste em modo anônimo**
3. **Verifique logs** no Supabase Dashboard → Authentication → Logs
4. **Aguarde até 10 minutos** para propagação das configurações

## 📝 **Notas Importantes:**
- ✅ O código já está otimizado para detectar automaticamente o ambiente
- ✅ URLs de redirecionamento são geradas dinamicamente
- ✅ Suporte tanto para produção quanto desenvolvimento
- ❌ Não remova `localhost:8080` das configurações (necessário para desenvolvimento) 