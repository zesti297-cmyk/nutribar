import type { UserRole } from "./types";

const ROLE_DASHBOARDS: Record<UserRole, string> = {
  patient: "/dashboard/patient",
  translator: "/dashboard/translator",
  nutritionist: "/dashboard/nutritionist",
  admin: "/dashboard/admin",
};

export function getDashboardPath(role: UserRole): string {
  return ROLE_DASHBOARDS[role];
}

export function isValidRole(role: string): role is UserRole {
  return ["patient", "translator", "nutritionist", "admin"].includes(role);
}

// Public URL slugs that map onto an internal UserRole. Lets alternative names
// like /login/superadmin resolve to the real "admin" role.
const ROLE_ALIASES: Record<string, UserRole> = {
  superadmin: "admin",
};

// Resolves a URL slug (e.g. "superadmin") to a UserRole, or null if unknown.
export function resolveRole(slug: string): UserRole | null {
  if (isValidRole(slug)) return slug;
  return ROLE_ALIASES[slug] ?? null;
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    patient: "Paciente",
    translator: "Tradutor",
    nutritionist: "Nutricionista",
    admin: "Admin",
  };
  return labels[role];
}
