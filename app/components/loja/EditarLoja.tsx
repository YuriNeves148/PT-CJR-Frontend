"use client";

import { useState } from "react";
import ModalEditarLoja, { type LojaEditavel } from "./ModalEditarLoja";

// A página do servidor renderiza este controle apenas para o proprietário.
export default function EditarLoja({ loja }: { loja: LojaEditavel }) {
  const [aberto, setAberto] = useState(false);
  const [mensagem, setMensagem] = useState("");
  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Editar loja"
        aria-haspopup="dialog"
        aria-expanded={aberto}
        onClick={() => {
          setMensagem("");
          setAberto(true);
        }}
        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#6A38F3] text-white transition-colors hover:bg-[#5522D8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6A38F3] active:bg-[#481BB8]"
      >
        {/* Lápis (Figma): o "+" ao lado é o botão de avaliar a loja */}
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </button>
      <p
        role="status"
        className={
          mensagem
            ? "absolute right-0 top-full mt-2 w-56 rounded-xl bg-black/80 p-3 text-sm text-white"
            : "sr-only"
        }
      >
        {mensagem}
      </p>
      {aberto && (
        <ModalEditarLoja
          loja={loja}
          aoFechar={() => setAberto(false)}
          aoSalvar={() => {
            setMensagem("Alterações da loja salvas com sucesso.");
            setAberto(false);
          }}
        />
      )}
    </div>
  );
}
