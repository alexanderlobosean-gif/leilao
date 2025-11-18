-- Desativa o RLS temporariamente
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;

-- Remove a política problemática
DROP POLICY IF EXISTS "Admins can view all auth users" ON auth.users;

-- Cria uma política mais segura
CREATE POLICY "Admins can view all users"
ON auth.users
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users u
        WHERE u.id = auth.uid()
        AND u.raw_user_meta_data->>'user_type' = 'admin'
    )
);

-- Reativa o RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
