import "server-only";

import { createClient } from "@/lib/supabase/server";

/**
 * Retorna o id da barbearia do usuário autenticado.
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

  const { data, error } = await supabase
    .from("barbearias")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Barbearia não encontrada para este usuário");

  return data.id;
}
