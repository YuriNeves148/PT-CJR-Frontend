import { NextResponse } from "next/server";
import { BACKEND_URL } from "@/app/lib/backend";

export async function POST(request: Request) {
  try {
    const { email, senha_atual, nova_senha } = await request.json();

    const resposta = await fetch(`${BACKEND_URL}/trocar-senha`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha_atual, nova_senha }),
      cache: "no-store",
    });

    const dados = await resposta.json().catch(() => null);
    const mensagem = Array.isArray(dados?.message) ? dados.message.join(" ") : dados?.message ?? dados?.mensagem;

    if (!resposta.ok) {
      return NextResponse.json(
        { mensagem: mensagem ?? "Não foi possível alterar a senha." },
        { status: resposta.status }
      );
    }

    return NextResponse.json({ mensagem: mensagem ?? "Senha alterada com sucesso." });
  } catch {
    return NextResponse.json({ mensagem: "Servidor indisponível." }, { status: 502 });
  }
}
