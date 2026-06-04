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

async function getServicoInfo(supabase: ReturnType<typeof createClient>, servicoId: string, barbeariaId: string) {
  const { data } = await supabase
    .from("servicos")
    .select("duracao_minutos, preco")
    .eq("id", servicoId)
    .eq("barbearia_id", barbeariaId)
    .maybeSingle();
  return data;
}

async function validarConflito(
  supabase: ReturnType<typeof createClient>,
  funcionarioId: string,
  dataHora: string,
  duracaoMinutos: number,
  barbeariaId: string,
  excludeId?: string
): Promise<string | null> {
  const inicio = new Date(dataHora);
  const fim = new Date(inicio.getTime() + duracaoMinutos * 60000);

  const inicioMs = inicio.getTime();
  const fimMs = fim.getTime();

  // Busca candidatos que começam antes do fim do novo agendamento.
  // Um agendamento que começa em/após `fim` jamais pode se sobrepor.
  // Limita a janela a 24h antes do início para evitar varrer toda a tabela
  // (nenhum serviço dura mais de um dia).
  const janelaInicioIso = new Date(inicioMs - 24 * 60 * 60 * 1000).toISOString();
  const fimIso = fim.toISOString();

  let query = supabase
    .from("agendamentos")
    .select("id, data_hora, duracao_minutos, status")
    .eq("funcionario_id", funcionarioId)
    .eq("barbearia_id", barbeariaId)
    .neq("status", "cancelado")
    .gte("data_hora", janelaInicioIso)
    .lt("data_hora", fimIso);

  // Se estiver editando, exclui o próprio registro da verificação
  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data: candidatos, error } = await query;

  if (error) return error.message;

  // Verifica sobreposição real considerando a duração de cada agendamento.
  // Dois intervalos [a1, a2) e [b1, b2) se sobrepõem se a1 < b2 && b1 < a2.
  const conflito = (candidatos ?? []).some((a) => {
    const exInicio = new Date(a.data_hora).getTime();
    const exFim = exInicio + (a.duracao_minutos ?? 30) * 60000;
    return exInicio < fimMs && inicioMs < exFim;
  });

  if (conflito) {
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

    const servico = await getServicoInfo(supabase, input.servico_id, barbeariaId);
    if (!servico) {
      return { success: false, error: "Serviço não encontrado ou sem permissão." };
    }

    const conflito = await validarConflito(
      supabase,
      input.funcionario_id,
      input.data_hora,
      servico.duracao_minutos,
      barbeariaId
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
    const barbeariaId = await getBarbeariaId();
    const supabase = createClient();

    // Verifica ownership
    const { data: existing } = await supabase
      .from("agendamentos")
      .select("id")
      .eq("id", id)
      .eq("barbearia_id", barbeariaId)
      .maybeSingle();

    if (!existing) {
      return { success: false, error: "Agendamento não encontrado ou sem permissão." };
    }

    const servico = await getServicoInfo(supabase, input.servico_id, barbeariaId);
    if (!servico) {
      return { success: false, error: "Serviço não encontrado ou sem permissão." };
    }

    const conflito = await validarConflito(
      supabase,
      input.funcionario_id,
      input.data_hora,
      servico.duracao_minutos,
      barbeariaId,
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
      .eq("id", id)
      .eq("barbearia_id", barbeariaId);

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
    const barbeariaId = await getBarbeariaId();
    const supabase = createClient();

    // Verifica ownership
    const { data: existing } = await supabase
      .from("agendamentos")
      .select("id")
      .eq("id", id)
      .eq("barbearia_id", barbeariaId)
      .maybeSingle();

    if (!existing) {
      return { success: false, error: "Agendamento não encontrado ou sem permissão." };
    }

    const { error } = await supabase
      .from("agendamentos")
      .update({ status })
      .eq("id", id)
      .eq("barbearia_id", barbeariaId);

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
    const barbeariaId = await getBarbeariaId();
    const supabase = createClient();

    // Verifica ownership
    const { data: existing } = await supabase
      .from("agendamentos")
      .select("id")
      .eq("id", id)
      .eq("barbearia_id", barbeariaId)
      .maybeSingle();

    if (!existing) {
      return { success: false, error: "Agendamento não encontrado ou sem permissão." };
    }

    const { error } = await supabase
      .from("agendamentos")
      .delete()
      .eq("id", id)
      .eq("barbearia_id", barbeariaId);

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
  duracaoMinutos: number,
  excludeId?: string
): Promise<{ success: true; slots: string[] } | { success: false; error: string }> {
  try {
    const barbeariaId = await getBarbeariaId();
    const supabase = createClient();

    // Busca info do funcionário (com filtro de barbearia)
    const { data: func, error: funcError } = await supabase
      .from("funcionarios")
      .select("dias_trabalho, hora_inicio, hora_fim, ativo")
      .eq("id", funcionarioId)
      .eq("barbearia_id", barbeariaId)
      .maybeSingle();

    if (funcError) return { success: false, error: funcError.message };
    if (!func) return { success: false, error: "Funcionário não encontrado ou sem permissão." };
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

    // Busca agendamentos existentes do dia (com filtro de barbearia)
    const inicioDia = new Date(dataObj);
    inicioDia.setHours(0, 0, 0, 0);
    const fimDia = new Date(dataObj);
    fimDia.setHours(23, 59, 59, 999);

    const { data: agendamentos, error: agError } = await supabase
      .from("agendamentos")
      .select("id, data_hora, duracao_minutos, status")
      .eq("funcionario_id", funcionarioId)
      .eq("barbearia_id", barbeariaId)
      .gte("data_hora", inicioDia.toISOString())
      .lte("data_hora", fimDia.toISOString())
      .neq("status", "cancelado");

    if (agError) return { success: false, error: agError.message };

    const ocupados = (agendamentos ?? [])
      .filter((a) => !excludeId || a.id !== excludeId)
      .map((a) => ({
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
