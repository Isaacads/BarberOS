"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AuthError]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center p-8">
      <h1 className="text-2xl font-bold">Erro no login</h1>
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
        <Button asChild>
          <Link href="/login">Voltar para login</Link>
        </Button>
      </div>
    </div>
  );
}
