"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { Funcionario } from "@/lib/types";
import {
  createFuncionario,
  updateFuncionario,
  type FuncionarioInput,
} from "@/app/(dashboard)/funcionarios/actions";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DIAS_SEMANA, timeFromDb } from "./dias-semana";

interface FuncionarioFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  funcionario?: Funcionario | null;
}

const emptyForm: FuncionarioInput = {
  nome: "",
  telefone: "",
  ativo: true,
  dias_trabalho: [1, 2, 3, 4, 5], // Seg-Sex como padrão
  hora_inicio: "09:00",
  hora_fim: "18:00",
};

export function FuncionarioFormDialog({
  open,
  onOpenChange,
  funcionario,
}: FuncionarioFormDialogProps) {
  const isEdit = !!funcionario;
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<FuncionarioInput>(emptyForm);

  useEffect(() => {
    if (open) {
      if (funcionario) {
        setForm({
          nome: funcionario.nome,
          telefone: funcionario.telefone ?? "",
          ativo: funcionario.ativo,
          dias_trabalho: funcionario.dias_trabalho ?? [],
          hora_inicio: timeFromDb(funcionario.hora_inicio),
          hora_fim: timeFromDb(funcionario.hora_fim),
        });
      } else {
        setForm(emptyForm);
      }
    }
  }, [open, funcionario]);

  function toggleDia(dia: number, checked: boolean) {
    setForm((prev) => {
      const set = new Set(prev.dias_trabalho);
      if (checked) set.add(dia);
      else set.delete(dia);
      return { ...prev, dias_trabalho: Array.from(set).sort((a, b) => a - b) };
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    startTransition(async () => {
      const result = isEdit
        ? await updateFuncionario(funcionario!.id, form)
        : await createFuncionario(form);

      if (result.success) {
        toast.success(
          isEdit
            ? "Funcionário atualizado com sucesso."
            : "Funcionário criado com sucesso."
        );
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar funcionário" : "Novo funcionário"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Atualize os dados e horários do funcionário."
              : "Cadastre um novo funcionário e seus horários de trabalho."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nome">
                Nome <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nome"
                required
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={form.telefone ?? ""}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hora_inicio">Hora de início</Label>
              <Input
                id="hora_inicio"
                type="time"
                value={form.hora_inicio ?? ""}
                onChange={(e) =>
                  setForm({ ...form, hora_inicio: e.target.value })
                }
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hora_fim">Hora de fim</Label>
              <Input
                id="hora_fim"
                type="time"
                value={form.hora_fim ?? ""}
                onChange={(e) => setForm({ ...form, hora_fim: e.target.value })}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Dias de trabalho</Label>
            <div className="grid grid-cols-2 gap-3 rounded-md border p-3 sm:grid-cols-4">
              {DIAS_SEMANA.map((dia) => {
                const checked = form.dias_trabalho.includes(dia.value);
                const id = `dia-${dia.value}`;
                return (
                  <div key={dia.value} className="flex items-center gap-2">
                    <Checkbox
                      id={id}
                      checked={checked}
                      onCheckedChange={(c) => toggleDia(dia.value, c === true)}
                      disabled={isPending}
                    />
                    <Label
                      htmlFor={id}
                      className="cursor-pointer text-sm font-normal"
                    >
                      {dia.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <Label htmlFor="ativo" className="text-sm font-medium">
                Funcionário ativo
              </Label>
              <p className="text-xs text-muted-foreground">
                Funcionários inativos não aparecem para novos agendamentos.
              </p>
            </div>
            <Switch
              id="ativo"
              checked={form.ativo}
              onCheckedChange={(c) => setForm({ ...form, ativo: c })}
              disabled={isPending}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
