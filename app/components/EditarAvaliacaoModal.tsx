"use client";

import { useEffect, useState } from "react";
import AvaliacaoModal, { AvisoCarregando } from "./AvaliacaoModal";
import {
  atualizarAvaliacaoLoja,
  deletarAvaliacaoLoja,
  getAvaliacaoLoja,
  type AvaliacaoLojaDetalhe,
} from "@/app/service/avaliacaoLojaService";

interface EditarAvaliacaoModalProps {
  avaliacaoId: number;
  lojaNome: string; // a página da loja já tem o nome; aparece em "Você está avaliando <loja>"
  onFechar: () => void;
  onAlterado: () => void; // chamado depois de salvar ou deletar, ex: para recarregar a lista
  // Se for passado, é chamado depois de deletar no lugar de onAlterado
  // (ex: a página da própria avaliação precisa sair dela, e não recarregar)
  onDeletado?: () => void;
}

// Uso: {avaliacaoEditando && <EditarAvaliacaoModal avaliacaoId={avaliacaoEditando} lojaNome={...} onFechar={...} onAlterado={...} />}
// Só o autor consegue salvar ou deletar: para outra pessoa o backend responde 403 e o modal mostra o erro.
export default function EditarAvaliacaoModal({
  avaliacaoId,
  lojaNome,
  onFechar,
  onAlterado,
  onDeletado,
}: EditarAvaliacaoModalProps) {
  const [avaliacao, setAvaliacao] = useState<AvaliacaoLojaDetalhe | null>(null);
  const [erro, setErro] = useState("");

  // Busca a avaliação atual para preencher as estrelas e o texto
  useEffect(() => {
    getAvaliacaoLoja(avaliacaoId)
      .then(setAvaliacao)
      .catch(() => setErro("Não foi possível carregar a avaliação."));
  }, [avaliacaoId]);

  if (!avaliacao) {
    return <AvisoCarregando erro={erro} texto="Carregando avaliação..." onFechar={onFechar} />;
  }

  return (
    <AvaliacaoModal
      lojaNome={lojaNome}
      textoBotao="Salvar"
      valoresIniciais={{ nota: avaliacao.nota, comentario: avaliacao.comentario }}
      onSalvar={async (novosDados) => {
        await atualizarAvaliacaoLoja(avaliacaoId, novosDados);
        onAlterado();
        onFechar();
      }}
      onDeletar={async () => {
        // Os comentários feitos nessa avaliação são apagados junto (onDelete: Cascade no schema)
        await deletarAvaliacaoLoja(avaliacaoId);
        onFechar();
        if (onDeletado) onDeletado();
        else onAlterado();
      }}
      onFechar={onFechar}
    />
  );
}
