import { format, addDays, subDays, startOfDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import { createClient } from "@/lib/supabase/server";
import type { Agendamento, Cliente, Funcionario, Servico } from "@/lib/types";
import { AgendamentosClient } from "@/components/agendamentos/agendamentos-client";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ data?: string }> | { data?: string };
}

export default async function AgendamentosPage({ searchParams }: PageProps) {
  const supabase = createClient();

  // Unwrap searchParams (compatível com Next.js 14/15)
  const params = await Promise.resolve(searchParams);

  // Parse da data de forma determinística (evita problemas de UTC no servidor)
  const dataParam = params.data;
  const hoje = startOfDay(new Date());
  let dataSelecionada: Date = hoje;

  if (dataParam) {
    // Parse YYYY-MM-DD como data local sem UTC shift
    const [ano, mes, dia] = dataParam.split("-").map(Number);
    if (!isNaN(ano) && !isNaN(mes) && !isNaN(dia)) {
      dataSelecionada = new Date(ano, mes - 1, dia, 0, 0, 0, 0);
    }
  }

  // Garante que estamos no início do dia
  dataSelecionada = startOfDay(dataSelecionada);

  const inicioDia = new Date(dataSelecionada);
  inicioDia.setHours(0, 0, 0, 0);
  const fimDia = new Date(dataSelecionada);
  fimDia.setHours(23, 59, 59, 999);

  // Resolve a barbearia do usuário autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let barbeariaId: string | undefined;

  if (user) {
    // 1. Novo modelo (usuarios)
    try {
      const { data: usuario } = await supabase
        .from("usuarios")
        .select("barbearia_id")
        .eq("auth_user_id", user.id)
        .eq("ativo", true)
        .maybeSingle();
      if (usuario?.barbearia_id) {
        barbeariaId = usuario.barbearia_id;
      }
    } catch {
      /* tabela pode não existir */
    }

    // 2. Fallback legacy
    if (!barbeariaId) {
      const { data: barbearia } = await supabase
        .from("barbearias")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      barbeariaId = barbearia?.id;
    }
  }

  let agendamentos: Agendamento[] = [];
  let clientes: Cliente[] = [];
  let funcionarios: Funcionario[] = [];
  let servicos: Servico[] = [];

  if (barbeariaId) {
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
        .eq("barbearia_id", barbeariaId)
        .gte("data_hora", inicioDia.toISOString())
        .lte("data_hora", fimDia.toISOString())
        .order("data_hora", { ascending: true }),
      supabase
        .from("clientes")
        .select("*")
        .eq("barbearia_id", barbeariaId)
        .order("nome"),
      supabase
        .from("funcionarios")
        .select("*")
        .eq("barbearia_id", barbeariaId)
        .order("nome"),
      supabase
        .from("servicos")
        .select("*")
        .eq("barbearia_id", barbeariaId)
        .order("nome"),
    ]);

    agendamentos = (agendamentosRaw as Agendamento[]) ?? [];
    clientes = (clientesRaw as Cliente[]) ?? [];
    funcionarios = (funcionariosRaw as Funcionario[]) ?? [];
    servicos = (servicosRaw as Servico[]) ?? [];
  }

  const hojeServer = format(new Date(), "yyyy-MM-dd");

  return (
    <AgendamentosClient
      agendamentos={agendamentos}
      clientes={clientes}
      funcionarios={funcionarios}
      servicos={servicos}
      dataSelecionada={dataSelecionada}
      hojeServer={hojeServer}
    />
  );
}
