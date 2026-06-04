import { IS_MOCK, MOCK_BARBearia, MOCK_USER } from "@/lib/mock/data";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let nomeBarbearia = "Minha Barbearia";
  let logoUrl: string | null = null;
  let userEmail = "";
  let userNome = "";
  let userPerfil: "admin" | "staff" = "admin";
  let planoLabel = "Trial";
  let planoExpirado = false;

  if (IS_MOCK) {
    nomeBarbearia = MOCK_BARBearia.nome;
    userEmail = MOCK_USER.email;
    userNome = "Dono";
    userPerfil = "admin";
    planoLabel = "Trial";
  } else {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const { redirect } = await import("next/navigation");
      redirect("/login");
      return <></>;
    }

    const authUser = user;
    userEmail = authUser.email ?? "";

    // 1. Busca dados via tabela usuarios
    let barbeariaId: string | undefined;
    const { data: usuario } = await supabase
      .from("usuarios")
      .select("barbearia_id, nome, perfil")
      .eq("auth_user_id", authUser.id)
      .eq("ativo", true)
      .maybeSingle();

    if (usuario) {
      barbeariaId = usuario.barbearia_id;
      userNome = usuario.nome;
      userPerfil = usuario.perfil as "admin" | "staff";
    }

    // 2. Fallback legacy
    if (!barbeariaId) {
      const { data: barbearia } = await supabase
        .from("barbearias")
        .select("id, nome, logo_url")
        .eq("user_id", authUser.id)
        .maybeSingle();

      if (barbearia) {
        barbeariaId = barbearia.id;
        nomeBarbearia = barbearia.nome;
        logoUrl = barbearia.logo_url ?? null;
        userPerfil = "admin";
      }
    } else {
      const { data: barbearia } = await supabase
        .from("barbearias")
        .select("nome, logo_url")
        .eq("id", barbeariaId)
        .maybeSingle();
      nomeBarbearia = barbearia?.nome ?? "Minha Barbearia";
      logoUrl = barbearia?.logo_url ?? null;
    }

    if (barbeariaId) {
      const { data: assinatura } = await supabase
        .from("assinaturas")
        .select("plano, status, trial_fim, pagamento_fim")
        .eq("barbearia_id", barbeariaId)
        .maybeSingle();

      const agora = new Date();
      const trialValido =
        assinatura?.trial_fim && new Date(assinatura.trial_fim) > agora;
      const pagamentoValido =
        assinatura?.pagamento_fim && new Date(assinatura.pagamento_fim) > agora;

      if (pagamentoValido) {
        planoLabel = assinatura.plano === "anual" ? "Plano Anual" : "Plano Mensal";
      } else if (trialValido) {
        planoLabel = "7 dias grátis";
      } else {
        planoLabel = "Expirado";
        planoExpirado = true;
      }
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar
        nomeBarbearia={nomeBarbearia}
        logoUrl={logoUrl}
        userEmail={userEmail}
        userNome={userNome}
        userPerfil={userPerfil}
        planoLabel={planoLabel}
        planoExpirado={planoExpirado}
      />
      <main className="lg:ml-64 min-h-screen">
        <div className="mx-auto max-w-7xl p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
