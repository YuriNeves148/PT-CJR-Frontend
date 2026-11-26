import { BACKEND_URL } from "@/app/lib/backend";
import { NextResponse } from "next/server";

// Todos os produtos (lista pública, usada no feed logado e deslogado)
export async function GET() {
  try {
    const resposta = await fetch(`${BACKEND_URL}/produtos`, {
      cache: "no-store",
    });

    if (!resposta.ok) {
      return NextResponse.json(
        { mensagem: "Não foi possível carregar os produtos." },
        { status: resposta.status },
      );
    }

    const dados = await resposta.json();
    return NextResponse.json(dados);
  } catch {
    return NextResponse.json(
      { mensagem: "Servidor indisponível." },
      { status: 502 },
    );
  }
}
