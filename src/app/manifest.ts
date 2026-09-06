import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Attendify",
    short_name: "Attendify",
    description: "College attendance for faculty",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f4efe4",
    theme_color: "#1b2a4a",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
