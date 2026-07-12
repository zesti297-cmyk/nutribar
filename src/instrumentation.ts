export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensureDb } = await import("@/lib/db-init");
    await ensureDb();
    const { seedDemoNutritionists } = await import("@/lib/seed-demo");
    await seedDemoNutritionists();
  }
}
