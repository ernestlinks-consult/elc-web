import { describe, expect, it } from "vitest";
import {
  articleHtml,
  readingMinutes,
  renderTiptap,
  sanitiseArticle,
} from "@/lib/content/article";

describe("sanitiseArticle", () => {
  it("removes scripts and their contents", () => {
    expect(sanitiseArticle("<p>Hi</p><script>alert(1)</script>")).toBe("<p>Hi</p>");
  });

  it("removes iframes", () => {
    expect(sanitiseArticle('<iframe src="https://example.test"></iframe>')).toBe("");
  });

  it("removes event handlers", () => {
    expect(sanitiseArticle('<p onclick="alert(1)">Hi</p>')).toBe("<p>Hi</p>");
    expect(sanitiseArticle('<img src="x" onerror="alert(1)">')).toBe("");
  });

  it("removes style attributes", () => {
    expect(sanitiseArticle('<p style="color:red">Hi</p>')).toBe("<p>Hi</p>");
  });

  it.each([
    "javascript:alert(1)",
    "JaVaScRiPt:alert(1)",
    "java\nscript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
  ])("removes the URL %j", (href) => {
    expect(sanitiseArticle(`<a href="${href}">Link</a>`)).not.toContain("href");
  });

  it("keeps ordinary article markup", () => {
    const html = "<h2>Title</h2><ul><li><strong>One</strong></li></ul>";

    expect(sanitiseArticle(html)).toBe(html);
  });

  it("keeps safe links and marks them noopener", () => {
    expect(sanitiseArticle('<a href="https://example.test">Link</a>')).toBe(
      '<a href="https://example.test" rel="noopener">Link</a>',
    );
  });
});

describe("renderTiptap", () => {
  it("renders headings, lists and marks", () => {
    const html = renderTiptap({
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Title" }] },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "One", marks: [{ type: "bold" }] }],
                },
              ],
            },
          ],
        },
      ],
    });

    expect(html).toBe("<h2>Title</h2><ul><li><p><strong>One</strong></p></li></ul>");
  });

  it("escapes text", () => {
    expect(
      renderTiptap({ type: "paragraph", content: [{ type: "text", text: "<script>" }] }),
    ).toBe("<p>&lt;script&gt;</p>");
  });

  it("keeps a heading below the page's H1", () => {
    expect(
      renderTiptap({ type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "T" }] }),
    ).toBe("<h2>T</h2>");
  });

  it("gives nothing for an empty body", () => {
    expect(renderTiptap({})).toBe("");
    expect(renderTiptap(null)).toBe("");
  });
});

describe("articleHtml", () => {
  it("prefers body_html, sanitised", () => {
    expect(articleHtml({ body: {}, body_html: "<p>Hi</p><script>x</script>" })).toBe("<p>Hi</p>");
  });

  it("falls back to Tiptap JSON", () => {
    const body = { type: "paragraph", content: [{ type: "text", text: "Hi" }] };

    expect(articleHtml({ body, body_html: null })).toBe("<p>Hi</p>");
    expect(articleHtml({ body, body_html: "  " })).toBe("<p>Hi</p>");
  });

  it("sanitises a link in Tiptap JSON", () => {
    const body = {
      type: "text",
      text: "Bad",
      marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }],
    };

    expect(articleHtml({ body, body_html: null })).not.toContain("javascript");
  });
});

describe("readingMinutes", () => {
  const words = (count: number) => `<p>${"word ".repeat(count)}</p>`;

  it.each([
    [0, 1],
    [1, 1],
    [200, 1],
    [201, 2],
    [1000, 5],
  ])("%i words take %i minutes", (count, minutes) => {
    expect(readingMinutes(words(count))).toBe(minutes);
  });

  it("doesn't count markup", () => {
    expect(readingMinutes(`<a href="${"x ".repeat(500)}">word</a>`)).toBe(1);
  });
});
