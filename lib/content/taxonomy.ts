// Fixed lists shared by the public filters and the route check in proxy.ts.
// Nothing here may import server-only code.

export const blogPageSize = 9;

export const postCategories = {
  passports: { label: "Passports", service: "passport" },
  school_applications: { label: "School applications", service: "school" },
  visas: { label: "Visas", service: "visa" },
  exams: { label: "Exams", service: "exams" },
  scholarships: { label: "Scholarships", service: "school" },
  student_stories: { label: "Student stories", service: "school" },
  work_abroad: { label: "Work abroad", service: "work" },
  travel: { label: "Travel", service: "travel" },
} as const;

export type PostCategory = keyof typeof postCategories;

export const isPostCategory = (value: string): value is PostCategory =>
  value in postCategories;

export const scholarshipStatuses = {
  open: "Open",
  opening_soon: "Opening soon",
  closed: "Closed",
} as const;

export type ScholarshipStatus = keyof typeof scholarshipStatuses;

export const isScholarshipStatus = (value: string): value is ScholarshipStatus =>
  value in scholarshipStatuses;

export const videoPlatforms = {
  tiktok: "TikTok",
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
} as const;

export type VideoPlatform = keyof typeof videoPlatforms;

export const isVideoPlatform = (value: string): value is VideoPlatform =>
  value in videoPlatforms;

/** Services first, general last, as the page lists them. */
export const faqTopics = {
  passport: "Passports",
  birth: "Birth certificates",
  school: "School applications",
  visa: "Visas",
  work: "Work abroad",
  exams: "Exams",
  travel: "Travel",
  general: "General",
} as const;

export type FaqTopic = keyof typeof faqTopics;

export const isFaqTopic = (value: string): value is FaqTopic => value in faqTopics;
