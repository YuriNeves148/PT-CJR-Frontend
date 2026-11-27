"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdicionarAvaliacaoModal from "@/app/components/AdicionarAvaliacaoModal";
import { ROTULO_AVALIACAO, type TipoAvaliacao } from "@/app/service/avaliacoes";

type AdicionarAvaliacaoBotaoProps = {
  tipo?: TipoAvaliacao;
  alvoId: number;
  nome: string;
  logado: boolean;
};

const ESTILO_BOTAO =
  "flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#6A38F3] text-white transition-colors hover:bg-[#5522D8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6A38F3] active:bg-[#481BB8]";

function IconeMais() {
  return (
    <svg width="36" height="36" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M16 4v24M4 16h24" />
    </svg>
  );
}

// Sem login, leva para a tela de login (o backend exige usuário para avaliar).
export default function AdicionarAvaliacaoBotao({ tipo = "loja", alvoId, nome, logado }: AdicionarAvaliacaoBotaoProps) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const rotulo = ROTULO_AVALIACAO[tipo];

  if (!logado) {
    return (
      <Link href="/login" aria-label={`Entre para avaliar ${rotulo.artigo} ${rotulo.nome}`} className={ESTILO_BOTAO}>
        <IconeMais />
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        aria-label={`Avaliar ${rotulo.nome}`}
        aria-haspopup="dialog"
        aria-expanded={aberto}
        onClick={() => setAberto(true)}
        className={ESTILO_BOTAO}
      >
        <IconeMais />
      </button>

      {aberto && (
        <AdicionarAvaliacaoModal
          tipo={tipo}
          alvoId={alvoId}
          nome={nome}
          onFechar={() => setAberto(false)}
          onCriado={() => router.refresh()}
        />
      )}
    </>
  );
}
