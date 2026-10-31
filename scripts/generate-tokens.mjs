// Regenerates styles/tokens.css from design-system/tokens.json. Run: npm run tokens
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const source = fileURLToPath(new URL("../design-system/tokens.json", import.meta.url));
const target = fileURLToPath(new URL("../styles/tokens.css", import.meta.url));

const tokens = JSON.parse(readFileSync(source, "utf8"));

function textStyle(style) {
  const prefix = `--text-${style.name}`;
  const declarations = [
    `${prefix}-size: ${style.fontSize};`,
    `${prefix}-line: ${style.lineHeight};`,
    `${prefix}-weight: ${style.fontWeight};`,
  ];
  if (style.letterSpacing) declarations.push(`${prefix}-tracking: ${style.letterSpacing};`);
  if (style.textTransform) declarations.push(`${prefix}-transform: ${style.textTransform};`);
  return declarations.join(" ");
}

const named = (group) => group.tokens.map((token) => `--${token.name}: ${token.value};`);

const lines = [
  ...tokens.color.tokens.map((token) => `--color-${token.name}: ${token.value.light};`),
  `--font-sans: ${tokens.type.families.sans};`,
  ...tokens.type.groups.flatMap((group) => group.styles.map(textStyle)),
  ...named(tokens.spacing),
  ...named(tokens.radius),
  ...named(tokens.shadow),
  ...named(tokens.breakpoint),
];

const css = [
  "/* ELC design tokens, generated from design-system/tokens.json. Copy to styles/tokens.css in the Next.js app. */",
  ":root {",
  ...lines.map((line) => `  ${line}`),
  "}",
  "",
].join("\n");

writeFileSync(target, css);
