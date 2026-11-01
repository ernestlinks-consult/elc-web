import Link from "next/link";
import { AlertsSignup } from "@/components/forms/AlertsSignup";
import { Badge, Button, EmptyState, Pagination } from "@/components/ui";
import type { FaqGroup } from "@/lib/content/faq-groups";
import type { BlogPost, ListedVideo, Scholarship } from "@/lib/content/listings";
import {
  blogPageSize,
  faqTopics,
  postCategories,
  scholarshipStatuses,
  videoPlatforms,
  type FaqTopic,
  type PostCategory,
  type ScholarshipStatus,
  type VideoPlatform,
} from "@/lib/content/taxonomy";
import { FaqList } from "./FaqList";
import { ImageOrPattern } from "./ImageOrPattern";
import { VideoEmbed } from "./VideoEmbed";
import { FilterLinks, PageTitle } from "./content-parts";
import { cardGrid, Section, SectionHeading, shortDate, Steps } from "./parts";

const home = { label: "Home", href: "/" };
const resources = { label: "Blog & Resources", href: "/resources" };

export function BlogListPage({
  topic,
  page,
  posts,
  total,
}: {
  topic: PostCategory | "all";
  page: number;
  posts: BlogPost[];
  total: number;
}) {
  const totalPages = Math.max(1, Math.ceil(total / blogPageSize));
  const showFeatured = topic === "all" && page === 1 && posts.length > 0;
  const [featured, ...rest] = posts;
  const cards = showFeatured ? rest : posts;
  const pageHref = (next: number) => {
    const query = new URLSearchParams();
    if (topic !== "all") query.set("topic", topic);
    if (next > 1) query.set("page", String(next));
    return `/resources/blog${query.size > 0 ? `?${query}` : ""}`;
  };

  return (
    <>
      <PageTitle
        crumbs={[home, resources, { label: "Blog" }]}
        title="The ELC Blog"
        lead="Clear guides on passports, applications, visas and exams, written by the team that does the work."
      />
      {showFeatured && (
        <Section tone="tint">
          <Link
            href={`/resources/blog/${featured.slug}`}
            className="flex flex-col gap-space-2 rounded-lg bg-surface p-space-5 text-ink no-underline"
          >
            <span className="text-eyebrow text-red-text">Featured</span>
            <strong className="text-h3">{featured.title}</strong>
            {featured.summary && <span className="text-ink-muted">{featured.summary}</span>}
            <span className="font-bold text-blue">Read the guide →</span>
          </Link>
        </Section>
      )}
      <Section>
        <h2 className="text-h2">All posts</h2>
        <FilterLinks
          label="Blog topics"
          links={[
            { href: "/resources/blog", label: "All", current: topic === "all" },
            ...(Object.keys(postCategories) as PostCategory[]).map((key) => ({
              href: `/resources/blog?topic=${key}`,
              label: postCategories[key].label,
              current: topic === key,
            })),
          ]}
        />
        {cards.length > 0 ? (
          <ul className={cardGrid}>
            {cards.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/resources/blog/${post.slug}`}
                  className="flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface text-ink no-underline"
                >
                  <ImageOrPattern path={post.cover_path} alt={post.cover_alt ?? ""} className="h-36" />
                  <span className="flex flex-col gap-1 p-space-4">
                    <span className="text-body-sm text-ink-muted">
                      {postCategories[post.category].label}
                      {post.published_at && ` · ${shortDate(post.published_at)}`}
                    </span>
                    <strong className="text-h4">{post.title}</strong>
                    {post.summary && <span className="text-ink-muted">{post.summary}</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          !showFeatured && (
            <EmptyState
              message="No posts on this topic yet."
              action={<Button href="/resources/blog" variant="secondary">See all posts</Button>}
            />
          )
        )}
        {totalPages > 1 && (
          <Pagination plainLinks page={page} totalPages={totalPages} hrefForPage={pageHref} />
        )}
      </Section>
    </>
  );
}

function ScholarshipCard({ item }: { item: Scholarship }) {
  const status = item.status as ScholarshipStatus;
  const deadline =
    item.deadline_text ?? (item.deadline_on ? shortDate(item.deadline_on) : null);
  const rows = [
    ["Where", item.where_text],
    ["Level", item.levels?.join(", ")],
    ["Covers", item.covers],
    ["Deadline", deadline],
  ].filter(([, value]) => value);

  return (
    <li className="flex min-w-0 flex-col gap-space-2 rounded-lg border border-line bg-surface p-space-5">
      <div className="flex flex-wrap items-center justify-between gap-space-2">
        <Badge tone={status === "open" ? "success" : status === "closed" ? "neutral" : "warning"}>
          {scholarshipStatuses[status]}
        </Badge>
        {item.verified_on && (
          <span className="text-body-sm text-ink-muted">
            Verified on {shortDate(item.verified_on)}
          </span>
        )}
      </div>
      <h3 className="text-h4">{item.name}</h3>
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-space-3 gap-y-1 text-body-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-ink-muted">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-body-sm font-bold">Never pay to apply.</p>
      <div className="mt-auto flex flex-wrap items-center gap-space-3">
        <a
          href={item.official_url!}
          target="_blank"
          rel="noopener"
          aria-label={`Official page for ${item.name} (opens in a new tab)`}
          className="inline-flex min-h-11 items-center font-bold"
        >
          Official page
        </a>
        <Button href="/start?service=school" variant="secondary">
          Get help applying
        </Button>
      </div>
    </li>
  );
}

export function ScholarshipsPage({
  status,
  scholarships,
  helpHref,
}: {
  status: ScholarshipStatus | "all";
  scholarships: Scholarship[];
  helpHref: string;
}) {
  const shown = scholarships.filter(
    (item) => status === "all" || item.status === status,
  );
  const count = (key: ScholarshipStatus) =>
    scholarships.filter((item) => item.status === key).length;

  return (
    <>
      <PageTitle
        crumbs={[home, resources, { label: "Scholarship Hunt" }]}
        title="Scholarship Hunt"
        lead="Verified opportunities for final-year students, NSS personnel and graduates. We check every deadline and link before it goes up."
      >
        <div className="flex flex-wrap gap-space-3">
          <Button href="#alerts">Get alerts on WhatsApp</Button>
          <Button href={helpHref} variant="secondary">
            Ask for help: &quot;SCHOLAR&quot;
          </Button>
        </div>
      </PageTitle>
      <Section>
        <h2 className="sr-only">Scholarships</h2>
        <FilterLinks
          label="Scholarship status"
          links={[
            { href: "/resources/scholarships", label: "All", count: scholarships.length, current: status === "all" },
            ...(Object.keys(scholarshipStatuses) as ScholarshipStatus[]).map((key) => ({
              href: `/resources/scholarships?status=${key}`,
              label: scholarshipStatuses[key],
              count: count(key),
              current: status === key,
            })),
          ]}
        />
        {shown.length > 0 ? (
          <ul className={cardGrid}>
            {shown.map((item) => (
              <ScholarshipCard key={item.id} item={item} />
            ))}
          </ul>
        ) : (
          <EmptyState
            message="No open scholarships right now. Get alerts on WhatsApp."
            action={<Button href="#alerts">Get alerts on WhatsApp</Button>}
          />
        )}
        <p className="text-body-sm text-ink-muted">
          Always confirm details on the official page before you apply. Dates
          marked “to be confirmed” are expected, not announced.
        </p>
      </Section>
      <Section tone="tint">
        <SectionHeading title="How we verify" />
        <Steps
          items={[
            ["Official source only", "We link to the funder’s own page, never a reposting site."],
            ["Dates checked", "Each listing shows the day we last checked it."],
            ["No pay-to-apply", "We never list a scholarship that charges you to apply for it."],
          ]}
        />
      </Section>
      <section id="alerts" className="scroll-mt-24 bg-blue-deep text-on-blue-muted">
        <div className="container grid py-14">
          <AlertsSignup privacyHref="/privacy" heading="Scholarship alerts on WhatsApp" />
        </div>
      </section>
    </>
  );
}

export function VideosPage({
  platform,
  videos,
  socials,
  liveNote,
}: {
  platform: VideoPlatform | "all";
  videos: ListedVideo[];
  socials: { label: string; url: string }[];
  liveNote: string;
}) {
  return (
    <>
      <PageTitle
        crumbs={[home, resources, { label: "Videos" }]}
        title="Watch ELC"
        lead="Our latest videos from TikTok, Instagram, Facebook and YouTube. They play right here, and every view and like counts on the platform."
      />
      <Section>
        <h2 className="sr-only">Videos</h2>
        <FilterLinks
          label="Video platform"
          links={[
            { href: "/resources/videos", label: "All", current: platform === "all" },
            ...(Object.keys(videoPlatforms) as VideoPlatform[]).map((key) => ({
              href: `/resources/videos?platform=${key}`,
              label: videoPlatforms[key],
              current: platform === key,
            })),
          ]}
        />
        {videos.length > 0 ? (
          <div className={cardGrid}>
            {videos.map((video) => (
              <VideoEmbed
                key={video.id}
                platform={video.platform}
                url={video.url}
                title={video.title}
                keyword={video.keyword}
                thumbnailUrl={video.thumbnail_url}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            message="No videos here yet."
            action={<Button href="/resources/videos" variant="secondary">See all videos</Button>}
          />
        )}
      </Section>
      <Section tone="tint">
        <SectionHeading title="Never miss a video or a LIVE." intro={liveNote} />
        <ul className="flex flex-wrap gap-space-2">
          {socials.map((social) => (
            <li key={social.url}>
              <Button href={social.url} variant="secondary">
                {social.label}
              </Button>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

export function FaqsPage({
  topic,
  groups,
  allGroups,
  whatsappHref,
}: {
  topic: FaqTopic | "all";
  groups: FaqGroup[];
  allGroups: FaqGroup[];
  whatsappHref: string;
}) {
  return (
    <>
      <PageTitle
        crumbs={[home, resources, { label: "FAQs" }]}
        title="Questions people ask us"
      />
      <Section>
        <FilterLinks
          label="FAQ topics"
          links={[
            { href: "/resources/faqs", label: "All", current: topic === "all" },
            ...allGroups.map((group) => ({
              href: `/resources/faqs?topic=${group.topic}`,
              label: faqTopics[group.topic],
              count: group.faqs.length,
              current: topic === group.topic,
            })),
          ]}
        />
        {groups.length > 0 ? (
          <FaqList groups={groups} />
        ) : (
          <EmptyState
            message="No questions here yet."
            action={<Button href={whatsappHref}>WhatsApp us</Button>}
          />
        )}
      </Section>
      <Section tone="tint">
        <SectionHeading
          title="Still stuck?"
          intro="Ask it on our weekday TikTok LIVE or message us."
        />
        <Button href={whatsappHref} className="self-start">
          WhatsApp us
        </Button>
      </Section>
    </>
  );
}
