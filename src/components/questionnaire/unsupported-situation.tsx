import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function UnsupportedSituation({
  message,
  onRestart,
}: {
  message: string;
  onRestart: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cette situation n&apos;est pas encore prise en charge</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button onClick={onRestart}>Recommencer</Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/a-propos" />}>
          En savoir plus
        </Button>
      </CardContent>
    </Card>
  );
}
