"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[DashboardError]", error);
  }, [error]);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 text-center p-8">
      <AlertTriangle className="h-10 w-10 text-destructive" />
      <h1 className="text-2xl font-bold">Erro ao carregar o painel</h1>
      <p className="text-muted-foreground max-w-md">
        {error.message || "Não foi possível carregar esta página. Verifique a conexão com o Supabase e as variáveis de ambiente."}
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground font-mono">
          Digest: {error.digest}
        </p>
      )}
      <div className="flex gap-2">
        <Button onClick={reset} variant="outline">
          Tentar novamente
        </Button>
        <Button onClick={() => window.location.href = "/login"}>
          Voltar para login
        </Button>
      </div>
    </div>
  );
}
