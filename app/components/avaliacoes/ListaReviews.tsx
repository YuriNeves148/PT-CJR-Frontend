"use client";

import Link from "next/link";
import { useState } from "react";
import AvatarUsuario from "@/app/components/loja/AvatarUsuario";
import { Estrelas } from "@/app/components/loja/LojaAvaliacoes";

export type Review = {
  chave: string;
  titulo: string;
  href: string;
  autor: string;
  fotoUrl: string | null;
  nota: number;
  comentario: string;
};

type ListaReviewsProps = {
  titulo: string;
  reviews: Review[] | null; // null = não foi possível carregar
  textoVazio: string;
};

// Quantas avaliações aparecem antes de clicar em "Ver mais".
const LIMITE_REVIEWS = 4;

export default function ListaReviews({ titulo, reviews, textoVazio }: ListaReviewsProps) {
  const [mostrarMais, setMostrarMais] = useState(false);
  const lista = reviews ?? [];
  const visiveis = mostrarMais ? lista : lista.slice(0, LIMITE_REVIEWS);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-[#171917]">{titulo}</h2>

        {lista.length > LIMITE_REVIEWS && (
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

      {lista.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {visiveis.map((review) => (
            <article
              key={review.chave}
              className="flex min-h-45 min-w-0 gap-5 rounded-2xl bg-white p-6 text-black shadow-sm"
            >
              <AvatarUsuario nome={review.autor} fotoUrl={review.fotoUrl} tamanho="h-20 w-20 text-3xl" />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link href={review.href} className="min-w-0 break-words text-xl font-bold hover:underline">
                    {review.titulo}
                  </Link>
                  <Estrelas nota={review.nota} tamanho="text-2xl" corVazia="text-gray-300" />
                </div>
                <p className="mt-2 break-words whitespace-pre-line text-gray-700">
                  {review.comentario || "Sem comentário."}
                </p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-gray-600">
          {reviews ? textoVazio : "Não foi possível carregar as avaliações."}
        </p>
      )}
    </div>
  );
}
