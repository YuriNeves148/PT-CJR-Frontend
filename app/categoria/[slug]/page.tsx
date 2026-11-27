"use client";

import { useEffect, useState, type SyntheticEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getCategorias,
  getProdutos,
  slugify,
  type Categoria,
  type Produto,
} from "@/app/service/produtoService";

const formatarPreco = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Todas as categorias usam o mesmo layout; só a frase e o mascote do topo mudam
const HEROIS: Record<string, { titulo: string; imagem: string; alt: string }> = {
  tecnologia: { titulo: "O universo da tecnologia", imagem: "/stockles.png", alt: "stockles segurando um celular" },
  beleza: { titulo: "O universo da beleza", imagem: "/stocklee2.png", alt: "stocklee, mascote da Stock.io" },
  mercado: { titulo: "O universo do mercado", imagem: "/stockles2-hero.png", alt: "stockles, mascote da Stock.io" },
  farmacia: { titulo: "O universo da farmácia", imagem: "/stockles2-hero.png", alt: "stockles, mascote da Stock.io" },
  moda: { titulo: "O universo da moda", imagem: "/stocklee2.png", alt: "stocklee, mascote da Stock.io" },
  casa: { titulo: "O universo da casa", imagem: "/stockles2-hero.png", alt: "stockles, mascote da Stock.io" },
  eletronicos: { titulo: "O universo dos eletrônicos", imagem: "/stockles.png", alt: "stockles segurando um celular" },
  jogos: { titulo: "O universo dos jogos", imagem: "/stockles.png", alt: "stockles segurando um celular" },
  brinquedos: { titulo: "O universo dos brinquedos", imagem: "/stocklee2.png", alt: "stocklee, mascote da Stock.io" },
};

// O link pode chegar com acento, espaço ou maiúscula (ex.: /categoria/Farmácia, gerado pelo feed).
// Passa tudo pelo mesmo slugify dos nossos links: "Farmácia" -> "farmacia", "Cama e Banho" -> "cama-e-banho"
function normalizarSlug(bruto: string) {
  let texto = bruto;
  try {
    texto = decodeURIComponent(bruto);
  } catch {
    // "%" solto na URL: usa como veio
  }
  return slugify(texto);
}

// Se a foto do produto não abrir, mostra o logo no lugar do ícone de imagem quebrada
function usarImagemReserva(e: SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (!img.src.endsWith("/logo-stockio.png")) img.src = "/logo-stockio.png";
}

export default function CategoriaPage() {
  const params = useParams<{ slug: string }>();
  const slug = normalizarSlug(params.slug);

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);

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
  // Se duas categorias tiverem o mesmo nome, viram um botão só (as duas teriam o mesmo link)
  const botoesCategorias = categoriasPrincipais.filter(
    (c, i, todas) => todas.findIndex((outra) => slugify(outra.nome) === slugify(c.nome)) === i
  );
  // Todas as categorias principais com esse nome (normalmente só uma)
  const categoriasDoSlug = categoriasPrincipais.filter((c) => slugify(c.nome) === slug);
  const categoriaAtual = categoriasDoSlug[0];
  const naoEncontrada = !carregando && !erro && !categoriaAtual;

  // Categorias da lista HEROIS têm frase e mascote próprios; as outras usam o nome vindo do banco
  const hero = HEROIS[slug] ?? {
    // Categoria que não existe: título neutro em vez de repetir o que veio na URL
    titulo: naoEncontrada
      ? "Todos os universos"
      : `O universo de ${categoriaAtual?.nome ?? slug.replace(/-/g, " ")}`,
    imagem: "/stockles2-hero.png",
    alt: "stockles, mascote da Stock.io",
  };

  const idsMae = new Set(categoriasDoSlug.map((c) => c.id));
  const idsDaCategoria = new Set([
    ...idsMae,
    ...categorias.filter((c) => c.categoria_pai_id !== null && idsMae.has(c.categoria_pai_id)).map((c) => c.id),
  ]);
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

  // Paginação numerada (igual ao padrão já usado em LojaProdutos.tsx)
  const PRODUTOS_POR_PAGINA = 15;
  const totalPaginas = Math.max(1, Math.ceil(produtosExibidos.length / PRODUTOS_POR_PAGINA));
  const paginaSegura = Math.min(paginaAtual, totalPaginas);
  const inicioPagina = (paginaSegura - 1) * PRODUTOS_POR_PAGINA;
  const produtosPaginados = produtosExibidos.slice(inicioPagina, inicioPagina + PRODUTOS_POR_PAGINA);

  // Volta para a página 1 sempre que a categoria, a busca ou a ordenação mudam
  // (ajuste de estado durante a renderização, sem useEffect, para não disparar
  // o aviso react-hooks/set-state-in-effect)
  const chaveFiltro = `${slug}|${busca}|${ordem}`;
  const [chaveFiltroAnterior, setChaveFiltroAnterior] = useState(chaveFiltro);
  if (chaveFiltro !== chaveFiltroAnterior) {
    setChaveFiltroAnterior(chaveFiltro);
    setPaginaAtual(1);
  }

  function mudarPagina(novaPagina: number) {
    if (novaPagina < 1 || novaPagina > totalPaginas) return;
    setPaginaAtual(novaPagina);
  }

  return (
    <div className="min-h-screen bg-[#f5f2e1]">
    

      {/* HERO */}
      <section className="overflow-hidden bg-black px-6 text-white md:px-[7vw]">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-end md:justify-center md:gap-8 md:text-right lg:gap-20">
          <h1 className="text-3xl font-semibold leading-tight md:self-center md:text-[44px]">
            {hero.titulo}
            <br />
            em um só lugar
          </h1>
          {/* Altura fixa (não largura) para todos os mascotes ficarem na mesma escala e cortados na cintura */}
          <div className="h-[300px] shrink-0 overflow-hidden pt-3 md:h-[340px]">
            <img
              src={hero.imagem}
              alt={hero.alt}
              className="h-[516px] w-auto max-w-none [filter:drop-shadow(0_0_1px_#f5f2e1)_drop-shadow(0_0_1px_#f5f2e1)] md:h-[594px]"
            />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1200px] px-6 pb-12 pt-4 md:px-[7vw]">
        <div className="mb-3.5 flex justify-end">
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

        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            {botoesCategorias.map((c) => (
              <Link
                key={c.id}
                href={`/categoria/${slugify(c.nome)}`}
                className={`w-[78px] rounded-full py-[5px] text-center text-[11px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6c3df0] ${
                  slugify(c.nome) === slug
                    ? "bg-[#6c3df0] text-white"
                    : "bg-white text-[#8b78d6]"
                }`}
              >
                {c.nome}
              </Link>
            ))}
          </div>

          <div className="relative w-64 max-w-full">
            <select
              value={ordem}
              onChange={(e) => setOrdem(e.target.value)}
              aria-label="Ordenar produtos"
              className="w-full cursor-pointer appearance-none rounded-full bg-white py-2 pl-5 pr-12 text-base text-[#8b78d6] outline-none focus-visible:ring-2 focus-visible:ring-[#6c3df0]"
            >
              <option value="">ordenar por</option>
              <option value="menor">Menor preço</option>
              <option value="maior">Maior preço</option>
              <option value="nome">Nome (A-Z)</option>
            </select>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b78d6]"
            >
              <path d="m5 9 7 7 7-7" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-3">
          {produtosPaginados.map((p) => (
            <Link
              key={p.id}
              href={`/produtos_logado?id=${p.id}`}
              aria-label={`Ver ${p.nome}`}
              className="flex flex-col rounded-[28px] bg-white px-3 pb-3.5 pt-[18px] transition-shadow hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6c3df0]"
            >
              <div className="mb-3.5 flex h-[110px] items-center justify-center">
                <img
                  src={p.imagem}
                  alt={p.nome}
                  onError={usarImagemReserva}
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
            </Link>
          ))}
        </div>

        {!carregando && !erro && totalPaginas > 1 && (
          <nav
            aria-label="Paginação dos produtos"
            className="mt-9 flex flex-wrap items-center justify-center gap-6"
          >
            <button
              type="button"
              onClick={() => mudarPagina(paginaSegura - 1)}
              disabled={paginaSegura === 1}
              aria-label="Página anterior"
              className="cursor-pointer text-2xl text-[#6c3df0] disabled:cursor-not-allowed disabled:opacity-30"
            >
              {"<"}
            </button>

            {Array.from({ length: totalPaginas }, (_, indice) => indice + 1).map((pagina) => (
              <button
                key={pagina}
                type="button"
                onClick={() => mudarPagina(pagina)}
                aria-current={paginaSegura === pagina ? "page" : undefined}
                className={`cursor-pointer text-lg text-[#6c3df0] ${
                  paginaSegura === pagina ? "font-semibold" : "font-light"
                }`}
              >
                {pagina}
              </button>
            ))}

            <button
              type="button"
              onClick={() => mudarPagina(paginaSegura + 1)}
              disabled={paginaSegura === totalPaginas}
              aria-label="Próxima página"
              className="cursor-pointer text-2xl text-[#6c3df0] disabled:cursor-not-allowed disabled:opacity-30"
            >
              {">"}
            </button>
          </nav>
        )}

        {carregando && (
          <p className="mt-8 text-center text-[#8b78d6]">Carregando produtos...</p>
        )}
        {erro && (
          <p className="mt-8 text-center text-[#d6003f]">
            Não foi possível carregar os produtos. Tente novamente mais tarde.
          </p>
        )}
        {naoEncontrada && (
          <p className="mt-8 text-center text-[#8b78d6]">
            Categoria não encontrada. Escolha uma das categorias acima.
          </p>
        )}
        {!carregando && !erro && !naoEncontrada && produtosExibidos.length === 0 && (
          <p className="mt-8 text-center text-[#8b78d6]">Nenhum produto encontrado.</p>
        )}
      </main>
    </div>
  );
}
