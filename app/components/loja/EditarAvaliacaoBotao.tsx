"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EditarAvaliacaoModal from "@/app/components/EditarAvaliacaoModal";
import type { TipoAvaliacao } from "@/app/service/avaliacoes";

type EditarAvaliacaoBotaoProps = {
  tipo?: TipoAvaliacao;
  avaliacaoId: number;
  nome: string;
  voltarPara: string; // página aberta depois de deletar a avaliação
};

// A página só renderiza este botão para o autor da avaliação.
export default function EditarAvaliacaoBotao({ tipo = "loja", avaliacaoId, nome, voltarPara }: EditarAvaliacaoBotaoProps) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Editar avaliação"
        aria-haspopup="dialog"
        aria-expanded={aberto}
        onClick={() => setAberto(true)}
        className="cursor-pointer rounded-full p-1 text-white hover:opacity-70 focus-visible:outline-2 focus-visible:outline-[#6A38F3]"
      >
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </button>

      {aberto && (
        <EditarAvaliacaoModal
          tipo={tipo}
          avaliacaoId={avaliacaoId}
          nome={nome}
          onFechar={() => setAberto(false)}
          onAlterado={() => router.refresh()}
          onDeletado={() => {
            router.push(voltarPara);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
