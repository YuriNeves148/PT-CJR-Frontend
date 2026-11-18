import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/app/lib/backend";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.json(
      { mensagem: "Usuário não autenticado." },
      { status: 401 }
    );
  }

  try {
    const corpo = await request.json();

    const resposta = await fetch(`${BACKEND_URL}/comentarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        conteudo: corpo.conteudo,
        avaliacao_loja_id: corpo.avaliacao_loja_id,
        avaliacao_produto_id: corpo.avaliacao_produto_id,
      }),
    });

    const dados = await resposta.json().catch(() => null);

    if (!resposta.ok) {
      const erro = Array.isArray(dados?.message)
        ? dados.message.join(" ")
        : dados?.message;
      return NextResponse.json(
        { mensagem: erro ?? "Não foi possível criar o comentário." },
        { status: resposta.status }
      );
    }

    return NextResponse.json(dados, { status: 201 });
  } catch {
    return NextResponse.json(
      { mensagem: "Servidor indisponível." },
      { status: 502 }
    );
  }
}
