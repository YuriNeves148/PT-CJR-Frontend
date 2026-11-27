"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { urlImagem } from "@/app/lib/urlImagem";
import { slugify } from "@/app/service/produtoService";
import type { CategoriaFeed, LojaFeed, ProdutoFeed } from "@/app/lib/backend";

type FeedProps = {
  categorias: CategoriaFeed[] | null;
  lojas: LojaFeed[] | null;
  produtos: ProdutoFeed[] | null;
};

const IMAGENS_CATEGORIA: Record<string, string> = {
  beleza: "/img_feed/categorias/beleza.png",
  brinquedos: "/img_feed/categorias/brinquedos.png",
  casa: "/img_feed/categorias/casa.jpg",
  eletronicos: "/img_feed/categorias/eletronicos.png",
  farmacia: "/img_feed/categorias/farmacia.png",
  jogos: "/img_feed/categorias/jogos.png",
  mercado: "/img_feed/categorias/mercado.png",
  moda: "/img_feed/categorias/moda.png",
};

const normalizar = (texto: string) => slugify(texto).replace(/-/g, " ");

export default function Feed({ categorias, lojas, produtos }: FeedProps) {
  const [busca, setBusca] = useState("");
  const [filtrosLojas, setFiltrosLojas] = useState<number[]>([]);
  const [filtrosProdutos, setFiltrosProdutos] = useState<number[]>([]);
  const termo = normalizar(busca);

  const principais = useMemo(
    () => (categorias ?? []).filter((c) => c.categoria_pai_id === null),
    [categorias]
  );

  const categoriaPrincipal = useMemo(() => {
    const porId = new Map((categorias ?? []).map((c) => [c.id, c]));
    return (id: number | null) => {
      const categoria = id === null ? undefined : porId.get(id);
      return categoria?.categoria_pai_id ?? categoria?.id ?? null;
    };
  }, [categorias]);

  const passaNoFiltro = (filtros: number[], categoriaId: number | null) =>
    filtros.length === 0 || filtros.includes(categoriaPrincipal(categoriaId) ?? -1);

  const produtosVisiveis = (produtos ?? []).filter(
    (p) => normalizar(p.nome).includes(termo) && passaNoFiltro(filtrosProdutos, p.categoria_id)
  );

  const lojasVisiveis = (lojas ?? []).filter(
    (l) => normalizar(l.nome).includes(termo) && passaNoFiltro(filtrosLojas, l.categoria_id)
  );

  const alternar = (id: number) => (atuais: number[]) =>
    atuais.includes(id) ? atuais.filter((f) => f !== id) : [...atuais, id];

  return (
    <main className="w-full overflow-x-hidden">
      <div className="flex flex-col items-center justify-center bg-[#000000] px-6 pt-10 lg:flex-row lg:items-start lg:pt-0">
        <div className="flex flex-col text-white lg:mt-27">
          <h1 className="text-4xl font-semibold sm:text-6xl lg:text-7xl">Do CAOS à organização,</h1>
          <p className="text-3xl font-semibold flex ml-auto sm:text-5xl lg:text-6xl">em alguns cliques</p>
        </div>
        <Image
          src="/img_feed/moca_em_pe.png"
          alt="moça em pé"
          width={100000}
          height={10000}
          className="h-auto w-72 sm:w-96 lg:h-170 lg:w-130"
          priority
        />
      </div>

      <div className="bg-[#F6F3E4] relative z-10 h-auto w-full lg:-mt-67">
        <div className="mx-auto w-full max-w-330 px-6 pt-10">
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Procurar produtos e lojas"
            className="ml-auto block w-full max-w-200 text-base p-3 rounded-4xl bg-[#FFFFFF] text-black"
            placeholder="Procurar por..."
          />

          <h2 className="text-black font-semibold text-3xl pt-10">Categorias</h2>
          <nav aria-label="Categorias" className="overflow-x-auto flex flex-row gap-15 pb-5 pt-10">
            {categorias === null ? (
              <p className="text-red-600 text-xl">Não foi possível carregar as categorias.</p>
            ) : principais.length === 0 ? (
              <p className="text-black text-xl">Nenhuma categoria cadastrada.</p>
            ) : (
              principais.map((categoria) => {
                const slug = slugify(categoria.nome);
                const imagem = IMAGENS_CATEGORIA[slug];
                return (
                  <Link
                    key={categoria.id}
                    href={`/categoria/${slug}`}
                    className="flex flex-col items-center shrink-0 rounded-4xl transition-transform hover:-translate-y-1"
                  >
                    <Image
                      src={imagem ?? "/img_feed/sem-imagem.png"}
                      alt={imagem ? categoria.nome : ""}
                      width={120}
                      height={120}
                      className="w-30 h-30 shrink-0 object-cover rounded-2xl"
                    />
                    {!imagem && <span className="text-black text-xl capitalize">{categoria.nome}</span>}
                  </Link>
                );
              })
            )}
          </nav>

          <div>
            <details className="peer">
              <summary className="flex cursor-pointer list-none items-end [&::-webkit-details-marker]:hidden">
                <h2 className="text-black font-semibold text-3xl pt-10">Produtos</h2>
                <FiltroCategorias
                  rotulo="Filtrar produtos por categoria"
                  categorias={principais}
                  selecionadas={filtrosProdutos}
                  aoAlternar={(id) => setFiltrosProdutos(alternar(id))}
                />
                <span className="ml-6 text-blue-600 text-lg hover:text-blue-900 sm:ml-10 sm:pr-10">ver mais / menos</span>
              </summary>
            </details>
            <div className="flex snap-x flex-nowrap gap-10 overflow-x-auto pb-5 pt-10 peer-open:flex-wrap">
              {produtos === null ? (
                <p className="text-red-600 text-xl">Não foi possível carregar os produtos.</p>
              ) : produtosVisiveis.length === 0 ? (
                <p className="text-black text-xl">
                  {termo || filtrosProdutos.length > 0 ? "Nenhum produto encontrado." : "Nenhum produto cadastrado."}
                </p>
              ) : (
                produtosVisiveis.map((produto) => {
                  const disponivel = produto.estoque > 0;
                  const capa = [...(produto.imagem ?? [])].sort((a, b) => a.ordem - b.ordem)[0];

                  return (
                    <Link
                      key={produto.id}
                      href={`/produto/${produto.id}`}
                      className="bg-[#FFFFFF] p-5 pb-11 shrink-0 snap-start rounded-2xl w-65 flex flex-col items-center transition-shadow hover:shadow-lg"
                    >
                      <Image
                        src={urlImagem(capa?.url_imagem, "/img_feed/adicione_imagem.png")}
                        alt={produto.nome}
                        width={120}
                        height={120}
                        unoptimized
                        className="w-30 h-30 shrink-0 object-cover"
                      />
                      <div className="pt-5 mr-auto">
                        <p className="line-clamp-2 break-words text-black font-bold text-2xl">{produto.nome}</p>
                        <p className="text-black font-bold text-2xl">
                          {Number(produto.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                        <p className={`font-bold text-2xl ${disponivel ? "text-green-600" : "text-red-600"}`}>
                          {disponivel ? "Disponível" : "Indisponível"}
                        </p>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          <div className="relative">
            <details className="peer">
              <summary className="flex cursor-pointer list-none items-end [&::-webkit-details-marker]:hidden">
                <h2 className="text-black font-semibold text-3xl pt-10">Lojas</h2>
                <FiltroCategorias
                  rotulo="Filtrar lojas por categoria"
                  categorias={principais}
                  selecionadas={filtrosLojas}
                  aoAlternar={(id) => setFiltrosLojas(alternar(id))}
                />
                <span className="ml-6 text-blue-600 text-lg hover:text-blue-900 sm:ml-10 sm:pr-10">ver mais / menos</span>
              </summary>
            </details>

            <div className="flex snap-x flex-nowrap shrink-0 items-start gap-11 overflow-x-auto pb-40 pt-10 peer-open:flex-wrap">
              {lojas === null ? (
                <p className="text-red-600 text-xl">Não foi possível carregar as lojas.</p>
              ) : lojasVisiveis.length === 0 ? (
                <p className="text-black text-xl">
                  {termo || filtrosLojas.length > 0 ? "Nenhuma loja encontrada." : "Nenhuma loja cadastrada."}
                </p>
              ) : (
                lojasVisiveis.map((loja) => (
                  <Link
                    key={loja.id}
                    href={`/loja/${loja.id}`}
                    className="shrink-0 snap-start p-5 max-w-48 flex flex-col items-center rounded-3xl transition-colors hover:bg-white/60"
                  >
                    <Image
                      src={urlImagem(loja.logo_url, "/img_feed/loja-sem-imagem.png")}
                      alt={`Logo da loja ${loja.nome}`}
                      width={120}
                      height={120}
                      unoptimized
                      className="w-30 h-30 shrink-0 rounded-full object-cover"
                    />
                    <div className="flex flex-col items-center pt-5">
                      <p className="text-black text-2xl font-bold text-center line-clamp-2 break-words">{loja.nome}</p>
                      {loja.categoria && (
                        <p className="text-blue-800 text-xl text-center truncate max-w-full">{loja.categoria.nome}</p>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function FiltroCategorias({
  rotulo,
  categorias,
  selecionadas,
  aoAlternar,
}: {
  rotulo: string;
  categorias: CategoriaFeed[];
  selecionadas: number[];
  aoAlternar: (id: number) => void;
}) {
  return (
    <details className="group relative mt-4 w-fit ml-auto">
      <summary
        aria-label={rotulo}
        className="flex w-40 sm:w-80 cursor-pointer list-none items-center gap-2 rounded-2xl bg-white pl-6 py-2 text-2xl text-black [&::-webkit-details-marker]:hidden hover:bg-gray-100"
      >
        filtros{selecionadas.length > 0 && ` (${selecionadas.length})`}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={5}
          className="h-4 w-4 transition-transform group-open:rotate-180"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>

      <fieldset className="absolute right-0 top-full z-20 w-60 sm:w-80 rounded-lg border border-gray-300 bg-white p-4 text-xl text-black shadow-lg">
        <legend className="sr-only">{rotulo}</legend>
        {categorias.map((categoria) => (
          <label key={categoria.id} className="flex cursor-pointer items-center gap-2 capitalize">
            <input
              type="checkbox"
              value={categoria.id}
              checked={selecionadas.includes(categoria.id)}
              onChange={() => aoAlternar(categoria.id)}
            />
            {categoria.nome}
          </label>
        ))}
      </fieldset>
    </details>
  );
}
