// Acesso ao backend NestJS a partir do servidor Next.js.
// Usado apenas em Server Components e Route Handlers: o JWT do cookie
// HTTP-only "session" nunca é exposto ao JavaScript do navegador.
import { cookies } from "next/headers";
import type { AvaliacaoLoja } from "@/app/components/loja/LojaAvaliacoes";
import type { ProdutoLoja } from "@/app/components/loja/ProdutoCard";
import type { Review } from "@/app/components/avaliacoes/ListaReviews";

export const BACKEND_URL = (
  process.env.BACKEND_URL ?? "http://localhost:3001"
).replace(/\/+$/, "");

// Endereço público usado nas URLs das imagens (pode diferir do interno).
const BACKEND_PUBLIC_URL = (
  process.env.BACKEND_PUBLIC_URL ?? BACKEND_URL
).replace(/\/+$/, "");

// ---------------------------------------------------------------------------
// Tipos retornados pelo backend
// ---------------------------------------------------------------------------

export type UsuarioSessao = {
  id: number;
  nome: string;
  username?: string;
  email?: string;
};

type CategoriaApi = { id: number; nome: string } | null;

type ProdutoApi = {
  id: number;
  nome: string;
  preco: string | number;
  estoque: number;
  imagem?: { url_imagem: string; ordem: number }[];
  media_avaliacoes: number | null;
  total_avaliacoes: number;
};

type AvaliacaoLojaApi = {
  id: number;
  nota: number;
  comentario: string | null;
  usuario: { id: number; nome: string; foto_perfil_url: string | null };
};

export type LojaApi = {
  id: number;
  nome: string;
  usuario_id: number;
  logo_url: string | null;
  banner_url: string | null;
  foto_perfil_url: string | null;
  categoria: CategoriaApi;
  usuario: {
    id: number;
    nome: string;
    foto_perfil_url: string | null;
  };
  produtos: ProdutoApi[];
  avaliacoes_loja: AvaliacaoLojaApi[];
  media_avaliacoes: number | null;
  total_avaliacoes: number;
};

// Resposta de GET /produtos/:id
export type ProdutoDetalheApi = {
  id: number;
  loja_id: number;
  categoria_id: number;
  nome: string;
  descricao: string | null;
  preco: string | number;
  estoque: number;
  imagem?: { id: number; url_imagem: string; ordem: number }[];
};

// Resposta de GET /avaliacoes-produtos
export type AvaliacaoApi = {
  id: number;
  nota: number;
  comentario: string | null;
  createdAt: string | null;
  produto_id?: number;
  loja_id?: number;
  usuario: { id: number; nome: string; foto_perfil_url: string | null };
};

export type PerfilPublico = {
  id: number;
  nome: string;
  username: string | null;
  foto_perfil_url: string | null;
  lojas: {
    id: number;
    nome: string;
    foto_perfil_url: string | null;
    logo_url: string | null;
    banner_url: string | null;
    categoria: CategoriaApi;
  }[];
};

// Resultado de uma consulta: dados, inexistente (404) ou falha do backend.
export type Consulta<T> =
  | { status: "ok"; dados: T }
  | { status: "nao-encontrado" }
  | { status: "erro" };

// ---------------------------------------------------------------------------
// Sessão
// ---------------------------------------------------------------------------

export async function getTokenSessao() {
  const cookieStore = await cookies();
  return cookieStore.get("session")?.value ?? null;
}

// Usuário autenticado, ou null se não houver sessão válida.
export async function getUsuarioSessao(): Promise<UsuarioSessao | null> {
  const token = await getTokenSessao();
  if (!token) return null;

  try {
    const resposta = await fetch(`${BACKEND_URL}/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!resposta.ok) return null;

    const usuario: unknown = await resposta.json();

    if (
      typeof usuario === "object" &&
      usuario !== null &&
      "id" in usuario &&
      typeof usuario.id === "number"
    ) {
      return usuario as UsuarioSessao;
    }

    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Consultas públicas
// ---------------------------------------------------------------------------

export function idValido(id: string) {
  return /^[1-9][0-9]{0,9}$/.test(id) && Number(id) <= 2_147_483_647;
}

async function consultarPublico<T>(caminho: string): Promise<Consulta<T>> {
  try {
    const resposta = await fetch(`${BACKEND_URL}${caminho}`, {
      cache: "no-store",
    });

    if (resposta.status === 404 || resposta.status === 400) {
      return { status: "nao-encontrado" };
    }

    if (!resposta.ok) return { status: "erro" };

    return { status: "ok", dados: (await resposta.json()) as T };
  } catch {
    return { status: "erro" };
  }
}

export function buscarLoja(id: string): Promise<Consulta<LojaApi>> {
  if (!idValido(id)) return Promise.resolve({ status: "nao-encontrado" });
  return consultarPublico<LojaApi>(`/lojas/${id}`);
}

export function buscarPerfil(id: string): Promise<Consulta<PerfilPublico>> {
  if (!idValido(id)) return Promise.resolve({ status: "nao-encontrado" });
  return consultarPublico<PerfilPublico>(`/user/${id}`);
}

export function buscarProduto(id: string): Promise<Consulta<ProdutoDetalheApi>> {
  if (!idValido(id)) return Promise.resolve({ status: "nao-encontrado" });
  return consultarPublico<ProdutoDetalheApi>(`/produtos/${id}`);
}

export function buscarCategoria(id: number) {
  return consultarPublico<{ id: number; nome: string }>(`/categorias/${id}`);
}

export function buscarAvaliacoesProduto(produtoId: number) {
  return consultarPublico<AvaliacaoApi[]>(`/avaliacoes-produtos?produto_id=${produtoId}`);
}

// ---------------------------------------------------------------------------
// Mapeamentos para os componentes existentes
// ---------------------------------------------------------------------------

// Só aceita imagens publicadas pelo próprio backend (pasta /uploads).
// Evita usar URLs arbitrárias em CSS (background-image) ou <img>.
export function urlImagemSegura(url: string | null | undefined) {
  if (!url) return null;
  if (/["'()\\\s<>?#%]/.test(url)) return null;
  const base = [BACKEND_PUBLIC_URL, BACKEND_URL].find((origem) =>
    url.startsWith(`${origem}/uploads/`)
  );
  const caminho = url.startsWith("/uploads/") ? url : base ? url.slice(base.length) : null;
  if (!caminho) return null;
  // Recusa travessia antes que a normalização de URL esconda os segmentos.
  if (caminho.split("/").some((parte) => parte === "." || parte === "..")) return null;
  const absoluta = `${BACKEND_PUBLIC_URL}${caminho}`;
  try {
    const imagem = new URL(absoluta);
    if (!["http:", "https:"].includes(imagem.protocol)) return null;
    return imagem.href;
  } catch {
    return null;
  }
}

export function mapearProduto(produto: ProdutoApi): ProdutoLoja {
  const primeiraImagem = [...(produto.imagem ?? [])].sort(
    (a, b) => a.ordem - b.ordem
  )[0];

  return {
    id: produto.id,
    nome: produto.nome,
    preco: Number(produto.preco),
    estoque: produto.estoque,
    imagemUrl: urlImagemSegura(primeiraImagem?.url_imagem),
  };
}

// Produtos com avaliações reais, da maior para a menor média.
export function produtosMelhorAvaliados(produtos: ProdutoApi[]) {
  return produtos
    .filter((produto) => produto.media_avaliacoes !== null)
    .sort(
      (a, b) =>
        (b.media_avaliacoes ?? 0) - (a.media_avaliacoes ?? 0) ||
        b.total_avaliacoes - a.total_avaliacoes
    )
    .map(mapearProduto);
}

export function mapearAvaliacao(avaliacao: AvaliacaoLojaApi): AvaliacaoLoja {
  return {
    id: avaliacao.id,
    nome: avaliacao.usuario.nome,
    fotoUrl: urlImagemSegura(avaliacao.usuario.foto_perfil_url),
    nota: avaliacao.nota,
    comentario: avaliacao.comentario ?? "",
  };
}

// O backend só aceita notas de 1 a 5. Registros antigos fora disso são
// ignorados para não distorcer a média.
export function avaliacoesValidas(avaliacoes: AvaliacaoApi[]) {
  return avaliacoes.filter(({ nota }) => nota >= 1 && nota <= 5);
}

export function mediaAvaliacoes(avaliacoes: { nota: number }[]) {
  if (avaliacoes.length === 0) return null;
  return avaliacoes.reduce((soma, { nota }) => soma + nota, 0) / avaliacoes.length;
}

export function mapearReview(avaliacao: AvaliacaoApi): Review {
  return {
    chave: String(avaliacao.id),
    titulo: avaliacao.usuario.nome,
    href: `/perfil/${avaliacao.usuario.id}`,
    autor: avaliacao.usuario.nome,
    fotoUrl: urlImagemSegura(avaliacao.usuario.foto_perfil_url),
    nota: avaliacao.nota,
    comentario: avaliacao.comentario ?? "",
  };
}

// Todas as imagens do produto, na ordem definida pela loja.
export function imagensDoProduto(produto: ProdutoDetalheApi) {
  return [...(produto.imagem ?? [])]
    .sort((a, b) => a.ordem - b.ordem)
    .map((imagem) => urlImagemSegura(imagem.url_imagem))
    .filter((url) => url !== null);
}
