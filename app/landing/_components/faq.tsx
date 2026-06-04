"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Como funciona o período gratuito?",
    answer:
      "Você tem 7 dias para testar todas as funcionalidades sem precisar de cartão de crédito.",
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer:
      "Sim. Sem multa, sem burocracia. Cancele pela própria plataforma.",
  },
  {
    question: "Quantos funcionários posso cadastrar?",
    answer:
      "Até 5 no plano atual. Em breve haverá planos para redes maiores.",
  },
  {
    question: "Os dados da minha barbearia ficam seguros?",
    answer:
      "Sim. Usamos Supabase com criptografia e backups automáticos.",
  },
  {
    question: "Funciona no celular?",
    answer: "Sim, a interface é totalmente responsiva.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="px-4 py-20 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Perguntas frequentes</h2>
          <p className="mt-3 text-slate-400">Tire suas dúvidas antes de começar.</p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="rounded-lg border border-slate-800 bg-slate-900/60 px-4"
            >
              <AccordionTrigger className="text-left text-sm font-medium text-slate-200 hover:text-amber-400">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-slate-400">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
