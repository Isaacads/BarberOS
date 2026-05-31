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
  LogOut,
  Menu,
  X,
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
  SheetClose,
} from "@/components/ui/sheet";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agendamentos", label: "Agendamentos", icon: Calendar },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/funcionarios", label: "Funcionários", icon: UserCog },
  { href: "/servicos", label: "Serviços", icon: Scissors },
];

interface SidebarProps {
  nomeBarbearia: string;
}

function NavLinks({
  pathname,
  onNavigate,
}: {
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

export function Sidebar({ nomeBarbearia }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

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
          <NavLinks pathname={pathname} />
        </nav>

        <div className="border-t p-3">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
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
                    pathname={pathname}
                    onNavigate={() => setMobileOpen(false)}
                  />
                </nav>
                <div className="border-t p-3">
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
