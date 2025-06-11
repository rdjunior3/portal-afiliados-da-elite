-- Habilitar RLS para tabelas de conteúdo educacional
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas (se existirem) para evitar conflitos
DROP POLICY IF EXISTS "Allow public read access" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.products;
DROP POLICY IF EXISTS "Allow admin management" ON public.products;
DROP POLICY IF EXISTS "Allow admin management" ON public.courses;
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.courses;
DROP POLICY IF EXISTS "Allow admin management" ON public.lessons;
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.lessons;
DROP POLICY IF EXISTS "Allow admin management" ON public.materials;
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.materials;

-------------------------------------
-- Políticas para a tabela `products`
-------------------------------------

-- 1. Permitir que usuários autenticados leiam todos os produtos ativos.
CREATE POLICY "Allow authenticated read access on products"
ON public.products
FOR SELECT
TO authenticated
USING (is_active = true);

-- 2. Permitir que administradores e super-administradores gerenciem (criar, atualizar, deletar) produtos.
CREATE POLICY "Allow admin management on products"
ON public.products
FOR ALL -- Abrange INSERT, UPDATE, DELETE
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
);


-------------------------------------
-- Políticas para a tabela `courses`
-------------------------------------

-- 1. Permitir que usuários autenticados leiam todos os cursos ativos.
CREATE POLICY "Allow authenticated read access on courses"
ON public.courses
FOR SELECT
TO authenticated
USING (is_active = true);

-- 2. Permitir que administradores e super-administradores gerenciem cursos.
CREATE POLICY "Allow admin management on courses"
ON public.courses
FOR ALL
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
);


-------------------------------------
-- Políticas para a tabela `lessons`
-------------------------------------

-- 1. Permitir que usuários autenticados leiam todas as aulas ativas.
CREATE POLICY "Allow authenticated read access on lessons"
ON public.lessons
FOR SELECT
TO authenticated
USING (is_active = true);

-- 2. Permitir que administradores e super-administradores gerenciem aulas.
CREATE POLICY "Allow admin management on lessons"
ON public.lessons
FOR ALL
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
);


-------------------------------------
-- Políticas para a tabela `materials`
-------------------------------------

-- 1. Permitir que usuários autenticados leiam todos os materiais.
CREATE POLICY "Allow authenticated read access on materials"
ON public.materials
FOR SELECT
TO authenticated
USING (true);

-- 2. Permitir que administradores e super-administradores gerenciem materiais.
CREATE POLICY "Allow admin management on materials"
ON public.materials
FOR ALL
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
); 