import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import GaleriaProduto from "@/app/components/produto/GaleriaProduto";
import EditarProdutoBotao from "@/app/components/produto/EditarProdutoBotao";
import ProdutoCard from "@/app/components/loja/ProdutoCard";
import ListaAvaliacoes from "@/app/components/loja/ListaAvaliacoes";
import AdicionarAvaliacaoBotao from "@/app/components/loja/AdicionarAvaliacaoBotao";
import { Estrelas } from "@/app/components/loja/LojaAvaliacoes";
import {
  buscarAvaliacoesProduto,
  buscarCategoria,
  buscarLoja,
  buscarProduto,
  getUsuarioSessao,
  mapearAvaliacao,
  mapearProduto,
  urlImagemSegura,
} from "@/app/lib/backend";
import { slugify } from "@/app/service/produtoService";

type ProdutoPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ProdutoPageProps): Promise<Metadata> {
  const { id } = await params;
  const consulta = await buscarProduto(id);
  return consulta.status === "ok" ? { title: consulta.dados.nome } : {};
}

function formatarPreco(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ProdutoPage({ params }: ProdutoPageProps) {
  const { id } = await params;
  const [consulta, sessao] = await Promise.all([buscarProduto(id), getUsuarioSessao()]);

  if (consulta.status === "nao-encontrado") notFound();

  const produto = consulta.status === "ok" ? consulta.dados : null;
  const [lojaConsulta, categoriaConsulta, avaliacoesConsulta] = produto
    ? await Promise.all([
        buscarLoja(String(produto.loja_id)),
        buscarCategoria(produto.categoria_id),
        buscarAvaliacoesProduto(produto.id),
      ])
    : [];

  if (!produto || lojaConsulta?.status !== "ok" || avaliacoesConsulta?.status !== "ok") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F5E9] px-6 text-center text-black">
        <p role="alert">Não foi possível carregar o produto agora. Tente novamente em instantes.</p>
      </main>
    );
  }

  const loja = lojaConsulta.dados;
  const categoria = categoriaConsulta?.status === "ok" ? categoriaConsulta.dados.nome : null;
  const avaliacoes = avaliacoesConsulta.dados;
  const total = avaliacoes.length;
  const media = total > 0 ? avaliacoes.reduce((soma, a) => soma + a.nota, 0) / total : null;
  const ehDono = sessao?.id === loja.usuario.id;
  const disponivel = produto.estoque > 0;

  const imagens = [...produto.imagem]
    .sort((a, b) => a.ordem - b.ordem)
    .flatMap((imagem) => {
      const url = urlImagemSegura(imagem.url_imagem);
      return url ? [{ id: imagem.id, url }] : [];
    });

  const daMesmaLoja = loja.produtos
    .filter((outro) => outro.id !== produto.id)
    .map(mapearProduto);

  return (
    <main className="min-h-screen bg-[#F8F5E9] text-black">
      <div className="mx-auto w-full max-w-[1290px] px-5 py-10 sm:px-8 lg:px-[100px]">
        <Link
          href={`/loja/${loja.id}`}
          aria-label={`Voltar para a loja ${loja.nome}`}
          className="inline-block transition-opacity hover:opacity-70"
        >
          <Image src="/seta_voltar.png" alt="" width={32} height={48} className="h-10 w-auto" />
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <GaleriaProduto nome={produto.nome} imagens={imagens} />

          <section aria-labelledby="nome-produto" className="min-w-0">
            <div className="flex items-start gap-4">
              <h1 id="nome-produto" className="break-words text-3xl font-bold sm:text-5xl">
                {produto.nome}
              </h1>
              {ehDono && <EditarProdutoBotao produtoId={produto.id} lojaId={loja.id} />}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-2 text-lg sm:text-xl">
              <span className="flex items-center gap-2">
                <Image src="/estrela.png" alt="" width={28} height={28} className="h-7 w-7" />
                {media !== null ? media.toFixed(1) : "–"} | {total} {total === 1 ? "review" : "reviews"}
              </span>
              {categoria && (
                <Link href={`/categoria/${slugify(categoria)}`} className="text-[#6A38F3] hover:underline">
                  {categoria}
                </Link>
              )}
              <span className={disponivel ? "text-[#6A38F3]" : "text-[#CF002D]"}>
                {disponivel
                  ? `${produto.estoque} ${produto.estoque === 1 ? "disponível" : "disponíveis"}`
                  : "Indisponível"}
              </span>
            </div>

            <p className="pb-6 pt-4 text-4xl sm:text-6xl">{formatarPreco(Number(produto.preco))}</p>

            <p className="text-base">
              Vendido por{" "}
              <Link href={`/loja/${loja.id}`} className="font-semibold text-[#6A38F3] hover:underline">
                {loja.nome}
              </Link>
            </p>

            <h2 className="pb-3 pt-8 text-2xl sm:text-3xl">Descrição</h2>
            <p className="whitespace-pre-line break-words text-lg">
              {produto.descricao?.trim() || "Este produto ainda não possui descrição."}
            </p>
          </section>
        </div>

        <section aria-labelledby="da-mesma-loja" className="mt-14">
          <h2 id="da-mesma-loja" className="pb-5 text-2xl sm:text-3xl">
            Da mesma loja
          </h2>
          {daMesmaLoja.length > 0 ? (
            <div className="flex snap-x snap-mandatory gap-7 overflow-x-auto pb-3">
              {daMesmaLoja.map((outro) => (
                <div key={outro.id} className="w-[205px] shrink-0 snap-start">
                  <ProdutoCard produto={outro} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Esta loja ainda não possui outros produtos.</p>
          )}
        </section>
      </div>

      <section aria-labelledby="reviews-produto" className="bg-black px-5 py-12 text-white sm:px-8">
        <div className="mx-auto max-w-5xl">
          <header className="relative mb-10 text-center">
            <h2 id="reviews-produto" className="text-2xl sm:text-4xl">
              Reviews e Comentários
            </h2>
            {media !== null && (
              <>
                <p className="mt-6 text-4xl sm:text-5xl">{media.toFixed(2)}</p>
                <div className="mt-4">
                  <Estrelas nota={media} tamanho="text-4xl sm:text-5xl" />
                </div>
              </>
            )}
            <div className="mt-6 flex justify-center sm:absolute sm:right-0 sm:top-0 sm:mt-0">
              <AdicionarAvaliacaoBotao
                tipo="produto"
                alvoId={produto.id}
                nome={produto.nome}
                logado={sessao !== null}
              />
            </div>
          </header>

          <ListaAvaliacoes
            avaliacoes={avaliacoes.map(mapearAvaliacao)}
            comentariosHref={`/produto/${produto.id}/avaliacoes`}
            mensagemVazia="Este produto ainda não possui avaliações."
          />
        </div>
      </section>
    </main>
  );
}
