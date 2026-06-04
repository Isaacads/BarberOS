"use server";

import { createClient } from "@/lib/supabase/server";

export async function getAssinatura(barbeariaId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("assinaturas")
    .select("*")
    .eq("barbearia_id", barbeariaId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function criarTrial(barbeariaId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("assinaturas")
    .insert({
      barbearia_id: barbeariaId,
      plano: "trial",
      status: "ativo",
      trial_inicio: new Date().toISOString(),
      trial_fim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function verificarTrialAtivo(barbeariaId: string): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("assinaturas")
    .select("status, trial_fim, pagamento_fim")
    .eq("barbearia_id", barbeariaId)
    .maybeSingle();

  if (error || !data) return false;

  // Se tem pagamento ativo
  if (data.pagamento_fim && new Date(data.pagamento_fim) > new Date()) {
    return true;
  }

  // Se está no trial
  if (data.status === "ativo" && data.trial_fim && new Date(data.trial_fim) > new Date()) {
    return true;
  }

  return false;
}
