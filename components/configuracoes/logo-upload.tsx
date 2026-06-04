"use client";

import { useRef, useState, useTransition } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";

import { uploadLogo } from "@/app/(dashboard)/configuracoes/actions";
import { Button } from "@/components/ui/button";

interface LogoUploadProps {
  currentUrl?: string | null;
  barbeariaNome: string;
}

export function LogoUpload({ currentUrl, barbeariaNome }: LogoUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, startUpload] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(selected.type)) {
      toast.error("Formato inválido. Use JPG, PNG ou WEBP.");
      return;
    }

    if (selected.size > 2 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 2MB.");
      return;
    }

    setFile(selected);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(selected);
  }

  function handleUpload() {
    if (!file) return;

    startUpload(async () => {
      const formData = new FormData();
      formData.append("logo", file);

      const result = await uploadLogo(formData);

      if (result.success) {
        toast.success("Logo atualizada com sucesso!");
        setFile(null);
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleCancel() {
    setFile(null);
    setPreview(currentUrl || null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const iniciais = barbeariaNome
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {/* Preview */}
        <div className="relative h-24 w-24 rounded-xl border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden bg-muted">
          {preview ? (
            <img
              src={preview}
              alt="Logo"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-muted-foreground">
              {iniciais}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileSelect}
          />

          {!file ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              Trocar logo
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                size="sm"
                className="gap-2"
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? "Enviando..." : "Confirmar upload"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={isUploading}
              >
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            JPG, PNG ou WEBP. Máx 2MB.
          </p>
        </div>
      </div>
    </div>
  );
}
