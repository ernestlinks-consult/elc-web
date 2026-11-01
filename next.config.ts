import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  images: {
    remotePatterns: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? [new URL(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/**`)]
      : [],
  },
  partialPrefetching: true,
  // Each Start online tab is a static page, so /start?service=visa needs no
  // searchParams and no streaming, and works without JavaScript.
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/start",
          has: [
            {
              type: "query",
              key: "service",
              value: "(?<service>passport|birth|school|visa|work|exams|travel)",
            },
          ],
          destination: "/start/:service",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
