import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = request.cookies.get("session")?.value;
  if (!token) {
    return NextResponse.json(
      { mensagem: "Usuário não autenticado." },
      { status: 401 },
    );
  }

  try {
    const dados = await request.formData();
    const resposta = await fetch(
      `http://localhost:3001/user/${id}/foto-perfil`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: dados,
        cache: "no-store",
      },
    );

    if (!resposta.ok) {
      const erro = await resposta.json();
      return NextResponse.json(erro, { status: resposta.status });
    }

    const usuario = await resposta.json();

    return NextResponse.json(usuario, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { mensagem: "Não foi possível conectar ao servidor." },
      { status: 502 },
    );
  }
}
