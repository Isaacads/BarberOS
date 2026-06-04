import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CTA() {
  return (
    <section className="px-4 py-20 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-2xl bg-amber-500 px-6 py-14 text-center">
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">
          Sua barbearia merece uma gestão profissional.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-900/80">
          Comece hoje, configure em minutos, use para sempre.
        </p>
        <Button
          asChild
          size="lg"
          className="mt-6 bg-white text-slate-950 hover:bg-slate-100"
        >
          <Link href="/registro">Criar minha conta grátis</Link>
        </Button>
      </div>
    </section>
  );
}
