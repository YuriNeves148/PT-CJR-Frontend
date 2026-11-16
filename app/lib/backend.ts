// Acesso ao backend NestJS a partir do servidor Next.js.
// Usado apenas em Server Components e Route Handlers: o JWT do cookie
// HTTP-only "session" nunca é exposto ao JavaScript do navegador.
import { cookies } from "next/headers";
import type { AvaliacaoLoja } from "@/app/components/loja/LojaAvaliacoes";
import type { ProdutoLoja } from "@/app/components/loja/ProdutoCard";

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

// ---------------------------------------------------------------------------
// Mapeamentos para os componentes existentes
// ---------------------------------------------------------------------------

// Só aceita imagens publicadas pelo próprio backend (pasta /uploads).
// Evita usar URLs arbitrárias em CSS (background-image) ou <img>.
export function urlImagemSegura(url: string | null | undefined) {
  if (!url) return null;
  if (!url.startsWith(`${BACKEND_PUBLIC_URL}/uploads/`)) return null;
  if (/["'()\\\s<>]/.test(url)) return null;
  return url;
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
    imagemUrl: primeiraImagem?.url_imagem ?? null,
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
