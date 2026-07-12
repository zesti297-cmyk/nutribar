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

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    patient: "Paciente",
    translator: "Tradutor",
    nutritionist: "Nutricionista",
    admin: "Admin",
  };
  return labels[role];
}
