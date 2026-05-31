import { IS_MOCK, MOCK_FUNCIONARIOS } from "@/lib/mock/data";
import { createClient } from "@/lib/supabase/server";
import type { Funcionario } from "@/lib/types";
import { FuncionariosTable } from "@/components/funcionarios/funcionarios-table";

export const dynamic = "force-dynamic";

export default async function FuncionariosPage() {
  let funcionarios: Funcionario[] = [];

  if (IS_MOCK) {
    funcionarios = MOCK_FUNCIONARIOS as Funcionario[];
  } else {
    const supabase = createClient();
    const { data } = await supabase
      .from("funcionarios")
      .select("*")
      .order("nome", { ascending: true });
    funcionarios = (data as Funcionario[]) ?? [];
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Funcionários</h1>
        <p className="text-muted-foreground">
          Cadastre e gerencie seus barbeiros e horários de trabalho.
        </p>
      </header>

      <FuncionariosTable funcionarios={funcionarios} />
    </div>
  );
}
