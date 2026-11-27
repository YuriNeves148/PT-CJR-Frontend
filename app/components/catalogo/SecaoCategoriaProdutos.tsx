import Link from "next/link";
import ProdutoCard, { type ProdutoLoja } from "@/app/components/loja/ProdutoCard";

type SecaoCategoriaProdutosProps = {
  nomeCategoria: string;
  slugCategoria: string;
  produtos: ProdutoLoja[];
};

export default function SecaoCategoriaProdutos({
  nomeCategoria,
  slugCategoria,
  produtos,
}: SecaoCategoriaProdutosProps) {
  if (produtos.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className="flex flex-wrap items-baseline gap-1 text-black">
          <span className="text-[22px] font-semibold">Produtos</span>
          <span className="text-xs font-medium">em {nomeCategoria}</span>
        </h2>

        <Link
          href={`/categoria/${slugCategoria}`}
          className="text-xs font-semibold text-[#6A38F3] hover:underline"
        >
          ver mais
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {produtos.map((produto) => (
          // Mesmo padrão da página da loja: o card inteiro leva ao produto
          <Link
            key={produto.id}
            href={`/produtos_logado?id=${produto.id}`}
            className="block rounded-[32px] transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6A38F3]"
          >
            <ProdutoCard produto={produto} />
          </Link>
        ))}
      </div>
    </section>
  );
}
