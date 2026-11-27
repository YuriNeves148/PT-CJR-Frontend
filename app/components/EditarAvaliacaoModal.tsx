"use client";

import { useEffect, useState } from "react";
import AvaliacaoModal, { AvisoCarregando } from "./AvaliacaoModal";
import type { AvaliacaoFormData } from "@/app/service/avaliacaoLojaService";
import { servicosAvaliacao, type TipoAvaliacao } from "@/app/service/avaliacoes";

interface EditarAvaliacaoModalProps {
  tipo?: TipoAvaliacao;
  avaliacaoId: number;
  nome: string; // aparece em "Você está avaliando <nome>"
  onFechar: () => void;
  onAlterado: () => void;
  // Se for passado, substitui onAlterado depois de deletar (ex: sair da página da avaliação)
  onDeletado?: () => void;
}

// Só o autor consegue salvar ou deletar: para outra pessoa o backend responde 403 e o modal mostra o erro.
export default function EditarAvaliacaoModal({
  tipo = "loja",
  avaliacaoId,
  nome,
  onFechar,
  onAlterado,
  onDeletado,
}: EditarAvaliacaoModalProps) {
  const [avaliacao, setAvaliacao] = useState<AvaliacaoFormData | null>(null);
  const [erro, setErro] = useState("");
  const servico = servicosAvaliacao[tipo];

  useEffect(() => {
    servico
      .buscar(avaliacaoId)
      .then(setAvaliacao)
      .catch(() => setErro("Não foi possível carregar a avaliação."));
  }, [servico, avaliacaoId]);

  if (!avaliacao) {
    return <AvisoCarregando erro={erro} texto="Carregando avaliação..." onFechar={onFechar} />;
  }

  return (
    <AvaliacaoModal
      tipo={tipo}
      nome={nome}
      textoBotao="Salvar"
      valoresIniciais={{ nota: avaliacao.nota, comentario: avaliacao.comentario }}
      onSalvar={async (novosDados) => {
        await servico.atualizar(avaliacaoId, novosDados);
        onAlterado();
        onFechar();
      }}
      onDeletar={async () => {
        await servico.deletar(avaliacaoId);
        onFechar();
        if (onDeletado) onDeletado();
        else onAlterado();
      }}
      onFechar={onFechar}
    />
  );
}
