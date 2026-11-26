import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ListaReviews from "@/app/components/avaliacoes/ListaReviews";
import ProdutoCard from "@/app/components/loja/ProdutoCard";
import EditarProduto from "@/app/components/produto/EditarProduto";
import GaleriaProduto from "@/app/components/produto/GaleriaProduto";
import {
  avaliacoesValidas,
  buscarAvaliacoesProduto,
  buscarCategoria,
  buscarLoja,
  buscarProduto,
  getUsuarioSessao,
  imagensDoProduto,
  mapearProduto,
  mapearReview,
  mediaAvaliacoes,
  urlImagemSegura,
} from "@/app/lib/backend";
import { LOGO_LOJA_PADRAO } from "@/app/components/loja/SeloLoja";

type ProdutoPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function textoEstoque(estoque: number) {
  if (estoque <= 0) return "indisponível";
  return estoque === 1 ? "1 disponível" : `${estoque} disponíveis`;
}

function textoReviews(media: number | null, total: number) {
  if (media === null) return "Sem avaliações";
  return `${media.toFixed(1)} | ${total} ${total === 1 ? "review" : "reviews"}`;
}

// Página do produto: /produtos_logado?id=1
export default async function ProdutosLogado({ searchParams }: ProdutoPageProps) {
  const { id } = await searchParams;
  if (typeof id !== "string") notFound();

  const [consulta, sessao] = await Promise.all([buscarProduto(id), getUsuarioSessao()]);

  if (consulta.status === "nao-encontrado") notFound();

  if (consulta.status === "erro") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f4e8] px-6 text-center">
        <p role="alert" className="text-[#171917]">
          Não foi possível carregar o produto agora. Tente novamente em instantes.
        </p>
      </main>
    );
  }

  const produto = consulta.dados;
  const [consultaLoja, consultaCategoria, consultaAvaliacoes] = await Promise.all([
    buscarLoja(String(produto.loja_id)),
    buscarCategoria(produto.categoria_id),
    buscarAvaliacoesProduto(produto.id),
  ]);

  // Se alguma destas falhar, o produto continua aparecendo.
  const loja = consultaLoja.status === "ok" ? consultaLoja.dados : null;
  const categoria = consultaCategoria.status === "ok" ? consultaCategoria.dados.nome : null;
  const avaliacoes =
    consultaAvaliacoes.status === "ok" ? avaliacoesValidas(consultaAvaliacoes.dados) : null;

  // O backend também confere o dono em toda edição.
  const ehDono = sessao !== null && sessao.id === loja?.usuario.id;
  // Selo da loja: o logo dela ou, se não tiver, a imagem padrão de loja do projeto.
  const selo = loja
    ? { nome: loja.nome, logoUrl: urlImagemSegura(loja.logo_url) ?? LOGO_LOJA_PADRAO }
    : null;
  const outrosProdutos = (loja?.produtos ?? [])
    .filter((outro) => outro.id !== produto.id)
    .map((outro) => ({ ...mapearProduto(outro), loja: selo }));

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f4e8]">
      {/* primeira parte */}
      <div className="mx-6 mt-20 flex flex-col gap-7 lg:mx-20 lg:flex-row 2xl:mx-40">
        <Link href={sessao ? "/feed_logado" : "/feed_deslogado"} aria-label="Voltar para o feed" className="h-12 w-8 shrink-0">
          <Image
            src="/seta_voltar.png"
            alt="seta"
            width={100}
            height={100}
            className="w-8 h-12 hover:p-1 duration-200"
          />
        </Link>

        {/* imagens do produto */}
        <GaleriaProduto key={produto.id} nome={produto.nome} imagens={imagensDoProduto(produto)} loja={selo} />

        {/* descricao do produto */}
        <div className="min-w-0 lg:flex-1">
          <div className="flex flex-row gap-5 mb-2">
            <h1 className="min-w-0 break-words text-black font-bold text-5xl">{produto.nome}</h1>
            {ehDono && <EditarProduto produtoId={produto.id} />}
          </div>
          <div className="flex flex-row flex-wrap items-center text-black gap-x-8 gap-y-2 text-xl pb-2">
            <span className="flex items-center gap-3">
              <Image
                src="/estrela.png"
                alt=""
                width={100}
                height={100}
                className="w-7 h-7 "
              />
              <span>
                {avaliacoes
                  ? textoReviews(mediaAvaliacoes(avaliacoes), avaliacoes.length)
                  : "Avaliações indisponíveis"}
              </span>
            </span>
            {categoria && <p className="text-purple-800 capitalize">{categoria}</p>}
            <p className={produto.estoque > 0 ? "text-purple-800" : "text-red-600"}>
              {textoEstoque(produto.estoque)}
            </p>
          </div>
          <p className="text-black text-6xl pt-2 pb-8">
            {Number(produto.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
          <section className="text-wrap text-black ">
            <h2 className="text-3xl pb-3 ">Descrição</h2>
            {/* whitespace-pre-line mantém os parágrafos e as quebras de linha salvos no banco */}
            <p className="max-w-160 break-words text-lg whitespace-pre-line">
              {produto.descricao || "Este produto ainda não tem descrição."}
            </p>
          </section>
        </div>
      </div>

      {/* segunda parte */}
      <div className="mx-6 text-black lg:mx-20 2xl:mx-40">
        <p className="text-3xl pt-10 pb-4">Da mesma loja</p>
        {outrosProdutos.length > 0 ? (
          <div className="flex flex-row overflow-x-auto gap-8 p-2">
            {outrosProdutos.map((outro) => (
              <Link
                key={outro.id}
                href={`/produtos_logado?id=${outro.id}`}
                className="w-[205px] shrink-0 rounded-[32px] shadow-lg transition-opacity hover:opacity-80"
              >
                <ProdutoCard produto={outro} />
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">
            {loja ? "Esta loja não tem outros produtos." : "Não foi possível carregar os produtos da loja."}
          </p>
        )}
      </div>

      {/* reviews */}
      <div className="mx-6 mt-10 mb-20 lg:mx-20 2xl:mx-40">
        <ListaReviews
          key={produto.id}
          titulo="Reviews"
          reviews={avaliacoes?.map(mapearReview) ?? null}
          textoVazio="Este produto ainda não tem avaliações."
        />
      </div>
    </main>
  );
}
