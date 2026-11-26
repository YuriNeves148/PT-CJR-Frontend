import Link from "next/link";
import { slugCategoria, type CategoriaLista } from "@/app/lib/lojas";

// Mesmos ícones da tela de catálogo (public/icones_catalogo)
const ICONES_CATEGORIA: Record<string, string> = {
  mercado: "/icones_catalogo/healthicons_vegetables-outline.svg",
  farmacia: "/icones_catalogo/hugeicons_medicine-02.svg",
  beleza: "/icones_catalogo/streamline-ultimate_make-up-lipstick.svg",
  moda: "/icones_catalogo/ph_dress-light.svg",
  eletronicos: "/icones_catalogo/cil_laptop.svg",
  jogos: "/icones_catalogo/proicons_game.svg",
  brinquedos: encodeURI("/icones_catalogo/noun-doll-7208768 1.svg"),
};

function IconeCasa({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 45 45" className={className} aria-hidden="true">
      <path
        d="M22.5 5.5L4 20.5H9.5V39.5H19V27H26V39.5H35.5V20.5H41L22.5 5.5Z"
        fill="#6A38F3"
      />
    </svg>
  );
}

function IconeGenerico({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 45 45" className={className} aria-hidden="true">
      <circle cx="22.5" cy="22.5" r="15" fill="#6A38F3" />
    </svg>
  );
}

export default function FaixaCategorias({
  categorias,
}: {
  categorias: CategoriaLista[];
}) {
  return (
    <section className="bg-black px-6 py-8 md:px-[7vw]">
      <h1 className="mb-5 text-2xl font-semibold text-white">Categoria</h1>
      <nav aria-label="Categorias" className="overflow-x-auto pb-2">
        <div className="mx-auto flex w-max min-w-full justify-center gap-4">
          {categorias.map((categoria) => {
            const slug = slugCategoria(categoria.nome);
            const icone = ICONES_CATEGORIA[slug];

            return (
              <Link
                key={categoria.id}
                href={`/categoria/${slug}`}
                className="flex w-20 shrink-0 flex-col items-center gap-2 rounded-3xl bg-white px-2 py-4 text-center text-black"
              >
                <span className="flex h-10 w-10 items-center justify-center">
                  {slug === "casa" ? (
                    <IconeCasa className="h-10 w-10" />
                  ) : icone ? (
                    <img
                      src={icone}
                      alt=""
                      aria-hidden="true"
                      className="h-10 w-10"
                    />
                  ) : (
                    <IconeGenerico className="h-10 w-10" />
                  )}
                </span>
                <span className="text-[11px] font-medium">
                  {categoria.nome}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </section>
  );
}