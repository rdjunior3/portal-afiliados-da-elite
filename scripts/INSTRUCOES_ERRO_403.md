# CORREÇÃO DO ERRO 403 EM PRODUCTS

## Problema Identificado
- Erro 403 ao tentar arquivar produtos
- Usuário admin não consegue fazer UPDATE na tabela products
- Problemas nas políticas RLS (Row Level Security)

## Solução

### Opção 1: Dashboard do Supabase (Recomendado)
1. Acesse: https://supabase.com/dashboard/project/rbqzddsserknaedojuex
2. Vá em **SQL Editor**
3. Cole o conteúdo do arquivo `fix-products-403-error.sql`
4. Execute o script
5. Analise os resultados do diagnóstico
6. Teste a operação no app

### Opção 2: Via CLI (Avançado)
```bash
# No terminal, na pasta /scripts
./fix-rls-products.sh
```

## Verificações Pós-Correção
- [ ] Usuário 04junior.silva09@gmail.com tem role 'admin'
- [ ] Políticas RLS aplicadas corretamente
- [ ] Enum product_status inclui 'archived'
- [ ] Operação de arquivar produto funciona no app

## Se o Problema Persistir
1. Verifique os logs do navegador para outros erros
2. Confirme que as variáveis de ambiente estão corretas
3. Teste a operação manualmente no SQL Editor
4. Considere desabilitar temporariamente o RLS para teste

## Contato
Se precisar de ajuda adicional, compartilhe:
- Resultados do diagnóstico SQL
- Logs completos do navegador
- Screenshot do erro