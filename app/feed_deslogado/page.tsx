import { redirect } from "next/navigation";
import FeedConteudo from "@/app/components/feed/FeedConteudo";
import { getUsuarioSessao } from "@/app/lib/backend";

// Home de quem não está logado: mesmo conteúdo do feed logado, com a navbar
// deslogada. Quem já tem sessão vai para o feed logado.
export default async function FeedDeslogado() {
  if (await getUsuarioSessao()) redirect("/feed_logado");
  return <FeedConteudo />;
}
