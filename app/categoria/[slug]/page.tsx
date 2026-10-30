"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import {
  getCategorias,
  getProdutos,
  slugify,
  type Categoria,
  type Produto,
} from "@/app/service/produtoService";

const formatarPreco = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function CategoriaPage() {
  const { slug } = useParams<{ slug: string }>();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState("");

  useEffect(() => {
    Promise.all([getCategorias(), getProdutos()])
      .then(([cats, prods]) => {
        setCategorias(cats);
        setProdutos(prods);
      })
      .catch(() => setErro(true))
      .finally(() => setCarregando(false));
  }, []);

  // Só as categorias principais viram botões; as subcategorias entram junto com a mãe
  const categoriasPrincipais = categorias.filter((c) => c.categoria_pai_id === null);
  const categoriaAtual = categoriasPrincipais.find((c) => slugify(c.nome) === slug);

  const idsDaCategoria = new Set(
    categoriaAtual
      ? [
          categoriaAtual.id,
          ...categorias.filter((c) => c.categoria_pai_id === categoriaAtual.id).map((c) => c.id),
        ]
      : []
  );
  const filtrados = produtos.filter(
    (p) =>
      idsDaCategoria.has(p.categoriaId) &&
      p.nome.toLowerCase().includes(busca.toLowerCase())
  );
  const produtosExibidos =
    ordem === "menor" ? filtrados.toSorted((a, b) => a.preco - b.preco)
    : ordem === "maior" ? filtrados.toSorted((a, b) => b.preco - a.preco)
    : ordem === "nome" ? filtrados.toSorted((a, b) => a.nome.localeCompare(b.nome))
    : filtrados;

  return (
    <div className="min-h-screen bg-[#f5f2e1]">
      <Navbar />

      {/* HERO */}
      <section className="overflow-hidden bg-black px-6 text-white md:px-[7vw]">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-end md:justify-center md:gap-4 md:text-right">
          <h1 className="text-3xl font-semibold leading-tight md:self-center md:text-[44px]">
            O universo da tecnologia
            <br />
            em um só lugar
          </h1>
          {/* Como na referência, o stockles aparece só da cintura pra cima: o resto é cortado */}
          <div className="h-[300px] w-[200px] shrink-0 overflow-hidden pt-3 md:h-[340px] md:w-[230px]">
            <img
              src="/stockles.png"
              alt="stockles segurando um celular"
              className="h-auto w-full"
            />
          </div>
        </div>
      </section>

      {/* CONTEÚDO */}
      <main className="mx-auto max-w-[1200px] px-6 pb-12 pt-4 md:px-[7vw]">
        <div className="mb-3.5 flex justify-end">
          <input
            type="text"
            placeholder="Procurar por..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full max-w-[330px] rounded-full bg-white px-[18px] py-2 text-xs text-neutral-800 outline-none placeholder:text-[#8b78d6] focus-visible:ring-2 focus-visible:ring-[#6c3df0]"
          />
        </div>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            {categoriasPrincipais.map((c) => (
              <Link
                key={c.id}
                href={`/categoria/${slugify(c.nome)}`}
                className={`w-[78px] rounded-full py-[5px] text-center text-[11px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6c3df0] ${
                  c.id === categoriaAtual?.id
                    ? "bg-[#6c3df0] text-white"
                    : "bg-white text-[#8b78d6]"
                }`}
              >
                {c.nome}
              </Link>
            ))}
          </div>

          <select
            value={ordem}
            onChange={(e) => setOrdem(e.target.value)}
            className="w-64 max-w-full cursor-pointer rounded-full bg-white px-5 py-2 text-base text-[#8b78d6] focus-visible:ring-2 focus-visible:ring-[#6c3df0]"
          >
            <option value="">ordenar por</option>
            <option value="menor">Menor preço</option>
            <option value="maior">Maior preço</option>
            <option value="nome">Nome (A-Z)</option>
          </select>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-3">
          {produtosExibidos.map((p) => (
            <article
              key={p.id}
              className="flex flex-col rounded-[28px] bg-white px-3 pb-3.5 pt-[18px]"
            >
              <div className="mb-3.5 flex h-[110px] items-center justify-center">
                <img
                  src={p.imagem}
                  alt={p.nome}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <h2 className="text-[15px] font-semibold text-neutral-900">{p.nome}</h2>
              <p className="my-0.5 text-[13px] font-medium text-neutral-900">
                {formatarPreco(p.preco)}
              </p>
              <span
                className={`text-[8px] font-bold ${
                  p.disponivel ? "text-[#b4dc00]" : "text-[#d6003f]"
                }`}
              >
                {p.disponivel ? "DISPONÍVEL" : "INDISPONÍVEL"}
              </span>
            </article>
          ))}
        </div>

        {carregando && (
          <p className="mt-8 text-center text-[#8b78d6]">Carregando produtos...</p>
        )}
        {erro && (
          <p className="mt-8 text-center text-[#d6003f]">
            Não foi possível carregar os produtos. Tente novamente mais tarde.
          </p>
        )}
        {!carregando && !erro && produtosExibidos.length === 0 && (
          <p className="mt-8 text-center text-[#8b78d6]">Nenhum produto encontrado.</p>
        )}
      </main>
    </div>
  );
}
