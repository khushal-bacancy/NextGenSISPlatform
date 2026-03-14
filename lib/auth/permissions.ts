import type { Route } from "next";

export type AppRole = "super_admin" | "school_admin" | "staff" | "teacher" | "parent" | "student";

export type AppFeature = "admin" | "enrollment" | "attendance" | "grades" | "portal" | "reports";

export const roleFeatureMap: Record<AppRole, AppFeature[]> = {
  super_admin: ["admin", "enrollment", "attendance", "grades", "portal", "reports"],
  school_admin: ["admin", "enrollment", "attendance", "grades", "portal", "reports"],
  staff: ["enrollment", "attendance", "grades", "reports"],
  teacher: ["enrollment", "attendance", "grades", "reports"],
  parent: ["portal", "reports"],
  student: ["portal", "reports"]
};

export const featureNavMap: Record<AppFeature, { href: Route; label: string }> = {
  admin: { href: "/admin", label: "Admin" },
  enrollment: { href: "/enrollment", label: "Enrollment" },
  attendance: { href: "/attendance", label: "Attendance" },
  grades: { href: "/grades", label: "Grades" },
  portal: { href: "/portal", label: "Portal" },
  reports: { href: "/reports", label: "Reports" }
};

export function hasFeatureAccess(role: AppRole, feature: AppFeature): boolean {
  return roleFeatureMap[role].includes(feature);
}

export function getDefaultRoute(role: AppRole): Route {
  const firstFeature = roleFeatureMap[role][0] ?? "portal";
  return featureNavMap[firstFeature].href;
}
