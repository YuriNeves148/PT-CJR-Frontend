import { redirect } from "next/navigation";
import FeedConteudo from "@/app/components/feed/FeedConteudo";
import { getUsuarioSessao } from "@/app/lib/backend";

// Home de quem está logado. O conteúdo é o mesmo do feed deslogado;
// só a navbar muda (ela mesma confere a sessão).
export default async function FeedLogado() {
  if (!(await getUsuarioSessao())) redirect("/feed_deslogado");
  return <FeedConteudo />;
}
