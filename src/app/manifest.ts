import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Assistant Déclaration d'Impôts",
    short_name: "Impôts Simplifiés",
    description:
      "Un questionnaire simple, sans jargon, pour savoir précisément quoi remplir sur votre déclaration de revenus française.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f172a",
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
