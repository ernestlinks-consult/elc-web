// Publishing calls revalidateTag, so this is only the fallback for anything
// missed: pages refresh within 10 minutes (docs/03-System-Architecture.md).
export const contentCacheLife = {
  stale: 300,
  revalidate: 600,
  expire: 86_400,
};

export const cacheTags = {
  settings: "settings",
  services: "services",
  team: "team",
  prices: "prices",
  drives: "drives",
  testimonials: "testimonials",
  programmes: "programmes",
  openings: "openings",
  faqs: "faqs",
  trips: "trips",
  videos: "videos",
  posts: "posts",
  scholarships: "scholarships",
} as const;
