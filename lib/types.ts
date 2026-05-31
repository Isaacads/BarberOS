export type Cliente = {
  id: string;
  barbearia_id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  observacoes: string | null;
  created_at: string;
};

export type Funcionario = {
  id: string;
  barbearia_id: string;
  nome: string;
  telefone: string | null;
  ativo: boolean;
  /** 0 = Domingo ... 6 = Sábado (padrão JS Date.getDay()) */
  dias_trabalho: number[];
  /** Formato HH:MM:SS vindo do Postgres (time) */
  hora_inicio: string | null;
  hora_fim: string | null;
  created_at: string;
};

export type Servico = {
  id: string;
  barbearia_id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  duracao_minutos: number;
  ativo: boolean;
  created_at: string;
};

export type Agendamento = {
  id: string;
  barbearia_id: string;
  cliente_id: string;
  funcionario_id: string;
  servico_id: string;
  data_hora: string;
  duracao_minutos: number;
  preco: number;
  status: "agendado" | "concluido" | "cancelado";
  observacoes: string | null;
  created_at: string;
};
