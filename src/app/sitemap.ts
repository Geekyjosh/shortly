import type { MetadataRoute } from "next";

const siteUrl = "https://shortly.nexviuslabs.com";

const publicRoutes = [
  "",
  "/features",
  "/link-management",
  "/link-analytics",
  "/qr-code-generator",
  "/pricing",
  "/about",
  "/help",
  "/solutions",
  "/solutions/marketing",
  "/solutions/creators",
  "/solutions/developers",
  "/privacy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route.startsWith("/solutions") ? 0.7 : 0.8,
  }));
}
