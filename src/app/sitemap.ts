import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://thekingside.com";
  const lastModified = new Date();
  const routes = [
    "",
    "/landing",
    "/tournaments",
    "/play",
    "/demo",
    "/affiliates",
    "/faq",
    "/rules",
    "/prize-policy",
    "/refund-policy",
    "/anti-cheat-policy",
    "/terms",
    "/privacy",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
