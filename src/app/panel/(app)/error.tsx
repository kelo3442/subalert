"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default function PanelError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Card>
      <EmptyState
        icon={<TriangleAlert className="size-6" aria-hidden />}
        title="Nie udało się wczytać danych"
        description="Sprawdź połączenie z internetem i spróbuj ponownie. Jeśli problem się powtarza, wróć za kilka minut."
        action={
          <Button onClick={reset} variant="secondary">
            <RotateCcw className="size-4" aria-hidden /> Spróbuj ponownie
          </Button>
        }
      />
    </Card>
  );
}
