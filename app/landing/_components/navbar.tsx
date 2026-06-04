"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "#funcionalidades", label: "Funcionalidades" },
    { href: "#precos", label: "Preços" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        <Link href="/landing" className="flex items-center gap-2 text-xl font-bold text-amber-400">
          <span>✂️</span>
          <span>BarberOS</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-slate-300 transition-colors hover:text-amber-400"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Button asChild variant="outline" className="border-white/20 bg-transparent text-slate-100 hover:bg-white/10">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild className="bg-amber-500 text-slate-950 hover:bg-amber-400">
            <Link href="/registro">Começar grátis</Link>
          </Button>
        </div>

        <button
          className="text-slate-200 md:hidden"
          onClick={() => setOpen((s) => !s)}
          aria-label="Menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-slate-950 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-slate-300 transition-colors hover:text-amber-400"
              >
                {l.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-2">
              <Button asChild variant="outline" className="w-full border-white/20 bg-transparent text-slate-100 hover:bg-white/10">
                <Link href="/login">Entrar</Link>
              </Button>
              <Button asChild className="w-full bg-amber-500 text-slate-950 hover:bg-amber-400">
                <Link href="/registro">Começar grátis</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
