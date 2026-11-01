import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { cacheTags, contentCacheLife } from "./cache";

export type TeamMember = {
  id: string;
  fullName: string;
  title: string;
  photoPath: string | null;
  bio: string | null;
};

export async function getTeam(): Promise<TeamMember[]> {
  "use cache";
  cacheTag(cacheTags.team);
  cacheLife(contentCacheLife);

  const { data, error } = await createPublicClient()
    .from("staff_public")
    .select("id, full_name, title, photo_path, bio")
    .order("sort_order");

  if (error) throw new Error(`Could not load the team: ${error.message}`);

  return data.map((member) => ({
    id: member.id!,
    fullName: member.full_name!,
    title: member.title!,
    photoPath: member.photo_path,
    bio: member.bio,
  }));
}
