"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCog,
  Scissors,
  Settings,
  Shield,
  LogOut,
  Menu,
  User,
  Crown,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const allLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agendamentos", label: "Agendamentos", icon: Calendar },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/funcionarios", label: "Funcionários", icon: UserCog },
  { href: "/servicos", label: "Serviços", icon: Scissors },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

const adminOnlyLinks = [
  { href: "/usuarios", label: "Usuários", icon: Shield },
];

interface SidebarProps {
  nomeBarbearia: string;
  userEmail: string;
  userNome: string;
  userPerfil: "admin" | "staff";
  planoLabel: string;
  planoExpirado: boolean;
}

function buildLinks(perfil: "admin" | "staff") {
  if (perfil === "admin") return [...allLinks, ...adminOnlyLinks];
  return allLinks;
}

function NavLinks({
  links,
  pathname,
  onNavigate,
}: {
  links: { href: string; label: string; icon: React.ElementType }[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      {links.map((link) => {
        const Icon = link.icon;
        const isActive =
          pathname === link.href ||
          (link.href !== "/dashboard" && pathname.startsWith(link.href));

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </>
  );
}

function UserInfo({
  userNome,
  userEmail,
  userPerfil,
  planoLabel,
  planoExpirado,
}: {
  userNome: string;
  userEmail: string;
  userPerfil: "admin" | "staff";
  planoLabel: string;
  planoExpirado: boolean;
}) {
  return (
    <div className="space-y-2 px-3 py-2">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
          <User className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="min-w-0">
          <span className="block truncate text-sm font-medium" title={userNome || userEmail}>
            {userNome || "Usuário"}
          </span>
          <span className="block truncate text-xs text-muted-foreground" title={userEmail}>
            {userEmail}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Crown className={cn("h-3.5 w-3.5", planoExpirado ? "text-destructive" : "text-amber-500")} />
        <span
          className={cn(
            "text-xs font-medium",
            planoExpirado ? "text-destructive" : "text-amber-600"
          )}
        >
          {planoLabel}
        </span>
        <span className={cn(
          "ml-auto rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
          userPerfil === "admin"
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        )}>
          {userPerfil}
        </span>
      </div>
    </div>
  );
}

export function Sidebar({
  nomeBarbearia,
  userEmail,
  userNome,
  userPerfil,
  planoLabel,
  planoExpirado,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const links = buildLinks(userPerfil);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col lg:border-r lg:bg-card">
        <div className="flex flex-col gap-1 border-b px-6 py-5">
          <div className="text-xl font-bold tracking-tight">✂️ BarberOS</div>
          <p
            className="truncate text-sm text-muted-foreground"
            title={nomeBarbearia}
          >
            {nomeBarbearia}
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          <NavLinks links={links} pathname={pathname} />
        </nav>

        <div className="border-t">
          <UserInfo
            userNome={userNome}
            userEmail={userEmail}
            userPerfil={userPerfil}
            planoLabel={planoLabel}
            planoExpirado={planoExpirado}
          />
          <div className="p-3 pt-0">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile header + drawer */}
      <div className="lg:hidden">
        <header className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b bg-card px-4">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Abrir menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="border-b px-6 py-5 text-left">
                  <SheetTitle className="text-xl font-bold tracking-tight">
                    ✂️ BarberOS
                  </SheetTitle>
                  <p className="truncate text-sm text-muted-foreground">
                    {nomeBarbearia}
                  </p>
                </SheetHeader>
                <nav className="flex-1 space-y-1 px-3 py-4">
                  <NavLinks
                    links={links}
                    pathname={pathname}
                    onNavigate={() => setMobileOpen(false)}
                  />
                </nav>
                <div className="border-t">
                  <UserInfo
                    userNome={userNome}
                    userEmail={userEmail}
                    userPerfil={userPerfil}
                    planoLabel={planoLabel}
                    planoExpirado={planoExpirado}
                  />
                  <div className="p-3 pt-0">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 text-muted-foreground"
                      onClick={() => {
                        setMobileOpen(false);
                        handleLogout();
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Sair
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <span className="font-semibold">BarberOS</span>
          </div>
        </header>

        {/* Espaçamento para o header fixo */}
        <div className="h-14" />
      </div>
    </>
  );
}
