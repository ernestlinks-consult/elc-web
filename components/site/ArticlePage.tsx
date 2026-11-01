import Link from "next/link";
import { Button } from "@/components/ui";
import type { Article, BlogPost } from "@/lib/content/listings";
import type { TeamMember } from "@/lib/content/staff";
import { postCategories } from "@/lib/content/taxonomy";
import { Breadcrumbs } from "./Breadcrumbs";
import { ImageOrPattern } from "./ImageOrPattern";
import { proseClasses } from "./content-parts";
import { cardGrid, Section, shortDate } from "./parts";
import { ShareLinks } from "./ShareLinks";

export function ArticlePage({
  post,
  html,
  minutes,
  author,
  related,
  url,
}: {
  post: Article;
  /** Already sanitised on the server. */
  html: string;
  minutes: number;
  author: TeamMember | null;
  related: BlogPost[];
  url: string;
}) {
  const category = postCategories[post.category];
  const meta = [
    author?.title,
    post.published_at ? shortDate(post.published_at) : null,
    `${minutes} min read`,
  ].filter(Boolean);

  return (
    <>
      <article>
        <div className="container flex max-w-205 flex-col gap-space-3 pt-10">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Blog & Resources", href: "/resources" },
              { label: "Blog", href: "/resources/blog" },
              { label: post.title },
            ]}
          />
          <p className="text-eyebrow text-red-text">{category.label}</p>
          <h1 className="text-h1">{post.title}</h1>
          {post.summary && <p className="text-lead text-ink-muted">{post.summary}</p>}
          <p className="text-body-sm text-ink-muted">
            {author && <strong className="text-ink">{author.fullName} </strong>}
            {meta.join(" · ")}
          </p>
          <ImageOrPattern
            path={post.cover_path}
            alt={post.cover_alt ?? ""}
            className="aspect-video rounded-lg"
            sizes="820px"
            priority
          />
          <ShareLinks url={url} title={post.title} />
          <div
            data-testid="article-body"
            className={proseClasses}
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <aside
            aria-label="Start online"
            className="flex flex-col gap-space-2 rounded-lg bg-blue-tint p-space-5"
          >
            <h2 className="text-h4">Not sure where you stand?</h2>
            <p className="text-ink-muted">
              Start online in under a minute and we&apos;ll message you with a
              plan, free.
            </p>
            <Button href={`/start?service=${category.service}`} className="self-start">
              Start online
            </Button>
          </aside>
          <p className="text-body-sm text-ink-muted">
            Rules and deadlines change. We confirm the current requirements for
            your country and programme before you apply.
          </p>
          {author && (
            <aside
              aria-label="About the author"
              className="flex flex-col gap-1 border-t border-line py-space-4"
            >
              <strong>{author.fullName}</strong>
              <p className="text-ink-muted">
                {author.bio ??
                  `${author.title} at ErnestLinks Consult. Bring your questions to our weekday TikTok LIVE.`}
              </p>
            </aside>
          )}
        </div>
      </article>

      {related.length > 0 && (
        <Section tone="tint">
          <div className="flex flex-wrap items-center justify-between gap-space-2">
            <h2 className="text-h3">Keep reading</h2>
            <Link href="/resources/blog" className="inline-flex min-h-11 items-center">
              All posts →
            </Link>
          </div>
          <ul className={cardGrid}>
            {related.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/resources/blog/${item.slug}`}
                  className="flex h-full flex-col gap-1 rounded-lg border border-line bg-surface p-space-4 text-ink no-underline"
                >
                  <span className="text-body-sm text-ink-muted">
                    {postCategories[item.category].label}
                  </span>
                  <strong className="text-h4">{item.title}</strong>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
