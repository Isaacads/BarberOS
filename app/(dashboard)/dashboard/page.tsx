import { format, startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

import { IS_MOCK, MOCK_AGENDAMENTOS, MOCK_CLIENTES } from "@/lib/mock/data";
import { createClient } from "@/lib/supabase/server";
import type { Agendamento, Cliente, Funcionario, Servico } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, DollarSign, Clock, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

const reais = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "agendado":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          Agendado
        </Badge>
      );
    case "concluido":
      return <Badge variant="success">Concluído</Badge>;
    case "cancelado":
      return <Badge variant="destructive">Cancelado</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

export default async function DashboardPage() {
  const hoje = new Date();
  const inicioHoje = startOfDay(hoje);
  const fimHoje = endOfDay(hoje);
  const inicioSemana = startOfWeek(hoje, { locale: ptBR });
  const fimSemana = endOfWeek(hoje, { locale: ptBR });

  let agendamentosHoje: Agendamento[] = [];
  let agendamentosSemana: Agendamento[] = [];
  let receitaHoje = 0;
  let totalClientes = 0;
  let clientes: Cliente[] = [];
  let funcionarios: Funcionario[] = [];
  let servicos: Servico[] = [];

  if (IS_MOCK) {
    agendamentosHoje = MOCK_AGENDAMENTOS.filter((a) => {
      const d = new Date(a.data_hora);
      return d >= inicioHoje && d <= fimHoje;
    }) as Agendamento[];
    agendamentosSemana = MOCK_AGENDAMENTOS.filter((a) => {
      const d = new Date(a.data_hora);
      return d >= inicioSemana && d <= fimSemana;
    }) as Agendamento[];
    receitaHoje = agendamentosHoje
      .filter((a) => a.status === "concluido")
      .reduce((sum, a) => sum + (a.preco || 0), 0);
    totalClientes = MOCK_CLIENTES.length;
    clientes = MOCK_CLIENTES as Cliente[];
    funcionarios = [];
    servicos = [];
  } else {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: barbearia } = await supabase
      .from("barbearias")
      .select("id")
      .eq("user_id", user!.id)
      .maybeSingle();

    const barbeariaId = barbearia?.id;

    if (barbeariaId) {
      const [
        { data: agHoje },
        { data: agSemana },
        { data: clientesRaw },
        { data: funcsRaw },
        { data: servsRaw },
      ] = await Promise.all([
        supabase
          .from("agendamentos")
          .select("*")
          .eq("barbearia_id", barbeariaId)
          .gte("data_hora", inicioHoje.toISOString())
          .lte("data_hora", fimHoje.toISOString())
          .order("data_hora", { ascending: true }),
        supabase
          .from("agendamentos")
          .select("*")
          .eq("barbearia_id", barbeariaId)
          .gte("data_hora", inicioSemana.toISOString())
          .lte("data_hora", fimSemana.toISOString())
          .order("data_hora", { ascending: true }),
        supabase.from("clientes").select("*").eq("barbearia_id", barbeariaId),
        supabase
          .from("funcionarios")
          .select("*")
          .eq("barbearia_id", barbeariaId),
        supabase.from("servicos").select("*").eq("barbearia_id", barbeariaId),
      ]);

      agendamentosHoje = (agHoje as Agendamento[]) ?? [];
      agendamentosSemana = (agSemana as Agendamento[]) ?? [];
      receitaHoje = agendamentosHoje
        .filter((a) => a.status === "concluido")
        .reduce((sum, a) => sum + (a.preco || 0), 0);
      totalClientes = clientesRaw?.length ?? 0;
      clientes = (clientesRaw as Cliente[]) ?? [];
      funcionarios = (funcsRaw as Funcionario[]) ?? [];
      servicos = (servsRaw as Servico[]) ?? [];
    }
  }

  const cards = [
    {
      label: "Agendamentos hoje",
      value: agendamentosHoje.length,
      icon: Calendar,
    },
    {
      label: "Esta semana",
      value: agendamentosSemana.length,
      icon: Clock,
    },
    {
      label: "Receita hoje",
      value: reais.format(receitaHoje),
      icon: DollarSign,
    },
    {
      label: "Total de clientes",
      value: totalClientes,
      icon: Users,
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta! Veja um resumo da sua barbearia.
        </p>
      </header>

      {/* Cards de métricas */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl lg:text-3xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Próximos agendamentos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Próximos agendamentos</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/agendamentos">Ver todos</Link>
          </Button>
        </div>

        {agendamentosHoje.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Nenhum agendamento hoje</p>
            <p className="text-sm text-muted-foreground">
              Você não tem agendamentos para o dia de hoje.
            </p>
            <Button className="mt-4 gap-2" asChild>
              <Link href="/agendamentos">
                <Plus className="h-4 w-4" />
                Criar agendamento
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {agendamentosHoje.map((ag) => {
              const cliente = clientes.find((c) => c.id === ag.cliente_id);
              const funcionario = funcionarios.find(
                (f) => f.id === ag.funcionario_id
              );
              const servico = servicos.find((s) => s.id === ag.servico_id);
              const hora = format(new Date(ag.data_hora), "HH:mm", {
                locale: ptBR,
              });

              return (
                <Card key={ag.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-col items-center justify-center rounded-md bg-primary/10 text-primary">
                          <span className="text-sm font-bold">{hora}</span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {cliente?.nome ?? "Cliente"}
                          </p>
                          <div className="flex flex-wrap gap-x-3 text-sm text-muted-foreground">
                            <span>{funcionario?.nome ?? "Funcionário"}</span>
                            <span>•</span>
                            <span>{servico?.nome ?? "Serviço"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {reais.format(ag.preco)}
                        </span>
                        <StatusBadge status={ag.status} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
