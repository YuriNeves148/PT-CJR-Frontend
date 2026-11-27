"use client";

import Image from "next/image";
import { useState } from "react";

type GaleriaProdutoProps = {
  nome: string;
  imagens: { id: number; url: string }[];
};

export default function GaleriaProduto({ nome, imagens }: GaleriaProdutoProps) {
  const [selecionada, setSelecionada] = useState(0);
  const atual = imagens[selecionada] ?? imagens[0];

  if (!atual) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-[32px] bg-white text-gray-400">
        Produto sem imagem
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {imagens.length > 1 && (
        <ul
          aria-label="Fotos do produto"
          className="flex shrink-0 gap-3 overflow-x-auto p-1 sm:max-h-[560px] sm:flex-col sm:overflow-y-auto sm:overflow-x-hidden"
        >
          {imagens.map((imagem, indice) => (
            <li key={imagem.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setSelecionada(indice)}
                aria-label={`Ver foto ${indice + 1} de ${imagens.length}`}
                aria-current={indice === selecionada}
                className={`relative block h-20 w-20 cursor-pointer overflow-hidden rounded-2xl bg-white ring-2 transition sm:h-24 sm:w-24 ${
                  indice === selecionada
                    ? "ring-[#6A38F3]"
                    : "ring-transparent hover:ring-[#6A38F3]/40"
                }`}
              >
                <Image src={imagem.url} alt="" fill unoptimized sizes="96px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="relative aspect-square w-full overflow-hidden rounded-[32px] bg-white">
        <Image
          src={atual.url}
          alt={nome}
          fill
          unoptimized
          priority
          sizes="(min-width: 1024px) 560px, 100vw"
          className="object-contain"
        />
      </div>
    </div>
  );
}
