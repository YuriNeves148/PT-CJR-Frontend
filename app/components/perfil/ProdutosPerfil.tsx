"use client";

import Link from "next/link";
import { useState } from "react";
import ProdutoCard, { type ProdutoLoja } from "@/app/components/loja/ProdutoCard";

// Quantos produtos aparecem antes de clicar em "Ver mais" (uma linha no desktop).
const LIMITE_PRODUTOS = 5;

export default function ProdutosPerfil({ produtos }: { produtos: ProdutoLoja[] }) {
  const [mostrarMais, setMostrarMais] = useState(false);
  const visiveis = mostrarMais ? produtos : produtos.slice(0, LIMITE_PRODUTOS);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-[#171917]">Produtos</h2>

        {produtos.length > LIMITE_PRODUTOS && (
          <button
            type="button"
            onClick={() => setMostrarMais(!mostrarMais)}
            aria-expanded={mostrarMais}
            className="cursor-pointer font-semibold text-[#7137f5] hover:underline"
          >
            {mostrarMais ? "Ver menos" : "Ver mais"}
          </button>
        )}
      </div>

      {produtos.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-8 pb-4">
          {visiveis.map((produto) => (
            <Link
              key={produto.id}
              href={`/produtos_logado?id=${produto.id}`}
              className="w-[205px] transition-opacity hover:opacity-80"
            >
              <ProdutoCard produto={produto} />
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-gray-600">Nenhum produto para exibir.</p>
      )}
    </div>
  );
}
