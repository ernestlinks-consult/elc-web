import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogListPage } from "@/components/site/ListPages";
import { getBlogPage } from "@/lib/content/listings";
import {
  blogPageSize,
  isPostCategory,
  postCategories,
  type PostCategory,
} from "@/lib/content/taxonomy";
import { pageMetadata } from "@/lib/site-metadata";

// /resources/blog?topic=exams&page=2 arrives here through proxy.ts.

type PageProps = { params: Promise<{ topic: string; page: string }> };

export async function generateStaticParams() {
  const topics = ["all", ...Object.keys(postCategories)] as (PostCategory | "all")[];
  const params = await Promise.all(
    topics.map(async (topic) => {
      const { total } = await getBlogPage(topic, 1);
      const pages = Math.max(1, Math.ceil(total / blogPageSize));
      return Array.from({ length: pages }, (_, index) => ({
        topic,
        page: String(index + 1),
      }));
    }),
  );

  return params.flat();
}

function publicPath(topic: string, page: string) {
  const query = new URLSearchParams();
  if (topic !== "all") query.set("topic", topic);
  if (page !== "1") query.set("page", page);
  return `/resources/blog${query.size > 0 ? `?${query}` : ""}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { topic, page } = await params;
  const label = isPostCategory(topic) ? postCategories[topic].label : "All posts";
  const pageText = page === "1" ? "" : `, page ${page}`;

  return pageMetadata({
    title: `${label}${pageText} | The ELC Blog`,
    description: `${label} guides from the ErnestLinks Consult team${pageText}.`,
    path: publicPath(topic, page),
  });
}

export default async function Page({ params }: PageProps) {
  const { topic, page } = await params;
  const number = Number(page);
  if ((topic !== "all" && !isPostCategory(topic)) || !Number.isInteger(number)) notFound();

  const { posts, total } = await getBlogPage(topic as PostCategory | "all", number);

  return (
    <BlogListPage
      topic={topic as PostCategory | "all"}
      page={number}
      posts={posts}
      total={total}
    />
  );
}
