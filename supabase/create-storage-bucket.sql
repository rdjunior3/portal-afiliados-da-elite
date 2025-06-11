-- Criar bucket de storage para imagens de produtos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true);

-- Política para permitir upload de imagens (apenas usuários autenticados)
CREATE POLICY "Allow authenticated users to upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Política para permitir visualização pública das imagens
CREATE POLICY "Allow public to view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Política para permitir atualização de imagens (apenas admin/super_admin)
CREATE POLICY "Allow admin to update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images' AND (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'super_admin')
  )
));

-- Política para permitir exclusão de imagens (apenas admin/super_admin)
CREATE POLICY "Allow admin to delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images' AND (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'super_admin')
  )
)); 