import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

type ColorToken = { name: string; value: { light: string } };

const tokens: { color: { tokens: ColorToken[] } } = JSON.parse(
  readFileSync("design-system/tokens.json", "utf8"),
);
const css = readFileSync("styles/tokens.css", "utf8");

test.each(tokens.color.tokens)(
  "colour token $name matches styles/tokens.css",
  (token) => {
    const declaration = css.match(
      new RegExp(`--color-${token.name}:\\s*([^;]+);`),
    );

    expect(declaration?.[1]).toBe(token.value.light);
  },
);
