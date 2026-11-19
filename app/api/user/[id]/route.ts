import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: number }> },
) {
  const id = await params;
  const token = request.cookies.get("session")?.value;
  if (!token) {
    return NextResponse.json(
      { mensagem: "Usuário não autenticado." },
      { status: 401 },
    );
  }

  try {
    const dados = await request.json();
    const resposta = await fetch(`http://localhost:3001/user/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
      cache: "no-store",
    });

    if (!resposta.ok) {
      return NextResponse.json(
        { mensagem: "Sessão inválida ou expirada." },
        { status: 401 },
      );
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = await params;
  const token = request.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.json(
      { mensagem: "Usuário não autenticado." },
      { status: 401 },
    );
  }

  try {
    const resposta = await fetch(`http://localhost:3001/user/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!resposta.ok) {
      return NextResponse.json(
        { mensagem: "Sessão inválida ou expirada." },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { mensagem: "Usuário excluído com sucesso!" },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { mensagem: "Não foi possível conectar ao servidor." },
      { status: 502 },
    );
  }
}
