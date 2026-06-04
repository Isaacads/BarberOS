"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getBarbeariaIdAndPerfil } from "@/lib/supabase/get-barbearia";

export type UsuarioInput = {
  nome: string;
  email: string;
  telefone?: string | null;
  perfil: "admin" | "staff";
};

export type ActionResult = { success: true } | { success: false; error: string };

async function assertAdmin() {
  const { perfil } = await getBarbeariaIdAndPerfil();
  if (perfil !== "admin") {
    throw new Error("Apenas administradores podem gerenciar usuários.");
  }
}

export async function listUsuarios() {
  await assertAdmin();
  const { barbeariaId } = await getBarbeariaIdAndPerfil();
  const supabase = createClient();

  const { data, error } = await supabase
    .from("usuarios")
    .select(
      "id, nome, email, telefone, perfil, ativo, created_at, barbearia_id, auth_user_id"
    )
    .eq("barbearia_id", barbeariaId)
    .order("nome", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Cadastra um novo usuário na tabela usuarios e envia convite por e-mail.
 * Não usa auth.admin — o usuário clica no link e ativa sua conta.
 */
export async function createUsuario(
  input: UsuarioInput
): Promise<ActionResult> {
  try {
    await assertAdmin();
    const { barbeariaId } = await getBarbeariaIdAndPerfil();
    const supabase = createClient();

    // 1. Insere na tabela usuarios (auth_user_id ficará NULL até o convite ser aceito)
    const { error: dbError } = await supabase.from("usuarios").insert({
      barbearia_id: barbeariaId,
      nome: input.nome.trim(),
      email: input.email.trim().toLowerCase(),
      telefone: input.telefone?.trim() || null,
      perfil: input.perfil,
      ativo: true,
    });

    if (dbError) {
      // E-mail duplicado?
      if (dbError.code === "23505") {
        return { success: false, error: "Este e-mail já está cadastrado nesta barbearia." };
      }
      return { success: false, error: dbError.message };
    }

    // 2. Envia link de redefinição de senha (convite)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const { error: inviteErr } = await supabase.auth.resetPasswordForEmail(
      input.email.trim().toLowerCase(),
      {
        redirectTo: `${appUrl}/login`,
      }
    );

    if (inviteErr) {
      console.error("Erro ao enviar convite:", inviteErr.message);
      // Não impede — usuário pode pedir redefinição depois
    }

    revalidatePath("/usuarios");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao criar usuário.",
    };
  }
}

export async function updateUsuario(
  id: string,
  input: Omit<UsuarioInput, "senha">
): Promise<ActionResult> {
  try {
    await assertAdmin();
    const { barbeariaId } = await getBarbeariaIdAndPerfil();
    const supabase = createClient();

    const { error } = await supabase
      .from("usuarios")
      .update({
        nome: input.nome.trim(),
        email: input.email.trim().toLowerCase(),
        telefone: input.telefone?.trim() || null,
        perfil: input.perfil,
      })
      .eq("id", id)
      .eq("barbearia_id", barbeariaId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/usuarios");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao atualizar usuário.",
    };
  }
}

export async function updateUsuarioStatus(
  id: string,
  ativo: boolean
): Promise<ActionResult> {
  try {
    await assertAdmin();
    const { barbeariaId } = await getBarbeariaIdAndPerfil();
    const supabase = createClient();

    const { error } = await supabase
      .from("usuarios")
      .update({ ativo })
      .eq("id", id)
      .eq("barbearia_id", barbeariaId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/usuarios");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao atualizar status.",
    };
  }
}

export async function deleteUsuario(id: string): Promise<ActionResult> {
  try {
    await assertAdmin();
    const { barbeariaId } = await getBarbeariaIdAndPerfil();
    const supabase = createClient();

    const { error } = await supabase
      .from("usuarios")
      .delete()
      .eq("id", id)
      .eq("barbearia_id", barbeariaId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/usuarios");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao excluir usuário.",
    };
  }
}
