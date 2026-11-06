import { api } from './api';

// Formato que o backend devolve (Prisma: Produtos, Categorias e Imagens_Produtos)
interface ProdutoApi {
  id: number;
  loja_id: number;
  categoria_id: number;
  nome: string;
  descricao: string | null;
  preco: string; // Decimal do Prisma chega como string, ex: "3899.99"
  estoque: number;
  imagem?: { url_imagem: string; ordem: number }[];
}

export interface Categoria {
  id: number;
  nome: string;
  categoria_pai_id: number | null;
}

export interface Produto {
  id: number;
  categoriaId: number;
  nome: string;
  preco: number;
  imagem: string;
  disponivel: boolean;
}

// "Acessórios" -> "acessorios", usado na URL /categoria/[slug]
export function slugify(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-');
}

export async function getCategorias(): Promise<Categoria[]> {
  const response = await api.get<Categoria[]>('/categorias');
  return response.data;
}

export async function getProdutos(): Promise<Produto[]> {
  const response = await api.get<ProdutoApi[]>('/produtos');
  return response.data.map((p) => {
    const primeiraImagem = [...(p.imagem ?? [])].sort((a, b) => a.ordem - b.ordem)[0];
    return {
      id: p.id,
      categoriaId: p.categoria_id,
      nome: p.nome,
      preco: Number(p.preco),
      imagem: primeiraImagem?.url_imagem ?? '/logo-stockio.png',
      disponivel: p.estoque > 0,
    };
  });
}
