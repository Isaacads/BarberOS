"use server";

import { revalidatePath } from "next/cache";

import { IS_MOCK, MOCK_CLIENTES } from "@/lib/mock/data";
import { createClient } from "@/lib/supabase/server";
import { getBarbeariaId } from "@/lib/supabase/get-barbearia";

export type ClienteInput = {
  nome: string;
  telefone?: string | null;
  email?: string | null;
  observacoes?: string | null;
};

export type ActionResult = { success: true } | { success: false; error: string };

function sanitize(input: ClienteInput) {
  const nome = input.nome?.trim() ?? "";
  if (!nome) {
    return { ok: false as const, error: "Nome é obrigatório." };
  }
  return {
    ok: true as const,
    data: {
      nome,
      telefone: input.telefone?.trim() || null,
      email: input.email?.trim() || null,
      observacoes: input.observacoes?.trim() || null,
    },
  };
}

export async function createCliente(input: ClienteInput): Promise<ActionResult> {
  const parsed = sanitize(input);
  if (!parsed.ok) return { success: false, error: parsed.error };

  if (IS_MOCK) {
    MOCK_CLIENTES.push({
      id: `c${Date.now()}`,
      barbearia_id: "mock-barbearia-001",
      ...parsed.data,
      created_at: new Date().toISOString(),
    } as any);
    revalidatePath("/clientes");
    return { success: true };
  }

  try {
    const barbeariaId = await getBarbeariaId();
    const supabase = createClient();

    const { error } = await supabase.from("clientes").insert({
      barbearia_id: barbeariaId,
      ...parsed.data,
    });

    if (error) return { success: false, error: error.message };

    revalidatePath("/clientes");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao criar cliente.",
    };
  }
}

export async function updateCliente(
  id: string,
  input: ClienteInput
): Promise<ActionResult> {
  const parsed = sanitize(input);
  if (!parsed.ok) return { success: false, error: parsed.error };

  if (IS_MOCK) {
    const idx = MOCK_CLIENTES.findIndex((c) => c.id === id);
    if (idx >= 0) {
      MOCK_CLIENTES[idx] = { ...MOCK_CLIENTES[idx], ...parsed.data } as any;
    }
    revalidatePath("/clientes");
    return { success: true };
  }

  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("clientes")
      .update(parsed.data)
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/clientes");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao atualizar cliente.",
    };
  }
}

export async function deleteCliente(id: string): Promise<ActionResult> {
  if (IS_MOCK) {
    const idx = MOCK_CLIENTES.findIndex((c) => c.id === id);
    if (idx >= 0) MOCK_CLIENTES.splice(idx, 1);
    revalidatePath("/clientes");
    return { success: true };
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.from("clientes").delete().eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/clientes");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao excluir cliente.",
    };
  }
}
