"use client";

import { useEffect, useState, useTransition } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import type { Cliente, Funcionario, Servico } from "@/lib/types";
import {
  createAgendamento,
  updateAgendamento,
  getHorariosDisponiveis,
  type AgendamentoInput,
} from "@/app/(dashboard)/agendamentos/actions";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ClienteCombobox } from "./cliente-combobox";

interface AgendamentoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientes: Cliente[];
  funcionarios: Funcionario[];
  servicos: Servico[];
  agendamento?: {
    id: string;
    cliente_id: string;
    funcionario_id: string;
    servico_id: string;
    data_hora: string;
    observacoes: string | null;
  } | null;
}

export function AgendamentoFormDialog({
  open,
  onOpenChange,
  clientes,
  funcionarios,
  servicos,
  agendamento,
}: AgendamentoFormDialogProps) {
  const isEdit = !!agendamento;
  const [isPending, startTransition] = useTransition();

  const [clienteId, setClienteId] = useState("");
  const [funcionarioId, setFuncionarioId] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [horario, setHorario] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const funcionariosAtivos = funcionarios.filter((f) => f.ativo);
  const servicosAtivos = servicos.filter((s) => s.ativo);

  const servicoSelecionado = servicosAtivos.find((s) => s.id === servicoId);

  useEffect(() => {
    if (open && agendamento) {
      setClienteId(agendamento.cliente_id);
      setFuncionarioId(agendamento.funcionario_id);
      setServicoId(agendamento.servico_id);
      const dt = new Date(agendamento.data_hora);
      setDate(dt);
      setHorario(
        dt.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
      setObservacoes(agendamento.observacoes ?? "");
    } else if (open) {
      setClienteId("");
      setFuncionarioId("");
      setServicoId("");
      setDate(undefined);
      setHorario("");
      setObservacoes("");
      setSlots([]);
    }
  }, [open, agendamento]);

  // Busca slots disponíveis quando funcionário, serviço ou data mudam
  useEffect(() => {
    if (!funcionarioId || !servicoSelecionado || !date) {
      setSlots([]);
      return;
    }

    setLoadingSlots(true);
    const dataStr = format(date, "yyyy-MM-dd");

    getHorariosDisponiveis(
      funcionarioId,
      dataStr,
      servicoSelecionado.duracao_minutos
    ).then((result) => {
      setLoadingSlots(false);
      if (result.success) {
        setSlots(result.slots);
        // Se o horário atual não está mais disponível (exceto no modo edição do mesmo agendamento)
        if (horario && !result.slots.includes(horario) && !isEdit) {
          setHorario("");
        }
      } else {
        toast.error(result.error);
        setSlots([]);
      }
    });
  }, [funcionarioId, servicoId, date, servicoSelecionado]);

  const clienteOptions = clientes.map((c) => ({
    value: c.id,
    label: c.nome,
  }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clienteId || !funcionarioId || !servicoId || !date || !horario) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    const [h, m] = horario.split(":").map(Number);
    const dataHora = new Date(date);
    dataHora.setHours(h, m, 0, 0);

    const input: AgendamentoInput = {
      cliente_id: clienteId,
      funcionario_id: funcionarioId,
      servico_id: servicoId,
      data_hora: dataHora.toISOString(),
      observacoes: observacoes || null,
    };

    startTransition(async () => {
      const result = isEdit
        ? await updateAgendamento(agendamento!.id, input)
        : await createAgendamento(input);

      if (result.success) {
        toast.success(
          isEdit
            ? "Agendamento atualizado com sucesso."
            : "Agendamento criado com sucesso."
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
          <DialogTitle>
            {isEdit ? "Editar agendamento" : "Novo agendamento"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do agendamento.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cliente */}
          <div className="space-y-2">
            <Label>
              Cliente <span className="text-destructive">*</span>
            </Label>
            <ClienteCombobox
              options={clienteOptions}
              value={clienteId}
              onChange={setClienteId}
              disabled={isPending}
            />
          </div>

          {/* Funcionário */}
          <div className="space-y-2">
            <Label>
              Funcionário <span className="text-destructive">*</span>
            </Label>
            <Select
              value={funcionarioId}
              onValueChange={setFuncionarioId}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {funcionariosAtivos.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Serviço */}
          <div className="space-y-2">
            <Label>
              Serviço <span className="text-destructive">*</span>
            </Label>
            <Select
              value={servicoId}
              onValueChange={setServicoId}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {servicosAtivos.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nome} —{" "}
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(s.preco)}
                    {" "}({s.duracao_minutos}min)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data */}
          <div className="space-y-2">
            <Label>
              Data <span className="text-destructive">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                  disabled={isPending}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date
                    ? format(date, "dd/MM/yyyy", { locale: ptBR })
                    : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Horário */}
          <div className="space-y-2">
            <Label>
              Horário <span className="text-destructive">*</span>
            </Label>
            {loadingSlots ? (
              <div className="flex h-10 items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Buscando horários...
              </div>
            ) : slots.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {!funcionarioId || !servicoId || !date
                  ? "Selecione funcionário, serviço e data para ver os horários."
                  : "Nenhum horário disponível para esta combinação."}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {slots.map((slot) => (
                  <Button
                    key={slot}
                    type="button"
                    variant={horario === slot ? "default" : "outline"}
                    size="sm"
                    onClick={() => setHorario(slot)}
                    disabled={isPending}
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
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
