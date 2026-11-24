import { NextRequest } from "next/server";
import { repassarParaBackend } from "../../_lib/backend";

// O "id" vem do nome da pasta [id]. Nesta versão do Next, params é uma Promise.
type Contexto = { params: Promise<{ id: string }> };

// PATCH /api/avaliacoes-loja/:id -> PATCH {backend}/avaliacoes-loja/:id (editar avaliação)
export async function PATCH(request: NextRequest, { params }: Contexto) {
  const { id } = await params;
  return repassarParaBackend(request, `/avaliacoes-loja/${encodeURIComponent(id)}`, "PATCH");
}

// DELETE /api/avaliacoes-loja/:id -> DELETE {backend}/avaliacoes-loja/:id (deletar avaliação)
export async function DELETE(request: NextRequest, { params }: Contexto) {
  const { id } = await params;
  return repassarParaBackend(request, `/avaliacoes-loja/${encodeURIComponent(id)}`, "DELETE");
}
