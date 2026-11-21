"use client";

import { useRef, type ChangeEvent, type ReactNode } from "react";
import Image from "next/image";

type CampoArquivoProps = {
  titulo: string;
  arquivo: File | null;
  aceitar: string;
  aoSelecionar: (arquivo: File | null) => void;
  icone: ReactNode;
  imagemAtual?: string | null;
  salvo?: boolean;
  desabilitado?: boolean;
};

export default function CampoArquivo({
  titulo,
  arquivo,
  aceitar,
  aoSelecionar,
  icone,
  imagemAtual,
  salvo = false,
  desabilitado = false,
}: CampoArquivoProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={aceitar}
        aria-label={titulo}
        tabIndex={-1}
        disabled={desabilitado}
        className="sr-only"
        onChange={(evento: ChangeEvent<HTMLInputElement>) => {
          aoSelecionar(evento.target.files?.[0] ?? null);
          evento.target.value = "";
        }}
      />

      <button
        type="button"
        disabled={desabilitado}
        onClick={() => inputRef.current?.click()}
        className="relative flex min-h-[136px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl px-4 py-3 text-center transition-colors hover:bg-purple-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6A38F3] disabled:cursor-wait disabled:opacity-60"
      >
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full fill-none text-[#6A38F3]"
        >
          <rect
            x="1"
            y="1"
            width="calc(100% - 2px)"
            height="calc(100% - 2px)"
            rx="10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="24 20"
          />
        </svg>
        <span className="text-[#6A38F3]">{icone}</span>

        <span className="text-sm leading-6 text-black sm:text-lg">
          {titulo}
        </span>

        {arquivo && (
          <span className="max-w-full break-all text-xs text-gray-500">
            Selecionado: {arquivo.name} — clique para substituir
          </span>
        )}
        {!arquivo && (imagemAtual || salvo) && (
          <span className="flex items-center gap-2 text-xs text-gray-600">
            {imagemAtual && (
              <Image
                src={imagemAtual}
                alt=""
                width={28}
                height={20}
                unoptimized
                className="h-5 w-7 rounded object-contain"
              />
            )}
            {salvo ? "Imagem salva" : "Imagem atual mantida"}
          </span>
        )}
      </button>

      {arquivo && (
        <button
          type="button"
          disabled={desabilitado}
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

export function IconeUpload() {
  return (
    <svg
      width="35"
      height="44"
      viewBox="0 0 35 44"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 0h15l15 15v24a5 5 0 0 1-5 5H5a5 5 0 0 1-5-5V5a5 5 0 0 1 5-5Z"
        fill="currentColor"
      />
      <path d="M20 4v12h11L20 4Z" fill="#EEEEEE" />
      <path d="m17.5 22-9 10h6v7h6v-7h6l-9-10Z" fill="#EEEEEE" />
    </svg>
  );
}

export function IconeBanner() {
  return (
    <svg
      width="35"
      height="44"
      viewBox="0 0 35 44"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 0h15l15 15v24a5 5 0 0 1-5 5H5a5 5 0 0 1-5-5V5a5 5 0 0 1 5-5Z"
        fill="currentColor"
      />
      <circle cx="23" cy="12" r="3" fill="#EEEEEE" />
      <path
        d="m17.5 23-5 5a3 3 0 0 0 2 5v3a3 3 0 0 0 6 0v-3a3 3 0 0 0 2-5l-5-5Z"
        fill="#EEEEEE"
      />
    </svg>
  );
}
