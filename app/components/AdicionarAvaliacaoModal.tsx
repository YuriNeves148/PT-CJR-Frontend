"use client";

import AvaliacaoModal from "./AvaliacaoModal";
import { servicosAvaliacao, type TipoAvaliacao } from "@/app/service/avaliacoes";

interface AdicionarAvaliacaoModalProps {
  tipo?: TipoAvaliacao;
  alvoId: number; // id da loja ou do produto avaliado
  nome: string; // aparece em "Você está avaliando <nome>"
  onFechar: () => void;
  onCriado: () => void;
}

// Uso: {aberto && <AdicionarAvaliacaoModal alvoId={...} nome={...} onFechar={...} onCriado={...} />}
export default function AdicionarAvaliacaoModal({
  tipo = "loja",
  alvoId,
  nome,
  onFechar,
  onCriado,
}: AdicionarAvaliacaoModalProps) {
  return (
    <AvaliacaoModal
      tipo={tipo}
      nome={nome}
      textoBotao="Avaliar"
      onSalvar={async (dados) => {
        await servicosAvaliacao[tipo].criar(alvoId, dados);
        onCriado();
        onFechar();
      }}
      onFechar={onFechar}
    />
  );
}
