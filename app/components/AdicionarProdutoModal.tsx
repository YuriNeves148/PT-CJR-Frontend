"use client";

import { useRef } from "react";
import ProdutoModal from "./ProdutoModal";
import { atualizarProduto, criarProduto, salvarFotosProduto } from "@/app/service/produtoService";

interface AdicionarProdutoModalProps {
  lojaId: number; // loja em que o produto será criado
  onFechar: () => void;
  onCriado: () => void; // chamado depois de salvar, ex: para recarregar a lista
  categoriaLojaId?: number | null; // limita a categoria do produto à da loja
}

// Uso: {aberto && <AdicionarProdutoModal lojaId={...} onFechar={...} onCriado={...} />}
export default function AdicionarProdutoModal({ lojaId, onFechar, onCriado, categoriaLojaId }: AdicionarProdutoModalProps) {
  // Se o produto for criado mas alguma foto falhar, o modal continua aberto com o erro.
  // Estes refs evitam criar o produto (e as fotos já enviadas) de novo quando o usuário tentar outra vez.
  const produtoCriadoId = useRef<number | null>(null);
  const fotosEnviadas = useRef(new Set<number>());

  // Se o usuário fechar depois de um erro nas fotos, o produto já existe: avisa a página mesmo assim
  const fechar = () => {
    if (produtoCriadoId.current !== null) onCriado();
    onFechar();
  };

  return (
    <ProdutoModal
      titulo="Adicionar Produto"
      textoBotao="Adicionar"
      onSalvar={async (dados, fotos) => {
        // 1. Cria o produto (ou, numa nova tentativa, só atualiza o que já foi criado)
        if (produtoCriadoId.current === null) {
          const produto = await criarProduto(lojaId, dados);
          produtoCriadoId.current = produto.id;
        } else {
          await atualizarProduto(produtoCriadoId.current, dados);
        }

        // 2. Envia as fotos para o produto criado
        try {
          await salvarFotosProduto(produtoCriadoId.current, fotos, fotosEnviadas.current);
        } catch (erro) {
          const motivo = erro instanceof Error ? erro.message : "";
          throw new Error(`O produto foi criado, mas uma foto não foi enviada. ${motivo} Tente salvar de novo.`);
        }

        fechar();
      }}
      onFechar={fechar}
      categoriaLojaId={categoriaLojaId}
    />
  );
}
