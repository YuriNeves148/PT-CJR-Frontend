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
  imagem?: { id: number; url_imagem: string; ordem: number }[];
}

// O backend salva as fotos como "/uploads/produtos/arquivo.jpg" e serve essa pasta
// na porta dele (3001). Sem completar o endereço, o navegador procuraria a foto no Next (3000).
export function urlImagem(caminho: string) {
  if (/^(https?:|blob:|data:)/.test(caminho)) return caminho;
  return `${api.defaults.baseURL}${caminho}`;
}

export interface Categoria {
  id: number;
  nome: string;
  categoria_pai_id: number | null;
}

export interface Produto {
  id: number;
  categoriaId: number;
  lojaId: number;
  nome: string;
  preco: number;
  imagem: string;
  disponivel: boolean;
}

// Formato que o backend devolve para GET /lojas (listagem pública, sem produtos/avaliações)
interface LojaApi {
  id: number;
  nome: string;
  logo_url: string | null;
  sticker_url: string | null;
}

export interface Loja {
  id: number;
  nome: string;
  logoUrl: string | null;
}

// GET /lojas é público (listagem geral de lojas, diferente de /lojas/me)
export async function getLojas(): Promise<Loja[]> {
  const response = await api.get<LojaApi[]>('/lojas');
  return response.data.map((l) => ({
    id: l.id,
    nome: l.nome,
    logoUrl: l.logo_url ? urlImagem(l.logo_url) : l.sticker_url ? urlImagem(l.sticker_url) : null,
  }));
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
      lojaId: p.loja_id,
      nome: p.nome,
      preco: Number(p.preco),
      imagem: primeiraImagem ? urlImagem(primeiraImagem.url_imagem) : '/logo-stockio.png',
      disponivel: p.estoque > 0,
    };
  });
}

// ---------- Criar / editar / deletar produto (usado pelos modais) ----------

// O que o formulário dos modais envia. Mesmo formato do CreateProdutoDto do backend.
export interface ProdutoFormData {
  categoria_id: number;
  nome: string;
  descricao?: string | null; // null apaga a descrição que existia
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
  imagens: { id: number; url: string }[]; // em ordem; vazio se o backend ainda não devolver fotos
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
    imagens: [...(p.imagem ?? [])]
      .sort((a, b) => a.ordem - b.ordem)
      .map((img) => ({ id: img.id, url: urlImagem(img.url_imagem) })),
  };
}

// Criar, editar e deletar precisam do token, que está no cookie httpOnly.
// Por isso chamam as rotas do próprio Next (app/api/produtos), e não o backend direto.
async function chamarRotaInterna<T>(url: string, method: string, body?: unknown): Promise<T> {
  // FormData (fotos) vai como está: o navegador monta o Content-Type com o "boundary" sozinho
  const ehArquivo = body instanceof FormData;
  const resposta = await fetch(url, {
    method,
    headers: body && !ehArquivo ? { 'Content-Type': 'application/json' } : undefined,
    body: ehArquivo ? body : body ? JSON.stringify(body) : undefined,
  });
  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    // 401: sem login ou login vencido (o backend responde só "Unauthorized", em inglês)
    if (resposta.status === 401) {
      throw new Error('Sua sessão expirou ou você não está logado. Faça login novamente.');
    }
    // O Nest manda o erro em "message" (texto ou lista); as rotas do Next mandam em "mensagem"
    const msg = dados?.message ?? dados?.mensagem ?? 'Não foi possível salvar o produto.';
    throw new Error(Array.isArray(msg) ? msg.join(' ') : msg);
  }
  return dados as T;
}

export function criarProduto(lojaId: number, data: ProdutoFormData) {
  // /api/produtos/criar (e não /api/produtos) para não colidir com a rota GET /api/produtos
  // que a branch feed_integrado cria para listar os produtos do usuário
  return chamarRotaInterna<ProdutoApi>('/api/produtos/criar', 'POST', { loja_id: lojaId, ...data });
}

export function atualizarProduto(id: number, data: Partial<ProdutoFormData>) {
  return chamarRotaInterna<ProdutoApi>(`/api/produtos/${id}`, 'PATCH', data);
}

export function deletarProduto(id: number) {
  return chamarRotaInterna<ProdutoApi>(`/api/produtos/${id}`, 'DELETE');
}

// ---------- Fotos do produto ----------

// Uma foto de um dos 4 espaços do modal, na hora de salvar:
// - arquivo: foto nova escolhida (null = foto já salva que não mudou)
// - imagemId: id da foto que já existia naquele espaço (se tiver, a foto é trocada em vez de criada)
export type FotoParaSalvar = { arquivo: File | null; imagemId?: number } | null;

function formularioComFoto(arquivo: File) {
  const form = new FormData();
  form.append('imagem', arquivo); // nome do campo esperado pelo FileInterceptor('imagem') do backend
  return form;
}

// Adiciona uma foto nova. O backend coloca ela depois das que já existem.
export function enviarImagemProduto(produtoId: number, arquivo: File) {
  return chamarRotaInterna(`/api/produtos/${produtoId}/imagem`, 'POST', formularioComFoto(arquivo));
}

// Troca uma foto que já existe por outra (mantém a mesma posição)
export function substituirImagemProduto(produtoId: number, imagemId: number, arquivo: File) {
  return chamarRotaInterna(`/api/produtos/${produtoId}/imagens/${imagemId}`, 'PATCH', formularioComFoto(arquivo));
}

export function removerImagemProduto(produtoId: number, imagemId: number) {
  return chamarRotaInterna(`/api/produtos/${produtoId}/imagens/${imagemId}`, 'DELETE');
}

// Envia as fotos dos espaços que mudaram, uma por vez e na ordem dos espaços,
// para a foto do espaço grande ser a primeira. Espaços com índice em "jaEnviadas" são pulados:
// assim, se uma foto falhar e o usuário clicar em salvar de novo, as outras não são duplicadas.
export async function salvarFotosProduto(produtoId: number, fotos: FotoParaSalvar[], jaEnviadas: Set<number>) {
  for (const [indice, foto] of fotos.entries()) {
    if (!foto?.arquivo || jaEnviadas.has(indice)) continue;

    if (foto.imagemId) {
      await substituirImagemProduto(produtoId, foto.imagemId, foto.arquivo);
    } else {
      await enviarImagemProduto(produtoId, foto.arquivo);
    }
    jaEnviadas.add(indice);
  }
}
