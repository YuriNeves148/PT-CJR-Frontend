"use client";

import Image from "next/image";
import { useState } from "react";
import SeloLoja from "@/app/components/loja/SeloLoja";

const SEM_IMAGEM = "/img_feed/adicione_imagem.png";

type GaleriaProdutoProps = {
  nome: string;
  imagens: string[];
  loja?: { nome: string; logoUrl: string | null } | null; // selo da loja na imagem em destaque
};

// Miniaturas à esquerda e a imagem escolhida em destaque.
export default function GaleriaProduto({ nome, imagens, loja }: GaleriaProdutoProps) {
  const [escolhida, setEscolhida] = useState(0);
  const lista = imagens.length > 0 ? imagens : [SEM_IMAGEM];
  // Se uma foto for removida na edição, volta para a primeira.
  const atual = lista[escolhida] ?? lista[0];

  return (
    <>
      <div className="flex shrink-0 gap-2 overflow-auto lg:h-160 lg:flex-col">
        {lista.map((url, indice) => (
          <button
            key={url}
            type="button"
            onClick={() => setEscolhida(indice)}
            aria-label={`Ver imagem ${indice + 1} de ${nome}`}
            aria-pressed={url === atual}
            className={`shrink-0 cursor-pointer rounded-4xl border-2 p-1 ${
              url === atual ? "border-[#7137f5]" : "border-transparent"
            }`}
          >
            <Image
              src={url}
              alt=""
              width={173}
              height={173}
              unoptimized
              className="h-24 w-24 rounded-4xl bg-white object-contain xl:h-40 xl:w-40"
            />
          </button>
        ))}
      </div>

      <div className="relative min-w-0 lg:w-150 lg:shrink">
        <Image
          src={atual}
          alt={nome}
          width={600}
          height={600}
          unoptimized
          className="aspect-square w-full rounded-4xl bg-white object-contain p-1"
        />
        {loja && (
          <SeloLoja nome={loja.nome} logoUrl={loja.logoUrl} tamanho="h-11 w-11" posicao="right-5 top-5" />
        )}
      </div>
    </>
  );
}
