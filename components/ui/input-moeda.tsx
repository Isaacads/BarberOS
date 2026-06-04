"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

interface InputMoedaProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value?: number;
  onChange: (value: number) => void;
}

function formatMoeda(cents: number): string {
  if (cents === 0) return "";
  const reais = cents / 100;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(reais);
}

function parseMoeda(raw: string): number {
  const digits = raw.replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

export const InputMoeda = React.forwardRef<
  HTMLInputElement,
  InputMoedaProps
>(({ value = 0, onChange, ...props }, ref) => {
  const [display, setDisplay] = React.useState(() => formatMoeda(value));
  const [focused, setFocused] = React.useState(false);

  React.useEffect(() => {
    if (!focused) {
      const formatted = formatMoeda(value);
      if (formatted !== display) {
        setDisplay(formatted);
      }
    }
  }, [value, focused]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const cents = parseMoeda(raw);
    setDisplay(formatMoeda(cents));
    onChange(cents / 100); // envia valor em reais (ex: 35.00)
  }

  function handleFocus() {
    setFocused(true);
    if (value === 0) setDisplay("");
  }

  function handleBlur() {
    setFocused(false);
    setDisplay(formatMoeda(value));
  }

  return (
    <Input
      ref={ref}
      type="text"
      inputMode="decimal"
      placeholder="R$ 0,00"
      value={display}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    />
  );
});
InputMoeda.displayName = "InputMoeda";
