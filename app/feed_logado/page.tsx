"use client";
import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Loja = {
  id: number;
  nome: string;
  descricao?: string | null;
  logo_url?: string | null;
};

type Categoria = {
  id: number;
  nome: string;
  categoria_pai_id: number | null;
};
function gerarSlug(nome: string): string {
  return nome.toLocaleLowerCase().normalize("NFD").trim();
}

type ImagemProduto = {
  id: number;
  produto_id: number;
  url_imagem: string;
  ordem: number;
};

type Produtos = {
  id: number;
  nome: string;
  descricao: string | null;
  preco: number;
  estoque: number;
  imagem: ImagemProduto[];
};

export default function Home() {
  /* para LOJAS */
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [carregandoLojas, setCarregandoLojas] = useState(true);
  const [erroLojas, setErroLojas] = useState("");
  useEffect(() => {
    async function carregarLojas() {
      try {
        const resposta = await fetch("/api/lojas");

        if (resposta.status === 401) {
          window.location.href = "/login";
          return;
        }
        if (!resposta.ok) {
          setErroLojas("Não foi possível carregar as lojas.");
          return;
        }

        const dados: Loja[] = await resposta.json();
        setLojas(dados);
      } catch {
        setErroLojas("Erro de conexão com o servidor.");
      } finally {
        setCarregandoLojas(false);
      }
    }

    carregarLojas();
  }, []);

  /* para CATEGORIAS */
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregandoCategorias, setCarregandoCategorias] = useState(true);
  const [erroCategorias, setErroCategorias] = useState("");
  useEffect(() => {
    async function carregarCategorias() {
      try {
        const resposta = await fetch("/api/categorias");

        if (!resposta.ok) {
          setErroCategorias("Não foi possível carregar as categorias.");
          return;
        }

        const dados: Categoria[] = await resposta.json();
        setCategorias(dados.filter((c) => c.categoria_pai_id === null));
      } catch {
        setErroCategorias("Erro de conexão com o servidor.");
      } finally {
        setCarregandoCategorias(false);
      }
    }

    carregarCategorias();
  }, []);

  /* para PRODUTOS */
  const [produtos, setProdutos] = useState<Produtos[]>([]);
  const [carregandoProdutos, setCarregandoProdutos] = useState(true);
  const [erroProdutos, setErroProdutos] = useState("");
  useEffect(() => {
    async function carregarProdutos() {
      try {
        const resposta = await fetch("/api/produtos");

        if (resposta.status === 401) {
          window.location.href = "/login";
          return;
        }
        if (!resposta.ok) {
          setErroProdutos("Não foi possível carregar os produtos.");
          return;
        }

        const dados: Produtos[] = await resposta.json();
        setProdutos(dados);
      } catch {
        setErroProdutos("Erro de conexão com o servidor.");
      } finally {
        setCarregandoProdutos(false);
      }
    }

    carregarProdutos();
  }, []);

  return (
    <main className="w-full overflow-x-hidden">
      <div className="flex flex-row justify-center bg-[#000000]">
        <div className="flex flex-col mt-27">
          <p className="text-7xl font-semibold">Do CAOS à organização,</p>
          <p className="text-6xl  font-semibold flex ml-auto">
            em alguns cliques
          </p>
        </div>
        <Image
          src="/img_feed/moca_em_pe.png"
          alt="moça em pé"
          width={100000}
          height={10000}
          className="w-130 h-170"
        />
      </div>

      {/* INFO.DE CATEGORIAS */}
      <div className="bg-[#F6F3E4] relative z-10 h-auto w-screen -mt-67">
        <div className=" w-330 pt-10 justify-self-center ">
          <input
            className="flex ml-auto text-base w-200 p-3 rounded-4xl bg-[#FFFFFF] text-black"
            placeholder="Procurar por..."
          ></input>
          <p className="text-black font-semibold text-3xl pt-10">Categorias</p>
          <nav className="overflow-hidden flex flex-row gap-15 pb-5 pt-10">
            {carregandoCategorias ? (
              <p className="text-black text-xl">Carregando categorias...</p>
            ) : erroCategorias ? (
              <p className="text-red-600 text-xl">{erroCategorias}</p>
            ) : categorias.length === 0 ? (
              <p className="text-black text-xl">
                Nenhuma categoria cadastrada.
              </p>
            ) : (
              categorias.map((categoria) => (
                <Link
                  key={categoria.id}
                  href={`/categoria/${gerarSlug(categoria.nome)}`}
                  className="flex flex-col items-center shrink-0"
                >
                  <Image
                    src="/img_feed/adicione_imagem.png"
                    alt={categoria.nome}
                    width={100}
                    height={100}
                    className="w-30 h-30 shrink-0 object-cover"
                  />
                  <p className="text-black text-xl pt-3 capitalize">
                    {categoria.nome}
                  </p>
                </Link>
              ))
            )}
          </nav>

          {/* INFO. DE PRODUTOS */}
          <div>
            <details className="peer">
              <summary className="flex cursor-pointer list-none items-end [&::-webkit-details-marker]:hidden">
                <span className="text-black font-semibold text-3xl pt-10">
                  Produtos
                </span>
                <span className="ml-auto pr-10 text-blue-600 text-lg hover:text-blue-900">
                  ver mais / menos
                </span>
              </summary>
            </details>
            <nav className="flex flex-nowrap gap-10 overflow-hidden pb-5 pt-10 peer-open:flex-wrap">
              {carregandoProdutos ? (
                <p className="text-black text-xl">Carregando produtos...</p>
              ) : erroProdutos ? (
                <p className="text-red-600 text-xl">{erroProdutos}</p>
              ) : produtos.length === 0 ? (
                <p className="text-black text-xl">Nenhum produto cadastrado.</p>
              ) : (
                produtos.map((produto) => {
                  const disponivel = produto.estoque > 0;

                  return (
                    <span
                      key={produto.id}
                      className="bg-[#FFFFFF] p-5 pb-11 shrink-0 rounded-2xl w-65 flex flex-col items-center"
                    >
                      <Image
                        src={
                          produto.imagem && produto.imagem.length > 0
                            ? `http://localhost:3001${produto.imagem[0].url_imagem}`
                            : "/img_feed/adicione_imagem.png"
                        }
                        alt={produto.nome}
                        width={100}
                        height={100}
                        className="w-30 h-30 shrink-0 object-cover"
                      />
                      <div className="pt-5 mr-auto">
                        <p className="line-clamp-2 break-words text-black font-bold text-2xl">
                          {produto.nome}
                        </p>
                        <p className="text-black font-bold text-2xl">
                          {Number(produto.preco).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </p>
                        <p
                          className={`font-bold text-2xl ${disponivel ? "text-green-600" : "text-red-600"}`}
                        >
                          {disponivel ? "Disponível" : "Indisponível"}
                        </p>
                      </div>
                    </span>
                  );
                })
              )}
            </nav>
          </div>

          {/* INFO. DE LOJAS */}
          <div className="relative">
            <details className="peer ">
              <summary className="flex cursor-pointer  list-none items-end [&::-webkit-details-marker]:hidden">
                <span className="text-black font-semibold text-3xl pt-10">
                  Lojas
                </span>
                <details className="group relative  mt-4 w-fit ml-auto ">
                  <summary className="flex w-120 cursor-pointer list-none items-center gap-2 rounded-2xl bg-white pl-6 py-2 text-2xl text-black [&::-webkit-details-marker]:hidden hover:bg-gray-100">
                    filtros
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

                  <div className="absolute top-full z-20 w-120 rounded-lg border border-gray-300 bg-white p-4 text-xl text-black shadow-lg">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="categoria" value="mercado" />
                      Mercado
                    </label>
                  </div>
                </details>
                <span className="ml-10 pr-10 text-blue-600 text-lg hover:text-blue-900">
                  ver mais / menos
                </span>
              </summary>
            </details>

            <nav className="flex flex-nowrap shrink-0 items-center gap-11 overflow-hidden pb-40 pt-10 peer-open:flex-wrap">
              {carregandoLojas ? (
                <p className="text-black text-xl">Carregando lojas...</p>
              ) : erroLojas ? (
                <p className="text-red-600 text-xl">{erroLojas}</p>
              ) : lojas.length === 0 ? (
                <p className="text-black text-xl">Nenhuma loja cadastrada.</p>
              ) : (
                lojas.map((loja) => (
                  <span
                    key={loja.id}
                    className="shrink-0 p-5 max-w-48 flex flex-col items-center"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={loja.logo_url || "/img_feed/lojas/loja_generica.jpg"}
                      alt={`loja ${loja.nome}`}
                      className="w-30 h-30 shrink-0 rounded-full object-cover "
                    />
                    <div className="flex flex-col items-center pt-5">
                      <p className="text-black text-2xl text-center line-clamp-2 break-words">
                        {loja.nome}
                      </p>
                    </div>
                  </span>
                ))
              )}
            </nav>
          </div>
        </div>
      </div>
    </main>
  );
}
