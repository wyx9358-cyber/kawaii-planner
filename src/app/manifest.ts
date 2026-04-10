import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Momo Time",
    short_name: "Momo Time",
    description: "可爱风个人排班与时间管理 App",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f8fbff",
    theme_color: "#bfe1ff",
    lang: "zh-CN",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
