import sanitizeHtml from "sanitize-html";

// Blog bodies are written by staff, but they reach every visitor, so nothing is
// trusted: the allowlist below is the only HTML that can come out. Server only.

const options: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "h2", "h3", "h4", "ul", "ol", "li", "blockquote", "strong", "em", "b", "i",
    "u", "a", "br", "hr", "code", "pre", "table", "thead", "tbody", "tr", "th", "td",
  ],
  allowedAttributes: { a: ["href", "title", "rel"] },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowProtocolRelative: false,
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener" }),
  },
};

export function sanitiseArticle(html: string) {
  return sanitizeHtml(html, options);
}

type TiptapMark = { type: string; attrs?: { href?: string } };

type TiptapNode = {
  type: string;
  text?: string;
  attrs?: { level?: number };
  marks?: TiptapMark[];
  content?: TiptapNode[];
};

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

function renderText(node: TiptapNode) {
  return (node.marks ?? []).reduce((html, mark) => {
    switch (mark.type) {
      case "bold":
        return `<strong>${html}</strong>`;
      case "italic":
        return `<em>${html}</em>`;
      case "link":
        return `<a href="${escapeHtml(mark.attrs?.href ?? "")}">${html}</a>`;
      default:
        return html;
    }
  }, escapeHtml(node.text ?? ""));
}

const blockTags: Record<string, string> = {
  paragraph: "p",
  bulletList: "ul",
  orderedList: "ol",
  listItem: "li",
  blockquote: "blockquote",
};

function renderNode(node: TiptapNode): string {
  const inner = (node.content ?? []).map(renderNode).join("");

  if (node.type === "text") return renderText(node);
  if (node.type === "hardBreak") return "<br>";
  if (node.type === "doc") return inner;
  if (node.type === "heading") {
    const level = Math.min(Math.max(node.attrs?.level ?? 2, 2), 4);
    return `<h${level}>${inner}</h${level}>`;
  }

  const tag = blockTags[node.type];
  return tag ? `<${tag}>${inner}</${tag}>` : inner;
}

/** Tiptap's stored JSON as HTML, for posts with no body_html. */
export function renderTiptap(body: unknown) {
  return body && typeof body === "object" ? renderNode(body as TiptapNode) : "";
}

export function articleHtml(post: { body: unknown; body_html: string | null }) {
  return sanitiseArticle(post.body_html?.trim() ? post.body_html : renderTiptap(post.body));
}

const wordsPerMinute = 200;

export function readingMinutes(html: string) {
  const text = html.replace(/<[^>]+>/g, " ").trim();
  const words = text ? text.split(/\s+/).length : 0;

  return Math.max(1, Math.ceil(words / wordsPerMinute));
}
