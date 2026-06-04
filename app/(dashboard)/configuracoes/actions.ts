"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getBarbeariaId } from "@/lib/supabase/get-barbearia";

export type BarbeariaConfigInput = {
  nome: string;
  slogan?: string | null;
  telefone?: string | null;
  endereco_completo?: string | null;
  hora_abertura?: string | null;
  hora_fechamento?: string | null;
  intervalo_minutos?: number;
};

export type ActionResult = { success: true } | { success: false; error: string };

export async function updateBarbeariaConfig(
  input: BarbeariaConfigInput
): Promise<ActionResult> {
  const nome = input.nome?.trim();
  if (!nome) {
    return { success: false, error: "Nome da barbearia é obrigatório." };
  }

  try {
    const barbeariaId = await getBarbeariaId();
    const supabase = createClient();

    const { error } = await supabase
      .from("barbearias")
      .update({
        nome,
        slogan: input.slogan?.trim() || null,
        telefone: input.telefone?.trim() || null,
        endereco_completo: input.endereco_completo?.trim() || null,
        hora_abertura: input.hora_abertura || null,
        hora_fechamento: input.hora_fechamento || null,
        intervalo_minutos: input.intervalo_minutos ?? 30,
      })
      .eq("id", barbeariaId)
      .eq("user_id", (await supabase.auth.getUser()).data.user!.id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/configuracoes");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao salvar configurações.",
    };
  }
}

export async function uploadLogo(
  formData: FormData
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  try {
    const file = formData.get("logo") as File;
    if (!file) return { success: false, error: "Nenhum arquivo enviado." };

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return { success: false, error: "Formato inválido. Use JPG, PNG ou WEBP." };
    }

    if (file.size > 2 * 1024 * 1024) {
      return { success: false, error: "Arquivo muito grande. Máximo 2MB." };
    }

    const barbeariaId = await getBarbeariaId();
    const supabase = createClient();

    const ext = file.name.split(".").pop() || "png";
    const path = `${barbeariaId}/logo.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(path, file, { upsert: true });

    if (uploadError) return { success: false, error: uploadError.message };

    const {
      data: { publicUrl },
    } = supabase.storage.from("logos").getPublicUrl(path);

    const { error: dbError } = await supabase
      .from("barbearias")
      .update({ logo_url: publicUrl })
      .eq("id", barbeariaId);

    if (dbError) return { success: false, error: dbError.message };

    revalidatePath("/configuracoes");
    revalidatePath("/dashboard");
    return { success: true, url: publicUrl };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao fazer upload.",
    };
  }
}

export async function criarBarbearia(
  input: BarbeariaConfigInput
): Promise<ActionResult & { id?: string }> {
  const nome = input.nome?.trim();
  if (!nome) {
    return { success: false, error: "Nome da barbearia é obrigatório." };
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Usuário não autenticado." };
    }

    const { data, error } = await supabase
      .from("barbearias")
      .insert({
        user_id: user.id,
        nome,
        slogan: input.slogan?.trim() || null,
        telefone: input.telefone?.trim() || null,
        endereco_completo: input.endereco_completo?.trim() || null,
        hora_abertura: input.hora_abertura || null,
        hora_fechamento: input.hora_fechamento || null,
        intervalo_minutos: input.intervalo_minutos ?? 30,
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };

    // Cria trial automaticamente
    if (data?.id) {
      const trialFim = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await supabase.from("assinaturas").insert({
        barbearia_id: data.id,
        plano: "trial",
        status: "ativo",
        trial_inicio: new Date().toISOString(),
        trial_fim: trialFim.toISOString(),
      });
    }

    revalidatePath("/configuracoes");
    revalidatePath("/dashboard");
    return { success: true, id: data?.id };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao criar barbearia.",
    };
  }
}

export async function resetPassword(): Promise<ActionResult> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return { success: false, error: "E-mail não encontrado." };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`,
    });

    if (error) return { success: false, error: error.message };

    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao enviar e-mail.",
    };
  }
}
