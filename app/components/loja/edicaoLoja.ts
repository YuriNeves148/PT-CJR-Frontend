import {
  enviarImagemLoja,
  mensagemDeErro,
  validarImagemLoja,
  ROTULOS_IMAGEM,
  type TipoImagemLoja,
} from "./enviarImagemLoja";

export type DadosEdicaoLoja = { nome: string; categoria_id: number | null };
export type ArquivosLoja = Partial<Record<TipoImagemLoja, File>>;
export const TIPOS_IMAGEM: TipoImagemLoja[] = ["foto-perfil", "logo", "banner"];
export type ResultadoEdicao = {
  dadosSalvos: boolean;
  imagensSalvas: TipoImagemLoja[];
  erros: string[];
};

export function validarEdicaoLoja(
  dados: DadosEdicaoLoja,
  categorias: { id: number }[],
  arquivos: ArquivosLoja,
) {
  if (!dados.nome.trim() || dados.nome.trim().length > 255)
    return "Informe um nome de até 255 caracteres.";
  if (
    !Number.isInteger(dados.categoria_id) ||
    !categorias.some(({ id }) => id === dados.categoria_id)
  )
    return "Selecione uma categoria válida.";
  for (const tipo of TIPOS_IMAGEM) {
    const arquivo = arquivos[tipo];
    if (arquivo) {
      const erro = validarImagemLoja(tipo, arquivo);
      if (erro) return erro;
    }
  }
  return null;
}

// Cada endpoint persiste separadamente. O chamador avança a referência dos
// dados confirmados e remove apenas os arquivos salvos antes de uma tentativa.
export async function salvarEdicaoLoja(
  id: number,
  anterior: DadosEdicaoLoja,
  dados: DadosEdicaoLoja,
  arquivos: ArquivosLoja,
): Promise<ResultadoEdicao> {
  const resultado: ResultadoEdicao = {
    dadosSalvos: false,
    imagensSalvas: [],
    erros: [],
  };
  const alteracoes = {
    ...(dados.nome.trim() !== anterior.nome ? { nome: dados.nome.trim() } : {}),
    ...(dados.categoria_id !== anterior.categoria_id
      ? { categoria_id: dados.categoria_id }
      : {}),
  };
  if (Object.keys(alteracoes).length) {
    try {
      const resposta = await fetch(`/api/lojas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alteracoes),
      });
      if (resposta.ok) resultado.dadosSalvos = true;
      else {
        const corpo: unknown = await resposta.json().catch(() => null);
        resultado.erros.push(
          resposta.status === 401
            ? "Sua sessão expirou. Faça login novamente."
            : mensagemDeErro(
                corpo,
                "Não foi possível salvar o nome e a categoria.",
              ),
        );
        if ([401, 403, 404].includes(resposta.status)) return resultado;
      }
    } catch {
      resultado.erros.push("Falha de conexão ao salvar o nome e a categoria.");
    }
  }
  for (const tipo of TIPOS_IMAGEM) {
    const arquivo = arquivos[tipo];
    if (!arquivo) continue;
    const envio = await enviarImagemLoja(id, tipo, arquivo);
    if (envio.ok) resultado.imagensSalvas.push(tipo);
    else {
      resultado.erros.push(`${ROTULOS_IMAGEM[tipo]}: ${envio.mensagem}`);
      if (envio.status && [401, 403, 404].includes(envio.status)) break;
    }
  }
  return resultado;
}
