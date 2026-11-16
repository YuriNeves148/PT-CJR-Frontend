import { redirect } from "next/navigation";
import { getUsuarioSessao } from "@/app/lib/backend";

export default async function PerfilLogadoPage() {
  const usuario = await getUsuarioSessao();
  redirect(usuario ? `/perfil/${usuario.id}` : "/login");
}
