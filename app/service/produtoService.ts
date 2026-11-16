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

// ---------- Criar / editar / deletar produto (usado pelos modais) ----------

// O que o formulário dos modais envia. Mesmo formato do CreateProdutoDto do backend.
export interface ProdutoFormData {
  categoria_id: number;
  nome: string;
  descricao?: string;
  preco: number; // em reais, ex: 4.7
  estoque: number;
}

// Produto completo, usado para preencher o modal de editar
export interface ProdutoDetalhe {
  id: number;
  loja_id: number;
  categoria_id: number;
  nome: string;
  descricao: string | null;
  preco: number;
  estoque: number;
}

// GET é público, então pode chamar o backend direto pelo axios
export async function getProdutoPorId(id: number): Promise<ProdutoDetalhe> {
  const response = await api.get<ProdutoApi>(`/produtos/${id}`);
  const p = response.data;
  return {
    id: p.id,
    loja_id: p.loja_id,
    categoria_id: p.categoria_id,
    nome: p.nome,
    descricao: p.descricao,
    preco: Number(p.preco),
    estoque: p.estoque,
  };
}

// Criar, editar e deletar precisam do token, que está no cookie httpOnly.
// Por isso chamam as rotas do próprio Next (app/api/produtos), e não o backend direto.
async function chamarRotaInterna<T>(url: string, method: string, body?: unknown): Promise<T> {
  const resposta = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    // O Nest manda o erro em "message" (texto ou lista); as rotas do Next mandam em "mensagem"
    const msg = dados?.message ?? dados?.mensagem ?? 'Não foi possível salvar o produto.';
    throw new Error(Array.isArray(msg) ? msg.join(' ') : msg);
  }
  return dados as T;
}

export function criarProduto(lojaId: number, data: ProdutoFormData) {
  return chamarRotaInterna<ProdutoApi>('/api/produtos', 'POST', { loja_id: lojaId, ...data });
}

export function atualizarProduto(id: number, data: Partial<ProdutoFormData>) {
  return chamarRotaInterna<ProdutoApi>(`/api/produtos/${id}`, 'PATCH', data);
}

export function deletarProduto(id: number) {
  return chamarRotaInterna<ProdutoApi>(`/api/produtos/${id}`, 'DELETE');
}
