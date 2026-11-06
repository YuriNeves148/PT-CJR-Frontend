import { NextResponse } from "next/server";

export async function POST() {
  const resposta = NextResponse.json({ sucesso: true });

  resposta.cookies.set("session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return resposta;
}