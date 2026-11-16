import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// Repassa a requisição para o backend Nest anexando o token do cookie httpOnly "session".
// O navegador não consegue ler esse cookie, por isso as rotas protegidas passam por aqui.
export async function repassarParaBackend(
  request: NextRequest,
  caminho: string,
  metodo: "POST" | "PATCH" | "DELETE"
) {
  const token = request.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.json(
      { mensagem: "Usuário não autenticado." },
      { status: 401 }
    );
  }

  try {
    const corpo = metodo === "DELETE" ? undefined : await request.text();

    const resposta = await fetch(`${BACKEND_URL}${caminho}`, {
      method: metodo,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(corpo ? { "Content-Type": "application/json" } : {}),
      },
      body: corpo || undefined,
      cache: "no-store",
    });

    // Devolve para o front exatamente o que o backend respondeu (dados ou erro + status)
    const texto = await resposta.text();
    let dados: unknown = null;
    try {
      dados = texto ? JSON.parse(texto) : null;
    } catch {
      dados = { mensagem: texto };
    }

    return NextResponse.json(dados, { status: resposta.status });
  } catch {
    return NextResponse.json(
      { mensagem: "Não foi possível conectar ao servidor." },
      { status: 502 }
    );
  }
}
