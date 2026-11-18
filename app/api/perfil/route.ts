import { NextResponse } from "next/server";
import { BACKEND_URL, getTokenSessao } from "@/app/lib/backend";

export async function PATCH(request: Request) {
  const token = await getTokenSessao();
  if (!token) return NextResponse.json({ message: "Faça login para editar seu perfil." }, { status: 401 });

  let dados: unknown;
  try {
    dados = await request.json();
  } catch {
    return NextResponse.json({ message: "JSON inválido." }, { status: 400 });
  }

  const campos = ["nome", "username", "email"] as const;
  if (
    typeof dados !== "object" || dados === null ||
    Object.keys(dados).some((campo) => !campos.includes(campo as typeof campos[number])) ||
    !campos.every((campo) => {
      const valor = (dados as Record<string, unknown>)[campo];
      return typeof valor === "string" && valor.trim().length > 0 && valor.length <= 255;
    })
  ) {
    return NextResponse.json({ message: "Informe nome, username e e-mail válidos." }, { status: 400 });
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
      body: JSON.stringify(Object.fromEntries(campos.map((campo) => [campo, (dados as Record<string, string>)[campo].trim()]))),
      cache: "no-store",
    });
    if (!resposta.ok) {
      const resultado: unknown = await resposta.json().catch(() => null);
      const message = resultado && typeof resultado === "object" && "message" in resultado
        ? resultado.message : "Não foi possível salvar o perfil.";
      return NextResponse.json({ message }, { status: resposta.status });
    }
    return NextResponse.json({ sucesso: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ message: "Não foi possível conectar ao backend." }, { status: 502 });
  }
}
