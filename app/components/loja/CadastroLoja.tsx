"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { filtrarCategoriasSistema } from "@/app/lib/categoriasSistema";

import ModalAdicionarLoja, {
  type CategoriaModal,
  type DadosNovaLoja,
} from "./ModalAdicionarLoja";
import {
  ACEITAR_IMAGEM,
  ROTULOS_IMAGEM,
  enviarImagemLoja,
  mensagemDeErro,
  type TipoImagemLoja,
} from "./enviarImagemLoja";

type LojaCriada = { id: number; nome: string };

type EstadoImagem = {
  tipo: TipoImagemLoja;
  arquivo: File;
  status: "enviando" | "enviada" | "falhou";
  mensagem?: string;
};

type CadastroLojaProps = {
  // Conteúdo e estilo do botão que abre o modal
  children?: ReactNode;
  className?: string;
};

const ORDEM_ENVIO: TipoImagemLoja[] = ["foto-perfil", "logo", "banner"];

// Fluxo completo de cadastro: cria a loja e, com o ID retornado, envia as
// imagens. Se algum upload falhar, a loja não é recriada: o usuário pode
// tentar novamente ou escolher outro arquivo para a mesma loja.
export default function CadastroLoja({
  children = "Adicionar loja",
  className = "cursor-pointer rounded-full bg-[#6A38F3] px-8 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50",
}: CadastroLojaProps) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [categorias, setCategorias] = useState<CategoriaModal[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCategorias, setErroCategorias] = useState("");
  const [lojaCriada, setLojaCriada] = useState<LojaCriada | null>(null);
  const [imagens, setImagens] = useState<EstadoImagem[]>([]);

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
          setCategorias(filtrarCategoriasSistema(categoriasValidas));
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

  function atualizarImagem(tipo: TipoImagemLoja, dados: Partial<EstadoImagem>) {
    setImagens((anteriores) =>
      anteriores.map((imagem) =>
        imagem.tipo === tipo ? { ...imagem, ...dados } : imagem
      )
    );
  }

  async function enviar(lojaId: number, tipo: TipoImagemLoja, arquivo: File) {
    atualizarImagem(tipo, { arquivo, status: "enviando", mensagem: undefined });

    const resultado = await enviarImagemLoja(lojaId, tipo, arquivo);

    atualizarImagem(
      tipo,
      resultado.ok
        ? { status: "enviada" }
        : { status: "falhou", mensagem: resultado.mensagem }
    );
  }

  async function cadastrarLoja(dados: DadosNovaLoja) {
    setLojaCriada(null);
    setImagens([]);

    // 1. Cria a loja (erros aqui aparecem no próprio modal)
    const resposta = await fetch("/api/lojas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: dados.nome,
        categoria_id: dados.categoriaId,
      }),
    });

    const resultado: unknown = await resposta.json().catch(() => null);

    if (!resposta.ok) {
      throw new Error(
        mensagemDeErro(resultado, "Não foi possível cadastrar a loja.")
      );
    }

    if (
      typeof resultado !== "object" ||
      resultado === null ||
      !("id" in resultado) ||
      typeof resultado.id !== "number" ||
      !("nome" in resultado) ||
      typeof resultado.nome !== "string"
    ) {
      throw new Error(
        "O servidor respondeu, mas os dados da loja são inválidos."
      );
    }

    const loja: LojaCriada = { id: resultado.id, nome: resultado.nome };

    // 2. Envia as imagens selecionadas usando o ID retornado
    const arquivos: Record<TipoImagemLoja, File | null> = {
      "foto-perfil": dados.fotoPerfil,
      logo: dados.logo,
      banner: dados.banner,
    };

    const selecionadas = ORDEM_ENVIO.flatMap((tipo) => {
      const arquivo = arquivos[tipo];
      return arquivo
        ? [{ tipo, arquivo, status: "enviando" as const }]
        : [];
    });

    setLojaCriada(loja);
    setImagens(selecionadas);

    for (const { tipo, arquivo } of selecionadas) {
      await enviar(loja.id, tipo, arquivo);
    }

    router.refresh();
  }

  const enviando = imagens.some((imagem) => imagem.status === "enviando");
  const falhas = imagens.filter((imagem) => imagem.status === "falhou");
  const concluido = lojaCriada && !enviando;

  return (
    <>
      <button
        type="button"
        disabled={carregando || !!erroCategorias || categorias.length === 0}
        onClick={() => setAberto(true)}
        className={className}
      >
        {children}
      </button>

      {erroCategorias && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {erroCategorias}
        </p>
      )}

      {!carregando && !erroCategorias && categorias.length === 0 && (
        <p className="mt-2 text-sm text-orange-700">
          Nenhuma categoria cadastrada.
        </p>
      )}

      {lojaCriada && (
        <div
          role="status"
          className={`mt-6 w-full rounded-xl border bg-white p-6 text-black ${
            concluido && falhas.length > 0
              ? "border-orange-300"
              : "border-green-300"
          }`}
        >
          <h2
            className={`mb-3 text-xl font-bold ${
              concluido && falhas.length > 0
                ? "text-orange-700"
                : "text-green-700"
            }`}
          >
            {!concluido
              ? "Loja criada. Enviando imagens..."
              : falhas.length > 0
                ? "Cadastro parcialmente concluído"
                : "Loja criada com sucesso!"}
          </h2>

          <p>
            A loja <strong>{lojaCriada.nome}</strong> foi cadastrada.
            {concluido && falhas.length > 0 &&
              " Algumas imagens não foram enviadas. Você pode tentar novamente sem criar outra loja."}
          </p>

          {imagens.length > 0 && (
            <ul className="mt-4 flex flex-col gap-3">
              {imagens.map((imagem) => (
                <ItemImagem
                  key={imagem.tipo}
                  imagem={imagem}
                  aoTentarNovamente={(arquivo) =>
                    enviar(lojaCriada.id, imagem.tipo, arquivo).then(() =>
                      router.refresh()
                    )
                  }
                />
              ))}
            </ul>
          )}

          <Link
            href={`/loja/${lojaCriada.id}`}
            className="mt-5 inline-block font-semibold text-[#6A38F3] underline"
          >
            Ver loja
          </Link>
        </div>
      )}

      <ModalAdicionarLoja
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        categorias={categorias}
        aoAdicionar={cadastrarLoja}
      />
    </>
  );
}

function ItemImagem({
  imagem,
  aoTentarNovamente,
}: {
  imagem: EstadoImagem;
  aoTentarNovamente: (arquivo: File) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const rotulo = ROTULOS_IMAGEM[imagem.tipo];

  return (
    <li className="flex flex-col gap-1 border-t border-gray-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium">
          {rotulo}:{" "}
          {imagem.status === "enviando" && (
            <span className="text-gray-600">enviando...</span>
          )}
          {imagem.status === "enviada" && (
            <span className="text-[#5E7A00]">enviada</span>
          )}
          {imagem.status === "falhou" && (
            <span className="text-red-600">falhou</span>
          )}
        </p>
        <p className="break-all text-xs text-gray-500">{imagem.arquivo.name}</p>
        {imagem.mensagem && (
          <p className="text-sm text-red-600">{imagem.mensagem}</p>
        )}
      </div>

      {imagem.status === "falhou" && (
        <div className="flex shrink-0 gap-4">
          <button
            type="button"
            onClick={() => aoTentarNovamente(imagem.arquivo)}
            className="cursor-pointer text-sm font-semibold text-[#6A38F3] hover:underline"
          >
            Tentar novamente
          </button>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="cursor-pointer text-sm font-semibold text-[#6A38F3] hover:underline"
          >
            Escolher outro arquivo
          </button>

          <input
            ref={inputRef}
            type="file"
            accept={ACEITAR_IMAGEM[imagem.tipo]}
            className="sr-only"
            onChange={(evento) => {
              const arquivo = evento.target.files?.[0];
              evento.target.value = "";
              if (arquivo) aoTentarNovamente(arquivo);
            }}
          />
        </div>
      )}
    </li>
  );
}
