import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/panel",
    name: "Opłacik — subskrypcje i rachunki",
    short_name: "Opłacik",
    description: "Subskrypcje i rachunki w jednym miejscu, z przypomnieniami przed płatnością.",
    lang: "pl",
    start_url: "/panel",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#09090b",
    theme_color: "#09090b",
    categories: ["finance", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Dodaj subskrypcję", url: "/panel/subskrypcje/nowa", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Kalendarz płatności", url: "/panel/kalendarz", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
