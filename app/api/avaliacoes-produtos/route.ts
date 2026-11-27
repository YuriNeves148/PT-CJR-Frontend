import { NextRequest } from "next/server";
import { repassarParaBackend } from "../_lib/backend";

export async function POST(request: NextRequest) {
  return repassarParaBackend(request, "/avaliacoes-produtos", "POST");
}
