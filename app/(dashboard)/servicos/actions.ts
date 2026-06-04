"use server";

import { revalidatePath } from "next/cache";

import { IS_MOCK, MOCK_SERVICOS } from "@/lib/mock/data";
import { createClient } from "@/lib/supabase/server";
import { getBarbeariaId } from "@/lib/supabase/get-barbearia";

export type ServicoInput = {
  nome: string;
  descricao?: string | null;
  preco: number;
  duracao_minutos: number;
  ativo: boolean;
};

export type ActionResult = { success: true } | { success: false; error: string };

function sanitize(input: ServicoInput) {
  const nome = input.nome?.trim() ?? "";
  if (!nome) {
    return { ok: false as const, error: "Nome é obrigatório." };
  }

  const preco = Number(input.preco);
  if (!Number.isFinite(preco) || preco < 0) {
    return { ok: false as const, error: "Preço inválido." };
  }

  const duracao = Number(input.duracao_minutos);
  if (!Number.isInteger(duracao) || duracao <= 0) {
    return { ok: false as const, error: "Duração inválida." };
  }

  return {
    ok: true as const,
    data: {
      nome,
      descricao: input.descricao?.trim() || null,
      preco: Math.round(preco * 100) / 100,
      duracao_minutos: duracao,
      ativo: !!input.ativo,
    },
  };
}

export async function createServico(input: ServicoInput): Promise<ActionResult> {
  const parsed = sanitize(input);
  if (!parsed.ok) return { success: false, error: parsed.error };

  if (IS_MOCK) {
    MOCK_SERVICOS.push({
      id: `s${Date.now()}`,
      barbearia_id: "mock-barbearia-001",
      ...parsed.data,
      created_at: new Date().toISOString(),
    } as any);
    revalidatePath("/servicos");
    return { success: true };
  }

  try {
    const barbeariaId = await getBarbeariaId();
    const supabase = createClient();

    const { error } = await supabase.from("servicos").insert({
      barbearia_id: barbeariaId,
      ...parsed.data,
    });

    if (error) return { success: false, error: error.message };

    revalidatePath("/servicos");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao criar serviço.",
    };
  }
}

export async function updateServico(
  id: string,
  input: ServicoInput
): Promise<ActionResult> {
  const parsed = sanitize(input);
  if (!parsed.ok) return { success: false, error: parsed.error };

  if (IS_MOCK) {
    const idx = MOCK_SERVICOS.findIndex((s) => s.id === id);
    if (idx >= 0) {
      MOCK_SERVICOS[idx] = { ...MOCK_SERVICOS[idx], ...parsed.data } as any;
    }
    revalidatePath("/servicos");
    return { success: true };
  }

  try {
    const barbeariaId = await getBarbeariaId();
    const supabase = createClient();

    // Verifica ownership
    const { data: existing } = await supabase
      .from("servicos")
      .select("id")
      .eq("id", id)
      .eq("barbearia_id", barbeariaId)
      .maybeSingle();

    if (!existing) {
      return { success: false, error: "Serviço não encontrado ou sem permissão." };
    }

    const { error } = await supabase
      .from("servicos")
      .update(parsed.data)
      .eq("id", id)
      .eq("barbearia_id", barbeariaId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/servicos");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao atualizar serviço.",
    };
  }
}

export async function deleteServico(id: string): Promise<ActionResult> {
  if (IS_MOCK) {
    const idx = MOCK_SERVICOS.findIndex((s) => s.id === id);
    if (idx >= 0) MOCK_SERVICOS.splice(idx, 1);
    revalidatePath("/servicos");
    return { success: true };
  }

  try {
    const barbeariaId = await getBarbeariaId();
    const supabase = createClient();

    // Verifica ownership
    const { data: existing } = await supabase
      .from("servicos")
      .select("id")
      .eq("id", id)
      .eq("barbearia_id", barbeariaId)
      .maybeSingle();

    if (!existing) {
      return { success: false, error: "Serviço não encontrado ou sem permissão." };
    }

    const { error } = await supabase
      .from("servicos")
      .delete()
      .eq("id", id)
      .eq("barbearia_id", barbeariaId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/servicos");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao excluir serviço.",
    };
  }
}
