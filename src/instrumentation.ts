export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { ensureDb } = await import("@/lib/db-init");
      await ensureDb();
      const { seedDemoNutritionists } = await import("@/lib/seed-demo");
      await seedDemoNutritionists();
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
