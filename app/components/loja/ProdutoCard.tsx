import Link from "next/link";

export type ProdutoLoja = {
  id: number;
  nome: string;
  preco: number;
  estoque: number;
  imagemUrl?: string | null;
  criadoEm?: number;
  media?: number | null;
  // Selo da loja vendedora (opcional: usado no catálogo geral, não faz sentido dentro da própria página da loja)
  loja?: { nome: string; logoUrl?: string | null } | null;
};

type ProdutoCardProps = {
  produto: ProdutoLoja;
};

export default function ProdutoCard({
  produto,
}: ProdutoCardProps) {
  const disponivel = produto.estoque > 0;

  const precoFormatado = produto.preco.toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  );

  return (
    <Link
      href={`/produto/${produto.id}`}
      className="block rounded-[32px] transition-shadow hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6A38F3]"
    >
      <article
        className="
          flex h-[278px] w-full flex-col
          overflow-hidden rounded-[32px]
          bg-white px-5 pb-5 pt-3 text-black
        "
      >
        {/* Imagem */}
        <div className="relative flex h-[155px] w-full items-center justify-center overflow-hidden">
          {produto.imagemUrl ? (
            <img
              src={produto.imagemUrl}
              alt={produto.nome}
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-center text-xs text-gray-400">
              Produto sem imagem
            </span>
          )}

          {/* Selo da loja vendedora */}
          {produto.loja && (
            <span
              title={produto.loja.nome}
              className="absolute right-0 top-0 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white bg-white shadow"
            >
              {produto.loja.logoUrl ? (
                <img
                  src={produto.loja.logoUrl}
                  alt={produto.loja.nome}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-[10px] font-semibold text-[#6A38F3]">
                  {produto.loja.nome.slice(0, 2).toUpperCase()}
                </span>
              )}
            </span>
          )}
        </div>

        {/* Informações */}
        <div className="mt-auto">
          <h3
            className="truncate text-[20px] font-semibold leading-tight"
            title={produto.nome}
          >
            {produto.nome}
          </h3>

          <p className="mt-1 text-[19px] font-medium leading-tight">
            {precoFormatado}
          </p>

          <p
            className={`mt-1.5 text-[11px] font-medium ${
              disponivel
                ? "text-[#A5CE00]"
                : "text-[#CF002D]"
            }`}
          >
            {disponivel ? "DISPONÍVEL" : "INDISPONÍVEL"}
          </p>
        </div>
      </article>
    </Link>
  );
}
