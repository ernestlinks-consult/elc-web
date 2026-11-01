import { readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";
import {
  publicDynamicRoutes,
  publicPages,
  publicSections,
  resolvePublicRoute,
} from "@/lib/public-routes";

const siteFolder = join(process.cwd(), "app", "(site)");

function dynamicPages(folder: string): string[] {
  const entries = readdirSync(folder, { withFileTypes: true });
  const here = entries.some((entry) => entry.name === "page.tsx")
    ? [`/${relative(siteFolder, folder).split(sep).join("/")}`]
    : [];

  return [
    ...here.filter((route) => route.includes("[")),
    ...entries
      .filter((entry) => entry.isDirectory())
      .flatMap((entry) => dynamicPages(join(folder, entry.name))),
  ];
}

const resolve = (url: string) => {
  const { pathname, searchParams } = new URL(url, "http://localhost");
  return resolvePublicRoute(pathname, searchParams);
};

describe("the proxy's route list", () => {
  it("covers every public dynamic route", () => {
    const routes = dynamicPages(siteFolder);

    expect(routes.length).toBeGreaterThan(0);
    expect(routes.toSorted()).toEqual([...publicDynamicRoutes].toSorted());
  });

  it("knows every top-level folder", () => {
    const folders = readdirSync(siteFolder, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    expect(folders.toSorted()).toEqual([...publicPages, ...publicSections].toSorted());
  });
});

describe("resolvePublicRoute", () => {
  it.each([
    "/no-such-page",
    "/page-not-found",
    "/about/team",
    "/services",
    "/services/no-such",
    "/services/passports/extra",
    "/start/no-such",
    "/start/visa/extra",
    "/resources/no-such",
    "/resources/blog/a/b",
    "/resources/blog/list/all",
    "/resources/faqs/extra",
    "/resources/blog?topic=nope",
    "/resources/blog?page=0",
    "/resources/blog?page=-1",
    "/resources/blog?page=1.5",
    "/resources/blog?page=abc",
    "/resources/blog?topic=exams&page=x",
    "/resources/blog/list/nope/1",
    "/resources/blog/list/all/0",
    "/resources/scholarships?status=nope",
    "/resources/scholarships/status/nope",
    "/resources/videos?platform=nope",
    "/resources/videos/platform/nope",
    "/resources/faqs?topic=nope",
    "/resources/faqs/topic/nope",
  ])("stops %s", (url) => {
    expect(resolve(url)).toEqual({ action: "notFound" });
  });

  it.each([
    ["/resources/blog?topic=exams", "/resources/blog/list/exams/1"],
    ["/resources/scholarships?status=open", "/resources/scholarships/status/open"],
    ["/resources/videos?platform=tiktok", "/resources/videos/platform/tiktok"],
    ["/resources/faqs?topic=general", "/resources/faqs/topic/general"],
  ])("rewrites %s", (url, path) => {
    expect(resolve(url)).toEqual({ action: "rewrite", path });
  });

  it("asks the database about a later blog page", () => {
    expect(resolve("/resources/blog?topic=exams&page=2")).toEqual({
      action: "rewrite",
      path: "/resources/blog/list/exams/2",
      check: { kind: "blogPage", topic: "exams", page: 2 },
    });
  });

  it("asks the database about an article", () => {
    expect(resolve("/resources/blog/some-post")).toEqual({
      action: "continue",
      check: { kind: "post", slug: "some-post" },
    });
  });

  it.each([
    "/",
    "/about",
    "/resources",
    "/resources/blog",
    "/resources/blog/list/exams/1",
    "/services/passports",
    "/start",
    "/start/done",
    "/start/visa",
  ])(
    "lets %s through",
    (url) => {
      expect(resolve(url)).toEqual({ action: "continue" });
    },
  );
});
