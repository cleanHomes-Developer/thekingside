import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api",
        "/dashboard",
        "/wallet",
        "/settings",
        "/support",
        "/login",
        "/register",
        "/anticheat",
      ],
    },
    sitemap: "https://thekingside.com/sitemap.xml",
  };
}
