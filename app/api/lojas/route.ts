import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return NextResponse.json({ mensagem: "Não autenticado." }, { status: 401 });
  }

  try {
    const resposta = await fetch("http://localhost:3001/lojas/me", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!resposta.ok) {
      return NextResponse.json(
        { mensagem: "Não foi possível carregar as lojas." },
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
