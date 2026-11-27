"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import ModalEditarComentario from "@/app/components/ModalEditarComentario";
import AvatarUsuario from "./AvatarUsuario";

export type ComentarioView = {
  id: number;
  conteudo: string;
  tempo: string;
  autor: { nome: string; fotoUrl: string | null };
  donoDaLoja: boolean;
  editavel: boolean;
};

type ComentariosAvaliacaoProps = {
  tipo?: "loja" | "produto";
  avaliacaoId: number;
  comentarios: ComentarioView[];
  logado: boolean;
};

export default function ComentariosAvaliacao({
  tipo = "loja",
  avaliacaoId,
  comentarios,
  logado,
}: ComentariosAvaliacaoProps) {
  const router = useRouter();
  const [editando, setEditando] = useState<ComentarioView | null>(null);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensagem("");

    const conteudo = texto.trim();
    if (!conteudo) return;

    setEnviando(true);

    try {
      const resposta = await fetch("/api/comentarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conteudo,
          [tipo === "produto" ? "avaliacao_produto_id" : "avaliacao_loja_id"]: avaliacaoId,
        }),
      });

      if (!resposta.ok) {
        if (resposta.status === 401) {
          setMensagem("Faça login para comentar.");
        } else {
          const dados = await resposta.json().catch(() => null);
          setMensagem(dados?.mensagem ?? "Não foi possível enviar o comentário.");
        }
        return;
      }

      setTexto("");
      router.refresh();
    } catch {
      setMensagem("Erro de conexão com o servidor. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-12">
      {comentarios.length === 0 ? (
        <p className="py-6 text-gray-600">Ainda não há comentários.</p>
      ) : (
        <ul className="flex flex-col gap-6 border-l border-black/40 pl-6">
          {comentarios.map((comentario) => (
            <li key={comentario.id} className="flex gap-4">
              <AvatarUsuario
                nome={comentario.autor.nome}
                fotoUrl={comentario.autor.fotoUrl}
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <h3 className="font-medium text-black">
                    {comentario.autor.nome}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {comentario.tempo}
                  </span>
                </div>

                {comentario.donoDaLoja && (
                  <p className="text-[10px] leading-none text-[#6A38F3]">
                    dono(a) da loja
                  </p>
                )}

                <p className="mt-1 whitespace-pre-wrap break-words text-sm text-black">
                  {comentario.conteudo}
                </p>
              </div>

              {comentario.editavel && (
                <button
                  type="button"
                  aria-label="Editar comentário"
                  onClick={() => setEditando(comentario)}
                  className="h-fit cursor-pointer text-black hover:opacity-60"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {logado && (
        <form onSubmit={enviar} className="mt-12">
          <div className="flex items-center rounded-full bg-white px-6 py-3 shadow-sm">
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Adicionar comentário"
              className="flex-1 bg-transparent text-black outline-none placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={enviando || !texto.trim()}
              aria-label="Enviar comentário"
              className="cursor-pointer text-gray-500 hover:text-[#6A38F3] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
                <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
          {mensagem && (
            <p className="mt-2 pl-6 text-sm text-red-600">{mensagem}</p>
          )}
        </form>
      )}

      <ModalEditarComentario
        aberto={editando !== null}
        onFechar={() => setEditando(null)}
        comentarioId={editando?.id ?? 0}
        conteudoInicial={editando?.conteudo ?? ""}
        onEditado={() => router.refresh()}
      />
    </section>
  );
}