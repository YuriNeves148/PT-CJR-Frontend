"use client";

import { useEffect, useState } from "react";
import ProdutoModal from "./ProdutoModal";
import {
  atualizarProduto,
  deletarProduto,
  getProdutoPorId,
  type ProdutoDetalhe,
} from "@/app/service/produtoService";

interface EditarProdutoModalProps {
  produtoId: number;
  onFechar: () => void;
  onAlterado: () => void; // chamado depois de salvar ou deletar, ex: para recarregar a lista
}

// Uso: {produtoEditando && <EditarProdutoModal produtoId={produtoEditando} onFechar={...} onAlterado={...} />}
export default function EditarProdutoModal({ produtoId, onFechar, onAlterado }: EditarProdutoModalProps) {
  const [produto, setProduto] = useState<ProdutoDetalhe | null>(null);
  const [erro, setErro] = useState("");

  // Busca os dados atuais do produto para preencher o formulário
  useEffect(() => {
    getProdutoPorId(produtoId)
      .then(setProduto)
      .catch(() => setErro("Não foi possível carregar o produto."));
  }, [produtoId]);

  // Enquanto carrega (ou se der erro), mostra um aviso no lugar do formulário
  if (!produto) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        onMouseDown={(e) => e.target === e.currentTarget && onFechar()}
      >
        <div role="dialog" aria-modal="true" className="rounded-3xl bg-[#ececec] px-10 py-8 text-center">
          <p className={erro ? "text-[#d6003f]" : "text-[#6c3df0]"}>{erro || "Carregando produto..."}</p>
          {erro && (
            <button
              type="button"
              onClick={onFechar}
              className="mt-4 rounded-full bg-[#6c3df0] px-6 py-2 text-sm text-white"
            >
              Fechar
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <ProdutoModal
      titulo="Editar Produto"
      textoBotao="Salvar"
      valoresIniciais={{
        nome: produto.nome,
        categoria_id: produto.categoria_id,
        descricao: produto.descricao ?? "",
        preco: produto.preco,
        estoque: produto.estoque,
      }}
      onSalvar={async (dados) => {
        // Se der erro, o ProdutoModal mostra a mensagem e o modal continua aberto
        await atualizarProduto(produtoId, dados);
        // TODO (passo 8): enviar as fotos quando o CRUD de imagens estiver pronto
        onAlterado();
        onFechar();
      }}
      onDeletar={async () => {
        await deletarProduto(produtoId);
        onAlterado();
        onFechar();
      }}
      onFechar={onFechar}
    />
  );
}
