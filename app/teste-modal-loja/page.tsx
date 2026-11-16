
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import ModalAdicionarLoja, {
  type DadosNovaLoja,
  type CategoriaModal,
} from "@/app/components/loja/ModalAdicionarLoja";

type LojaCriada = {
  id: number;
  nome: string;
  categoria_id: number | null;
  usuario_id: number;
};

function obterMensagemErro(resultado: unknown): string {
  if (typeof resultado !== "object" || resultado === null) {
    return "Não foi possível cadastrar a loja.";
  }

  const dados = resultado as {
    message?: string | string[];
  };

  if (Array.isArray(dados.message)) {
    return dados.message.join(" ");
  }

  return dados.message ?? "Não foi possível cadastrar a loja.";
}

export default function TesteModalLojaPage() {
  const [aberto, setAberto] = useState(false);
  const [categorias, setCategorias] = useState<CategoriaModal[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCategorias, setErroCategorias] = useState("");
  const [erroCadastro, setErroCadastro] = useState("");
  const [lojaCriada, setLojaCriada] = useState<LojaCriada | null>(null);

  useEffect(() => {
    const controlador = new AbortController();

    async function carregarCategorias() {
      try {
        const resposta = await fetch("/api/categorias", {
          cache: "no-store",
          signal: controlador.signal,
        });

        if (!resposta.ok) {
          throw new Error("Erro ao carregar categorias.");
        }

        const dados: unknown = await resposta.json();

        if (!Array.isArray(dados)) {
          throw new Error("Formato de categorias inválido.");
        }

        const categoriasValidas = dados.filter(
          (categoria): categoria is CategoriaModal =>
            typeof categoria === "object" &&
            categoria !== null &&
            typeof categoria.id === "number" &&
            typeof categoria.nome === "string"
        );

        if (!controlador.signal.aborted) {
          setCategorias(categoriasValidas);
        }
      } catch (erro) {
        if (!controlador.signal.aborted) {
          setErroCategorias(
            erro instanceof Error
              ? erro.message
              : "Não foi possível consultar as categorias."
          );
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCarregando(false);
        }
      }
    }

    carregarCategorias();

    return () => controlador.abort();
  }, []);

  async function cadastrarLoja(dados: DadosNovaLoja) {
    setErroCadastro("");
    setLojaCriada(null);

    // Os arquivos não devem ser ignorados silenciosamente.
    if (dados.fotoPerfil || dados.logo || dados.banner) {
      throw new Error(
        "O upload de imagens ainda não está disponível. " +
        "Para testar o cadastro, deixe os três anexos vazios."
      );
    }

    const resposta = await fetch("/api/lojas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome: dados.nome,
        categoria_id: dados.categoriaId,
      }),
    });

    const resultado: unknown = await resposta.json();

    if (!resposta.ok) {
      const mensagem = obterMensagemErro(resultado);
      setErroCadastro(mensagem);
      throw new Error(mensagem);
    }

    if (
      typeof resultado !== "object" ||
      resultado === null ||
      !("id" in resultado) ||
      typeof resultado.id !== "number" ||
      !("nome" in resultado) ||
      typeof resultado.nome !== "string" ||
      !("usuario_id" in resultado) ||
      typeof resultado.usuario_id !== "number" ||
      !("categoria_id" in resultado) ||
      (resultado.categoria_id !== null &&
        typeof resultado.categoria_id !== "number")
    ) {
      throw new Error(
        "O servidor respondeu, mas os dados da loja são inválidos."
      );
    }

    setLojaCriada(resultado as LojaCriada);
  }

  return (
    <main className="min-h-screen bg-[#F8F5E9] px-6 py-16 text-black">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-3xl font-bold">
          Cadastro de Loja
        </h1>

        <p className="mb-6 text-gray-700">
          Nesta etapa, o cadastro funciona com nome e categoria.
          O upload de imagens será integrado depois.
        </p>

        {carregando && (
          <p>Carregando categorias...</p>
        )}

        {erroCategorias && (
          <p role="alert" className="mb-4 text-red-600">
            {erroCategorias}
          </p>
        )}

        {!carregando &&
          !erroCategorias &&
          categorias.length === 0 && (
            <p className="mb-4 text-orange-700">
              Nenhuma categoria cadastrada.
            </p>
          )}

        <button
          type="button"
          disabled={
            carregando ||
            !!erroCategorias ||
            categorias.length === 0
          }
          onClick={() => {
            setErroCadastro("");
            setAberto(true);
          }}
          className="cursor-pointer rounded-full bg-[#6A38F3] px-8 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Adicionar loja
        </button>

        {erroCadastro && (
          <p role="alert" className="mt-5 text-red-600">
            {erroCadastro}
          </p>
        )}

        {lojaCriada && (
          <div className="mt-8 rounded-xl border border-green-300 bg-white p-6">
            <h2 className="mb-4 text-xl font-bold text-green-700">
              Loja cadastrada com sucesso!
            </h2>

            <p>ID da loja: {lojaCriada.id}</p>
            <p>Nome: {lojaCriada.nome}</p>
            <p>Categoria ID: {lojaCriada.categoria_id}</p>
            <p>Proprietário ID: {lojaCriada.usuario_id}</p>

            <p className="mt-4 text-sm text-gray-600">
              O cadastro foi confirmado pelo backend.
              A página pública da loja ainda utiliza dados
              demonstrativos e será integrada posteriormente.
            </p>

            <Link
              href="/"
              className="mt-4 inline-block text-[#6A38F3] underline"
            >
              Voltar à página inicial
            </Link>
          </div>
        )}

        <ModalAdicionarLoja
          aberto={aberto}
          aoFechar={() => setAberto(false)}
          categorias={categorias}
          aoAdicionar={cadastrarLoja}
        />
      </div>
    </main>
  );
}
