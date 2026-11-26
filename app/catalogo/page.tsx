"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getCategorias,
  getProdutos,
  getLojas,
  slugify,
  type Categoria,
  type Produto,
  type Loja,
} from "@/app/service/produtoService";
import SecaoCategoriaProdutos from "@/app/components/catalogo/SecaoCategoriaProdutos";
import type { ProdutoLoja } from "@/app/components/loja/ProdutoCard";

// Ícones originais exportados do Figma (public/icones_catalogo/). O arquivo de
// "Brinquedos" tem espaço no nome original; mantido como veio, só codificado na URL.
const ICONES_CATEGORIA: Record<string, string> = {
  mercado: "/icones_catalogo/healthicons_vegetables-outline.svg",
  farmacia: "/icones_catalogo/hugeicons_medicine-02.svg",
  beleza: "/icones_catalogo/streamline-ultimate_make-up-lipstick.svg",
  moda: "/icones_catalogo/ph_dress-light.svg",
  eletronicos: "/icones_catalogo/cil_laptop.svg",
  jogos: "/icones_catalogo/proicons_game.svg",
  brinquedos: encodeURI("/icones_catalogo/noun-doll-7208768 1.svg"),
};

// Ícone de "Casa": a exportação do Figma saiu cortada e não foi fornecida.
// Desenhado à mão no mesmo estilo dos outros (viewBox 45x45, preenchimento sólido #6A38F3).
function IconeCasa({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 45 45" className={className} aria-hidden="true">
      <path
        d="M22.5 5.5L4 20.5H9.5V39.5H19V27H26V39.5H35.5V20.5H41L22.5 5.5Z"
        fill="#6A38F3"
      />
    </svg>
  );
}

// Fallback neutro para alguma categoria cadastrada que não esteja no mapa acima
// (ex.: nome diferente do esperado) — evita mostrar o ícone de casa fora de contexto.
function IconeGenerico({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 45 45" className={className} aria-hidden="true">
      <circle cx="22.5" cy="22.5" r="15" fill="#6A38F3" />
    </svg>
  );
}

const PRODUTOS_POR_SECAO = 5;

export default function CatalogoPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    Promise.all([getCategorias(), getProdutos(), getLojas()])
      .then(([cats, prods, lojasApi]) => {
        setCategorias(cats);
        setProdutos(prods);
        setLojas(lojasApi);
      })
      .catch(() => setErro(true))
      .finally(() => setCarregando(false));
  }, []);

  const lojasPorId = useMemo(() => new Map(lojas.map((l) => [l.id, l])), [lojas]);

  const categoriasPrincipais = useMemo(
    () => categorias.filter((c) => c.categoria_pai_id === null),
    [categorias]
  );

  const buscaNormalizada = busca.trim().toLowerCase();

  // Agrupa produtos por categoria principal, incluindo produtos cadastrados
  // diretamente em uma subcategoria dela (mesma lógica de /categoria/[slug]).
  const secoes = useMemo(() => {
    return categoriasPrincipais
      .map((principal) => {
        const idsDaCategoria = new Set<number>([
          principal.id,
          ...categorias
            .filter((c) => c.categoria_pai_id === principal.id)
            .map((c) => c.id),
        ]);

        const produtosDaSecao: ProdutoLoja[] = produtos
          .filter(
            (p) =>
              idsDaCategoria.has(p.categoriaId) &&
              p.nome.toLowerCase().includes(buscaNormalizada)
          )
          .slice(0, PRODUTOS_POR_SECAO)
          .map((p) => {
            const loja = lojasPorId.get(p.lojaId);
            return {
              id: p.id,
              nome: p.nome,
              preco: p.preco,
              estoque: p.disponivel ? 1 : 0,
              imagemUrl: p.imagem,
              loja: loja ? { nome: loja.nome, logoUrl: loja.logoUrl } : null,
            };
          });

        return {
          id: principal.id,
          nome: principal.nome,
          slug: slugify(principal.nome),
          produtos: produtosDaSecao,
        };
      })
      .filter((secao) => secao.produtos.length > 0);
  }, [categoriasPrincipais, categorias, produtos, lojasPorId, buscaNormalizada]);

  const semResultados = !carregando && !erro && secoes.length === 0;

  return (
    <div className="min-h-screen bg-[#f5f2e1]">
      {/* Faixa de categorias — estrutural, sempre visível mesmo sem produtos */}
      <section className="bg-black px-6 py-8 md:px-[7vw]">
        <h1 className="mb-5 text-2xl font-semibold text-white">Categoria</h1>
        <nav aria-label="Categorias" className="overflow-x-auto pb-2">
          <div className="mx-auto flex w-max min-w-full justify-center gap-4">
          {categoriasPrincipais.map((c) => {
            const slug = slugify(c.nome);
            const icone = ICONES_CATEGORIA[slug];
            return (
              <Link
                key={c.id}
                href={`/categoria/${slug}`}
                className="flex w-20 shrink-0 flex-col items-center gap-2 rounded-3xl bg-white px-2 py-4 text-center text-black"
              >
                <span className="flex h-10 w-10 items-center justify-center">
                  {slug === "casa" ? (
                    <IconeCasa className="h-10 w-10" />
                  ) : icone ? (
                    <img src={icone} alt="" aria-hidden="true" className="h-10 w-10" />
                  ) : (
                    <IconeGenerico className="h-10 w-10" />
                  )}
                </span>
                <span className="text-[11px] font-medium">{c.nome}</span>
              </Link>
            );
          })}
          </div>
        </nav>
      </section>

      <main className="mx-auto max-w-[1290px] px-5 py-10 sm:px-8 lg:px-[100px]">
        {/* Busca — estrutural, sempre visível */}
        <div className="mb-8 flex justify-end">
          <div className="relative w-full max-w-[330px]">
            <input
              type="text"
              placeholder="Procurar por..."
              aria-label="Procurar produtos"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full rounded-full bg-white py-2 pl-[18px] pr-10 text-xs text-neutral-800 outline-none placeholder:text-[#8b78d6] focus-visible:ring-2 focus-visible:ring-[#6c3df0]"
            />
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b78d6]"
            >
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="M15.5 15.5 21 21" />
            </svg>
          </div>
        </div>

        {carregando && (
          <p className="py-10 text-center text-[#8b78d6]">Carregando catálogo...</p>
        )}

        {erro && (
          <p className="py-10 text-center text-[#d6003f]">
            Não foi possível carregar o catálogo. Tente novamente mais tarde.
          </p>
        )}

        {semResultados && (
          <p className="py-10 text-center text-[#8b78d6]">
            {buscaNormalizada
              ? "Nenhum produto encontrado para essa busca."
              : "Nenhum produto cadastrado ainda."}
          </p>
        )}

        {!carregando &&
          !erro &&
          secoes.map((secao) => (
            <SecaoCategoriaProdutos
              key={secao.id}
              nomeCategoria={secao.nome}
              slugCategoria={secao.slug}
              produtos={secao.produtos}
            />
          ))}
      </main>
    </div>
  );
}
