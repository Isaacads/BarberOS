"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { Cliente } from "@/lib/types";
import {
  createCliente,
  updateCliente,
  type ClienteInput,
} from "@/app/(dashboard)/clientes/actions";

import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";

interface ClienteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente?: Cliente | null;
}

export function ClienteFormDialog({
  open,
  onOpenChange,
  cliente,
}: ClienteFormDialogProps) {
  const isEdit = !!cliente;
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<ClienteInput>({
    nome: "",
    telefone: "",
    email: "",
    observacoes: "",
  });

  // Sincroniza o formulário sempre que o dialog abrir ou o cliente mudar
  useEffect(() => {
    if (open) {
      setForm({
        nome: cliente?.nome ?? "",
        telefone: cliente?.telefone ?? "",
        email: cliente?.email ?? "",
        observacoes: cliente?.observacoes ?? "",
      });
    }
  }, [open, cliente]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    startTransition(async () => {
      const result = isEdit
        ? await updateCliente(cliente!.id, form)
        : await createCliente(form);

      if (result.success) {
        toast.success(
          isEdit ? "Cliente atualizado com sucesso." : "Cliente criado com sucesso."
        );
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar cliente" : "Novo cliente"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Atualize as informações do cliente."
              : "Adicione um novo cliente à sua base."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="grid gap-4 sm:grid-cols-2">
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
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={form.email ?? ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              rows={3}
              value={form.observacoes ?? ""}
              onChange={(e) =>
                setForm({ ...form, observacoes: e.target.value })
              }
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
