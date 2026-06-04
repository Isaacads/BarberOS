import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Assinatura expirada — BarberOS",
  description: "Renove sua assinatura para continuar usando o BarberOS",
};

export default function PagamentoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex items-center justify-center gap-2 text-amber-500">
          <AlertTriangle size={32} />
        </div>

        <h1 className="text-center text-2xl font-bold">
          Seu período de teste expirou
        </h1>

        <p className="text-center text-muted-foreground">
          Para continuar gerenciando sua barbearia no BarberOS, escolha um plano e renove sua assinatura.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-lg">Mensal</CardTitle>
              <CardDescription>R$ 49,90/mês</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                {[
                  "Agendamentos ilimitados",
                  "Até 5 funcionários",
                  "Clientes ilimitados",
                  "Suporte por e-mail",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check size={14} className="text-green-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/dashboard?plano=mensal">Assinar Mensal</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-500">
            <CardHeader className="text-center">
              <div className="mx-auto w-fit rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                Economize 20%
              </div>
              <CardTitle className="text-lg">Anual</CardTitle>
              <CardDescription>R$ 39,90/mês</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                {[
                  "Tudo do plano mensal",
                  "2 meses grátis",
                  "Suporte prioritário",
                  "Novidades em primeira mão",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check size={14} className="text-green-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-amber-500 text-slate-950 hover:bg-amber-400" asChild>
                <Link href="/dashboard?plano=anual">Assinar Anual</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Em breve: integração com Stripe/Pagar.me. Por enquanto, entre em contato para ativar seu plano.
        </p>
      </div>
    </div>
  );
}
