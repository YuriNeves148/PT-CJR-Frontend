import { NextRequest } from "next/server";
import { repassarParaBackend } from "../../_lib/backend";

type Contexto = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Contexto) {
  const { id } = await params;
  return repassarParaBackend(request, `/avaliacoes-produtos/${encodeURIComponent(id)}`, "PATCH");
}

export async function DELETE(request: NextRequest, { params }: Contexto) {
  const { id } = await params;
  return repassarParaBackend(request, `/avaliacoes-produtos/${encodeURIComponent(id)}`, "DELETE");
}
