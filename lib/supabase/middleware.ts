import { IS_MOCK } from "@/lib/mock/data";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Modo mock: bypass completo de autenticação
  if (IS_MOCK) {
    return supabaseResponse;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url.includes("seu-projeto")) {
    const { pathname } = request.nextUrl;
    const isAuthRoute =
      pathname.startsWith("/login") || pathname.startsWith("/registro") || pathname.startsWith("/pagamento");
    const isPublicRoute = pathname === "/" || pathname.startsWith("/landing") || isAuthRoute;

    if (!isPublicRoute) {
      const redirect = request.nextUrl.clone();
      redirect.pathname = "/login";
      redirect.searchParams.set("error", "missing_env");
      return NextResponse.redirect(redirect);
    }
    return supabaseResponse;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        supabaseResponse = NextResponse.next({ request });
        supabaseResponse.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: "", ...options });
        supabaseResponse = NextResponse.next({ request });
        supabaseResponse.cookies.set({ name, value: "", ...options });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/registro") || pathname.startsWith("/pagamento");
  const isPublicRoute = pathname === "/" || pathname.startsWith("/landing") || isAuthRoute;

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute && !pathname.startsWith("/pagamento")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Verifica trial/assinatura para rotas protegidas do dashboard
  if (user && !isPublicRoute) {
    // 1. Resolve barbearia via tabela usuarios (novo modelo)
    const { data: usuario } = await supabase
      .from("usuarios")
      .select("barbearia_id, perfil")
      .eq("auth_user_id", user.id)
      .eq("ativo", true)
      .maybeSingle();

    let barbeariaId: string | undefined = usuario?.barbearia_id;
    let perfil: string = usuario?.perfil ?? "admin";

    // 2. Fallback legacy: busca via barbearias.user_id (dono único)
    if (!barbeariaId) {
      const { data: barbearia } = await supabase
        .from("barbearias")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      barbeariaId = barbearia?.id;
      perfil = "admin";
    }

    // Se não tem barbearia cadastrada, manda para configurações criar
    if (!barbeariaId) {
      const url = request.nextUrl.clone();
      url.pathname = "/configuracoes";
      return NextResponse.redirect(url);
    }

    // Redireciona staff que tenta acessar /usuarios
    if (perfil !== "admin" && pathname.startsWith("/usuarios")) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    const { data: assinatura } = await supabase
      .from("assinaturas")
      .select("id, status, trial_fim, pagamento_fim")
      .eq("barbearia_id", barbeariaId)
      .maybeSingle();

    const agora = new Date();

    // Se não tem assinatura, cria trial automaticamente
    if (!assinatura) {
      const trialFim = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await supabase.from("assinaturas").insert({
        barbearia_id: barbeariaId,
        plano: "trial",
        status: "ativo",
        trial_inicio: agora.toISOString(),
        trial_fim: trialFim.toISOString(),
      });
      return supabaseResponse;
    }

    const trialValido = assinatura?.trial_fim && new Date(assinatura.trial_fim) > agora;
    const pagamentoValido = assinatura?.pagamento_fim && new Date(assinatura.pagamento_fim) > agora;

    if (!trialValido && !pagamentoValido) {
      const url = request.nextUrl.clone();
      url.pathname = "/pagamento";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
