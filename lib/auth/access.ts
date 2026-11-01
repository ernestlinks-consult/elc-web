// Who may be in the portal. Pure, so proxy.ts and server code decide the same way.

export type StaffRole = "admin" | "editor" | "front_desk";

export type AccessRow = {
  full_name: string;
  role: StaffRole;
  is_active: boolean;
  aal: string | null;
} | null;

export type AccessState = "no_access" | "disabled" | "two_step" | "ok";

export function decideAccess(row: AccessRow): AccessState {
  if (!row) return "no_access";
  if (!row.is_active) return "disabled";
  if (row.role === "admin" && row.aal !== "aal2") return "two_step";
  return "ok";
}

export const roleLabels: Record<StaffRole, string> = {
  admin: "Admin",
  editor: "Editor",
  front_desk: "Front desk",
};

/** Front desk and admins work every lead; editors only their own. */
export const seesAllLeads = (role: StaffRole) => role !== "editor";

export const signInPath = "/portal/sign-in";

/** Only ever a page in the portal, so a link cannot send someone elsewhere. */
export function safeNext(next: unknown) {
  return typeof next === "string" &&
    /^\/portal(\/|$|\?)/.test(next) &&
    !next.includes("//")
    ? next
    : "/portal";
}
