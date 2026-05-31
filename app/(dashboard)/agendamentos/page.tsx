import { format, addDays, subDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

import { createClient } from "@/lib/supabase/server";
import type { Agendamento, Cliente, Funcionario, Servico } from "@/lib/types";
import { AgendamentosClient } from "@/components/agendamentos/agendamentos-client";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: { data?: string };
}

export default async function AgendamentosPage({ searchParams }: PageProps) {
  const supabase = createClient();

  // Parse da data (ou hoje)
  const dataParam = searchParams.data;
  const dataSelecionada = dataParam
    ? startOfDay(new Date(dataParam + "T00:00:00"))
    : startOfDay(new Date());

  const inicioDia = new Date(dataSelecionada);
  inicioDia.setHours(0, 0, 0, 0);
  const fimDia = new Date(dataSelecionada);
  fimDia.setHours(23, 59, 59, 999);

  // Busca dados em paralelo
  const [
    { data: agendamentosRaw },
    { data: clientesRaw },
    { data: funcionariosRaw },
    { data: servicosRaw },
  ] = await Promise.all([
    supabase
      .from("agendamentos")
      .select("*")
      .gte("data_hora", inicioDia.toISOString())
      .lte("data_hora", fimDia.toISOString())
      .order("data_hora", { ascending: true }),
    supabase.from("clientes").select("*").order("nome"),
    supabase.from("funcionarios").select("*").order("nome"),
    supabase.from("servicos").select("*").order("nome"),
  ]);

  const agendamentos = (agendamentosRaw as Agendamento[]) ?? [];
  const clientes = (clientesRaw as Cliente[]) ?? [];
  const funcionarios = (funcionariosRaw as Funcionario[]) ?? [];
  const servicos = (servicosRaw as Servico[]) ?? [];

  return (
    <AgendamentosClient
      agendamentos={agendamentos}
      clientes={clientes}
      funcionarios={funcionarios}
      servicos={servicos}
      dataSelecionada={dataSelecionada}
    />
  );
}
