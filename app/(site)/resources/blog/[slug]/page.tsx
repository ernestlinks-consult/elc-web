import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticlePage } from "@/components/site/ArticlePage";
import { articleHtml, readingMinutes } from "@/lib/content/article";
import { getPost, getPostSlugs, getRelatedPosts } from "@/lib/content/listings";
import { getTeam } from "@/lib/content/staff";
import { pageMetadata, siteUrl } from "@/lib/site-metadata";

type PageProps = { params: Promise<{ slug: string }> };

// Cache Components needs at least one param. With no posts yet, this stand-in is
// never linked, and proxy.ts answers 404 for it.
export async function generateStaticParams() {
  const slugs = await getPostSlugs();

  return (slugs.length > 0 ? slugs : ["no-posts-yet"]).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  const base = pageMetadata({
    title: `${post.seo_title ?? post.title} | ErnestLinks Consult`,
    description: post.seo_description ?? post.summary ?? post.title,
    path: `/resources/blog/${post.slug}`,
  });

  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      ...(post.cover_path
        ? {
            images: [
              {
                url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-images/${post.cover_path}`,
                alt: post.cover_alt ?? post.title,
              },
            ],
          }
        : {}),
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const [team, related] = await Promise.all([getTeam(), getRelatedPosts(post)]);
  const html = articleHtml(post);

  return (
    <ArticlePage
      post={post}
      html={html}
      minutes={readingMinutes(html)}
      author={team.find((member) => member.id === post.author_id) ?? null}
      related={related}
      url={`${siteUrl}/resources/blog/${post.slug}`}
    />
  );
}
