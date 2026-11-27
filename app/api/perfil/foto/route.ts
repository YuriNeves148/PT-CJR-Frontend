import { NextResponse } from "next/server";
import { BACKEND_URL, getTokenSessao } from "@/app/lib/backend";

export async function POST(request: Request) {
  const token = await getTokenSessao();
  if (!token) return NextResponse.json({ message: "Faça login para alterar sua foto." }, { status: 401 });
  let arquivo: FormDataEntryValue | null;
  try {
    arquivo = (await request.formData()).get("foto");
  } catch {
    return NextResponse.json({ message: "Envie uma imagem PNG, JPG, JPEG ou WebP." }, { status: 400 });
  }
  if (!(arquivo instanceof File) || !arquivo.size || arquivo.size > 2 * 1024 * 1024) {
    return NextResponse.json({ message: "Envie uma imagem de até 2 MB." }, { status: 400 });
  }
  try {
    const sessao = await fetch(`${BACKEND_URL}/user/me`, {
      headers: { Authorization: `Bearer ${token}` }, cache: "no-store",
    });
    if (!sessao.ok) return NextResponse.json({ message: "Não foi possível validar sua sessão." }, { status: sessao.status === 401 ? 401 : 502 });
    const usuario = await sessao.json();
    if (!Number.isSafeInteger(usuario.id) || usuario.id <= 0) throw new Error("Sessão inválida");
    const corpo = new FormData();
    corpo.append("foto", arquivo, arquivo.name);
    const resposta = await fetch(`${BACKEND_URL}/user/${usuario.id}/foto-perfil`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` }, body: corpo, cache: "no-store",
    });
    const resultado = await resposta.json().catch(() => ({ message: "Não foi possível atualizar a foto." }));
    return NextResponse.json(resultado, { status: resposta.status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ message: "Não foi possível conectar ao servidor para enviar a foto." }, { status: 502 });
  }
}
