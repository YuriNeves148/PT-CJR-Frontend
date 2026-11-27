"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdicionarProdutoModal from "@/app/components/AdicionarProdutoModal";

type AdicionarProdutoBotaoProps = {
  lojaId: number;
  categoriaLojaId: number | null;
};

// A página do servidor renderiza este botão apenas para o proprietário.
export default function AdicionarProdutoBotao({
  lojaId,
  categoriaLojaId,
}: AdicionarProdutoBotaoProps) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={aberto}
        onClick={() => setAberto(true)}
        className="cursor-pointer rounded-full bg-[#6A38F3] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#5522D8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6A38F3] active:bg-[#481BB8]"
      >
        Adicionar produto
      </button>
      {aberto && (
        <AdicionarProdutoModal
          lojaId={lojaId}
          categoriaLojaId={categoriaLojaId}
          onFechar={() => setAberto(false)}
          // Busca a loja de novo no servidor para o produto novo aparecer na lista
          onCriado={() => router.refresh()}
        />
      )}
    </>
  );
}
