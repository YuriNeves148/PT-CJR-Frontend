import { NextResponse } from "next/server";

export async function GET() {
  try {
    const resposta = await fetch("http://localhost:3001/categorias", {
      cache: "no-store",
    });

    if (!resposta.ok) {
      return NextResponse.json(
        { mensagem: "Não foi possível carregar as categorias." },
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
