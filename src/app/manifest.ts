import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Shortly",
    short_name: "Shortly",
    description: "Create, manage, share and analyze short links with Shortly.",

    start_url: "/",
    scope: "/",

    display: "standalone",

    background_color: "#020617",
    theme_color: "#2563eb",

    orientation: "any",

    categories: ["productivity", "utilities", "business"],

    icons: [
      {
        src: "/pwa-icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/pwa-icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/pwa-icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
