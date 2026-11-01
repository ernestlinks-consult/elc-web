// Invites a staff member (Phase 1: there is no team screen yet). It needs the
// service-role key, so only an admin with that key can run it.
//
//   npm run staff:invite -- --email ama@ernestlinksconsult.com --name "Ama B." \
//     --role editor --title "Study Abroad Counsellor" --content post,faq --on-site
//
// Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for the environment you
// mean to change. It prints which project it is using before it does anything.

import { parseArgs } from "node:util";
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

const roles = ["admin", "editor", "front_desk"];
const contentTypes = [
  "scholarship", "post", "video", "programme", "opening", "drive", "trip", "faq",
  "testimonial", "team",
];

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

async function invite() {
  nextEnv.loadEnvConfig(process.cwd());

  const { values } = parseArgs({
    options: {
      email: { type: "string" },
      name: { type: "string" },
      role: { type: "string" },
      title: { type: "string" },
      content: { type: "string", default: "" },
      "on-site": { type: "boolean", default: false },
    },
  });

  const { email, name, role, title } = values;
  const content = values.content.split(",").filter(Boolean);

  if (!email || !name || !role) {
    return fail('Usage: npm run staff:invite -- --email x --name "y" --role editor [--title "z"] [--content post,faq] [--on-site]');
  }
  if (!roles.includes(role)) return fail(`--role must be one of: ${roles.join(", ")}`);

  const unknown = content.filter((type) => !contentTypes.includes(type));
  if (unknown.length > 0) return fail(`Unknown content types: ${unknown.join(", ")}`);
  if (content.length > 0 && role !== "editor") {
    return fail("--content only applies to editors. Others can't edit content types.");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return fail("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");

  console.log(`Project: ${url}`);

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);
  if (error) return fail(`Could not invite: ${error.message}`);

  const staffId = data.user.id;
  const { error: staffError } = await supabase.from("staff").insert({
    id: staffId,
    full_name: name,
    title: title ?? "",
    role,
    email,
    show_on_site: values["on-site"],
  });

  if (staffError) {
    await supabase.auth.admin.deleteUser(staffId);
    return fail(`Could not create the staff row, so the invite was removed: ${staffError.message}`);
  }

  if (content.length > 0) {
    const { error: accessError } = await supabase
      .from("staff_content_access")
      .insert(content.map((content_type) => ({ staff_id: staffId, content_type })));

    if (accessError) return fail(`Invited, but content access failed: ${accessError.message}`);
  }

  console.log(`Invited ${name} <${email}> as ${role}.`);
  if (role === "admin") console.log("They will set up two-step sign-in on first sign-in.");
}

await invite();
