import { NextResponse } from "next/server";
import { BACKEND_URL, getTokenSessao } from "@/app/lib/backend";

// Altera a senha do usuário logado. Quem confere a senha antiga é o backend.
export async function PATCH(request: Request) {
  const token = await getTokenSessao();
  if (!token) return NextResponse.json({ message: "Faça login para alterar sua senha." }, { status: 401 });

  let dados: { senhaAntiga?: unknown; novaSenha?: unknown } | null;
  try {
    dados = await request.json();
  } catch {
    return NextResponse.json({ message: "JSON inválido." }, { status: 400 });
  }

  const senhaAntiga = dados?.senhaAntiga;
  const novaSenha = dados?.novaSenha;
  if (typeof senhaAntiga !== "string" || !senhaAntiga || typeof novaSenha !== "string" || !novaSenha) {
    return NextResponse.json({ message: "Informe a senha antiga e a nova senha." }, { status: 400 });
  }

  try {
    // O ID vem da sessão verificada pelo Nest, nunca do formulário.
    const sessao = await fetch(`${BACKEND_URL}/user/me`, {
      headers: { Authorization: `Bearer ${token}` }, cache: "no-store",
    });
    if (!sessao.ok) {
      return NextResponse.json({ message: "Não foi possível validar a sessão." }, { status: sessao.status === 401 ? 401 : 502 });
    }
    const usuario = await sessao.json();
    if (!Number.isSafeInteger(usuario.id) || usuario.id <= 0) {
      return NextResponse.json({ message: "Sessão inválida." }, { status: 502 });
    }

    const resposta = await fetch(`${BACKEND_URL}/user/${usuario.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ senha: novaSenha, senha_antiga: senhaAntiga }),
      cache: "no-store",
    });
    if (!resposta.ok) {
      const resultado = await resposta.json().catch(() => null);
      return NextResponse.json(
        { message: resultado?.message ?? "Não foi possível alterar a senha." },
        { status: resposta.status },
      );
    }
    return NextResponse.json({ sucesso: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ message: "Não foi possível conectar ao backend." }, { status: 502 });
  }
}
