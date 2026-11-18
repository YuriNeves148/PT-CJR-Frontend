"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";

type ModalComentarioProps = {
  aberto: boolean;
  onFechar: () => void;
  avaliacaoLojaId?: number;
  avaliacaoProdutoId?: number;
  onCriado?: () => void;
};

export default function ModalComentario({
  aberto,
  onFechar,
  avaliacaoLojaId,
  avaliacaoProdutoId,
  onCriado,
}: ModalComentarioProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [conteudo, setConteudo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (aberto && !dialog.open) dialog.showModal();
    if (!aberto && dialog.open) dialog.close();
  }, [aberto]);

  function aoFechar() {
    setConteudo("");
    setMensagem("");
    onFechar();
  }

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensagem("");

    const texto = conteudo.trim();
    if (!texto) {
      setMensagem("Escreva um comentário antes de enviar.");
      return;
    }

    setEnviando(true);

    try {
      const resposta = await fetch("/api/comentarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conteudo: texto,
          ...(avaliacaoLojaId != null
            ? { avaliacao_loja_id: avaliacaoLojaId }
            : {}),
          ...(avaliacaoProdutoId != null
            ? { avaliacao_produto_id: avaliacaoProdutoId }
            : {}),
        }),
      });

      if (!resposta.ok) {
        if (resposta.status === 401) {
          setMensagem("Você precisa estar logado para comentar.");
        } else {
          const dados = await resposta.json().catch(() => null);
          setMensagem(
            dados?.mensagem ?? "Não foi possível enviar o comentário.",
          );
        }
        return;
      }

      onCriado?.();
      dialogRef.current?.close();
    } catch {
      setMensagem("Erro de conexão com o servidor. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={aoFechar}
      className="open:flex flex-col rounded-4xl p-6 m-auto bg-[#EDEDED] w-[830px] max-w-[95vw] h-[510px] max-h-[95vh] backdrop:bg-black/60"
    >
      <button
        type="button"
        aria-label="Fechar"
        onClick={() => dialogRef.current?.close()}
        className="self-end cursor-pointer"
      >
        <Image
          src="/img_esq_senha/x_fechar.png"
          alt="Fechar"
          width={32}
          height={32}
          className="w-8 h-8 hover:scale-110"
        />
      </button>

      <form
        onSubmit={enviar}
        className="flex flex-col flex-1 min-h-0 items-center gap-4 px-10 pb-4"
      >
        <textarea
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          placeholder="Comentário"
          className="w-full flex-1 min-h-0 resize-none rounded-3xl bg-white p-8 text-lg outline-none"
        />

        {mensagem && <p className="text-red-600 text-sm">{mensagem}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="bg-[#6A38F3] hover:bg-[#8c77e6] text-white w-[460px] max-w-full rounded-full py-2 text-lg shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {enviando ? "Enviando..." : "Avaliar"}
        </button>
      </form>
    </dialog>
  );
}
