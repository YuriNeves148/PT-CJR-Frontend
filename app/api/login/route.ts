import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, senha } = await request.json();

    const resposta = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    if (!resposta.ok) {
      return NextResponse.json(
        { mensagem: "Não foi possível realizar o login." },
        { status: resposta.status }
      );
    }

    const dados = await resposta.json();

    if (!dados.access_token) {
      return NextResponse.json(
        { mensagem: "Resposta inválida do backend." },
        { status: 502 }
      );
    }

    const resultado = NextResponse.json({ sucesso: true });

    resultado.cookies.set("session", dados.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return resultado;
  } catch {
    return NextResponse.json(
      { mensagem: "Servidor indisponível." },
      { status: 502 }
    );
  }
}
