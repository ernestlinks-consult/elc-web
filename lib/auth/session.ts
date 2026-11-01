import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import {
  decideAccess,
  signInPath,
  type AccessRow,
  type StaffRole,
} from "./access";

export type Staff = {
  id: string;
  fullName: string;
  firstName: string;
  role: StaffRole;
};

type Access =
  | { state: "signed_out" | "no_access" | "disabled" | "two_step"; staff: null }
  | { state: "ok"; staff: Staff };

/** One check per request, however many components ask. */
export const getAccess = cache(async (): Promise<Access> => {
  // Reading a session uses the clock, so it must wait for a real request.
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { state: "signed_out", staff: null };

  const { data } = await supabase.rpc("my_staff_access").maybeSingle();
  const row = data as AccessRow;
  const state = decideAccess(row);

  if (state !== "ok") return { state, staff: null };

  return {
    state,
    staff: {
      id: user.id,
      fullName: row!.full_name,
      firstName: row!.full_name.split(" ")[0],
      role: row!.role,
    },
  };
});

/** For pages. proxy.ts has already checked; this holds if it ever misses a route. */
export async function requireStaff(allowed?: StaffRole[]): Promise<Staff> {
  const { state, staff } = await getAccess();

  if (state === "two_step") redirect("/portal/two-step");
  if (state === "no_access") redirect("/portal/no-access");
  if (!staff) redirect(signInPath);
  if (allowed && !allowed.includes(staff.role)) redirect("/portal");

  return staff;
}

/**
 * For server actions and route handlers, which proxy.ts cannot be trusted to cover
 * (Next's docs are explicit). Null means refuse.
 */
export async function staffFor(allowed?: StaffRole[]): Promise<Staff | null> {
  const { staff } = await getAccess();

  return staff && (!allowed || allowed.includes(staff.role)) ? staff : null;
}
