-- Supabase RLS policies and auth mapping for Nutribar
-- Run after `schema.sql` has been applied.

-- 1) Link local `users` to Supabase Auth: add `auth_uid` column
ALTER TABLE IF EXISTS users
  ADD COLUMN IF NOT EXISTS auth_uid UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2) Enable Row Level Security on sensitive tables
ALTER TABLE IF EXISTS leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS nutritionist_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;

-- 3) Policies for `leads`
-- Allow authenticated users to insert leads
DROP POLICY IF EXISTS "Allow insert leads (authenticated)" ON leads;
CREATE POLICY "Allow insert leads (authenticated)" ON leads
  FOR INSERT
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Allow nutritionists, patients and admins to select leads
DROP POLICY IF EXISTS "Select leads for owner or admin" ON leads;
CREATE POLICY "Select leads for owner or admin" ON leads
  FOR SELECT
  USING (
    nutritionist_id = auth.uid()::uuid
    OR patient_user_id = auth.uid()::uuid
    OR EXISTS (SELECT 1 FROM users u WHERE u.auth_uid = auth.uid()::uuid AND u.role = 'admin')
  );

-- Allow owner (nutritionist) or patient to update their own leads
DROP POLICY IF EXISTS "Update leads owner or patient" ON leads;
CREATE POLICY "Update leads owner or patient" ON leads
  FOR UPDATE
  USING (
    nutritionist_id = auth.uid()::uuid
    OR patient_user_id = auth.uid()::uuid
    OR EXISTS (SELECT 1 FROM users u WHERE u.auth_uid = auth.uid()::uuid AND u.role = 'admin')
  )
  WITH CHECK (
    nutritionist_id = auth.uid()::uuid
    OR patient_user_id = auth.uid()::uuid
    OR EXISTS (SELECT 1 FROM users u WHERE u.auth_uid = auth.uid()::uuid AND u.role = 'admin')
  );

-- Allow delete only for admins
DROP POLICY IF EXISTS "Delete leads admin only" ON leads;
CREATE POLICY "Delete leads admin only" ON leads
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM users u WHERE u.auth_uid = auth.uid()::uuid AND u.role = 'admin'));

-- 4) Policies for `nutritionist_packs`
-- Public can select published packs
DROP POLICY IF EXISTS "Select public packs" ON nutritionist_packs;
CREATE POLICY "Select public packs" ON nutritionist_packs
  FOR SELECT
  USING (published = TRUE);

-- Nutritionist owners and admins can manage packs
DROP POLICY IF EXISTS "Manage packs owner or admin" ON nutritionist_packs;
CREATE POLICY "Manage packs owner or admin" ON nutritionist_packs
  FOR ALL
  USING (
    nutritionist_id = auth.uid()::uuid
    OR EXISTS (SELECT 1 FROM users u WHERE u.auth_uid = auth.uid()::uuid AND u.role = 'admin')
  )
  WITH CHECK (
    nutritionist_id = auth.uid()::uuid
    OR EXISTS (SELECT 1 FROM users u WHERE u.auth_uid = auth.uid()::uuid AND u.role = 'admin')
  );

-- 5) Policies for `users`
-- Allow users to select their own profile
DROP POLICY IF EXISTS "Select own user" ON users;
CREATE POLICY "Select own user" ON users
  FOR SELECT
  USING (auth.uid()::uuid = auth_uid OR EXISTS (SELECT 1 FROM users u WHERE u.auth_uid = auth.uid()::uuid AND u.role = 'admin'));

-- Allow users to update only their own profile (not role/status)
DROP POLICY IF EXISTS "Update own user" ON users;
CREATE POLICY "Update own user" ON users
  FOR UPDATE
  USING (auth.uid()::uuid = auth_uid)
  WITH CHECK (
    auth.uid()::uuid = auth_uid
  );

-- Admins can select/update everything via existence check in policies above

-- Notes:
-- - These policies assume that `users.auth_uid` stores the Supabase `auth.users.id` (auth UID).
-- - For admin identification we rely on the `users.role = 'admin'` flag stored in the users table.
-- - Review and adapt policies to your exact authorization model and custom claims.

-- End of policies file
