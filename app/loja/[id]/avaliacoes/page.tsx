
import Link from "next/link";
import {
  Estrelas,
} from "@/app/components/loja/LojaAvaliacoes";
import ListaAvaliacoes from "@/app/components/loja/ListaAvaliacoes";
import {
  lojaExemplo,
  avaliacoesExemplo,
} from "../dadosExemplo";

type AvaliacoesPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AvaliacoesPage({
  params,
}: AvaliacoesPageProps) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href={`/loja/${id}`}
          className="mb-8 inline-flex text-sm text-[#8646FF] hover:underline"
        >
          {"← Voltar para a loja"}
        </Link>

        <header className="mb-10 text-center">
          <h1 className="text-2xl sm:text-4xl">
            Reviews e Comentários
          </h1>

          <p className="mt-2 text-sm text-gray-300">
            {lojaExemplo.nome}
          </p>

          {avaliacoesExemplo.length > 0 && (
            <>
              <p className="mt-6 text-4xl sm:text-5xl">
                4.75
              </p>

              <div className="mt-4">
                <Estrelas
                  nota={4.75}
                  tamanho="text-4xl sm:text-5xl"
                />
              </div>
            </>
          )}
        </header>

        <ListaAvaliacoes
          avaliacoes={avaliacoesExemplo}
        />
      </div>
    </main>
  );
}
