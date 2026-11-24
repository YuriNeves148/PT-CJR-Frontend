"use client";

import AvaliacaoModal from "./AvaliacaoModal";
import { criarAvaliacaoLoja } from "@/app/service/avaliacaoLojaService";

interface AdicionarAvaliacaoModalProps {
  lojaId: number; // loja que está sendo avaliada
  lojaNome: string; // a página da loja já tem o nome; aparece em "Você está avaliando <loja>"
  onFechar: () => void;
  onCriado: () => void; // chamado depois de salvar, ex: para recarregar a lista de avaliações
}

// Uso: {aberto && <AdicionarAvaliacaoModal lojaId={...} lojaNome={...} onFechar={...} onCriado={...} />}
export default function AdicionarAvaliacaoModal({ lojaId, lojaNome, onFechar, onCriado }: AdicionarAvaliacaoModalProps) {
  return (
    <AvaliacaoModal
      lojaNome={lojaNome}
      textoBotao="Avaliar"
      onSalvar={async (dados) => {
        // Se der erro, o AvaliacaoModal mostra a mensagem e continua aberto
        await criarAvaliacaoLoja(lojaId, dados);
        onCriado();
        onFechar();
      }}
      onFechar={onFechar}
    />
  );
}
