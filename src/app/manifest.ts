import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "décla — ta déclaration, sans le jargon",
    short_name: "décla",
    description:
      "Réponds à quelques questions toutes simples, sans jargon fiscal, et sais exactement quoi écrire sur ta déclaration de revenus.",
    start_url: "/",
    display: "standalone",
    background_color: "#F1F3EC",
    theme_color: "#1E7A54",
    lang: "fr",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
