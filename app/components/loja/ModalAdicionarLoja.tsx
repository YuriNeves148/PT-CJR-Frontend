
"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { ACEITAR_IMAGEM } from "./enviarImagemLoja";

export type CategoriaModal = {
  id: number;
  nome: string;
};

export type DadosNovaLoja = {
  nome: string;
  categoriaId: number;
  fotoPerfil: File | null;
  logo: File | null;
  banner: File | null;
};

type ModalAdicionarLojaProps = {
  aberto: boolean;
  aoFechar: () => void;
  categorias: CategoriaModal[];
  aoAdicionar: (dados: DadosNovaLoja) => Promise<void> | void;
};

type CampoArquivoProps = {
  titulo: string;
  arquivo: File | null;
  aceitar: string;
  aoSelecionar: (arquivo: File | null) => void;
  icone: ReactNode;
};

const LIMITE_IMAGEM_MB = 10;
const LIMITE_LOGO_MB = 2;

function CampoArquivo({
  titulo,
  arquivo,
  aceitar,
  aoSelecionar,
  icone,
}: CampoArquivoProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={aceitar}
        className="sr-only"
        onChange={(evento: ChangeEvent<HTMLInputElement>) => {
          aoSelecionar(evento.target.files?.[0] ?? null);
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex min-h-[135px] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[#6A38F3] px-4 py-5 text-center transition-colors hover:bg-purple-50"
      >
        <span className="text-[#6A38F3]">{icone}</span>

        <span className="break-all text-sm text-black sm:text-lg">
          {arquivo ? arquivo.name : titulo}
        </span>

        {arquivo && (
          <span className="text-xs text-gray-500">
            Clique para substituir o arquivo
          </span>
        )}
      </button>

      {arquivo && (
        <button
          type="button"
          onClick={() => {
            aoSelecionar(null);
            if (inputRef.current) inputRef.current.value = "";
          }}
          className="mt-1 cursor-pointer text-xs text-[#6A38F3] hover:underline"
        >
          Remover arquivo
        </button>
      )}
    </div>
  );
}

function IconeUpload() {
  return (
    <svg
      width="35"
      height="35"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M12 19v-9m-4 4 4-4 4 4" />
    </svg>
  );
}

function IconeBanner() {
  return (
    <svg
      width="35"
      height="35"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8" cy="9" r="1.5" />
      <path d="m4 18 6-6 4 4 3-3 4 4" />
    </svg>
  );
}

export default function ModalAdicionarLoja({
  aberto,
  aoFechar,
  categorias,
  aoAdicionar,
}: ModalAdicionarLojaProps) {
  const [nome, setNome] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState<File | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!aberto) return;

    function aoPressionarTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") aoFechar();
    }

    document.addEventListener("keydown", aoPressionarTecla);

    return () => {
      document.removeEventListener("keydown", aoPressionarTecla);
    };
  }, [aberto, aoFechar]);

  if (!aberto) return null;

  function validarArquivo(
    arquivo: File | null,
    formatos: string[],
    descricao: string,
    limiteMb = LIMITE_IMAGEM_MB
  ) {
    if (!arquivo) return true;

    const extensao = arquivo.name.split(".").pop()?.toLowerCase();

    if (!extensao || !formatos.includes(extensao)) {
      setErro(`Formato inválido para ${descricao}.`);
      return false;
    }

    if (arquivo.size > limiteMb * 1024 * 1024) {
      setErro(`${descricao} deve ter no máximo ${limiteMb} MB.`);
      return false;
    }

    return true;
  }

  async function enviarFormulario(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (enviando) return;

    setErro("");

    if (!nome.trim() || !categoriaId) {
      setErro("Informe o nome da loja e selecione uma categoria.");
      return;
    }

    if (!validarArquivo(fotoPerfil, ["jpg", "jpeg", "png", "webp"], "Foto de perfil")) return;
    if (!validarArquivo(logo, ["svg", "png", "jpg", "jpeg", "webp"], "Logo", LIMITE_LOGO_MB)) return;
    if (!validarArquivo(banner, ["jpg", "jpeg", "png", "webp"], "Banner")) return;

    setEnviando(true);

    try {
      await aoAdicionar({
        nome: nome.trim(),
        categoriaId: Number(categoriaId),
        fotoPerfil,
        logo,
        banner,
      });

      setNome("");
      setCategoriaId("");
      setFotoPerfil(null);
      setLogo(null);
      setBanner(null);
      aoFechar();
    } catch (erroRecebido) {
      setErro(
        erroRecebido instanceof Error
          ? erroRecebido.message
          : "Não foi possível processar o formulário."
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-3 sm:p-6"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget && !enviando) {
          aoFechar();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-loja"
        className="relative max-h-[95dvh] w-full max-w-[800px] overflow-y-auto rounded-[30px] bg-[#EEEEEE] px-5 pb-9 pt-12 text-black shadow-2xl sm:px-12"
      >
        <button
          type="button"
          onClick={aoFechar}
          disabled={enviando}
          aria-label="Fechar modal"
          className="absolute right-5 top-4 cursor-pointer text-4xl font-light hover:text-[#6A38F3] disabled:opacity-50 sm:right-7"
        >
          ×
        </button>

        <h2
          id="titulo-modal-loja"
          className="mb-7 text-center text-3xl font-normal sm:text-4xl"
        >
          Adicionar loja
        </h2>

        <form
          onSubmit={enviarFormulario}
          className="mx-auto flex w-full max-w-[660px] flex-col gap-4"
        >
          <label className="sr-only" htmlFor="nome-nova-loja">
            Nome da loja
          </label>

          <input
            id="nome-nova-loja"
            type="text"
            value={nome}
            onChange={(evento) => setNome(evento.target.value)}
            placeholder="Nome da loja"
            maxLength={120}
            required
            className="h-[58px] w-full rounded-full bg-white px-7 text-base outline-none focus:ring-2 focus:ring-[#6A38F3]"
          />

          <label className="sr-only" htmlFor="categoria-nova-loja">
            Categoria
          </label>

          <select
            id="categoria-nova-loja"
            value={categoriaId}
            onChange={(evento) => setCategoriaId(evento.target.value)}
            required
            className="h-[58px] w-full rounded-full bg-white px-7 text-base outline-none focus:ring-2 focus:ring-[#6A38F3]"
          >
            <option value="">Categoria</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </select>

          <div className="mt-2 flex flex-col gap-4">
            <CampoArquivo
              titulo="Anexe a foto de perfil de sua loja"
              arquivo={fotoPerfil}
              aceitar=".jpg,.jpeg,.png,.webp"
              aoSelecionar={setFotoPerfil}
              icone={<IconeUpload />}
            />

            <CampoArquivo
              titulo="Anexe a logo de sua loja em SVG, PNG, JPG, JPEG ou WebP (até 2 MB)"
              arquivo={logo}
              aceitar={ACEITAR_IMAGEM.logo}
              aoSelecionar={(arquivo) => {
                setLogo(arquivo);
                setErro(arquivo && arquivo.size > LIMITE_LOGO_MB * 1024 * 1024
                  ? "Logo deve ter no máximo 2 MB. Escolha outro arquivo antes de cadastrar a loja."
                  : "");
              }}
              icone={<IconeUpload />}
            />

            <CampoArquivo
              titulo="Anexe o banner de sua loja"
              arquivo={banner}
              aceitar=".jpg,.jpeg,.png,.webp"
              aoSelecionar={setBanner}
              icone={<IconeBanner />}
            />
          </div>

          {erro && (
            <p role="alert" className="text-center text-sm text-red-600">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="mx-auto mt-3 min-h-[50px] w-full max-w-[300px] cursor-pointer rounded-full bg-[#6A38F3] px-6 text-lg text-white shadow-md transition-colors hover:bg-[#5522D8] disabled:cursor-wait disabled:opacity-60"
          >
            {enviando ? "Processando..." : "Adicionar"}
          </button>
        </form>
      </div>
    </div>
  );
}
