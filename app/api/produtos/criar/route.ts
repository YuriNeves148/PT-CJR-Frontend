import { NextRequest } from "next/server";
import { repassarParaBackend } from "../../_lib/backend";

// POST /api/produtos/criar -> POST {backend}/produtos (criar produto)
// Fica em /criar para não ocupar o arquivo app/api/produtos/route.ts, que a branch
// feed_integrado usa para o GET da lista de produtos (evita conflito no merge)
export async function POST(request: NextRequest) {
  return repassarParaBackend(request, "/produtos", "POST");
}
