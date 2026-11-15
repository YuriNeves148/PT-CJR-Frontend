
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function PerfilPage() {

  const [ehDonoDoPerfil, setEhDonoDoPerfil] = useState(false);
  const [mostrarMaisProdutos, setMostrarMaisProdutos] = useState(false);
  const [mostrarMaisLojas, setMostrarMaisLojas] = useState(false);

  useEffect(() => {
    async function verificarLogin() {
      try {
        const resposta = await fetch("/api/me", { cache: "no-store" });

        if (!resposta.ok) {
          setEhDonoDoPerfil(false);
          return;
        }

        const usuario = await resposta.json();
        const idNaUrl = new URLSearchParams(window.location.search).get("id");

        setEhDonoDoPerfil(
          idNaUrl === null ||
          (idNaUrl.trim() !== "" && Number(idNaUrl) === Number(usuario.sub))
        );

      } catch (erro) {
        console.error("Erro ao verificar login:", erro);
        setEhDonoDoPerfil(false);
      }
    }

    verificarLogin();
  }, []);

  return (
    <main className="min-h-screen bg-[#f7f4e8]">
      <section className="relative h-[280px] bg-black">
        <div className="absolute left-30 bottom-0 translate-y-1/2 w-45 h-45 rounded-full bg-gray-300 border-0 border-[#f7f4e8] flex items-center justify-center">
          <span className="text-5xl text-gray-600">U</span>
        </div>
      </section>

      <section className="px-16 py-0">
        <section className="px-16 pt-28 pb-10">

          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-bold text-[#171917]">Selena Gomez</h1>
              <p className="text-lg text-gray-600">@usuario</p>

              <div className="flex items-center gap-2">
                <Image src="/images/emailico.png" alt="Ícone de email" width={20} height={20}/>
                <p className="text-lg text-gray-600">usuario@email.com</p>
              </div>
            </div>

            {ehDonoDoPerfil && (
              <button type="button" className="w-85 bg-[#7137f5] text-white px-6 py-3 rounded-full font-semibold cursor-pointer hover:bg-[#8755ff] -translate-y-20">
                Editar Perfil
              </button>
            )}
          </div>

          <div className="mt-16">

            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#171917]">Produtos</h2>

              <button type="button" onClick={() => setMostrarMaisProdutos(!mostrarMaisProdutos)} className="text-[#7137f5] font-semibold cursor-pointer hover:underline">
                {mostrarMaisProdutos ? "Ver menos" : "Ver mais"}
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-8 pb-4">
              {Array.from({ length: mostrarMaisProdutos ? 9 : 5 }, (_, i) => (
                <div key={i} className="w-[250px] h-75 shrink-0 rounded-4xl bg-white shadow-sm"></div>
              ))}
            </div>

            <div className="mt-10 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#171917]">Lojas</h2>
              {ehDonoDoPerfil ? (
                <button type="button" className="text-[#7137f5] font-semibold cursor-pointer">
                  Cadastrar loja
                </button>
              ) : (
                <button type="button" onClick={() => setMostrarMaisLojas(!mostrarMaisLojas)} className="text-[#7137f5] font-semibold cursor-pointer hover:underline">
                  {mostrarMaisLojas ? "Ver menos" : "Ver mais"}
                </button>
              )}
            </div>

            <div className="mt-6 flex gap-5 overflow-x-auto pb-4">
              <div className="w-[550px] h-45 shrink-0 rounded-2xl bg-white shadow-sm"></div>
            </div>
          </div>

          <section className="mt-16">
            <h2 className="text-2xl font-bold text-[#171917]">Avaliações</h2>

            <div className="mt-6 grid grid-cols-2 gap-5">
              <div className="w-[750px] h-45 rounded-2xl bg-white shadow-sm"></div>
            </div>
          </section>

        </section>
      </section>
    </main>
  );
}
