// Imagem usada no projeto para loja sem logo/foto.
export const LOGO_LOJA_PADRAO = "/img_feed/loja-sem-imagem.png";

type SeloLojaProps = {
  nome: string;
  logoUrl: string | null | undefined;
  tamanho?: string; // classes de largura/altura, ex.: "h-8 w-8"
  posicao?: string; // distância do canto superior direito, ex.: "right-2 top-2"
};

// Selo discreto da loja no canto superior direito da imagem de um produto.
// O elemento pai precisa ter "relative".
export default function SeloLoja({
  nome,
  logoUrl,
  tamanho = "h-9 w-9",
  posicao = "right-0 top-0",
}: SeloLojaProps) {
  return (
    <span
      title={nome}
      className={`pointer-events-none absolute ${posicao} ${tamanho} overflow-hidden rounded-full border border-white bg-white shadow`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoUrl || LOGO_LOJA_PADRAO}
        alt={`Loja ${nome}`}
        className="h-full w-full object-cover"
      />
    </span>
  );
}
