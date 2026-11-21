"use client";

import { useState } from "react";
import ModalEditarLoja, { type LojaEditavel } from "./ModalEditarLoja";

// A página do servidor renderiza este controle apenas para o proprietário.
export default function EditarLoja({ loja }: { loja: LojaEditavel }) {
  const [aberto, setAberto] = useState(false);
  const [mensagem, setMensagem] = useState("");
  return (
    <div className="w-full bg-black px-4 pt-6 text-white md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col items-end gap-3">
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={aberto}
          onClick={() => {
            setMensagem("");
            setAberto(true);
          }}
          className="cursor-pointer rounded-full bg-[#6A38F3] px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#5522D8]"
        >
          Editar loja
        </button>
        <p role="status" className="text-sm">
          {mensagem}
        </p>
      </div>
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
