
import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

type LojaHeroProps = {
  nome: string;
  categoria: string;
  descricao?: string | null;
  bannerUrl?: string | null;
  logoUrl?: string | null;
  proprietario: string;
  perfilHref?: string;
  acoes?: ReactNode;
};

export default function LojaHero({
  nome,
  categoria,
  descricao,
  bannerUrl,
  logoUrl,
  proprietario,
  perfilHref,
  acoes,
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

      {acoes && (
        <div className="absolute right-5 top-[20%] z-20 sm:right-8 lg:right-[8%]">
          {acoes}
        </div>
      )}

      {/* Nome e categoria da loja */}
      <div className="relative z-10 mx-auto w-fit max-w-full px-6">
        {logoUrl && (
          <Image
            src={logoUrl}
            alt={`Logo de ${nome}`}
            width={128}
            height={128}
            unoptimized
            className="mb-4 h-20 w-20 object-contain sm:h-24 sm:w-24 lg:h-28 lg:w-28"
          />
        )}
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

        {descricao && (
          <p className="mt-3 line-clamp-2 max-w-2xl text-sm text-[#F8F5E9]/85 sm:text-base">
            {descricao}
          </p>
        )}
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
