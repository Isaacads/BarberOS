"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Pencil,
  Scissors,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import type { Agendamento, Cliente, Funcionario, Servico } from "@/lib/types";
import {
  updateAgendamentoStatus,
  deleteAgendamento,
} from "@/app/(dashboard)/agendamentos/actions";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AgendamentoCardProps {
  agendamento: Agendamento;
  cliente: Cliente | undefined;
  funcionario: Funcionario | undefined;
  servico: Servico | undefined;
  onEdit: () => void;
}

const reais = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "agendado":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Agendado</Badge>;
    case "concluido":
      return <Badge variant="success">Concluído</Badge>;
    case "cancelado":
      return <Badge variant="destructive">Cancelado</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

export function AgendamentoCard({
  agendamento,
  cliente,
  funcionario,
  servico,
  onEdit,
}: AgendamentoCardProps) {
  const [isDeleting, startDelete] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const dataHora = new Date(agendamento.data_hora);
  const hora = format(dataHora, "HH:mm", { locale: ptBR });

  function handleStatusChange(
    status: "agendado" | "concluido" | "cancelado"
  ) {
    startDelete(async () => {
      const result = await updateAgendamentoStatus(agendamento.id, status);
      if (result.success) {
        toast.success(`Status atualizado para ${status}.`);
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDelete() {
    startDelete(async () => {
      const result = await deleteAgendamento(agendamento.id);
      if (result.success) {
        toast.success("Agendamento excluído.");
        setShowDeleteConfirm(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  const isFinalizado =
    agendamento.status === "concluido" ||
    agendamento.status === "cancelado";

  return (
    <>
      <Card className="relative">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 flex-col items-center justify-center rounded-md bg-primary/10 text-primary">
                <span className="text-lg font-bold leading-none">{hora}</span>
              </div>
              <div>
                <h3 className="font-semibold">{cliente?.nome ?? "Cliente"}</h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {funcionario?.nome ?? "Funcionário"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Scissors className="h-3.5 w-3.5" />
                    {servico?.nome ?? "Serviço"}
                  </span>
                </div>
              </div>
            </div>
            <StatusBadge status={agendamento.status} />
          </div>

          <div className="mt-3 flex items-center justify-between text-sm">
            <div className="flex items-center gap-3 text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {servico?.duracao_minutos ?? agendamento.duracao_minutos} min
              </span>
              <span className="font-medium text-foreground">
                {reais.format(agendamento.preco)}
              </span>
            </div>
            {agendamento.observacoes && (
              <span className="text-xs text-muted-foreground italic">
                {agendamento.observacoes}
              </span>
            )}
          </div>
        </CardContent>

        {!isFinalizado && (
          <CardFooter className="flex justify-end gap-1 border-t bg-muted/30 px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-green-600 hover:text-green-700"
              onClick={() => handleStatusChange("concluido")}
            >
              <CheckCircle2 className="h-4 w-4" />
              Concluir
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-red-500 hover:text-red-600"
              onClick={() => handleStatusChange("cancelado")}
            >
              <XCircle className="h-4 w-4" />
              Cancelar
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onEdit}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardFooter>
        )}

        {isFinalizado && (
          <CardFooter className="flex justify-end gap-1 border-t bg-muted/30 px-4 py-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onEdit}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardFooter>
        )}
      </Card>

      <AlertDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir agendamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o agendamento das{" "}
              <strong>{hora}</strong> com{" "}
              <strong>{cliente?.nome ?? "Cliente"}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
