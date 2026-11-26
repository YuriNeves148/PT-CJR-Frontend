
import Link from "next/link";

export type AvaliacaoLoja = {
  id: number;
  nome: string;
  fotoUrl?: string | null;
  nota: number;
  comentario: string;
};

type LojaAvaliacoesProps = {
  notaMedia: number | null;
  avaliacoes: AvaliacaoLoja[];
  avaliacoesHref?: string;
};

// Componente de estrelas com preenchimento proporcional
export function Estrelas({
  nota,
  tamanho = "text-3xl",
  corVazia = "text-white",
}: {
  nota: number;
  tamanho?: string;
  corVazia?: string; // cor da estrela vazia (branca sobre fundo escuro, cinza sobre fundo claro)
}) {
  // Garante que a nota fique entre 0 e 5
  const notaValida = Math.max(0, Math.min(5, nota));

  return (
    <div
      className={`inline-flex ${tamanho} leading-none`}
      role="img"
      aria-label={`Avaliação de ${notaValida.toFixed(2)} de 5 estrelas`}
    >
      {Array.from({ length: 5 }, (_, indice) => {
        // Calcula o preenchimento de cada estrela
        const preenchimento =
          Math.max(0, Math.min(1, notaValida - indice)) * 100;

        return (
          <span
            key={indice}
            className="relative inline-block"
            aria-hidden="true"
          >
            {/* Estrela vazia */}
            <span className={corVazia}>★</span>

            {/* Parte amarela */}
            <span
              className="absolute inset-0 overflow-hidden whitespace-nowrap text-[#FFE600]"
              style={{
                clipPath: `inset(0 ${100 - preenchimento}% 0 0)`,
              }}
            >
              ★
            </span>
          </span>
        );
      })}
    </div>
  );
}

export default function LojaAvaliacoes({
  notaMedia,
  avaliacoes,
  avaliacoesHref,
}: LojaAvaliacoesProps) {
  return (
    <section className="w-full bg-black px-4 py-10 text-white md:px-10 lg:py-12">
      <div className="mx-auto max-w-6xl">

        {/* Título e média das avaliações */}
        <div className="text-center">
          <h2 className="text-2xl font-normal md:text-4xl">
            Reviews e Comentários
          </h2>

          {notaMedia !== null ? (
            <>
              <p className="mt-5 text-4xl md:text-5xl">
                {notaMedia.toFixed(2)}
              </p>

              <div className="mt-5">
                <Estrelas
                  nota={notaMedia}
                  tamanho="text-4xl md:text-5xl"
                />
              </div>
            </>
          ) : (
            <p className="mt-5 text-xl text-gray-400">
              Sem avaliações
            </p>
          )}
        </div>

        {/* Link para a página de avaliações */}
        <div className="mb-4 mt-4 flex justify-end">
          {avaliacoesHref ? (
            <Link
              href={avaliacoesHref}
              className="text-sm text-[#8646FF] transition-colors hover:text-[#A785FF]"
            >
              ver mais
            </Link>
          ) : (
            <span className="text-sm text-[#8646FF]">
              ver mais
            </span>
          )}
        </div>

        {/* Carrossel horizontal */}
        {avaliacoes.length > 0 ? (
          <div
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4"
          >
            {avaliacoes.map((avaliacao) => (
              <article
                key={avaliacao.id}
                className="
                  relative
                  flex h-[165px]
                  w-[85%] flex-none snap-start
                  items-center gap-4
                  overflow-hidden
                  rounded-[28px]
                  bg-[#F8F5E9]
                  p-4 text-black
                  sm:w-[75%]
                  md:h-[185px]
                  md:w-[680px]
                  md:gap-5
                  md:p-6
                "
              >
                {/* Foto de perfil */}
                <div
                  className="
                    h-20 w-20
                    flex-none overflow-hidden
                    rounded-full bg-gray-200
                    md:h-28 md:w-28
                  "
                >
                  {avaliacao.fotoUrl ? (
                    <img
                      src={avaliacao.fotoUrl}
                      alt={`Foto de ${avaliacao.nome}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center text-3xl text-gray-600"
                    >
                      {avaliacao.nome.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Informações da avaliação */}
                <div className="flex h-full min-w-0 flex-1 flex-col py-1">

                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="text-base font-medium md:text-xl">
                      {avaliacao.nome}
                    </h3>

                    <Estrelas
                      nota={avaliacao.nota}
                      tamanho="text-xl md:text-2xl"
                    />
                  </div>

                  {/* Comentário limitado a três linhas */}
                  <p
                    className="
                      mt-2 line-clamp-3
                      overflow-hidden
                      text-sm leading-snug
                      md:text-base
                    "
                  >
                    {avaliacao.comentario}
                  </p>

                  {/* Espaço reservado ao link de detalhes */}
                  <div className="mt-auto flex justify-end">
                    <span className="text-sm text-[#8646FF]">
                      ver mais
                    </span>
                  </div>

                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-gray-400">
            Esta loja ainda não possui avaliações.
          </p>
        )}
      </div>
    </section>
  );
}
