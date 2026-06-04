import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Mensal",
    price: "R$ 49,90",
    period: "/mês",
    description: "Ideal para começar sem compromisso.",
    features: [
      "Agendamentos ilimitados",
      "Até 5 funcionários",
      "Cadastro ilimitado de clientes",
      "Gestão de serviços",
      "Configurações da barbearia",
      "Suporte por e-mail",
    ],
    cta: "Assinar plano mensal",
    highlighted: false,
  },
  {
    name: "Anual",
    price: "R$ 39,90",
    period: "/mês",
    badge: "Economize 20%",
    description: "Cobrado R$ 478,80/ano. O melhor custo-benefício.",
    features: [
      "Tudo do plano mensal",
      "2 meses grátis",
      "Suporte prioritário",
      "Novidades em primeira mão",
    ],
    cta: "Assinar plano anual",
    highlighted: true,
  },
];

export function Pricing() {
  return (
    <section id="precos" className="px-4 py-20 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Planos simples e transparentes</h2>
          <p className="mt-3 text-slate-400">Escolha o plano que faz sentido para sua barbearia.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-6 ${
                plan.highlighted
                  ? "border-amber-500/40 bg-amber-500/5"
                  : "border-slate-800 bg-slate-900/60"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 right-4 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-slate-950">
                  {plan.badge}
                </div>
              )}

              <div className="mb-4">
                <div className="text-sm font-medium text-slate-300">PLANO {plan.name.toUpperCase()}</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-sm text-slate-400">{plan.period}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{plan.description}</p>
              </div>

              <ul className="mb-6 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                    <Check size={16} className="mt-0.5 shrink-0 text-amber-400" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={`w-full ${
                  plan.highlighted
                    ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                    : "border-white/20 bg-transparent text-slate-100 hover:bg-white/10"
                }`}
                variant={plan.highlighted ? "default" : "outline"}
              >
                <Link href="/registro">{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          7 dias grátis em qualquer plano. Cancele quando quiser.
        </p>
      </div>
    </section>
  );
}
