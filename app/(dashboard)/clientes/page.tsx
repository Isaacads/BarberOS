import { IS_MOCK, MOCK_CLIENTES } from "@/lib/mock/data";
import { createClient } from "@/lib/supabase/server";
import type { Cliente } from "@/lib/types";
import { ClientesTable } from "@/components/clientes/clientes-table";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  let clientes: Cliente[] = [];

  if (IS_MOCK) {
    clientes = MOCK_CLIENTES as Cliente[];
  } else {
    const supabase = createClient();
    const { data } = await supabase
      .from("clientes")
      .select("*")
      .order("nome", { ascending: true });
    clientes = (data as Cliente[]) ?? [];
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
        <p className="text-muted-foreground">
          Gerencie a base de clientes da sua barbearia.
        </p>
      </header>

      <ClientesTable clientes={clientes} />
    </div>
  );
}
