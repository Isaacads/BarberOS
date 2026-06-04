"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pt-32 pb-20 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl"></div>
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-400">
            🚀 Novo — 7 dias grátis para testar
          </div>

          <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Chega de caderninho.
            <br />
            <span className="text-amber-400">Gerencie sua barbearia</span>{" "}
            do jeito certo.
          </h1>

          <p className="max-w-2xl text-lg text-slate-400">
            Agendamentos, clientes e funcionários organizados em um só lugar.
            Simples de usar, poderoso o suficiente para crescer.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="bg-amber-500 text-slate-950 hover:bg-amber-400"
            >
              <Link href="/registro">Começar 7 dias grátis</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/20 bg-transparent text-slate-100 hover:bg-white/10"
            >
              <Link href="#funcionalidades">Ver demonstração</Link>
            </Button>
          </div>

          <div className="mt-8 w-full max-w-4xl">
            <Mockup />
          </div>
        </div>
      </div>
    </section>
  );
}

function Mockup() {
  const items = [
    { time: "09:00", client: "Carlos Silva", barber: "João", service: "Corte", status: "Agendado" },
    { time: "09:30", client: "Pedro Souza", barber: "Marcos", service: "Barba", status: "Agendado" },
    { time: "10:00", client: "André Lima", barber: "João", service: "Corte + Barba", status: "Concluído" },
    { time: "10:30", client: "Lucas Rocha", barber: "Marcos", service: "Corte", status: "Agendado" },
  ];

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/80 shadow-2xl">
      <div className="flex items-center gap-2 border-b border-slate-700 px-4 py-3">
        <div className="h-3 w-3 rounded-full bg-red-500"></div>
        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
        <div className="h-3 w-3 rounded-full bg-green-500"></div>
        <div className="ml-2 text-xs text-slate-400">BarberOS — Dashboard</div>
      </div>
      <div className="p-4">
        <div className="mb-3 text-sm font-semibold text-slate-200">Agendamentos de hoje — 12 de Junho</div>
        <div className="space-y-2">
          {items.map((it, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg bg-slate-800 px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-400">{it.time}</span>
                <span className="text-slate-200">{it.client}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden text-xs text-slate-400 sm:inline">{it.barber}</span>
                <span className="hidden text-xs text-slate-400 sm:inline">{it.service}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    it.status === "Concluído"
                      ? "bg-green-500/15 text-green-400"
                      : "bg-blue-500/15 text-blue-400"
                  }`}
                >
                  {it.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
