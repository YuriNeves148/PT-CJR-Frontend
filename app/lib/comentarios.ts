import { BACKEND_URL, idValido, type Consulta } from "@/app/lib/backend";

export type AutorApi = {
  id: number;
  nome: string;
  username: string | null;
  foto_perfil_url: string | null;
};

export type AvaliacaoLojaDetalhe = {
  id: number;
  loja_id: number;
  nota: number;
  comentario: string | null;
  createdAt: string | null;
  usuario: AutorApi;
};

export type ComentarioApi = {
  id: number;
  usuario_id: number;
  conteudo: string;
  createdAt: string | null;
  usuario: AutorApi;
};

async function consultar<T>(caminho: string): Promise<Consulta<T>> {
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

export function buscarAvaliacaoLoja(
  id: string,
): Promise<Consulta<AvaliacaoLojaDetalhe>> {
  if (!idValido(id)) return Promise.resolve({ status: "nao-encontrado" });
  return consultar<AvaliacaoLojaDetalhe>(`/avaliacoes-loja/${id}`);
}

export function buscarComentarios(
  avaliacaoId: string,
): Promise<Consulta<ComentarioApi[]>> {
  if (!idValido(avaliacaoId)) return Promise.resolve({ status: "nao-encontrado" });
  return consultar<ComentarioApi[]>(
    `/comentarios?avaliacao_loja_id=${avaliacaoId}`,
  );
}

export function tempoRelativo(data: string | null) {
  if (!data) return "";
  const tempo = new Date(data).getTime();
  if (Number.isNaN(tempo)) return "";

  const segundos = Math.max(0, Math.floor((Date.now() - tempo) / 1000));
  if (segundos < 60) return "agora";

  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `${minutos}min`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `${horas}h`;

  const dias = Math.floor(horas / 24);
  if (dias < 7) return `${dias}d`;
  if (dias < 30) return `${Math.floor(dias / 7)}sem`;
  if (dias < 365) return `${Math.floor(dias / 30)}m`;
  return `${Math.floor(dias / 365)}a`;
}