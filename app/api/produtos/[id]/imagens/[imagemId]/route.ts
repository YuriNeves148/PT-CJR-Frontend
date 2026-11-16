import { NextRequest } from "next/server";
import { repassarParaBackend } from "../../../../_lib/backend";

type Contexto = { params: Promise<{ id: string; imagemId: string }> };

const caminho = (id: string, imagemId: string) =>
  `/produtos/${encodeURIComponent(id)}/imagens/${encodeURIComponent(imagemId)}`;

// PATCH /api/produtos/:id/imagens/:imagemId -> trocar uma foto por outra
export async function PATCH(request: NextRequest, { params }: Contexto) {
  const { id, imagemId } = await params;
  return repassarParaBackend(request, caminho(id, imagemId), "PATCH");
}

// DELETE /api/produtos/:id/imagens/:imagemId -> apagar uma foto
export async function DELETE(request: NextRequest, { params }: Contexto) {
  const { id, imagemId } = await params;
  return repassarParaBackend(request, caminho(id, imagemId), "DELETE");
}
