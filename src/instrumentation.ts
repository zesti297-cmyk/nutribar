export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { ensureDb } = await import("@/lib/db-init");
      await ensureDb();
      // O seed de nutricionistas demo foi removido: as demos da landing vêm de
      // demo-nutritionists.ts (só visual) e o banco guarda apenas contas reais.
    } catch (error) {
      // Supabase may be unreachable or unconfigured (e.g. local dev without
      // credentials). Don't crash the server — features that depend on it
      // (auth, dashboards) will simply be unavailable until it's configured.
      console.warn(
        "[instrumentation] Skipping Supabase setup/seed — Supabase unreachable or not configured:",
        error instanceof Error ? error.message : error,
      );
    }
  }
}
