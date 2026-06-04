"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { criarBarbearia, type BarbeariaConfigInput } from "@/app/(dashboard)/configuracoes/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, Save } from "lucide-react";

export function CriarBarbeariaForm() {
  const router = useRouter();
  const [isSaving, startSave] = useTransition();

  const [form, setForm] = useState<BarbeariaConfigInput>({
    nome: "",
    slogan: "",
    telefone: "",
    endereco_completo: "",
    hora_abertura: "09:00",
    hora_fechamento: "19:00",
    intervalo_minutos: 30,
  });

  function handleSave() {
    startSave(async () => {
      const result = await criarBarbearia(form);
      if (result.success) {
        toast.success("Barbearia criada com sucesso!");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          Dados da barbearia
        </CardTitle>
        <CardDescription>
          Preencha as informações básicas da sua barbearia.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome">
            Nome da barbearia <span className="text-destructive">*</span>
          </Label>
          <Input
            id="nome"
            placeholder="Ex: Barbearia do João"
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="hora_abertura">Horário de abertura</Label>
            <Input
              id="hora_abertura"
              type="time"
              value={form.hora_abertura ?? "09:00"}
              onChange={(e) => setForm({ ...form, hora_abertura: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hora_fechamento">Horário de fechamento</Label>
            <Input
              id="hora_fechamento"
              type="time"
              value={form.hora_fechamento ?? "19:00"}
              onChange={(e) => setForm({ ...form, hora_fechamento: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? "Criando..." : "Criar barbearia"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
