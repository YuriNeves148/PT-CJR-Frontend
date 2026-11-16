"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ACEITAR_IMAGEM,
  ROTULOS_IMAGEM,
  enviarImagemLoja,
  type TipoImagemLoja,
} from "./enviarImagemLoja";

type Mensagem = { tipo: "sucesso" | "erro"; texto: string };

// Renderizado apenas para o proprietário da loja (verificado no servidor).
// A autorização definitiva continua sendo feita pelo backend.
export default function EditarImagensLoja({ lojaId }: { lojaId: number }) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="w-full bg-black px-4 pt-6 text-white md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col items-end gap-4">
        <button
          type="button"
          onClick={() => setAberto((valor) => !valor)}
          aria-expanded={aberto}
          className="cursor-pointer rounded-full bg-[#6A38F3] px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#5522D8]"
        >
          {aberto ? "Fechar edição" : "Editar imagens"}
        </button>

        {aberto && (
          <div className="grid w-full gap-3 rounded-[28px] bg-[#F8F5E9] p-5 text-black sm:grid-cols-3">
            {(["foto-perfil", "logo", "banner"] as const).map((tipo) => (
              <CampoImagem key={tipo} lojaId={lojaId} tipo={tipo} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CampoImagem({
  lojaId,
  tipo,
}: {
  lojaId: number;
  tipo: TipoImagemLoja;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState<Mensagem | null>(null);

  async function enviar(arquivo: File) {
    setEnviando(true);
    setMensagem(null);

    const resultado = await enviarImagemLoja(lojaId, tipo, arquivo);

    setEnviando(false);

    if (resultado.ok) {
      setMensagem({ tipo: "sucesso", texto: "Imagem atualizada." });
      router.refresh();
    } else {
      setMensagem({ tipo: "erro", texto: resultado.mensagem });
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={ACEITAR_IMAGEM[tipo]}
        className="sr-only"
        onChange={(evento) => {
          const arquivo = evento.target.files?.[0];
          evento.target.value = "";
          if (arquivo) enviar(arquivo);
        }}
      />

      <button
        type="button"
        disabled={enviando}
        onClick={() => inputRef.current?.click()}
        className="min-h-[70px] cursor-pointer rounded-xl border-2 border-dashed border-[#6A38F3] px-4 py-3 text-sm transition-colors hover:bg-purple-50 disabled:cursor-wait disabled:opacity-60"
      >
        {enviando
          ? "Enviando..."
          : `Alterar ${ROTULOS_IMAGEM[tipo].toLowerCase()}${
              tipo === "logo" ? " (SVG, PNG, JPG, JPEG ou WebP, até 2 MB)" : ""
            }`}
      </button>

      {mensagem && (
        <p
          role={mensagem.tipo === "erro" ? "alert" : "status"}
          className={`text-xs ${
            mensagem.tipo === "erro" ? "text-red-600" : "text-[#5E7A00]"
          }`}
        >
          {mensagem.texto}
        </p>
      )}
    </div>
  );
}
