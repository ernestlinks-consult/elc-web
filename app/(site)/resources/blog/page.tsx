import type { Metadata } from "next";
import { BlogListPage } from "@/components/site/ListPages";
import { getBlogPage } from "@/lib/content/listings";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = pageMetadata({
  title: "The ELC Blog | ErnestLinks Consult",
  description:
    "Clear guides on passports, applications, visas and exams, written by the team that does the work.",
  path: "/resources/blog",
});

export default async function Page() {
  const { posts, total } = await getBlogPage("all", 1);

  return <BlogListPage topic="all" page={1} posts={posts} total={total} />;
}
