import { createClient } from "@/lib/supabase/server";
import { ConfiguracoesClient } from "@/components/configuracoes/configuracoes-client";
import { CriarBarbeariaForm } from "@/components/configuracoes/criar-barbearia-form";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: barbearia } = await supabase
    .from("barbearias")
    .select("*")
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!barbearia) {
    return (
      <div className="mx-auto max-w-xl">
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Configure sua barbearia para começar a usar o BarberOS.
          </p>
        </header>
        <CriarBarbeariaForm />
      </div>
    );
  }

  return (
    <ConfiguracoesClient
      barbearia={{
        id: barbearia.id,
        nome: barbearia.nome,
        slogan: barbearia.slogan ?? null,
        telefone: barbearia.telefone ?? null,
        endereco_completo: barbearia.endereco_completo ?? null,
        logo_url: barbearia.logo_url ?? null,
        hora_abertura: barbearia.hora_abertura ?? null,
        hora_fechamento: barbearia.hora_fechamento ?? null,
        intervalo_minutos: barbearia.intervalo_minutos ?? 30,
      }}
      userEmail={user!.email ?? ""}
    />
  );
}
