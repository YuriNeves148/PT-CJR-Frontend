
import Link from "next/link";

type LojaHeroProps = {
  nome: string;
  categoria: string;
  bannerUrl?: string | null;
  proprietario: string;
  perfilHref?: string;
};

export default function LojaHero({
  nome,
  categoria,
  bannerUrl,
  proprietario,
  perfilHref,
}: LojaHeroProps) {
  return (
    <section
      className="
        relative flex
        h-[300px] w-full
        flex-col justify-center
        overflow-hidden
        bg-neutral-800
        bg-cover bg-center bg-no-repeat
        text-[#F8F5E9]
        sm:h-[400px]
        lg:h-[540px]
      "
      style={
        bannerUrl
          ? { backgroundImage: `url("${bannerUrl}")` }
          : undefined
      }
    >
      {/* Degradê escuro sobre a imagem */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.65) 35%, rgba(0,0,0,0.35) 70%, rgba(0,0,0,0.25) 100%)",
        }}
      />

      {/* Nome e categoria da loja */}
      <div className="relative z-10 mx-auto w-fit max-w-full px-6">
        <h1
          className="
            text-4xl font-semibold
            tracking-tight
            sm:text-5xl
            lg:text-7xl
          "
        >
          {nome}
        </h1>

        <p className="text-base sm:text-lg lg:text-xl">
          {categoria}
        </p>
      </div>

      {/* Nome do proprietário */}
      <div
        className="
          absolute bottom-5 right-5 z-10
          text-xs
          sm:right-8 sm:text-sm
          lg:right-12
        "
      >
        <span>by </span>

        {perfilHref ? (
          <Link
            href={perfilHref}
            className="underline transition-colors duration-300 hover:text-[#C6E700]"
          >
            {proprietario}
          </Link>
        ) : (
          <span>{proprietario}</span>
        )}
      </div>
    </section>
  );
}
