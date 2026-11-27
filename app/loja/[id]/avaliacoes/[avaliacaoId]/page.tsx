import Link from "next/link";
import { notFound } from "next/navigation";
import { Estrelas } from "@/app/components/loja/LojaAvaliacoes";
import AvatarUsuario from "@/app/components/loja/AvatarUsuario";
import EditarAvaliacaoBotao from "@/app/components/loja/EditarAvaliacaoBotao";
import ComentariosAvaliacao, {
  type ComentarioView,
} from "@/app/components/loja/ComentariosAvaliacao";
import {
  buscarLoja,
  getUsuarioSessao,
  urlImagemSegura,
} from "@/app/lib/backend";
import {
  buscarAvaliacaoLoja,
  buscarComentarios,
  tempoRelativo,
} from "@/app/lib/comentarios";

type PageProps = {
  params: Promise<{ id: string; avaliacaoId: string }>;
};

export default async function ComentariosAvaliacaoPage({ params }: PageProps) {
  const { id, avaliacaoId } = await params;

  const [avaliacao, loja, comentarios, usuario] = await Promise.all([
    buscarAvaliacaoLoja(avaliacaoId),
    buscarLoja(id),
    buscarComentarios(avaliacaoId),
    getUsuarioSessao(),
  ]);

  if (
    avaliacao.status === "nao-encontrado" ||
    loja.status === "nao-encontrado"
  ) {
    notFound();
  }

  if (
    avaliacao.status !== "ok" ||
    loja.status !== "ok" ||
    comentarios.status !== "ok"
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-center text-white">
        <p role="alert">
          Não foi possível carregar os comentários agora. Tente novamente em
          instantes.
        </p>
      </main>
    );
  }

  // A avaliação precisa ser da loja que está na URL
  if (avaliacao.dados.loja_id !== loja.dados.id) notFound();

  const autor = avaliacao.dados.usuario;

  const itens: ComentarioView[] = comentarios.dados.map((comentario) => ({
    id: comentario.id,
    conteudo: comentario.conteudo,
    tempo: tempoRelativo(comentario.createdAt),
    autor: {
      nome: comentario.usuario.nome,
      fotoUrl: urlImagemSegura(comentario.usuario.foto_perfil_url),
    },
    donoDaLoja: comentario.usuario.id === loja.dados.usuario_id,
    editavel: usuario !== null && usuario.id === comentario.usuario.id,
  }));

  return (
    <main className="min-h-screen bg-[#F8F5E9]">
      <header className="min-h-[280px] bg-black px-5 py-10 text-white sm:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-4">
            <Link
              href={`/loja/${loja.dados.id}/avaliacoes`}
              aria-label="Voltar para as avaliações"
              className="text-3xl leading-none hover:opacity-70"
            >
              {"<"}
            </Link>

            <AvatarUsuario
              nome={autor.nome}
              fotoUrl={urlImagemSegura(autor.foto_perfil_url)}
              tamanho="h-14 w-14"
            />

            <div className="flex items-baseline gap-2">
              <h1 className="text-xl sm:text-2xl">{autor.nome}</h1>
              <span className="text-xs text-gray-400">
                {tempoRelativo(avaliacao.dados.createdAt)}
              </span>
            </div>

            <div className="ml-auto flex flex-col items-end gap-2">
              {usuario !== null && usuario.id === autor.id && (
                <EditarAvaliacaoBotao
                  avaliacaoId={avaliacao.dados.id}
                  nome={loja.dados.nome}
                  voltarPara={`/loja/${loja.dados.id}/avaliacoes`}
                />
              )}
              <Estrelas nota={avaliacao.dados.nota} tamanho="text-2xl" />
            </div>
          </div>

          <p className="mt-8 text-base leading-relaxed sm:text-lg">
            {avaliacao.dados.comentario}
          </p>
        </div>
      </header>

      <ComentariosAvaliacao
        avaliacaoId={avaliacao.dados.id}
        comentarios={itens}
        logado={usuario !== null}
      />
    </main>
  );
}