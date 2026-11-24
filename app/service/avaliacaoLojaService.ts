import { api } from './api';

// ---------- Avaliações de loja (usado pelos modais de avaliação) ----------

// Formato que o backend devolve (Prisma: Avaliacoes_Loja, com o autor em "usuario")
export interface AvaliacaoLojaDetalhe {
  id: number;
  loja_id: number;
  usuario_id: number;
  nota: number; // inteiro de 1 a 5
  comentario: string | null;
  usuario: { id: number; nome: string; username: string | null; foto_perfil_url: string | null };
}

// O que o formulário do modal envia. Mesmo formato do CreateAvaliacoesLojaDto do backend.
export interface AvaliacaoFormData {
  nota: number;
  comentario: string | null; // null apaga o texto que existia
}

// ---------- Leituras (públicas: chamam o backend direto pelo axios) ----------

export async function getAvaliacaoLoja(id: number): Promise<AvaliacaoLojaDetalhe> {
  const response = await api.get<AvaliacaoLojaDetalhe>(`/avaliacoes-loja/${id}`);
  return response.data;
}

// Todas as avaliações de uma loja, das mais recentes para as mais antigas
export async function getAvaliacoesDaLoja(lojaId: number): Promise<AvaliacaoLojaDetalhe[]> {
  const response = await api.get<AvaliacaoLojaDetalhe[]>('/avaliacoes-loja', {
    params: { loja_id: lojaId },
  });
  return response.data;
}

// Nome da loja, para o título "Você está avaliando <loja>"
export async function getNomeLoja(lojaId: number): Promise<string> {
  const response = await api.get<{ nome: string }>(`/lojas/${lojaId}`);
  return response.data.nome;
}

// ---------- Criar / editar / deletar (precisam do token) ----------

// O token está no cookie httpOnly, então essas chamadas passam pelas rotas do
// próprio Next (app/api/avaliacoes-loja), e não vão direto para o backend.
async function chamarRotaInterna<T>(url: string, method: string, body?: unknown): Promise<T> {
  const resposta = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    // 401: sem login ou login vencido (o backend responde só "Unauthorized", em inglês)
    if (resposta.status === 401) {
      throw new Error('Sua sessão expirou ou você não está logado. Faça login novamente.');
    }
    // O Nest manda o erro em "message" (texto ou lista); as rotas do Next mandam em "mensagem"
    const msg = dados?.message ?? dados?.mensagem ?? 'Não foi possível salvar a avaliação.';
    throw new Error(Array.isArray(msg) ? msg.join(' ') : msg);
  }
  return dados as T;
}

export function criarAvaliacaoLoja(lojaId: number, data: AvaliacaoFormData) {
  return chamarRotaInterna<AvaliacaoLojaDetalhe>('/api/avaliacoes-loja', 'POST', {
    loja_id: lojaId,
    ...data,
  });
}

export function atualizarAvaliacaoLoja(id: number, data: AvaliacaoFormData) {
  return chamarRotaInterna<AvaliacaoLojaDetalhe>(`/api/avaliacoes-loja/${id}`, 'PATCH', data);
}

export function deletarAvaliacaoLoja(id: number) {
  return chamarRotaInterna<AvaliacaoLojaDetalhe>(`/api/avaliacoes-loja/${id}`, 'DELETE');
}
