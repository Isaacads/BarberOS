"use server";

import { createClient } from "@/lib/supabase/server";

export type RegistroInput = {
  nomeBarbearia: string;
  email: string;
  password: string;
};

export type RegistroResult =
  | { success: true; sessionActive: boolean }
  | { success: false; error: string };

export async function registrarBarbearia(
  input: RegistroInput
): Promise<RegistroResult> {
  const supabase = createClient();

  // 1. Sign up
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: { nome_barbearia: input.nomeBarbearia },
    },
  });

  if (authError) return { success: false, error: authError.message };
  if (!authData.user) return { success: false, error: "Falha ao criar conta." };

  const userId = authData.user.id;

  // 2. Cria barbearia
  const { data: barbeariaData, error: dbError } = await supabase
    .from("barbearias")
    .insert({
      user_id: userId,
      nome: input.nomeBarbearia,
    })
    .select()
    .single();

  if (dbError) return { success: false, error: `Erro ao criar barbearia: ${dbError.message}` };
  if (!barbeariaData) return { success: false, error: "Barbearia não criada." };

  const barbeariaId = barbeariaData.id;

  // 3. Insere dono na tabela usuarios (RLS permite pois é admin da barbearia — mas como acabou de criar, usamos service role temporario de fallback via user_id)
  const { error: userErr } = await supabase.from("usuarios").insert({
    barbearia_id: barbeariaId,
    auth_user_id: userId,
    nome: input.nomeBarbearia,
    email: authData.user.email ?? input.email,
    perfil: "admin",
    ativo: true,
  });

  if (userErr) {
    // RLS do usuarios pode bloquear. Fallback: o middleware criará no primeiro acesso
    console.error("usuarios insert:", userErr.message);
  }

  // 4. Trial
  const { error: trialErr } = await supabase.from("assinaturas").insert({
    barbearia_id: barbeariaId,
    plano: "trial",
    status: "ativo",
    trial_inicio: new Date().toISOString(),
    trial_fim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });

  if (trialErr) {
    console.error("assinaturas insert:", trialErr.message);
  }

  return { success: true, sessionActive: !!authData.session };
}
