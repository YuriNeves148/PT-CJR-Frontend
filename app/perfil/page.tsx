import { redirect } from "next/navigation";
import { getUsuarioSessao, idValido } from "@/app/lib/backend";

export default async function PerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string | string[] }>;
}) {
  const { id } = await searchParams;
  if (typeof id === "string" && idValido(id)) redirect(`/perfil/${id}`);

  const usuario = await getUsuarioSessao();
  if (!usuario) redirect("/login");
  redirect(`/perfil/${usuario.id}`);
}
