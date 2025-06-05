import { z } from 'zod';

// Schema para validação do formulário de produtos
export const productSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  
  slug: z
    .string()
    .min(3, 'Slug deve ter pelo menos 3 caracteres')
    .max(50, 'Slug deve ter no máximo 50 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens')
    .trim(),
  
  description: z
    .string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  
  price: z
    .number({ required_error: 'Preço é obrigatório' })
    .positive('Preço deve ser positivo')
    .max(999999.99, 'Preço muito alto')
    .multipleOf(0.01, 'Preço deve ter no máximo 2 casas decimais'),
  
  commission_rate: z
    .number({ required_error: 'Taxa de comissão é obrigatória' })
    .min(0, 'Taxa de comissão deve ser pelo menos 0%')
    .max(100, 'Taxa de comissão deve ser no máximo 100%')
    .multipleOf(0.01, 'Taxa deve ter no máximo 2 casas decimais'),
  
  category_id: z
    .string({ required_error: 'Categoria é obrigatória' })
    .uuid('ID da categoria inválido')
    .min(1, 'Selecione uma categoria'),
  
  affiliate_link: z
    .string({ required_error: 'Link de afiliado é obrigatório' })
    .url('Digite uma URL válida')
    .min(10, 'Link deve ter pelo menos 10 caracteres')
    .max(500, 'Link muito longo'),
  
  thumbnail_url: z
    .string()
    .url('URL da imagem inválida')
    .optional()
    .or(z.literal(''))
});

// Tipo inferido do schema
export type ProductFormData = z.infer<typeof productSchema>;

// Schema para validação de slug único (usado separadamente)
export const slugValidationSchema = z.object({
  slug: z.string().min(1),
  productId: z.string().optional() // Para edições, excluir o próprio produto
});

export type SlugValidationData = z.infer<typeof slugValidationSchema>; 