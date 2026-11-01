import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { cacheTags, contentCacheLife } from "./cache";
import { blogPageSize, type PostCategory, type VideoPlatform } from "./taxonomy";

// Public listings. RLS already limits the anon client to published rows; each
// query says so as well, and names its columns so a private one can't slip in.
// programmes.internal_school_name is never selected, and anon has no grant on it.

function rows<T>(
  name: string,
  { data, error }: { data: T[] | null; error: { message: string } | null },
) {
  if (error) throw new Error(`Could not load ${name}: ${error.message}`);
  return data ?? [];
}

export async function getDrives() {
  "use cache";
  cacheTag(cacheTags.drives);
  cacheLife(contentCacheLife);

  return rows(
    "drives",
    await createPublicClient()
      .from("drives")
      .select("id, host_name, drive_date, applicants_count, photo_path")
      .eq("publish_state", "published")
      .order("drive_date", { ascending: false, nullsFirst: false }),
  );
}

export type Drive = Awaited<ReturnType<typeof getDrives>>[number];

/** Only rows with written permission, whatever else the table holds. */
export async function getTestimonials() {
  "use cache";
  cacheTag(cacheTags.testimonials);
  cacheLife(contentCacheLife);

  return rows(
    "testimonials",
    await createPublicClient()
      .from("testimonials")
      .select("id, display_name, service_key, year, quote, photo_path")
      .eq("publish_state", "published")
      .eq("permission_on_file", true)
      .order("year", { ascending: false }),
  );
}

export type Testimonial = Awaited<ReturnType<typeof getTestimonials>>[number];

export async function getProgrammes(kind: "study" | "bridging") {
  "use cache";
  cacheTag(cacheTags.programmes);
  cacheLife(contentCacheLife);

  return rows(
    "programmes",
    await createPublicClient()
      .from("programmes")
      .select(
        "id, kind, country, city, level, title, duration_text, tuition_text, keyword, correct_as_of",
      )
      .eq("publish_state", "published")
      .eq("kind", kind)
      .order("correct_as_of", { ascending: false }),
  );
}

export type Programme = Awaited<ReturnType<typeof getProgrammes>>[number];

export async function getOpenings() {
  "use cache";
  cacheTag(cacheTags.openings);
  cacheLife(contentCacheLife);

  return rows(
    "openings",
    await createPublicClient()
      .from("openings")
      .select(
        "id, country, sector, title, requirements, candidate_costs, keyword, correct_as_of",
      )
      .eq("publish_state", "published")
      .order("correct_as_of", { ascending: false }),
  );
}

export type Opening = Awaited<ReturnType<typeof getOpenings>>[number];

export async function getFaqs(serviceKey: string) {
  "use cache";
  cacheTag(cacheTags.faqs);
  cacheLife(contentCacheLife);

  return rows(
    "FAQs",
    await createPublicClient()
      .from("faqs")
      .select("id, question, answer")
      .eq("publish_state", "published")
      .eq("service_key", serviceKey)
      .order("sort_order"),
  );
}

export type Faq = Awaited<ReturnType<typeof getFaqs>>[number];

export async function getAllFaqs() {
  "use cache";
  cacheTag(cacheTags.faqs);
  cacheLife(contentCacheLife);

  return rows(
    "FAQs",
    await createPublicClient()
      .from("faqs")
      .select("id, question, answer, service_key")
      .eq("publish_state", "published")
      .order("sort_order"),
  );
}

export async function getTrips() {
  "use cache";
  cacheTag(cacheTags.trips);
  cacheLife(contentCacheLife);

  return rows(
    "trips",
    await createPublicClient()
      .from("trips")
      .select(
        "id, title, destination, starts_on, ends_on, price_from_ghs, seats_left, photo_path",
      )
      .eq("publish_state", "published")
      .order("starts_on", { nullsFirst: false }),
  );
}

export type Trip = Awaited<ReturnType<typeof getTrips>>[number];

/** Videos placed on a page, pinned first. */
export async function getVideos(pageKey: string) {
  "use cache";
  cacheTag(cacheTags.videos);
  cacheLife(contentCacheLife);

  return rows(
    "videos",
    await createPublicClient()
      .from("videos")
      .select(
        "id, platform, url, thumbnail_url, title, keyword, pinned, video_placements!inner (page_key)",
      )
      .eq("publish_state", "published")
      .eq("video_placements.page_key", pageKey)
      .order("pinned", { ascending: false })
      .order("published_at", { ascending: false }),
  );
}

export type Video = Awaited<ReturnType<typeof getVideos>>[number];

/** Every published video, pinned first, optionally for one platform. */
export async function getAllVideos(platform?: VideoPlatform) {
  "use cache";
  cacheTag(cacheTags.videos);
  cacheLife(contentCacheLife);

  let query = createPublicClient()
    .from("videos")
    .select("id, platform, url, thumbnail_url, title, keyword, pinned")
    .eq("publish_state", "published");

  if (platform) query = query.eq("platform", platform);

  return rows(
    "videos",
    await query
      .order("pinned", { ascending: false })
      .order("published_at", { ascending: false }),
  );
}

export type ListedVideo = Awaited<ReturnType<typeof getAllVideos>>[number];

export async function getLatestPosts(limit: number) {
  "use cache";
  cacheTag(cacheTags.posts);
  cacheLife(contentCacheLife);

  return rows(
    "posts",
    await createPublicClient()
      .from("posts")
      .select("id, slug, title, summary, category, published_at")
      .eq("publish_state", "published")
      .order("published_at", { ascending: false })
      .limit(limit),
  );
}

export type Post = Awaited<ReturnType<typeof getLatestPosts>>[number];

/** One page of the blog, and how many posts match in total. */
export async function getBlogPage(topic: PostCategory | "all", page: number) {
  "use cache";
  cacheTag(cacheTags.posts);
  cacheLife(contentCacheLife);

  let query = createPublicClient()
    .from("posts")
    .select("id, slug, title, summary, category, published_at, cover_path, cover_alt", {
      count: "exact",
    })
    .eq("publish_state", "published");

  if (topic !== "all") query = query.eq("category", topic);

  const from = (page - 1) * blogPageSize;
  const { data, count, error } = await query
    .order("published_at", { ascending: false })
    .range(from, from + blogPageSize - 1);

  if (error) throw new Error(`Could not load posts: ${error.message}`);
  return { posts: data, total: count ?? 0 };
}

export type BlogPost = Awaited<ReturnType<typeof getBlogPage>>["posts"][number];

export async function getPostSlugs() {
  "use cache";
  cacheTag(cacheTags.posts);
  cacheLife(contentCacheLife);

  return rows(
    "posts",
    await createPublicClient()
      .from("posts")
      .select("slug")
      .eq("publish_state", "published"),
  ).map(({ slug }) => slug);
}

export async function getPost(slug: string) {
  "use cache";
  cacheTag(cacheTags.posts);
  cacheLife(contentCacheLife);

  const { data, error } = await createPublicClient()
    .from("posts")
    .select(
      "id, slug, title, summary, body, body_html, category, author_id, cover_path, cover_alt, seo_title, seo_description, published_at",
    )
    .eq("slug", slug)
    .eq("publish_state", "published")
    .maybeSingle();

  if (error) throw new Error(`Could not load the post: ${error.message}`);
  return data;
}

export type Article = NonNullable<Awaited<ReturnType<typeof getPost>>>;

/** Three more to read: same category first, then the latest. */
export async function getRelatedPosts(post: Pick<Article, "id" | "category">) {
  const [sameCategory, latest] = await Promise.all([
    getBlogPage(post.category, 1),
    getBlogPage("all", 1),
  ]);
  const seen = new Set([post.id]);

  return [...sameCategory.posts, ...latest.posts]
    .filter((item) => !seen.has(item.id) && Boolean(seen.add(item.id)))
    .slice(0, 3);
}

/** The view adds status from dates and requires the official link and both ticks. */
export async function getScholarships() {
  "use cache";
  cacheTag(cacheTags.scholarships);
  cacheLife(contentCacheLife);

  return rows(
    "scholarships",
    await createPublicClient()
      .from("scholarships_public")
      .select(
        "id, slug, name, where_text, levels, covers, official_url, status, deadline_on, deadline_text, verified_on",
      )
      .order("deadline_on", { nullsFirst: false }),
  );
}

export type Scholarship = Awaited<ReturnType<typeof getScholarships>>[number];
