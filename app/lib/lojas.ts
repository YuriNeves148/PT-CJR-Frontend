import { BACKEND_URL, urlImagemSegura } from "@/app/lib/backend";

export type CategoriaLista = {
  id: number;
  nome: string;
  categoria_pai_id: number | null;
};

type LojaApi = {
  id: number;
  nome: string;
  logo_url: string | null;
  sticker_url: string | null;
  categoria: { id: number; nome: string } | null;
};

export type LojaCard = {
  id: number;
  nome: string;
  logoUrl: string | null;
  categoria: string | null;
  categoriaId: number | null;
};

async function listar<T>(caminho: string): Promise<T | null> {
  try {
    const resposta = await fetch(`${BACKEND_URL}${caminho}`, {
      cache: "no-store",
    });
    if (!resposta.ok) return null;
    return (await resposta.json()) as T;
  } catch {
    return null;
  }
}

// GET /lojas é público. Devolve null se o back estiver fora do ar.
export async function buscarLojasParaLista(): Promise<LojaCard[] | null> {
  const lojas = await listar<LojaApi[]>("/lojas");
  if (!lojas) return null;

  return lojas.map((loja) => ({
    id: loja.id,
    nome: loja.nome,
    logoUrl:
      urlImagemSegura(loja.logo_url) ?? urlImagemSegura(loja.sticker_url),
    categoria: loja.categoria?.nome ?? null,
    categoriaId: loja.categoria?.id ?? null,
  }));
}

export function buscarCategoriasParaLista() {
  return listar<CategoriaLista[]>("/categorias");
}

// "Eletrônicos" -> "eletronicos" (usado na URL /categoria/[slug])
export function slugCategoria(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
}