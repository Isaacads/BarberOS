/** Mapeamento dos dias da semana (padrão JS Date.getDay() — 0=Dom..6=Sab) */
export const DIAS_SEMANA: { value: number; label: string; short: string }[] = [
  { value: 1, label: "Segunda", short: "Seg" },
  { value: 2, label: "Terça", short: "Ter" },
  { value: 3, label: "Quarta", short: "Qua" },
  { value: 4, label: "Quinta", short: "Qui" },
  { value: 5, label: "Sexta", short: "Sex" },
  { value: 6, label: "Sábado", short: "Sáb" },
  { value: 0, label: "Domingo", short: "Dom" },
];

/** Converte "HH:MM:SS" do Postgres para "HH:MM" usado pelo input type=time */
export function timeFromDb(value: string | null | undefined): string {
  if (!value) return "";
  // value pode vir como "08:00:00" ou "08:00"
  return value.length >= 5 ? value.slice(0, 5) : value;
}

/** Formata "HH:MM:SS" em "HH:MM" para exibição */
export function formatHorario(
  inicio: string | null,
  fim: string | null
): string {
  if (!inicio && !fim) return "—";
  const i = timeFromDb(inicio) || "?";
  const f = timeFromDb(fim) || "?";
  return `${i} – ${f}`;
}

/** Renderiza os dias selecionados em forma curta (ex: "Seg, Ter, Qua") */
export function formatDias(dias: number[] | null | undefined): string {
  if (!dias || dias.length === 0) return "—";
  return DIAS_SEMANA.filter((d) => dias.includes(d.value))
    .map((d) => d.short)
    .join(", ");
}
