import { IS_MOCK, MOCK_BARBearia } from "@/lib/mock/data";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let nomeBarbearia = "Minha Barbearia";

  if (IS_MOCK) {
    nomeBarbearia = MOCK_BARBearia.nome;
  } else {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const { redirect } = await import("next/navigation");
      redirect("/login");
    }

    const { data: barbearia } = await supabase
      .from("barbearias")
      .select("nome")
      .eq("user_id", user!.id)
      .maybeSingle();

    nomeBarbearia = barbearia?.nome ?? "Minha Barbearia";
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar nomeBarbearia={nomeBarbearia} />
      <main className="lg:ml-64 min-h-screen">
        <div className="mx-auto max-w-7xl p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
