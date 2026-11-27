import { redirect } from "next/navigation";
import { idValido } from "@/app/lib/backend";

export default async function ProdutosLogadoPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string | string[] }>;
}) {
  const { id } = await searchParams;
  redirect(typeof id === "string" && idValido(id) ? `/produto/${id}` : "/catalogo");
}
