
export type ProdutoLoja = {
  id: number;
  nome: string;
  preco: number;
  estoque: number;
  imagemUrl?: string | null;
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
    <article
      className="
        flex h-[278px] w-full flex-col
        overflow-hidden rounded-[32px]
        bg-white px-5 pb-5 pt-3 text-black
      "
    >
      {/* Imagem */}
      <div className="flex h-[155px] w-full items-center justify-center overflow-hidden">
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
  );
}
