import { slugify } from "@/app/service/produtoService";

// Categorias definidas pelo sistema: o usuário escolhe uma delas, mas não cria novas.
// Para incluir uma categoria, adicione aqui e em scripts/seed-categorias.mjs (backend).
// O slug é o endereço da página: /categoria/[slug].
export const CATEGORIAS_SISTEMA = [
  { slug: "mercado", nome: "Mercado", imagem: "/img_feed/categorias/mercado.png" },
  { slug: "farmacia", nome: "Farmácia", imagem: "/img_feed/categorias/farmacia.png" },
  { slug: "beleza", nome: "Beleza", imagem: "/img_feed/categorias/beleza.png" },
  { slug: "moda", nome: "Moda", imagem: "/img_feed/categorias/moda.png" },
  { slug: "eletronicos", nome: "Eletrônicos", imagem: "/img_feed/categorias/eletronicos.png" },
  { slug: "tecnologia", nome: "Tecnologia", imagem: "/img_feed/sem-imagem.png" },
  { slug: "jogos", nome: "Jogos", imagem: "/img_feed/categorias/jogos.png" },
  { slug: "brinquedos", nome: "Brinquedos", imagem: "/img_feed/categorias/brinquedos.png" },
  { slug: "casa", nome: "Casa", imagem: "/img_feed/categorias/casa.jpg" },
];

// Das categorias que vieram do banco, devolve só as principais que são do sistema,
// na ordem da lista acima. Mantém o id do banco, usado ao salvar e ao filtrar.
export function filtrarCategoriasSistema<
  T extends { nome: string; categoria_pai_id?: number | null },
>(categorias: T[]): T[] {
  return CATEGORIAS_SISTEMA.flatMap(({ slug }) => {
    const encontrada = categorias.find(
      (c) => (c.categoria_pai_id ?? null) === null && slugify(c.nome) === slug,
    );
    return encontrada ? [encontrada] : [];
  });
}

export function imagemCategoria(nome: string) {
  const slug = slugify(nome);
  return (
    CATEGORIAS_SISTEMA.find((c) => c.slug === slug)?.imagem ??
    "/img_feed/sem-imagem.png"
  );
}
