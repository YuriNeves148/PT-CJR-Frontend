import { api } from './api';
import { chamarRotaInterna, type AvaliacaoFormData } from './avaliacaoLojaService';

export interface AvaliacaoProdutoDetalhe {
  id: number;
  produto_id: number;
  usuario_id: number;
  nota: number;
  comentario: string | null;
  usuario: { id: number; nome: string; username: string | null; foto_perfil_url: string | null };
}

export async function getAvaliacaoProduto(id: number): Promise<AvaliacaoProdutoDetalhe> {
  const response = await api.get<AvaliacaoProdutoDetalhe>(`/avaliacoes-produtos/${id}`);
  return response.data;
}

export function criarAvaliacaoProduto(produtoId: number, data: AvaliacaoFormData) {
  return chamarRotaInterna<AvaliacaoProdutoDetalhe>('/api/avaliacoes-produtos', 'POST', {
    produto_id: produtoId,
    ...data,
  });
}

export function atualizarAvaliacaoProduto(id: number, data: AvaliacaoFormData) {
  return chamarRotaInterna<AvaliacaoProdutoDetalhe>(`/api/avaliacoes-produtos/${id}`, 'PATCH', data);
}

export function deletarAvaliacaoProduto(id: number) {
  return chamarRotaInterna<AvaliacaoProdutoDetalhe>(`/api/avaliacoes-produtos/${id}`, 'DELETE');
}
