import "server-only";

import { createClient } from "@/lib/supabase/server";

/**
 * Retorna o id da barbearia do usuário autenticado.
 * Primeiro tenta pela tabela usuarios (multi-tenant), depois legacy fallback.
 * Lança erro se não houver sessão ou se a barbearia não existir.
 */
export async function getBarbeariaId(): Promise<string> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  // 1. Novo modelo: barbearia via tabela usuarios (silenciosamente skipa se tabela nao existe)
  try {
    const { data: usuario } = await supabase
      .from("usuarios")
      .select("barbearia_id")
      .eq("auth_user_id", user.id)
      .eq("ativo", true)
      .maybeSingle();
    if (usuario) return usuario.barbearia_id;
  } catch {
    /* tabela pode nao existir */
  }

  // 2. Fallback legacy
  const { data, error } = await supabase
    .from("barbearias")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Barbearia não encontrada para este usuário");

  return data.id;
}

export async function getBarbeariaIdAndPerfil(): Promise<{
  barbeariaId: string;
  perfil: "admin" | "staff";
  nome: string;
}> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  // 1. Novo modelo
  try {
    const { data: usuario } = await supabase
      .from("usuarios")
      .select("barbearia_id, perfil, nome")
      .eq("auth_user_id", user.id)
      .eq("ativo", true)
      .maybeSingle();
    if (usuario) {
      return {
        barbeariaId: usuario.barbearia_id,
        perfil: (usuario.perfil as "admin" | "staff") ?? "staff",
        nome: usuario.nome,
      };
    }
  } catch {
    /* tabela pode nao existir */
  }

  // 2. Fallback legacy
  const { data: barbearia } = await supabase
    .from("barbearias")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (barbearia) {
    return {
      barbeariaId: barbearia.id,
      perfil: "admin",
      nome: user.email ?? "Administrador",
    };
  }

  throw new Error("Barbearia não encontrada para este usuário");
}
