"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
          <h1 className="text-2xl font-bold">Erro inesperado</h1>
          <p className="text-muted-foreground max-w-md">
            {error.message || "Algo deu errado. Tente novamente."}
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground">
              Digest: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
