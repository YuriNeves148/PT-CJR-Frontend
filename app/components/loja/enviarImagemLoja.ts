// Envia uma imagem da loja pela rota intermediária do Next.js
// (/api/lojas/:id/imagens/:tipo), que encaminha o JWT ao backend.

export type TipoImagemLoja = "foto-perfil" | "logo" | "banner";

export const ROTULOS_IMAGEM: Record<TipoImagemLoja, string> = {
  "foto-perfil": "Foto de perfil",
  logo: "Logo",
  banner: "Banner",
};

export const ACEITAR_IMAGEM: Record<TipoImagemLoja, string> = {
  "foto-perfil": ".jpg,.jpeg,.png,.webp",
  logo: ".svg,.png,.jpg,.jpeg,.webp",
  banner: ".jpg,.jpeg,.png,.webp",
};

export function validarImagemLoja(
  tipo: TipoImagemLoja,
  arquivo: File,
): string | null {
  const extensao = arquivo.name.split(".").pop()?.toLowerCase();
  if (!extensao || !ACEITAR_IMAGEM[tipo].split(",").includes(`.${extensao}`)) {
    return `Formato inválido para ${ROTULOS_IMAGEM[tipo].toLowerCase()}. Use ${ACEITAR_IMAGEM[tipo].replaceAll(".", "").replaceAll(",", ", ")}.`;
  }
  if (arquivo.size === 0) return "O arquivo selecionado está vazio.";
  const limite = tipo === "logo" ? 2 : 10;
  if (arquivo.size > limite * 1024 * 1024)
    return `${ROTULOS_IMAGEM[tipo]} deve ter no máximo ${limite} MB.`;
  return null;
}

export function mensagemDeErro(resultado: unknown, padrao: string) {
  if (typeof resultado !== "object" || resultado === null) return padrao;

  const { message } = resultado as { message?: unknown };

  if (Array.isArray(message)) return message.join(" ");
  if (typeof message === "string" && message.trim()) return message;

  return padrao;
}

export async function enviarImagemLoja(
  lojaId: number,
  tipo: TipoImagemLoja,
  arquivo: File,
): Promise<{ ok: true } | { ok: false; mensagem: string; status?: number }> {
  const erro = validarImagemLoja(tipo, arquivo);
  if (erro) return { ok: false, mensagem: erro };

  const corpo = new FormData();
  corpo.append("arquivo", arquivo, arquivo.name);

  try {
    const resposta = await fetch(`/api/lojas/${lojaId}/imagens/${tipo}`, {
      method: "POST",
      body: corpo,
    });

    if (resposta.ok) return { ok: true };

    const resultado: unknown = await resposta.json().catch(() => null);

    return {
      ok: false,
      status: resposta.status,
      mensagem:
        resposta.status === 401
          ? "Sua sessão expirou. Faça login novamente."
          : mensagemDeErro(
              resultado,
              `Não foi possível enviar ${ROTULOS_IMAGEM[tipo].toLowerCase()}.`,
            ),
    };
  } catch {
    return { ok: false, mensagem: "Falha de conexão ao enviar a imagem." };
  }
}
