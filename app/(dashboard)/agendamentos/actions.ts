"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getBarbeariaId } from "@/lib/supabase/get-barbearia";

export type AgendamentoInput = {
  cliente_id: string;
  funcionario_id: string;
  servico_id: string;
  data_hora: string; // ISO string
  observacoes?: string | null;
};

export type ActionResult = { success: true } | { success: false; error: string };

async function getServicoInfo(supabase: ReturnType<typeof createClient>, servicoId: string) {
  const { data } = await supabase
    .from("servicos")
    .select("duracao_minutos, preco")
    .eq("id", servicoId)
    .maybeSingle();
  return data;
}

async function validarConflito(
  supabase: ReturnType<typeof createClient>,
  funcionarioId: string,
  dataHora: string,
  duracaoMinutos: number,
  excludeId?: string
): Promise<string | null> {
  const inicio = new Date(dataHora);
  const fim = new Date(inicio.getTime() + duracaoMinutos * 60000);

  const inicioIso = inicio.toISOString();
  const fimIso = fim.toISOString();

  let query = supabase
    .from("agendamentos")
    .select("id, data_hora, duracao_minutos, status")
    .eq("funcionario_id", funcionarioId)
    .neq("status", "cancelado")
    .lt("data_hora", fimIso)
    .gt("data_hora", inicioIso);

  // Se estiver editando, exclui o próprio registro da verificação
  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data: conflitos, error } = await query;

  if (error) return error.message;
  if (conflitos && conflitos.length > 0) {
    return "Conflito de horário: o funcionário já tem um agendamento neste período.";
  }

  // Verifica também se o novo agendamento engloba algum existente
  let query2 = supabase
    .from("agendamentos")
    .select("id, data_hora, duracao_minutos, status")
    .eq("funcionario_id", funcionarioId)
    .neq("status", "cancelado")
    .gte("data_hora", inicioIso)
    .lt("data_hora", fimIso);

  if (excludeId) {
    query2 = query2.neq("id", excludeId);
  }

  const { data: conflitos2, error: err2 } = await query2;
  if (err2) return err2.message;
  if (conflitos2 && conflitos2.length > 0) {
    return "Conflito de horário: o funcionário já tem um agendamento neste período.";
  }

  return null;
}

export async function createAgendamento(
  input: AgendamentoInput
): Promise<ActionResult> {
  try {
    const barbeariaId = await getBarbeariaId();
    const supabase = createClient();

    const servico = await getServicoInfo(supabase, input.servico_id);
    if (!servico) {
      return { success: false, error: "Serviço não encontrado." };
    }

    const conflito = await validarConflito(
      supabase,
      input.funcionario_id,
      input.data_hora,
      servico.duracao_minutos
    );
    if (conflito) return { success: false, error: conflito };

    const { error } = await supabase.from("agendamentos").insert({
      barbearia_id: barbeariaId,
      cliente_id: input.cliente_id,
      funcionario_id: input.funcionario_id,
      servico_id: input.servico_id,
      data_hora: input.data_hora,
      duracao_minutos: servico.duracao_minutos,
      preco: servico.preco,
      status: "agendado",
      observacoes: input.observacoes?.trim() || null,
    });

    if (error) return { success: false, error: error.message };

    revalidatePath("/agendamentos");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao criar agendamento.",
    };
  }
}

export async function updateAgendamento(
  id: string,
  input: AgendamentoInput
): Promise<ActionResult> {
  try {
    const supabase = createClient();

    const servico = await getServicoInfo(supabase, input.servico_id);
    if (!servico) {
      return { success: false, error: "Serviço não encontrado." };
    }

    const conflito = await validarConflito(
      supabase,
      input.funcionario_id,
      input.data_hora,
      servico.duracao_minutos,
      id
    );
    if (conflito) return { success: false, error: conflito };

    const { error } = await supabase
      .from("agendamentos")
      .update({
        cliente_id: input.cliente_id,
        funcionario_id: input.funcionario_id,
        servico_id: input.servico_id,
        data_hora: input.data_hora,
        duracao_minutos: servico.duracao_minutos,
        preco: servico.preco,
        observacoes: input.observacoes?.trim() || null,
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/agendamentos");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao atualizar agendamento.",
    };
  }
}

export async function updateAgendamentoStatus(
  id: string,
  status: "agendado" | "concluido" | "cancelado"
): Promise<ActionResult> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("agendamentos")
      .update({ status })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/agendamentos");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao atualizar status.",
    };
  }
}

export async function deleteAgendamento(id: string): Promise<ActionResult> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from("agendamentos").delete().eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/agendamentos");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao excluir agendamento.",
    };
  }
}

/**
 * Retorna os slots de horário disponíveis para um funcionário em uma data,
 * considerando seus dias de trabalho, horário de início/fim e agendamentos existentes.
 */
export async function getHorariosDisponiveis(
  funcionarioId: string,
  data: string, // YYYY-MM-DD
  duracaoMinutos: number
): Promise<{ success: true; slots: string[] } | { success: false; error: string }> {
  try {
    const supabase = createClient();

    // Busca info do funcionário
    const { data: func, error: funcError } = await supabase
      .from("funcionarios")
      .select("dias_trabalho, hora_inicio, hora_fim, ativo")
      .eq("id", funcionarioId)
      .maybeSingle();

    if (funcError) return { success: false, error: funcError.message };
    if (!func) return { success: false, error: "Funcionário não encontrado." };
    if (!func.ativo) return { success: false, error: "Funcionário inativo." };

    const dataObj = new Date(data + "T00:00:00");
    const diaSemana = dataObj.getDay(); // 0=Dom ... 6=Sab

    if (!func.dias_trabalho.includes(diaSemana)) {
      return { success: true, slots: [] };
    }

    const horaInicio = func.hora_inicio ?? "09:00:00";
    const horaFim = func.hora_fim ?? "18:00:00";

    // Gera slots a cada 15 minutos
    const slots: string[] = [];
    const [hiH, hiM] = horaInicio.split(":").map(Number);
    const [hfH, hfM] = horaFim.split(":").map(Number);

    let current = new Date(dataObj);
    current.setHours(hiH, hiM, 0, 0);

    const end = new Date(dataObj);
    end.setHours(hfH, hfM, 0, 0);

    // Busca agendamentos existentes do dia
    const inicioDia = new Date(dataObj);
    inicioDia.setHours(0, 0, 0, 0);
    const fimDia = new Date(dataObj);
    fimDia.setHours(23, 59, 59, 999);

    const { data: agendamentos, error: agError } = await supabase
      .from("agendamentos")
      .select("data_hora, duracao_minutos, status")
      .eq("funcionario_id", funcionarioId)
      .gte("data_hora", inicioDia.toISOString())
      .lte("data_hora", fimDia.toISOString())
      .neq("status", "cancelado");

    if (agError) return { success: false, error: agError.message };

    const ocupados = (agendamentos ?? []).map((a) => ({
      inicio: new Date(a.data_hora).getTime(),
      fim:
        new Date(a.data_hora).getTime() + (a.duracao_minutos ?? 30) * 60000,
    }));

    while (current < end) {
      const slotInicio = current.getTime();
      const slotFim = slotInicio + duracaoMinutos * 60000;

      // Verifica se o slot cabe dentro do horário de trabalho
      if (slotFim > end.getTime()) break;

      // Verifica conflito com agendamentos existentes
      const conflito = ocupados.some(
        (o) => slotInicio < o.fim && slotFim > o.inicio
      );

      if (!conflito) {
        slots.push(
          current.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        );
      }

      current.setMinutes(current.getMinutes() + 15);
    }

    return { success: true, slots };
  } catch (e) {
    return {
      success: false,
      error:
        e instanceof Error ? e.message : "Erro ao buscar horários disponíveis.",
    };
  }
}
