"use client";

import { useEffect, useRef, useState } from "react";
import ProdutoModal from "./ProdutoModal";
import {
  atualizarProduto,
  deletarProduto,
  getProdutoPorId,
  salvarFotosProduto,
  type ProdutoDetalhe,
} from "@/app/service/produtoService";

interface EditarProdutoModalProps {
  produtoId: number;
  onFechar: () => void;
  onAlterado: () => void; // chamado depois de salvar ou deletar, ex: para recarregar a lista
  onDeletado?: () => void; // se for passado, substitui onAlterado depois de deletar
}

// Uso: {produtoEditando && <EditarProdutoModal produtoId={produtoEditando} onFechar={...} onAlterado={...} />}
export default function EditarProdutoModal({ produtoId, onFechar, onAlterado, onDeletado }: EditarProdutoModalProps) {
  const [produto, setProduto] = useState<ProdutoDetalhe | null>(null);
  const [erro, setErro] = useState("");
  // Se uma foto falhar e o usuário tentar de novo, as fotos que já foram não são enviadas outra vez
  const fotosEnviadas = useRef(new Set<number>());
  // Se os dados foram salvos e o usuário fechar depois de um erro nas fotos, a página ainda precisa atualizar
  const salvouAlgo = useRef(false);

  const fechar = () => {
    if (salvouAlgo.current) onAlterado();
    onFechar();
  };

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
      fotosIniciais={produto.imagens}
      onSalvar={async (dados, fotos) => {
        // Se der erro, o ProdutoModal mostra a mensagem e o modal continua aberto
        await atualizarProduto(produtoId, dados);
        salvouAlgo.current = true;

        // Fotos: espaços com foto salva e arquivo novo são trocados; espaços vazios com arquivo novo são adicionados
        try {
          await salvarFotosProduto(produtoId, fotos, fotosEnviadas.current);
        } catch (erro) {
          const motivo = erro instanceof Error ? erro.message : "";
          throw new Error(`Os dados foram salvos, mas uma foto não foi enviada. ${motivo} Tente salvar de novo.`);
        }

        fechar();
      }}
      onDeletar={async () => {
        // O banco apaga os registros das fotos junto com o produto (onDelete: Cascade no schema)
        await deletarProduto(produtoId);
        if (onDeletado) {
          onFechar();
          onDeletado();
          return;
        }
        salvouAlgo.current = true;
        fechar();
      }}
      onFechar={fechar}
    />
  );
}
