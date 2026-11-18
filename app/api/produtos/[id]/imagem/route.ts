import { NextRequest } from "next/server";
import { repassarParaBackend } from "../../../_lib/backend";

type Contexto = { params: Promise<{ id: string }> };

// POST /api/produtos/:id/imagem -> POST {backend}/produtos/:id/imagem (enviar uma foto)
export async function POST(request: NextRequest, { params }: Contexto) {
  const { id } = await params;
  return repassarParaBackend(request, `/produtos/${encodeURIComponent(id)}/imagem`, "POST");
}
