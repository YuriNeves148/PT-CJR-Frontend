import { notFound } from "next/navigation";
import LojaHero from "@/app/components/loja/LojaHero";
import LojaAvaliacoes from "@/app/components/loja/LojaAvaliacoes";
import LojaProdutos from "@/app/components/loja/LojaProdutos";
import EditarLoja from "@/app/components/loja/EditarLoja";
import AdicionarAvaliacaoBotao from "@/app/components/loja/AdicionarAvaliacaoBotao";
import {
  buscarLoja,
  getUsuarioSessao,
  mapearAvaliacao,
  mapearProduto,
  produtosMelhorAvaliados,
  urlImagemSegura,
} from "@/app/lib/backend";

type LojaPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LojaPage({ params }: LojaPageProps) {
  const { id } = await params;

  const [consulta, sessao] = await Promise.all([
    buscarLoja(id),
    getUsuarioSessao(),
  ]);

  if (consulta.status === "nao-encontrado") notFound();

  if (consulta.status === "erro") {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-black px-6 text-center text-white">
        <p role="alert">
          Não foi possível carregar a loja agora. Tente novamente em instantes.
        </p>
      </main>
    );
  }

  const loja = consulta.dados;
  const ehDono = sessao?.id === loja.usuario.id;

  return (
    <main className="min-h-screen w-full bg-black">
      <LojaHero
        nome={loja.nome}
        categoria={loja.categoria?.nome ?? "Sem categoria"}
        bannerUrl={urlImagemSegura(loja.banner_url)}
        logoUrl={urlImagemSegura(loja.logo_url)}
        proprietario={loja.usuario.nome}
        perfilHref={`/perfil/${loja.usuario.id}`}
        acoes={
          <div className="flex flex-col items-center gap-3">
            {ehDono && (
              <EditarLoja
                loja={{
                  id: loja.id,
                  nome: loja.nome,
                  categoria_id: loja.categoria?.id ?? null,
                  imagens: {
                    "foto-perfil": urlImagemSegura(loja.foto_perfil_url),
                    logo: urlImagemSegura(loja.logo_url),
                    banner: urlImagemSegura(loja.banner_url),
                  },
                }}
              />
            )}
            <AdicionarAvaliacaoBotao
              lojaId={loja.id}
              lojaNome={loja.nome}
              logado={sessao !== null}
            />
          </div>
        }
      />

      <LojaAvaliacoes
        notaMedia={loja.media_avaliacoes}
        avaliacoes={loja.avaliacoes_loja.map(mapearAvaliacao)}
        avaliacoesHref={`/loja/${loja.id}/avaliacoes`}
      />

      <LojaProdutos
        nomeLoja={loja.nome}
        produtos={loja.produtos.map(mapearProduto)}
        melhoresAvaliados={produtosMelhorAvaliados(loja.produtos)}
        produtosPorPagina={5}
      />
    </main>
  );
}
