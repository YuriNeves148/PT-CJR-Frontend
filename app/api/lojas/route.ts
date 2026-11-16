
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type DadosCadastroLoja = {
  nome?: unknown;
  categoria_id?: unknown;
  descricao?: unknown;
};

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Faça login para cadastrar uma loja." },
        { status: 401 }
      );
    }

    let dados: DadosCadastroLoja;

    try {
      dados = await request.json();
    } catch {
      return NextResponse.json(
        { message: "JSON inválido." },
        { status: 400 }
      );
    }

    if (
      !dados ||
      typeof dados.nome !== "string" ||
      !dados.nome.trim() ||
      typeof dados.categoria_id !== "number" ||
      !Number.isInteger(dados.categoria_id) ||
      dados.categoria_id <= 0 ||
      (dados.descricao !== undefined &&
        typeof dados.descricao !== "string")
    ) {
      return NextResponse.json(
        { message: "Nome ou categoria inválidos." },
        { status: 400 }
      );
    }

    const resposta = await fetch(
      "http://localhost:3001/lojas",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: dados.nome.trim(),
          categoria_id: dados.categoria_id,
          ...(dados.descricao !== undefined
            ? { descricao: dados.descricao }
            : {}),
        }),
        cache: "no-store",
      }
    );

    const resultado = await resposta.json().catch(() => ({
      message: "O backend retornou uma resposta inválida.",
    }));

    return NextResponse.json(resultado, {
      status: resposta.status,
    });
  } catch (erro) {
    console.error("Erro ao cadastrar loja:", erro);

    return NextResponse.json(
      { message: "Não foi possível conectar ao backend." },
      { status: 502 }
    );
  }
}
