import { IS_MOCK, MOCK_SERVICOS } from "@/lib/mock/data";
import { createClient } from "@/lib/supabase/server";
import type { Servico } from "@/lib/types";
import { ServicosTable } from "@/components/servicos/servicos-table";

export const dynamic = "force-dynamic";

export default async function ServicosPage() {
  let servicos: Servico[] = [];

  if (IS_MOCK) {
    servicos = MOCK_SERVICOS as Servico[];
  } else {
    const supabase = createClient();
    const { data } = await supabase
      .from("servicos")
      .select("*")
      .order("nome", { ascending: true });
    servicos = (data as Servico[]) ?? [];
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Serviços</h1>
        <p className="text-muted-foreground">
          Configure os serviços oferecidos, preços e duração.
        </p>
      </header>

      <ServicosTable servicos={servicos} />
    </div>
  );
}
