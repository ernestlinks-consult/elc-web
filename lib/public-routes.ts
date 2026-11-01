import {
  isFaqTopic,
  isPostCategory,
  isScholarshipStatus,
  isVideoPlatform,
} from "./content/taxonomy";
import { serviceKeys, type ServiceKey } from "./forms/types";

// What proxy.ts does with a public URL. Filters arrive as query strings, but
// reading searchParams would make a page stream: it would answer 200 before it could
// say 404, and show nothing without JavaScript. So valid filters are rewritten here
// to prerendered routes, and anything else stops here with a real 404.

export const servicePageSlugs = new Set([
  "passports",
  "school-applications",
  "visa-applications",
  "work-abroad",
  "exams",
  "travel",
]);

/**
 * Every public dynamic route. A test walks app/(site) and fails if a route is
 * missing, because an unchecked one answers 200 for a page that doesn't exist.
 */
export const publicDynamicRoutes = [
  "/start/[service]",
  "/services/[slug]",
  "/resources/blog/[slug]",
  "/resources/blog/list/[topic]/[page]",
  "/resources/scholarships/status/[status]",
  "/resources/videos/platform/[platform]",
  "/resources/faqs/topic/[topic]",
] as const;

/** Pages with no children. A test keeps this and the top-level folders in step. */
export const publicPages = ["about", "contact", "payments", "privacy", "terms"];

/** Top-level folders with their own rules below. */
export const publicSections = ["dev", "resources", "services", "start"];

export type DatabaseCheck =
  | { kind: "post"; slug: string }
  | { kind: "blogPage"; topic: string; page: number };

export type RouteDecision =
  | { action: "continue"; check?: DatabaseCheck }
  | { action: "rewrite"; path: string; check?: DatabaseCheck }
  | { action: "notFound" };

const carryOn: RouteDecision = { action: "continue" };
const notFound: RouteDecision = { action: "notFound" };

function pageNumber(value: string) {
  return /^[1-9]\d{0,4}$/.test(value) ? Number(value) : null;
}

function blogRoute(topic: string, pageText: string, path: string | null) {
  const page = pageNumber(pageText);
  if (!page || (topic !== "all" && !isPostCategory(topic))) return notFound;

  const check: DatabaseCheck | undefined =
    page > 1 ? { kind: "blogPage", topic, page } : undefined;

  return path
    ? ({ action: "rewrite", path, check } as const)
    : ({ action: "continue", check } as const);
}

function filterRoute(
  value: string | null,
  isValid: (value: string) => boolean,
  path: (value: string) => string,
): RouteDecision {
  if (value === null) return carryOn;
  return isValid(value) ? { action: "rewrite", path: path(value) } : notFound;
}

export function resolvePublicRoute(
  pathname: string,
  query: URLSearchParams,
): RouteDecision {
  const segments = pathname.split("/").filter(Boolean);
  const [first, second, third, fourth, fifth] = segments;

  if (!first || first === "dev") return carryOn;

  if (publicPages.includes(first)) {
    return segments.length === 1 ? carryOn : notFound;
  }

  if (first === "services") {
    return segments.length === 2 && servicePageSlugs.has(second) ? carryOn : notFound;
  }

  if (first === "start") {
    if (segments.length === 1) return carryOn;
    return segments.length === 2 &&
      (second === "done" || serviceKeys.includes(second as ServiceKey))
      ? carryOn
      : notFound;
  }

  if (first !== "resources") return notFound;
  if (!second) return carryOn;

  if (second === "blog") {
    if (segments.length === 2) {
      const topic = query.get("topic");
      const page = query.get("page");
      if (topic === null && page === null) return carryOn;

      const target = topic ?? "all";
      const number = page ?? "1";
      return blogRoute(target, number, `/resources/blog/list/${target}/${number}`);
    }

    if (third === "list" && segments.length === 5) {
      return blogRoute(fourth, fifth, null);
    }

    return segments.length === 3
      ? { action: "continue", check: { kind: "post", slug: third } }
      : notFound;
  }

  if (second === "scholarships") {
    if (segments.length === 2) {
      return filterRoute(
        query.get("status"),
        isScholarshipStatus,
        (status) => `/resources/scholarships/status/${status}`,
      );
    }
    if (third === "status" && segments.length === 4) {
      return isScholarshipStatus(fourth) ? carryOn : notFound;
    }
  }

  if (second === "videos") {
    if (segments.length === 2) {
      return filterRoute(
        query.get("platform"),
        isVideoPlatform,
        (platform) => `/resources/videos/platform/${platform}`,
      );
    }
    if (third === "platform" && segments.length === 4) {
      return isVideoPlatform(fourth) ? carryOn : notFound;
    }
  }

  if (second === "faqs") {
    if (segments.length === 2) {
      return filterRoute(
        query.get("topic"),
        isFaqTopic,
        (topic) => `/resources/faqs/topic/${topic}`,
      );
    }
    if (third === "topic" && segments.length === 4) {
      return isFaqTopic(fourth) ? carryOn : notFound;
    }
  }

  return notFound;
}
