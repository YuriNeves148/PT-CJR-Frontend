
"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Estrelas,
  type AvaliacaoLoja,
} from "./LojaAvaliacoes";

type ListaAvaliacoesProps = {
  avaliacoes: AvaliacaoLoja[];
  lojaId: number;
};

const AVALIACOES_POR_PAGINA = 3;

export default function ListaAvaliacoes({
  avaliacoes,
  lojaId,
}: ListaAvaliacoesProps) {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [expandidas, setExpandidas] = useState<number[]>([]);

  const totalPaginas = Math.ceil(
    avaliacoes.length / AVALIACOES_POR_PAGINA
  );

  const paginaSegura = Math.min(
    paginaAtual,
    Math.max(1, totalPaginas)
  );

  const inicio =
    (paginaSegura - 1) * AVALIACOES_POR_PAGINA;

  const avaliacoesVisiveis = avaliacoes.slice(
    inicio,
    inicio + AVALIACOES_POR_PAGINA
  );

  function mudarPagina(pagina: number) {
    if (pagina < 1 || pagina > totalPaginas) return;

    setPaginaAtual(pagina);
    setExpandidas([]);
  }

  function alternarComentario(id: number) {
    setExpandidas((anteriores) =>
      anteriores.includes(id)
        ? anteriores.filter((valor) => valor !== id)
        : [...anteriores, id]
    );
  }

  return (
    <div className="mx-auto w-full max-w-[760px]">
      {avaliacoesVisiveis.length === 0 ? (
        <p className="py-12 text-center text-gray-400">
          Esta loja ainda não possui avaliações.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {avaliacoesVisiveis.map((avaliacao) => {
            const expandida = expandidas.includes(avaliacao.id);

            return (
              <article
                key={avaliacao.id}
                className="flex min-h-[150px] gap-4 rounded-[28px] bg-[#F8F5E9] p-5 text-black sm:gap-5 sm:p-6"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 sm:h-24 sm:w-24">
                  {avaliacao.fotoUrl ? (
                    <img
                      src={avaliacao.fotoUrl}
                      alt={`Foto de ${avaliacao.nome}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl text-gray-600">
                      {avaliacao.nome.charAt(0)}
                    </span>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-medium sm:text-xl">
                      {avaliacao.nome}
                    </h3>

                    <Estrelas
                      nota={avaliacao.nota}
                      tamanho="text-xl sm:text-2xl"
                    />
                  </div>

                  <p
                    className={`mt-2 text-sm leading-relaxed sm:text-base ${
                      expandida ? "" : "line-clamp-3"
                    }`}
                  >
                    {avaliacao.comentario}
                  </p>

                  <div className="mt-auto flex items-center justify-end gap-4 pt-2 text-sm text-[#8646FF]">
                    <Link
                      href={`/loja/${lojaId}/avaliacoes/${avaliacao.id}`}
                      className="hover:underline"
                    >
                      ver comentários
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        alternarComentario(avaliacao.id)
                      }
                      aria-expanded={expandida}
                      className="hover:underline"
                    >
                      {expandida ? "ver menos" : "ver mais"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {totalPaginas > 1 && (
        <nav
          aria-label="Paginação das avaliações"
          className="mt-9 flex items-center justify-center gap-5 text-white"
        >
          <button
            type="button"
            onClick={() => mudarPagina(paginaSegura - 1)}
            disabled={paginaSegura === 1}
            aria-label="Página anterior"
            className="cursor-pointer text-2xl disabled:cursor-not-allowed disabled:opacity-30"
          >
            {"<"}
          </button>

          {Array.from(
            { length: totalPaginas },
            (_, indice) => indice + 1
          ).map((numero) => (
            <button
              key={numero}
              type="button"
              onClick={() => mudarPagina(numero)}
              aria-current={
                numero === paginaSegura ? "page" : undefined
              }
              className={`cursor-pointer text-lg ${
                numero === paginaSegura
                  ? "font-bold text-[#C6E700]"
                  : "text-white"
              }`}
            >
              {numero}
            </button>
          ))}

          <button
            type="button"
            onClick={() => mudarPagina(paginaSegura + 1)}
            disabled={paginaSegura === totalPaginas}
            aria-label="Próxima página"
            className="cursor-pointer text-2xl disabled:cursor-not-allowed disabled:opacity-30"
          >
            {">"}
          </button>
        </nav>
      )}
    </div>
  );
}
