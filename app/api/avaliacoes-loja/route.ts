import { NextRequest } from "next/server";
import { repassarParaBackend } from "../_lib/backend";

// POST /api/avaliacoes-loja -> POST {backend}/avaliacoes-loja (criar avaliação)
// Passa pelo Next porque o backend exige o token, que fica no cookie httpOnly "session"
export async function POST(request: NextRequest) {
  return repassarParaBackend(request, "/avaliacoes-loja", "POST");
}
