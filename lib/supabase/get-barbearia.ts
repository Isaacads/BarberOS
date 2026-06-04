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

  // 1. Novo modelo: barbearia via tabela usuarios
  const { data: usuario, error: userErr } = await supabase
    .from("usuarios")
    .select("barbearia_id")
    .eq("auth_user_id", user.id)
    .eq("ativo", true)
    .maybeSingle();

  if (!userErr && usuario) {
    return usuario.barbearia_id;
  }

  // 2. Fallback legacy: backwards compat com barbearias.user_id
  const { data, error } = await supabase
    .from("barbearias")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Barbearia não encontrada para este usuário");

  return data.id;
}

/**
 * Retorna barbearia_id, perfil e nome do usuário logado.
 * Fallback legacy: se não está na tabela usuarios, busca via barbearias.user_id e assume admin.
 */
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

  // Novo modelo
  const { data: usuario } = await supabase
    .from("usuarios")
    .select("barbearia_id, perfil, nome")
    .eq("auth_user_id", user.id)
    .eq("ativo", true)
    .maybeSingle();

  if (usuario) {
    return {
      barbeariaId: usuario.barbearia_id,
      perfil: usuario.perfil as "admin" | "staff",
      nome: usuario.nome,
    };
  }

  // Fallback legacy
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
export async function getUsuarioLogado(): Promise<{
  barbeariaId: string;
  perfil: "admin" | "staff";
  nome: string;
  email: string;
}> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const { data, error } = await supabase
    .from("usuarios")
    .select("barbearia_id, perfil, nome, email")
    .eq("auth_user_id", user.id)
    .eq("ativo", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Usuário não cadastrado no sistema.");

  return {
    barbeariaId: data.barbearia_id,
    perfil: data.perfil,
    nome: data.nome,
    email: data.email,
  };
}
