import { CalendarDays, Users, Wrench, DollarSign, Settings, Smartphone } from "lucide-react";

const features = [
  {
    icon: CalendarDays,
    title: "Agendamento inteligente",
    description:
      "Cadastre horários, evite conflitos e visualize o dia todo de um jeito claro.",
  },
  {
    icon: Users,
    title: "Cadastro de clientes",
    description:
      "Histórico, telefone e observações de cada cliente sempre à mão.",
  },
  {
    icon: Wrench,
    title: "Gestão de funcionários",
    description:
      "Defina horários, dias de trabalho e serviços por profissional.",
  },
  {
    icon: DollarSign,
    title: "Controle de serviços",
    description:
      "Crie serviços com preço e duração. O sistema calcula os slots automaticamente.",
  },
  {
    icon: Settings,
    title: "Configurações completas",
    description:
      "Personalize nome, logo, slogan e horário de funcionamento da sua barbearia.",
  },
  {
    icon: Smartphone,
    title: "Acessa de qualquer lugar",
    description:
      "Interface responsiva, funciona no celular, tablet e computador.",
  },
];

export function Features() {
  return (
    <section id="funcionalidades" className="px-4 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Tudo que sua barbearia precisa</h2>
          <p className="mt-3 text-slate-400">Funcionalidades pensadas para o dia a dia da barbearia brasileira.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-xl border border-slate-800 bg-slate-900/60 p-6 transition hover:border-amber-500/30 hover:bg-slate-900"
            >
              <div className="mb-4 inline-flex rounded-lg bg-amber-500/10 p-3 text-amber-400">
                <f.icon size={24} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">{f.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
