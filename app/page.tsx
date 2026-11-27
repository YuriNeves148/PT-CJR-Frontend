import { redirect } from "next/navigation";
import { getUsuarioSessao } from "@/app/lib/backend";

export default async function Home() {
  const usuario = await getUsuarioSessao();
  redirect(usuario ? "/feed_logado" : "/feed_deslogado");
}
