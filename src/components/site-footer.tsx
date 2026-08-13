import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t px-6 py-4 text-center text-xs text-muted-foreground">
      Cet outil est informationnel et personnel, ce n&apos;est pas un service certifié.
      Vérifie toujours tes réponses sur{" "}
      <a href="https://www.impots.gouv.fr" className="underline underline-offset-2">
        impots.gouv.fr
      </a>{" "}
      avant de déclarer.{" "}
      <Link href="/a-propos" className="underline underline-offset-2">
        En savoir plus
      </Link>
    </footer>
  );
}
