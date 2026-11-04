import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components is disabled on purpose: almost every page in this store
  // reads live data (stock, cart, session), so the classic dynamic rendering
  // model keeps the code simpler for a demo project.
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
