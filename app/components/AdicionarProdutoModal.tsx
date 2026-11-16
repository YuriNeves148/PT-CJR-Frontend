"use client";

import ProdutoModal from "./ProdutoModal";
import { criarProduto } from "@/app/service/produtoService";

interface AdicionarProdutoModalProps {
  lojaId: number; // loja em que o produto será criado
  onFechar: () => void;
  onCriado: () => void; // chamado depois de salvar, ex: para recarregar a lista
}

// Uso: {aberto && <AdicionarProdutoModal lojaId={...} onFechar={...} onCriado={...} />}
export default function AdicionarProdutoModal({ lojaId, onFechar, onCriado }: AdicionarProdutoModalProps) {
  return (
    <ProdutoModal
      titulo="Adicionar Produto"
      textoBotao="Adicionar"
      onSalvar={async (dados) => {
        // Se der erro, o ProdutoModal mostra a mensagem e o modal continua aberto
        await criarProduto(lojaId, dados);
        // TODO (passo 8): enviar as fotos quando o CRUD de imagens estiver pronto
        onCriado();
        onFechar();
      }}
      onFechar={onFechar}
    />
  );
}
