"use client";

import { useState, useMemo } from "react";
import { format, addDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, Filter } from "lucide-react";

import type { Agendamento, Cliente, Funcionario, Servico } from "@/lib/types";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AgendamentoCard } from "./agendamento-card";
import { AgendamentoFormDialog } from "./agendamento-form-dialog";

interface AgendamentosClientProps {
  agendamentos: Agendamento[];
  clientes: Cliente[];
  funcionarios: Funcionario[];
  servicos: Servico[];
  dataSelecionada: Date;
}

export function AgendamentosClient({
  agendamentos,
  clientes,
  funcionarios,
  servicos,
  dataSelecionada,
}: AgendamentosClientProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Agendamento | null>(null);
  const [filtroFuncionario, setFiltroFuncionario] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  const dataFormatada = format(dataSelecionada, "dd 'de' MMMM", {
    locale: ptBR,
  });
  const dataIso = format(dataSelecionada, "yyyy-MM-dd");

  const anterior = format(subDays(dataSelecionada, 1), "yyyy-MM-dd");
  const hoje = format(new Date(), "yyyy-MM-dd");
  const proximo = format(addDays(dataSelecionada, 1), "yyyy-MM-dd");

  const agendamentosFiltrados = useMemo(() => {
    return agendamentos.filter((a) => {
      const matchFuncionario =
        filtroFuncionario === "todos" || a.funcionario_id === filtroFuncionario;
      const matchStatus =
        filtroStatus === "todos" || a.status === filtroStatus;
      return matchFuncionario && matchStatus;
    });
  }, [agendamentos, filtroFuncionario, filtroStatus]);

  function handleEdit(ag: Agendamento) {
    setEditing(ag);
    setFormOpen(true);
  }

  function handleNew() {
    setEditing(null);
    setFormOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho com navegação de data */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
          <p className="text-muted-foreground">
            Gerencie os horários da sua barbearia.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <a href={`?data=${anterior}`}>
              <ChevronLeft className="h-4 w-4" />
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href={`?data=${hoje}`}>Hoje</a>
          </Button>
          <div className="min-w-[140px] text-center font-medium">
            {dataFormatada}
          </div>
          <Button variant="outline" size="icon" asChild>
            <a href={`?data=${proximo}`}>
              <ChevronRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filtrar:</span>
        </div>
        <Select value={filtroFuncionario} onValueChange={setFiltroFuncionario}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Funcionário" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos funcionários</SelectItem>
            {funcionarios
              .filter((f) => f.ativo)
              .map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.nome}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos status</SelectItem>
            <SelectItem value="agendado">Agendado</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de agendamentos */}
      <div className="space-y-3">
        {agendamentosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
            <p className="text-lg font-medium">Nenhum agendamento</p>
            <p className="text-sm text-muted-foreground">
              Não há agendamentos para este dia com os filtros selecionados.
            </p>
            <Button onClick={handleNew} className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Novo agendamento
            </Button>
          </div>
        ) : (
          agendamentosFiltrados.map((ag) => (
            <AgendamentoCard
              key={ag.id}
              agendamento={ag}
              cliente={clientes.find((c) => c.id === ag.cliente_id)}
              funcionario={funcionarios.find((f) => f.id === ag.funcionario_id)}
              servico={servicos.find((s) => s.id === ag.servico_id)}
              onEdit={() => handleEdit(ag)}
            />
          ))
        )}
      </div>

      {/* Botão flutuante */}
      <Button
        onClick={handleNew}
        className="fixed bottom-6 right-6 gap-2 shadow-lg"
        size="lg"
      >
        <Plus className="h-5 w-5" />
        Novo agendamento
      </Button>

      <AgendamentoFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        clientes={clientes}
        funcionarios={funcionarios}
        servicos={servicos}
        agendamento={
          editing
            ? {
                id: editing.id,
                cliente_id: editing.cliente_id,
                funcionario_id: editing.funcionario_id,
                servico_id: editing.servico_id,
                data_hora: editing.data_hora,
                observacoes: editing.observacoes,
              }
            : null
        }
      />
    </div>
  );
}
