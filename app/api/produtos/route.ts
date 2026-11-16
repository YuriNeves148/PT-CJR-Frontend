import { NextRequest } from "next/server";
import { repassarParaBackend } from "../_lib/backend";

// POST /api/produtos -> POST {backend}/produtos (criar produto)
export async function POST(request: NextRequest) {
  return repassarParaBackend(request, "/produtos", "POST");
}
