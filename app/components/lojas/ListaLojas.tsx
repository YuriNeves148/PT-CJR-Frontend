"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CategoriaLista, LojaCard } from "@/app/lib/lojas";

type ListaLojasProps = {
  lojas: LojaCard[];
  categorias: CategoriaLista[];
};

// Busca sem diferenciar maiúsculas nem acentos
function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function ListaLojas({ lojas, categorias }: ListaLojasProps) {
  const [busca, setBusca] = useState("");
  const [categoriaId, setCategoriaId] = useState("");

  const principais = useMemo(
    () => categorias.filter((c) => c.categoria_pai_id === null),
    [categorias],
  );

  const visiveis = useMemo(() => {
    const termo = normalizar(busca);

    // A categoria escolhida inclui as suas subcategorias
    const idsDaCategoria = categoriaId
      ? new Set<number>([
          Number(categoriaId),
          ...categorias
            .filter((c) => c.categoria_pai_id === Number(categoriaId))
            .map((c) => c.id),
        ])
      : null;

    return lojas.filter(
      (loja) =>
        (!idsDaCategoria ||
          (loja.categoriaId !== null && idsDaCategoria.has(loja.categoriaId))) &&
        normalizar(loja.nome).includes(termo),
    );
  }, [lojas, categorias, busca, categoriaId]);

  return (
    <div>
      {/* Busca */}
      <div className="mb-8 flex justify-end">
        <div className="relative w-full max-w-[603px]">
          <input
            type="text"
            placeholder="Procurar por..."
            aria-label="Procurar lojas"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full rounded-full bg-white py-2 pl-7 pr-12 text-neutral-800 outline-none placeholder:text-[#8b78d6] focus-visible:ring-2 focus-visible:ring-[#6c3df0]"
          />
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8b78d6]"
          >
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="M15.5 15.5 21 21" />
          </svg>
        </div>
      </div>

      {/* Título e filtros */}
      <div className="mb-12 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-3xl font-medium text-black">Lojas</h2>

        <div className="relative w-full max-w-[467px]">
          <select
            aria-label="Filtrar lojas por categoria"
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            className="w-full cursor-pointer appearance-none rounded-full bg-white py-2 pl-8 pr-14 text-2xl text-[#8b78d6] outline-none focus-visible:ring-2 focus-visible:ring-[#6c3df0]"
          >
            <option value="">filtros</option>
            {principais.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </select>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute right-6 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6A38F3]"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>

      {/* Lojas */}
      {lojas.length === 0 ? (
        <p className="py-10 text-center text-[#8b78d6]">
          Nenhuma loja cadastrada ainda.
        </p>
      ) : visiveis.length === 0 ? (
        <p className="py-10 text-center text-[#8b78d6]">
          Nenhuma loja encontrada.
        </p>
      ) : (
        <ul className="mx-auto grid max-w-[1000px] grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-5">
          {visiveis.map((loja) => (
            <li key={loja.id} className="flex justify-center">
              <Link
                href={`/loja/${loja.id}`}
                className="flex w-[135px] flex-col items-center text-center"
              >
                <span className="flex h-[135px] w-[135px] items-center justify-center overflow-hidden rounded-full bg-white text-4xl font-semibold text-[#6A38F3]">
                  {loja.logoUrl ? (
                    <img
                      src={loja.logoUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    loja.nome.charAt(0).toUpperCase()
                  )}
                </span>
                <span className="mt-3 break-words text-lg text-black">
                  {loja.nome}
                </span>
                {loja.categoria && (
                  <span className="text-sm lowercase text-[#6A38F3]">
                    {loja.categoria}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}