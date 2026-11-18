import { BACKEND_URL } from "@/app/lib/backend";

import { NextResponse } from "next/server";

export async function GET() {
  try {
    const resposta = await fetch(
      `${BACKEND_URL}/categorias`,
      { cache: "no-store" }
    );

    if (!resposta.ok) {
      return NextResponse.json(
        { erro: "Não foi possível consultar as categorias." },
        { status: resposta.status }
      );
    }

    const categorias = await resposta.json();

    return NextResponse.json(categorias);
  } catch (erro) {
    console.error("Erro ao buscar categorias:", erro);

    return NextResponse.json(
      { erro: "Backend indisponível." },
      { status: 502 }
    );
  }
}
