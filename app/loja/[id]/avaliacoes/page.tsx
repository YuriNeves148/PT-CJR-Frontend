import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Estrelas,
} from "@/app/components/loja/LojaAvaliacoes";
import ListaAvaliacoes from "@/app/components/loja/ListaAvaliacoes";
import { buscarLoja, mapearAvaliacao } from "@/app/lib/backend";

type AvaliacoesPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AvaliacoesPage({
  params,
}: AvaliacoesPageProps) {
  const { id } = await params;
  const consulta = await buscarLoja(id);

  if (consulta.status === "nao-encontrado") notFound();

  if (consulta.status === "erro") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-center text-white">
        <p role="alert">
          Não foi possível carregar as avaliações agora. Tente novamente em instantes.
        </p>
      </main>
    );
  }

  const loja = consulta.dados;
  const avaliacoes = loja.avaliacoes_loja.map(mapearAvaliacao);

  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href={`/loja/${loja.id}`}
          className="mb-8 inline-flex text-sm text-[#8646FF] hover:underline"
        >
          {"← Voltar para a loja"}
        </Link>

        <header className="mb-10 text-center">
          <h1 className="text-2xl sm:text-4xl">
            Reviews e Comentários
          </h1>

          <p className="mt-2 text-sm text-gray-300">
            {loja.nome}
          </p>

          {loja.media_avaliacoes !== null && (
            <>
              <p className="mt-6 text-4xl sm:text-5xl">
                {loja.media_avaliacoes.toFixed(2)}
              </p>

              <div className="mt-4">
                <Estrelas
                  nota={loja.media_avaliacoes}
                  tamanho="text-4xl sm:text-5xl"
                />
              </div>
            </>
          )}
        </header>

        <ListaAvaliacoes
          avaliacoes={avaliacoes}
          comentariosHref={`/loja/${loja.id}/avaliacoes`}
        />
      </div>
    </main>
  );
}
