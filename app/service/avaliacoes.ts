import {
  atualizarAvaliacaoLoja,
  criarAvaliacaoLoja,
  deletarAvaliacaoLoja,
  getAvaliacaoLoja,
  type AvaliacaoFormData,
} from './avaliacaoLojaService';
import {
  atualizarAvaliacaoProduto,
  criarAvaliacaoProduto,
  deletarAvaliacaoProduto,
  getAvaliacaoProduto,
} from './avaliacaoProdutoService';

export type TipoAvaliacao = 'loja' | 'produto';

type ServicoAvaliacao = {
  buscar: (id: number) => Promise<AvaliacaoFormData>;
  criar: (alvoId: number, dados: AvaliacaoFormData) => Promise<unknown>;
  atualizar: (id: number, dados: AvaliacaoFormData) => Promise<unknown>;
  deletar: (id: number) => Promise<unknown>;
};

export const servicosAvaliacao: Record<TipoAvaliacao, ServicoAvaliacao> = {
  loja: {
    buscar: getAvaliacaoLoja,
    criar: criarAvaliacaoLoja,
    atualizar: atualizarAvaliacaoLoja,
    deletar: deletarAvaliacaoLoja,
  },
  produto: {
    buscar: getAvaliacaoProduto,
    criar: criarAvaliacaoProduto,
    atualizar: atualizarAvaliacaoProduto,
    deletar: deletarAvaliacaoProduto,
  },
};

export const ROTULO_AVALIACAO: Record<TipoAvaliacao, { artigo: string; nome: string }> = {
  loja: { artigo: 'a', nome: 'loja' },
  produto: { artigo: 'o', nome: 'produto' },
};
