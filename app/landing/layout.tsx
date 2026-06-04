import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BarberOS — Gestão para Barbearias",
  description:
    "Chega de caderninho. Agendamentos, clientes e funcionários organizados em um só lugar.",
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-950 text-slate-50">
      {children}
    </div>
  );
}
