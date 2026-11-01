import type { Metadata } from "next";
import Link from "next/link";
import { PageTitle } from "@/components/site/content-parts";
import { Section, cardGrid, shortDate } from "@/components/site/parts";
import { getAllVideos, getLatestPosts, getScholarships } from "@/lib/content/listings";
import { postCategories, scholarshipStatuses, videoPlatforms, type ScholarshipStatus, type VideoPlatform } from "@/lib/content/taxonomy";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Blog & Resources | ErnestLinks Consult",
  description:
    "Free guides, verified scholarships, our latest videos and straight answers. Everything we know, in one place.",
  path: "/resources",
});

const sections = [
  ["Blog", "Step-by-step guides, rule changes and student stories.", "Read the blog →", "/resources/blog"],
  ["Scholarship Hunt", "Verified opportunities with deadlines, eligibility and links.", "See open scholarships →", "/resources/scholarships"],
  ["Videos", "Our TikTok, Instagram, Facebook and YouTube posts, played here.", "Watch videos →", "/resources/videos"],
  ["FAQs", "Prices, timelines, payments and what to expect, by service.", "Find an answer →", "/resources/faqs"],
];

function Column({ title, href, linkLabel, items }: { title: string; href: string; linkLabel: string; items: { key: string; meta: string; title: string; href: string }[] }) {
  if (items.length === 0) return null;

  return (
    <div className="flex min-w-0 flex-col gap-space-3">
      <div className="flex flex-wrap items-center justify-between gap-space-2">
        <h3 className="text-eyebrow text-red-text">{title}</h3>
        <Link href={href} className="inline-flex min-h-11 items-center">{linkLabel}</Link>
      </div>
      <ul className="flex flex-col gap-space-2">
        {items.map((item) => (
          <li key={item.key}>
            <Link href={item.href} className="flex flex-col gap-1 rounded-lg bg-surface p-space-4 text-ink no-underline">
              <span className="text-body-sm text-ink-muted">{item.meta}</span>
              <strong>{item.title}</strong>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function Page() {
  const [posts, scholarships, videos] = await Promise.all([
    getLatestPosts(2),
    getScholarships(),
    getAllVideos(),
  ]);

  const postItems = posts.map((post) => ({
    key: post.id,
    meta: [postCategories[post.category].label, post.published_at && shortDate(post.published_at)].filter(Boolean).join(" · "),
    title: post.title,
    href: `/resources/blog/${post.slug}`,
  }));
  const scholarshipItems = scholarships
    .filter((item) => item.status !== "closed")
    .slice(0, 2)
    .map((item) => ({
      key: item.id!,
      meta: scholarshipStatuses[item.status as ScholarshipStatus],
      title: item.name!,
      href: "/resources/scholarships",
    }));
  const videoItems = videos.slice(0, 2).map((video) => ({
    key: video.id,
    meta: videoPlatforms[video.platform as VideoPlatform],
    title: video.title,
    href: "/resources/videos",
  }));
  const hasNew = postItems.length + scholarshipItems.length + videoItems.length > 0;

  return (
    <>
      <PageTitle
        pattern
        crumbs={[{ label: "Home", href: "/" }, { label: "Blog & Resources" }]}
        title="Blog & Resources"
        lead="Free guides, verified scholarships, our latest videos and straight answers. Everything we know, in one place."
      />
      <Section>
        <ul className={cardGrid}>
          {sections.map(([title, text, action, href]) => (
            <li key={title}>
              <Link href={href} className="flex h-full flex-col gap-space-2 rounded-lg border border-line bg-surface p-space-5 text-ink no-underline">
                <h2 className="text-h4">{title}</h2>
                <span className="text-ink-muted">{text}</span>
                <span className="mt-auto font-bold text-blue">{action}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
      {hasNew && (
        <Section tone="tint">
          <h2 className="text-h2">New this week</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-space-5">
            <Column title="From the blog" href="/resources/blog" linkLabel="All posts" items={postItems} />
            <Column title="Scholarship Hunt" href="/resources/scholarships" linkLabel="All opportunities" items={scholarshipItems} />
            <Column title="Latest videos" href="/resources/videos" linkLabel="All videos" items={videoItems} />
          </div>
        </Section>
      )}
    </>
  );
}
