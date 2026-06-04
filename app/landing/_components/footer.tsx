import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 px-4 py-10 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="text-center sm:text-left">
          <div className="flex items-center justify-center gap-2 text-lg font-bold text-amber-400 sm:justify-start">
            <span>✂️</span>
            <span>BarberOS</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Feito para barbearias brasileiras.</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-slate-300">
          <Link href="/login" className="transition-colors hover:text-amber-400">Entrar</Link>
          <Link href="/registro" className="transition-colors hover:text-amber-400">Cadastrar</Link>
          <a href="#funcionalidades" className="transition-colors hover:text-amber-400">Funcionalidades</a>
          <a href="#precos" className="transition-colors hover:text-amber-400">Preços</a>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-7xl text-center text-xs text-slate-500">
        © 2025 BarberOS. Todos os direitos reservados.
      </div>
    </footer>
  );
}
