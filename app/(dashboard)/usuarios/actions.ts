"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getBarbeariaIdAndPerfil } from "@/lib/supabase/get-barbearia";

export type UsuarioInput = {
  nome: string;
  email: string;
  telefone?: string | null;
  perfil: "admin" | "staff";
  senha?: string;
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
    .select("id, nome, email, telefone, perfil, ativo, created_at")
    .eq("barbearia_id", barbeariaId)
    .order("nome", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createUsuario(input: UsuarioInput): Promise<ActionResult> {
  try {
    await assertAdmin();
    const { barbeariaId } = await getBarbeariaIdAndPerfil();
    const adminClient = createClient(); // Server admin: bypass RLS
    const supabase = createClient();

    // 1. Cria auth user
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: input.email,
      password: input.senha || "BarberOS123!",
      email_confirm: true,
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    const authUserId = authData?.user?.id;
    if (!authUserId) {
      return { success: false, error: "Não foi possível criar o usuário." };
    }

    // 2. Insere na tabela usuarios
    const { error: dbError } = await supabase.from("usuarios").insert({
      barbearia_id: barbeariaId,
      auth_user_id: authUserId,
      nome: input.nome.trim(),
      email: input.email.trim().toLowerCase(),
      telefone: input.telefone?.trim() || null,
      perfil: input.perfil,
      ativo: true,
    });

    if (dbError) {
      // Tenta limpar o auth user criado
      try {
        await adminClient.auth.admin.deleteUser(authUserId);
      } catch {
        // ignora
      }
      return { success: false, error: dbError.message };
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

    const { data: usuario } = await supabase
      .from("usuarios")
      .select("auth_user_id")
      .eq("id", id)
      .eq("barbearia_id", barbeariaId)
      .maybeSingle();

    const { error } = await supabase
      .from("usuarios")
      .delete()
      .eq("id", id)
      .eq("barbearia_id", barbeariaId);

    if (error) return { success: false, error: error.message };

    // Remove do auth também
    if (usuario?.auth_user_id) {
      try {
        const adminClient = createClient();
        await adminClient.auth.admin.deleteUser(usuario.auth_user_id);
      } catch {
        // ignora se falhar, registro já foi removido do app
      }
    }

    revalidatePath("/usuarios");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao excluir usuário.",
    };
  }
}
