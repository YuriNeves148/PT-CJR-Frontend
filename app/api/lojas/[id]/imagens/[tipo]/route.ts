import { NextResponse } from "next/server";
import { BACKEND_URL, getTokenSessao } from "@/app/lib/backend";

// Tipos de imagem aceitos e o campo multipart esperado pelo backend.
const TIPOS = {
  banner: { campo: "banner", limiteMb: 10 },
  "foto-perfil": { campo: "foto", limiteMb: 10 },
  logo: { campo: "logo", limiteMb: 2 },
} as const;

type TipoImagem = keyof typeof TIPOS;

function ehTipoImagem(tipo: string): tipo is TipoImagem {
  return Object.hasOwn(TIPOS, tipo);
}

// Encaminha o upload ao NestJS com o JWT do cookie HTTP-only.
// O token nunca é enviado ao navegador.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; tipo: string }> }
) {
  const { id, tipo } = await params;

  if (!/^[1-9][0-9]{0,9}$/.test(id) || !ehTipoImagem(tipo)) {
    return NextResponse.json(
      { message: "Requisição de imagem inválida." },
      { status: 400 }
    );
  }

  const token = await getTokenSessao();

  if (!token) {
    return NextResponse.json(
      { message: "Faça login para enviar imagens." },
      { status: 401 }
    );
  }

  const { campo, limiteMb } = TIPOS[tipo];

  let arquivo: FormDataEntryValue | null;

  try {
    arquivo = (await request.formData()).get("arquivo");
  } catch {
    return NextResponse.json(
      { message: "Envie a imagem como formulário multipart." },
      { status: 400 }
    );
  }

  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return NextResponse.json(
      { message: "Selecione um arquivo." },
      { status: 400 }
    );
  }

  if (arquivo.size > limiteMb * 1024 * 1024) {
    return NextResponse.json(
      { message: `O arquivo deve ter no máximo ${limiteMb} MB.` },
      { status: 413 }
    );
  }

  const corpo = new FormData();
  corpo.append(campo, arquivo, arquivo.name);

  try {
    const resposta = await fetch(
      `${BACKEND_URL}/lojas/${id}/imagens/${tipo}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: corpo,
        cache: "no-store",
      }
    );

    const resultado = await resposta.json().catch(() => ({
      message: "O backend retornou uma resposta inválida.",
    }));

    return NextResponse.json(resultado, { status: resposta.status });
  } catch (erro) {
    console.error("Erro ao enviar imagem da loja:", erro);

    return NextResponse.json(
      { message: "Não foi possível conectar ao backend." },
      { status: 502 }
    );
  }
}
