export async function ensureDb() {
  // Supabase manages schema and migrations in the hosted database.
  // The app no longer relies on a local pg connection or DATABASE_URL.
  return;
}
