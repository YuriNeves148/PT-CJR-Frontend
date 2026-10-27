"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Produto = {
  id: number;
  nome: string;
  preco: number;
  imagem: string;
  disponivel: boolean;
};

// Dados falsos só para montar o layout. Depois troque por getProductsByCategory(slug).
const produtosMock: Produto[] = [
  { id: 1, nome: "Comp. Lenovo", preco: 3899.99, imagem: "/produtos/lenovo.png", disponivel: true },
  { id: 2, nome: "Comp. Samsung", preco: 8549.99, imagem: "/produtos/samsung.png", disponivel: false },
  { id: 3, nome: "Iphone 15", preco: 4769.1, imagem: "/produtos/iphone15.png", disponivel: true },
  { id: 4, nome: "Smart Tv Philips", preco: 1229.0, imagem: "/produtos/tv-philips.png", disponivel: true },
  { id: 5, nome: "Xbox Series X", preco: 3599.99, imagem: "/produtos/xbox.png", disponivel: true },
];

const categorias = [
  { slug: "celulares", label: "Celulares" },
  { slug: "notebooks", label: "Notebooks" },
  { slug: "tvs", label: "TVs" },
  { slug: "acessorios", label: "Acessórios" },
  { slug: "outros", label: "Outros" },
];

const formatarPreco = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function CategoriaPage() {
  const { slug } = useParams<{ slug: string }>();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState("");

  useEffect(() => {
    // Troque pelo axios quando o endpoint estiver pronto:
    // getProductsByCategory(slug).then(setProdutos);
    setProdutos(produtosMock);
  }, [slug]);

  const produtosExibidos = useMemo(() => {
    const filtrados = produtos.filter((p) =>
      p.nome.toLowerCase().includes(busca.toLowerCase())
    );
    if (ordem === "menor") return [...filtrados].sort((a, b) => a.preco - b.preco);
    if (ordem === "maior") return [...filtrados].sort((a, b) => b.preco - a.preco);
    if (ordem === "nome") return [...filtrados].sort((a, b) => a.nome.localeCompare(b.nome));
    return filtrados;
  }, [produtos, busca, ordem]);

  return (
    <div className="min-h-screen bg-[#f5f2e1]">
      {/* HEADER + HERO */}
      <section className="overflow-hidden bg-black px-6 text-white md:px-[7vw]">
        <header className="flex items-center justify-between py-5">
          <Link href="/" className="text-3xl font-extrabold tracking-tighter text-white">
            STOCK.IO
          </Link>
          <nav className="flex items-center gap-8">
            <Link href="/login" className="text-[11px] font-semibold text-white">
              LOGIN
            </Link>
            <Link
              href="/cadastro"
              className="rounded-full bg-[#6c3df0] px-12 py-1 text-[11px] font-semibold text-white"
            >
              CADASTRE-SE
            </Link>
          </nav>
        </header>

        <div className="flex min-h-[260px] flex-col items-center gap-6 text-center md:flex-row md:items-end md:justify-between md:text-right">
          <h1 className="text-3xl font-semibold leading-tight md:self-center md:text-[44px]">
            O universo da tecnologia
            <br />
            em um só lugar
          </h1>
          <img
            src="/stockles.png"
            alt="stockles segurando um celular"
            className="h-[200px] w-auto md:h-[260px]"
          />
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
            {categorias.map((c) => (
              <Link
                key={c.slug}
                href={`/categoria/${c.slug}`}
                className={`w-[78px] rounded-full py-[5px] text-center text-[11px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6c3df0] ${
                  c.slug === slug
                    ? "bg-[#6c3df0] text-white"
                    : "bg-white text-[#8b78d6]"
                }`}
              >
                {c.label}
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

        {produtosExibidos.length === 0 && (
          <p className="mt-8 text-center text-[#8b78d6]">Nenhum produto encontrado.</p>
        )}
      </main>
    </div>
  );
}
