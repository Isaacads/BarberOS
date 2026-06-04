import { createClient } from "@/lib/supabase/server";
import { UserCheck } from "lucide-react";
import { UsuariosTable } from "@/components/usuarios/usuarios-table";
import { UsuarioFormDialog } from "@/components/usuarios/usuario-form-dialog";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Resolve barbearia
  let barbeariaId: string | undefined;
  const { data: usuarioLogado } = await supabase
    .from("usuarios")
    .select("barbearia_id, perfil")
    .eq("auth_user_id", user.id)
    .eq("ativo", true)
    .maybeSingle();

  if (usuarioLogado) {
    barbeariaId = usuarioLogado.barbearia_id;
  } else {
    const { data: barbearia } = await supabase
      .from("barbearias")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    barbeariaId = barbearia?.id;
  }

  if (!barbeariaId) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Barbearia não encontrada.</p>
      </div>
    );
  }

  const { data: usuariosRaw } = await supabase
    .from("usuarios")
    .select("id, nome, email, telefone, perfil, ativo, created_at, barbearia_id, auth_user_id")
    .eq("barbearia_id", barbeariaId)
    .order("nome", { ascending: true });

  const usuarios = usuariosRaw ?? [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
        <p className="text-muted-foreground">
          Gerencie acesso e perfis da sua equipe (Admin ou Staff).
        </p>
      </header>

      {usuarios.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <UserCheck className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Nenhum usuário cadastrado</p>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            Cadastre usuários para permitir que sua equipe acesse o sistema com perfis específicos.
          </p>
          <div className="mt-4">
            <UsuarioFormDialog />
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-end">
            <UsuarioFormDialog />
          </div>
          <UsuariosTable usuarios={usuarios} />
        </>
      )}
    </div>
  );
}
