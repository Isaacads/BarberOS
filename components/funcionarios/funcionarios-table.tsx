"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { Funcionario } from "@/lib/types";
import { deleteFuncionario } from "@/app/(dashboard)/funcionarios/actions";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { FuncionarioFormDialog } from "./funcionario-form-dialog";
import { formatDias, formatHorario } from "./dias-semana";

interface FuncionariosTableProps {
  funcionarios: Funcionario[];
}

export function FuncionariosTable({ funcionarios }: FuncionariosTableProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Funcionario | null>(null);
  const [toDelete, setToDelete] = useState<Funcionario | null>(null);
  const [isDeleting, startDelete] = useTransition();

  function handleNew() {
    setEditing(null);
    setFormOpen(true);
  }

  function handleEdit(funcionario: Funcionario) {
    setEditing(funcionario);
    setFormOpen(true);
  }

  function confirmDelete() {
    if (!toDelete) return;
    const target = toDelete;
    startDelete(async () => {
      const result = await deleteFuncionario(target.id);
      if (result.success) {
        toast.success("Funcionário excluído com sucesso.");
        setToDelete(null);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={handleNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo funcionário
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Horário</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {funcionarios.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  Nenhum funcionário cadastrado ainda.
                </TableCell>
              </TableRow>
            ) : (
              funcionarios.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">{f.nome}</TableCell>
                  <TableCell>{f.telefone || "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{formatHorario(f.hora_inicio, f.hora_fim)}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDias(f.dias_trabalho)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {f.ativo ? (
                      <Badge variant="success">Ativo</Badge>
                    ) : (
                      <Badge variant="muted">Inativo</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(f)}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setToDelete(f)}
                        title="Excluir"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <FuncionarioFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        funcionario={editing}
      />

      <AlertDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir funcionário?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir{" "}
              <strong>{toDelete?.nome}</strong>? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
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
