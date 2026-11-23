import { NextRequest, NextResponse } from "next/server";
import { repassarParaBackend } from "../../_lib/backend";

type Contexto = { params: Promise<{ id: string }> };

// PATCH /api/comentarios/:id -> PATCH {backend}/comentarios/:id (editar comentário)
export async function PATCH(request: NextRequest, { params }: Contexto) {
  const { id } = await params;

  if (!/^[1-9][0-9]{0,9}$/.test(id)) {
    return NextResponse.json(
      { mensagem: "Identificador do comentário inválido." },
      { status: 400 }
    );
  }

  return repassarParaBackend(request, `/comentarios/${id}`, "PATCH");
}