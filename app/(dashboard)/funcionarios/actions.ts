"use server";

import { revalidatePath } from "next/cache";

import { IS_MOCK, MOCK_FUNCIONARIOS } from "@/lib/mock/data";
import { createClient } from "@/lib/supabase/server";
import { getBarbeariaId } from "@/lib/supabase/get-barbearia";

export type FuncionarioInput = {
  nome: string;
  telefone?: string | null;
  ativo: boolean;
  /** 0 = Domingo ... 6 = Sábado */
  dias_trabalho: number[];
  hora_inicio?: string | null;
  hora_fim?: string | null;
};

export type ActionResult = { success: true } | { success: false; error: string };

function sanitize(input: FuncionarioInput) {
  const nome = input.nome?.trim() ?? "";
  if (!nome) {
    return { ok: false as const, error: "Nome é obrigatório." };
  }

  const dias = Array.from(new Set(input.dias_trabalho ?? []))
    .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)
    .sort((a, b) => a - b);

  const horaInicio = input.hora_inicio?.trim() || null;
  const horaFim = input.hora_fim?.trim() || null;

  if (horaInicio && horaFim && horaInicio >= horaFim) {
    return {
      ok: false as const,
      error: "A hora de início deve ser menor que a hora de fim.",
    };
  }

  return {
    ok: true as const,
    data: {
      nome,
      telefone: input.telefone?.trim() || null,
      ativo: !!input.ativo,
      dias_trabalho: dias,
      hora_inicio: horaInicio,
      hora_fim: horaFim,
    },
  };
}

export async function createFuncionario(
  input: FuncionarioInput
): Promise<ActionResult> {
  const parsed = sanitize(input);
  if (!parsed.ok) return { success: false, error: parsed.error };

  if (IS_MOCK) {
    MOCK_FUNCIONARIOS.push({
      id: `f${Date.now()}`,
      barbearia_id: "mock-barbearia-001",
      ...parsed.data,
      created_at: new Date().toISOString(),
    } as any);
    revalidatePath("/funcionarios");
    return { success: true };
  }

  try {
    const barbeariaId = await getBarbeariaId();
    const supabase = createClient();

    const { error } = await supabase.from("funcionarios").insert({
      barbearia_id: barbeariaId,
      ...parsed.data,
    });

    if (error) return { success: false, error: error.message };

    revalidatePath("/funcionarios");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao criar funcionário.",
    };
  }
}

export async function updateFuncionario(
  id: string,
  input: FuncionarioInput
): Promise<ActionResult> {
  const parsed = sanitize(input);
  if (!parsed.ok) return { success: false, error: parsed.error };

  if (IS_MOCK) {
    const idx = MOCK_FUNCIONARIOS.findIndex((f) => f.id === id);
    if (idx >= 0) {
      MOCK_FUNCIONARIOS[idx] = { ...MOCK_FUNCIONARIOS[idx], ...parsed.data } as any;
    }
    revalidatePath("/funcionarios");
    return { success: true };
  }

  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("funcionarios")
      .update(parsed.data)
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/funcionarios");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error:
        e instanceof Error ? e.message : "Erro ao atualizar funcionário.",
    };
  }
}

export async function deleteFuncionario(id: string): Promise<ActionResult> {
  if (IS_MOCK) {
    const idx = MOCK_FUNCIONARIOS.findIndex((f) => f.id === id);
    if (idx >= 0) MOCK_FUNCIONARIOS.splice(idx, 1);
    revalidatePath("/funcionarios");
    return { success: true };
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.from("funcionarios").delete().eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/funcionarios");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao excluir funcionário.",
    };
  }
}
