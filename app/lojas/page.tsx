import type { Metadata } from "next";
import FaixaCategorias from "@/app/components/lojas/FaixaCategorias";
import ListaLojas from "@/app/components/lojas/ListaLojas";
import {
  buscarCategoriasParaLista,
  buscarLojasParaLista,
} from "@/app/lib/lojas";

export const metadata: Metadata = {
  title: "Lojas",
};

export default async function LojasPage() {
  const [lojas, categorias] = await Promise.all([
    buscarLojasParaLista(),
    buscarCategoriasParaLista(),
  ]);

  const todasCategorias = categorias ?? [];
  const principais = todasCategorias.filter(
    (categoria) => categoria.categoria_pai_id === null,
  );

  return (
    <div className="min-h-screen bg-[#f5f2e1]">
      <FaixaCategorias categorias={principais} />

      <main className="mx-auto max-w-[1290px] px-5 py-10 sm:px-8 lg:px-[100px]">
        {lojas === null ? (
          <p role="alert" className="py-10 text-center text-[#d6003f]">
            Não foi possível carregar as lojas. Tente novamente mais tarde.
          </p>
        ) : (
          <ListaLojas lojas={lojas} categorias={todasCategorias} />
        )}
      </main>
    </div>
  );
}