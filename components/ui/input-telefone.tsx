"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

interface InputTelefoneProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value?: string;
  onChange: (value: string) => void;
}

function formatTelefone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) {
    return digits.length ? `(${digits}` : "";
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export const InputTelefone = React.forwardRef<
  HTMLInputElement,
  InputTelefoneProps
>(({ value = "", onChange, ...props }, ref) => {
  const [display, setDisplay] = React.useState(() => formatTelefone(value));

  React.useEffect(() => {
    // Sincroniza se o value externo mudar (ex: ao editar)
    const formatted = formatTelefone(value);
    if (formatted !== display) {
      setDisplay(formatted);
    }
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const digits = raw.replace(/\D/g, "").slice(0, 11);
    const formatted = formatTelefone(raw);
    setDisplay(formatted);
    onChange(digits); // envia só os dígitos para o backend
  }

  return (
    <Input
      ref={ref}
      type="tel"
      inputMode="tel"
      placeholder="(11) 99999-9999"
      value={display}
      onChange={handleChange}
      {...props}
    />
  );
});
InputTelefone.displayName = "InputTelefone";
