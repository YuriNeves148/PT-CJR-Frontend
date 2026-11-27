import Feed from "@/app/components/feed/Feed";
import { buscarDadosFeed } from "@/app/lib/backend";

export default async function FeedDeslogadoPage() {
  const [categorias, lojas, produtos] = await buscarDadosFeed();

  return (
    <Feed
      categorias={categorias.status === "ok" ? categorias.dados : null}
      lojas={lojas.status === "ok" ? lojas.dados : null}
      produtos={produtos.status === "ok" ? produtos.dados : null}
    />
  );
}
