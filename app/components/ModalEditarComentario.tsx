"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";

type ModalEditarComentarioProps = {
  aberto: boolean;
  onFechar: () => void;
  comentarioId: number;
  conteudoInicial: string;
  onEditado?: (comentario: { id: number; conteudo: string }) => void;
};

export default function ModalEditarComentario({
  aberto,
  onFechar,
  comentarioId,
  conteudoInicial,
  onEditado,
}: ModalEditarComentarioProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (aberto && !dialog.open) dialog.showModal();
    if (!aberto && dialog.open) dialog.close();
  }, [aberto]);

  return (
    <dialog
      ref={dialogRef}
      aria-label="Editar comentário"
      onClose={onFechar}
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

      {/* O formulário só existe com o modal aberto: a cada abertura ele
          começa de novo, já com o texto atual do comentário. */}
      {aberto && (
        <FormularioEdicao
          comentarioId={comentarioId}
          conteudoInicial={conteudoInicial}
          onEditado={onEditado}
          fechar={() => dialogRef.current?.close()}
        />
      )}
    </dialog>
  );
}

type FormularioEdicaoProps = {
  comentarioId: number;
  conteudoInicial: string;
  onEditado?: (comentario: { id: number; conteudo: string }) => void;
  fechar: () => void;
};

function FormularioEdicao({
  comentarioId,
  conteudoInicial,
  onEditado,
  fechar,
}: FormularioEdicaoProps) {
  const [conteudo, setConteudo] = useState(conteudoInicial);
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensagem("");

    const texto = conteudo.trim();
    if (!texto) {
      setMensagem("O comentário não pode ficar vazio.");
      return;
    }

    // Nada mudou: só fecha, sem chamar o back
    if (texto === conteudoInicial.trim()) {
      fechar();
      return;
    }

    setEnviando(true);

    try {
      const resposta = await fetch(`/api/comentarios/${comentarioId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conteudo: texto }),
      });

      const dados = await resposta.json().catch(() => null);

      if (!resposta.ok) {
        if (resposta.status === 401) {
          setMensagem("Você precisa estar logado para editar.");
        } else if (resposta.status === 403) {
          setMensagem("Você só pode editar os seus próprios comentários.");
        } else if (resposta.status === 404) {
          setMensagem("Comentário não encontrado.");
        } else {
          const erro = Array.isArray(dados?.message)
            ? dados.message.join(" ")
            : (dados?.message ?? dados?.mensagem);
          setMensagem(erro ?? "Não foi possível editar o comentário.");
        }
        return;
      }

      onEditado?.({ id: comentarioId, conteudo: dados?.conteudo ?? texto });
      fechar();
    } catch {
      setMensagem("Erro de conexão com o servidor. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form
      onSubmit={enviar}
      className="flex flex-col flex-1 min-h-0 items-center gap-4 px-10 pb-4"
    >
      <textarea
        autoFocus
        value={conteudo}
        onChange={(e) => setConteudo(e.target.value)}
        placeholder="Comentário"
        aria-label="Comentário"
        className="w-full flex-1 min-h-0 resize-none rounded-3xl bg-white p-8 text-lg outline-none"
      />

      {mensagem && <p className="text-red-600 text-sm">{mensagem}</p>}

      <button
        type="submit"
        disabled={enviando}
        className="bg-[#6A38F3] hover:bg-[#8c77e6] text-white w-[460px] max-w-full rounded-full py-2 text-lg shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {enviando ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}