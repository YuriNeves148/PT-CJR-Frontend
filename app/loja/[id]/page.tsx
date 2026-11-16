
import LojaHero from "@/app/components/loja/LojaHero";
import LojaAvaliacoes from "@/app/components/loja/LojaAvaliacoes";
import LojaProdutos from "@/app/components/loja/LojaProdutos";

import {
  lojaExemplo,
  avaliacoesExemplo,
  produtosExemplo,
} from "./dadosExemplo";

type LojaPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LojaPage({
  params,
}: LojaPageProps) {
  const { id } = await params;

  const melhoresAvaliadosExemplo =
    produtosExemplo.slice(0, 5);

  return (
    <main className="min-h-screen w-full bg-black">
      <LojaHero
        nome={lojaExemplo.nome}
        categoria={lojaExemplo.categoria}
        bannerUrl={lojaExemplo.bannerUrl}
        proprietario={lojaExemplo.proprietario}
        perfilHref="/perfil/1"
      />

      <LojaAvaliacoes
        notaMedia={4.75}
        avaliacoes={avaliacoesExemplo}
        avaliacoesHref={`/loja/${id}/avaliacoes`}
      />

      <LojaProdutos
        nomeLoja={lojaExemplo.nome}
        produtos={produtosExemplo}
        melhoresAvaliados={melhoresAvaliadosExemplo}
        produtosPorPagina={5}
      />
    </main>
  );
}
