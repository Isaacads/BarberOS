"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateBarbeariaConfig, resetPassword, type BarbeariaConfigInput } from "@/app/(dashboard)/configuracoes/actions";
import { LogoUpload } from "@/components/configuracoes/logo-upload";
import { InputTelefone } from "@/components/ui/input-telefone";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, Save, Store, Clock, Image, Settings } from "lucide-react";

interface ConfiguracoesClientProps {
  barbearia: {
    id: string;
    nome: string;
    slogan: string | null;
    telefone: string | null;
    endereco_completo: string | null;
    logo_url: string | null;
    hora_abertura: string | null;
    hora_fechamento: string | null;
    intervalo_minutos: number | null;
  };
  userEmail: string;
}

const INTERVALOS = [15, 20, 30, 45, 60];

export function ConfiguracoesClient({ barbearia, userEmail }: ConfiguracoesClientProps) {
  const [isSaving, startSave] = useTransition();
  const [isResetting, startReset] = useTransition();

  const [form, setForm] = useState<BarbeariaConfigInput>({
    nome: barbearia.nome,
    slogan: barbearia.slogan ?? "",
    telefone: barbearia.telefone ?? "",
    endereco_completo: barbearia.endereco_completo ?? "",
    hora_abertura: barbearia.hora_abertura?.slice(0, 5) ?? "09:00",
    hora_fechamento: barbearia.hora_fechamento?.slice(0, 5) ?? "19:00",
    intervalo_minutos: barbearia.intervalo_minutos ?? 30,
  });

  function handleSave() {
    startSave(async () => {
      const result = await updateBarbeariaConfig(form);
      if (result.success) {
        toast.success("Configurações salvas com sucesso!");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleResetPassword() {
    startReset(async () => {
      const result = await resetPassword();
      if (result.success) {
        toast.success("E-mail de redefinição enviado! Verifique sua caixa de entrada.");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie os dados da sua barbearia e preferências do sistema.
        </p>
      </header>

      {/* 1. Dados da barbearia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Dados da barbearia
          </CardTitle>
          <CardDescription>
            Informações básicas exibidas no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">
              Nome <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nome"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slogan">Slogan</Label>
            <Input
              id="slogan"
              placeholder='Ex: "O melhor corte da cidade"'
              value={form.slogan ?? ""}
              onChange={(e) => setForm({ ...form, slogan: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <InputTelefone
              id="telefone"
              value={form.telefone ?? ""}
              onChange={(v) => setForm({ ...form, telefone: v })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço completo</Label>
            <Textarea
              id="endereco"
              placeholder="Rua, número, bairro, cidade, estado"
              rows={3}
              value={form.endereco_completo ?? ""}
              onChange={(e) =>
                setForm({ ...form, endereco_completo: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 2. Logo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Logo da barbearia
          </CardTitle>
          <CardDescription>
            Imagem exibida no dashboard e relatórios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LogoUpload
            currentUrl={barbearia.logo_url}
            barbeariaNome={barbearia.nome}
          />
        </CardContent>
      </Card>

      {/* 3. Horário de funcionamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horário de funcionamento
          </CardTitle>
          <CardDescription>
            Horário padrão usado ao cadastrar novos funcionários.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hora_abertura">Abertura</Label>
              <Input
                id="hora_abertura"
                type="time"
                value={form.hora_abertura ?? "09:00"}
                onChange={(e) =>
                  setForm({ ...form, hora_abertura: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hora_fechamento">Fechamento</Label>
              <Input
                id="hora_fechamento"
                type="time"
                value={form.hora_fechamento ?? "19:00"}
                onChange={(e) =>
                  setForm({ ...form, hora_fechamento: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 4. Intervalo padrão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Intervalo padrão
          </CardTitle>
          <CardDescription>
            Duração mínima entre agendamentos ao gerar slots de horário.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Duração mínima do slot</Label>
            <Select
              value={String(form.intervalo_minutos ?? 30)}
              onValueChange={(v) =>
                setForm({ ...form, intervalo_minutos: Number(v) })
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INTERVALOS.map((i) => (
                  <SelectItem key={i} value={String(i)}>
                    {i} minutos
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 5. Conta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Conta
          </CardTitle>
          <CardDescription>
            Gerencie sua conta de acesso.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                value={userEmail}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={handleResetPassword}
              disabled={isResetting}
            >
              {isResetting ? "Enviando..." : "Alterar senha"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
