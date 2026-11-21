import { NextResponse } from "next/server";
import { BACKEND_URL, getTokenSessao, idValido } from "@/app/lib/backend";

type Contexto = { params: Promise<{ id: string }> };

async function encaminhar(
  request: Request,
  { params }: Contexto,
  metodo: "PATCH" | "DELETE",
) {
  const { id } = await params;
  if (!idValido(id)) {
    return NextResponse.json(
      { message: "Identificador da loja inválido." },
      { status: 400 },
    );
  }

  const origem = request.headers.get("origin");
  // O Next pode construir request.url com localhost atrás de um proxy.
  // Host identifica o endereço efetivamente usado pelo navegador.
  let origemValida = true;
  if (origem) {
    try {
      const url = new URL(origem);
      origemValida =
        ["http:", "https:"].includes(url.protocol) &&
        url.host === (request.headers.get("host") ?? new URL(request.url).host);
    } catch {
      origemValida = false;
    }
  }
  if (!origemValida || request.headers.get("sec-fetch-site") === "cross-site") {
    return NextResponse.json(
      { message: "Origem da requisição inválida." },
      { status: 403 },
    );
  }

  const token = await getTokenSessao();
  if (!token) {
    return NextResponse.json(
      { message: "Sua sessão expirou. Faça login para alterar a loja." },
      { status: 401 },
    );
  }

  let corpo: { nome?: string; categoria_id?: number } | undefined;
  if (metodo === "PATCH") {
    let dados: unknown;
    try {
      dados = await request.json();
    } catch {
      return NextResponse.json({ message: "JSON inválido." }, { status: 400 });
    }
    if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
      return NextResponse.json(
        { message: "Dados de edição inválidos." },
        { status: 400 },
      );
    }
    const campos = Object.keys(dados);
    const { nome, categoria_id } = dados as Record<string, unknown>;
    if (
      !campos.length ||
      campos.some((campo) => !["nome", "categoria_id"].includes(campo)) ||
      ("nome" in dados &&
        (typeof nome !== "string" ||
          !nome.trim() ||
          nome.trim().length > 255)) ||
      ("categoria_id" in dados &&
        (typeof categoria_id !== "number" || !idValido(String(categoria_id))))
    ) {
      return NextResponse.json(
        {
          message:
            "Informe um nome de até 255 caracteres e uma categoria válida. Apenas nome e categoria podem ser editados.",
        },
        { status: 400 },
      );
    }
    corpo = {
      ...(typeof nome === "string" ? { nome: nome.trim() } : {}),
      ...(typeof categoria_id === "number" ? { categoria_id } : {}),
    };
  }

  try {
    if (corpo?.categoria_id !== undefined) {
      const consulta = await fetch(`${BACKEND_URL}/categorias`, {
        cache: "no-store",
      });
      if (!consulta.ok) {
        return NextResponse.json(
          { message: "Não foi possível validar a categoria. Tente novamente." },
          { status: 502 },
        );
      }
      const categorias: unknown = await consulta.json();
      if (!Array.isArray(categorias))
        throw new Error("Resposta de categorias inválida");
      if (
        !categorias.some((categoria) => categoria?.id === corpo.categoria_id)
      ) {
        return NextResponse.json(
          { message: "Selecione uma categoria existente." },
          { status: 400 },
        );
      }
    }

    // O NestJS autentica o JWT e verifica a propriedade em cada escrita.
    // Nenhum identificador de usuário recebido do navegador é encaminhado.
    const resposta = await fetch(`${BACKEND_URL}/lojas/${id}`, {
      method: metodo,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(corpo ? { "Content-Type": "application/json" } : {}),
      },
      ...(corpo ? { body: JSON.stringify(corpo) } : {}),
      cache: "no-store",
    });
    if (resposta.status === 204) return new Response(null, { status: 204 });
    const resultado = await resposta
      .json()
      .catch(() => ({ message: "O backend retornou uma resposta inválida." }));
    return NextResponse.json(resultado, { status: resposta.status });
  } catch {
    return NextResponse.json(
      { message: "Não foi possível conectar ao backend. Tente novamente." },
      { status: 502 },
    );
  }
}

export function PATCH(request: Request, contexto: Contexto) {
  return encaminhar(request, contexto, "PATCH");
}

export function DELETE(request: Request, contexto: Contexto) {
  return encaminhar(request, contexto, "DELETE");
}
