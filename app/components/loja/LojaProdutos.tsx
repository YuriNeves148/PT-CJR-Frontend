
"use client";

import { useState } from "react";
import { Poppins } from "next/font/google";
import ProdutoCard, {
    type ProdutoLoja,
} from "./ProdutoCard";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    display: "swap",
});

type LojaProdutosProps = {
    nomeLoja: string;
    produtos: ProdutoLoja[];
    melhoresAvaliados: ProdutoLoja[];
    produtosPorPagina?: number;
};

export default function LojaProdutos({
    nomeLoja,
    produtos,
    melhoresAvaliados,
    produtosPorPagina = 15,
}: LojaProdutosProps) {
    const [paginaAtual, setPaginaAtual] = useState(1);

    const quantidadePorPagina = Math.max(1, produtosPorPagina);

    const totalPaginas = Math.ceil(
        produtos.length / quantidadePorPagina
    );

    const paginaSegura = Math.min(
        paginaAtual,
        Math.max(1, totalPaginas)
    );

    const inicio = (paginaSegura - 1) * quantidadePorPagina;

    const produtosVisiveis = produtos.slice(
        inicio,
        inicio + quantidadePorPagina
    );

    function mudarPagina(novaPagina: number) {
        if (novaPagina < 1 || novaPagina > totalPaginas) {
            return;
        }

        setPaginaAtual(novaPagina);
    }

    return (
        <section
            className={`w-full bg-[#F8F5E9] text-black ${poppins.className}`}
        >
            <div
                className="
                    mx-auto w-full max-w-[1290px]
                    px-5 py-10
                    sm:px-8
                    lg:px-[100px]
                 "
            >
                {/* SEÇÃO 1: MELHORES AVALIADOS */}
                <div>
                    <div className="mb-8 flex items-end justify-between gap-4">
                        <h2 className="flex flex-wrap items-baseline gap-1">
                            <span className="text-[27px] font-semibold">
                                Produtos
                            </span>

                            <span className="text-[11px] font-medium">
                                melhor avaliados
                            </span>
                        </h2>

                        <span className="text-xs font-medium text-[#7137FF]">
                            ver mais
                        </span>
                    </div>

                    {melhoresAvaliados.length > 0 ? (
                        <div
                            className="
                flex snap-x snap-mandatory
                gap-7 overflow-x-auto pb-3
              "
                        >
                            {melhoresAvaliados.map((produto) => (
                                <div
                                    key={produto.id}
                                    className="w-[205px] shrink-0 snap-start"
                                >
                                    <ProdutoCard produto={produto} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="py-8 text-sm text-gray-500">
                            Ainda não há produtos avaliados.
                        </p>
                    )}
                </div>

                {/* SEÇÃO 2: TODOS OS PRODUTOS DA LOJA */}
                <div className="mt-10">
                    <div className="mb-7 flex items-end justify-between gap-4">
                        <h2 className="flex flex-wrap items-baseline gap-1">
                            <span className="text-[27px] font-semibold">
                                Produtos
                            </span>

                            <span className="text-[11px] font-medium">
                                de {nomeLoja}
                            </span>
                        </h2>

                        <span className="text-xs font-medium text-[#7137FF]">
                            ver mais
                        </span>
                    </div>

                    {produtosVisiveis.length > 0 ? (
                        <div
                            className="
                grid grid-cols-1 gap-4
                sm:grid-cols-2
                md:grid-cols-3
                lg:grid-cols-5
                lg:gap-7
              "
                        >
                            {produtosVisiveis.map((produto) => (
                                <ProdutoCard
                                    key={produto.id}
                                    produto={produto}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="py-12 text-center text-gray-500">
                            Esta loja ainda não possui produtos.
                        </p>
                    )}

                    {/* PAGINAÇÃO */}
                    {totalPaginas > 1 && (
                        <nav
                            aria-label="Paginação dos produtos"
                            className="
                mt-9 flex flex-wrap
                items-center justify-center gap-7
              "
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    mudarPagina(paginaSegura - 1)
                                }
                                disabled={paginaSegura === 1}
                                aria-label="Página anterior"
                                className="
                  cursor-pointer text-3xl
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
                            >
                                {"<"}
                            </button>

                            {Array.from(
                                { length: totalPaginas },
                                (_, indice) => indice + 1
                            ).map((pagina) => (
                                <button
                                    key={pagina}
                                    type="button"
                                    onClick={() => mudarPagina(pagina)}
                                    aria-current={
                                        paginaSegura === pagina
                                            ? "page"
                                            : undefined
                                    }
                                    className={`
                    cursor-pointer text-2xl
                    ${paginaSegura === pagina
                                            ? "font-semibold"
                                            : "font-light"
                                        }
                  `}
                                >
                                    {pagina}
                                </button>
                            ))}

                            <button
                                type="button"
                                onClick={() =>
                                    mudarPagina(paginaSegura + 1)
                                }
                                disabled={paginaSegura === totalPaginas}
                                aria-label="Próxima página"
                                className="
                  cursor-pointer text-3xl
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
                            >
                                {">"}
                            </button>
                        </nav>
                    )}
                </div>
            </div>
        </section>
    );
}
