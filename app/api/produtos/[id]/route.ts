import { NextRequest } from "next/server";
import { repassarParaBackend } from "../../_lib/backend";

// O "id" vem do nome da pasta [id]. Nesta versão do Next, params é uma Promise.
type Contexto = { params: Promise<{ id: string }> };

// PATCH /api/produtos/:id -> PATCH {backend}/produtos/:id (editar produto)
export async function PATCH(request: NextRequest, { params }: Contexto) {
  const { id } = await params;
  return repassarParaBackend(request, `/produtos/${encodeURIComponent(id)}`, "PATCH");
}

// DELETE /api/produtos/:id -> DELETE {backend}/produtos/:id (deletar produto)
export async function DELETE(request: NextRequest, { params }: Contexto) {
  const { id } = await params;
  return repassarParaBackend(request, `/produtos/${encodeURIComponent(id)}`, "DELETE");
}
