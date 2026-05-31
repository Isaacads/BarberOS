"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { Servico } from "@/lib/types";
import {
  createServico,
  updateServico,
  type ServicoInput,
} from "@/app/(dashboard)/servicos/actions";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface ServicoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servico?: Servico | null;
}

const DURACOES = [15, 20, 30, 45, 60, 90];

const emptyForm: ServicoInput = {
  nome: "",
  descricao: "",
  preco: 0,
  duracao_minutos: 30,
  ativo: true,
};

export function ServicoFormDialog({
  open,
  onOpenChange,
  servico,
}: ServicoFormDialogProps) {
  const isEdit = !!servico;
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<ServicoInput>(emptyForm);

  useEffect(() => {
    if (open) {
      if (servico) {
        setForm({
          nome: servico.nome,
          descricao: servico.descricao ?? "",
          preco: servico.preco,
          duracao_minutos: servico.duracao_minutos,
          ativo: servico.ativo,
        });
      } else {
        setForm(emptyForm);
      }
    }
  }, [open, servico]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    startTransition(async () => {
      const result = isEdit
        ? await updateServico(servico!.id, form)
        : await createServico(form);

      if (result.success) {
        toast.success(
          isEdit ? "Serviço atualizado com sucesso." : "Serviço criado com sucesso."
        );
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar serviço" : "Novo serviço"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Atualize os dados do serviço."
              : "Cadastre um novo serviço oferecido pela barbearia."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
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
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              rows={2}
              value={form.descricao ?? ""}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              disabled={isPending}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="preco">Preço (R$)</Label>
              <Input
                id="preco"
                type="number"
                min={0}
                step={0.01}
                required
                value={form.preco}
                onChange={(e) =>
                  setForm({ ...form, preco: parseFloat(e.target.value) || 0 })
                }
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duracao">Duração (minutos)</Label>
              <Select
                value={String(form.duracao_minutos)}
                onValueChange={(v) =>
                  setForm({ ...form, duracao_minutos: Number(v) })
                }
                disabled={isPending}
              >
                <SelectTrigger id="duracao">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {DURACOES.map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d} min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <Label htmlFor="ativo" className="text-sm font-medium">
                Serviço ativo
              </Label>
              <p className="text-xs text-muted-foreground">
                Serviços inativos não aparecem para novos agendamentos.
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
