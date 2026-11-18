import { BACKEND_URL } from "@/app/lib/backend";

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.json(
      { mensagem: "Usuário não autenticado." },
      { status: 401 }
    );
  }

  try {
    const resposta = await fetch(`${BACKEND_URL}/user/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!resposta.ok) {
      return NextResponse.json(
        { mensagem: resposta.status === 401 ? "Sessão inválida ou expirada." : "Não foi possível consultar a sessão." },
        { status: resposta.status === 401 ? 401 : 502 }
      );
    }

    const usuario = await resposta.json();
    return NextResponse.json(usuario, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { mensagem: "Não foi possível conectar ao servidor." },
      { status: 502 }
    );
  }
}
