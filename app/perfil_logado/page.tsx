"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function PerfilPage() {
  const [ehDonoDoPerfil, setEhDonoDoPerfil] = useState(false);
  const [mostrarMaisProdutos, setMostrarMaisProdutos] = useState(false);
  const [mostrarMaisLojas, setMostrarMaisLojas] = useState(false);

  // Pop-up de edição de perfil
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [nome, setNome] = useState("Selena Gomez");
  const [username, setUsername] = useState("usuario");
  const [email, setEmail] = useState("usuario@email.com");

  // Volta os campos ao valor original quando o pop-up fecha
  function limparCampos() {
    setNome("Selena Gomez");
    setUsername("usuario");
    setEmail("usuario@email.com");
    setPreview(null);
  }

  function fechar_popup() {
    dialogRef.current?.close();
  }

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
            (idNaUrl.trim() !== "" && Number(idNaUrl) === Number(usuario.sub)),
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

      <section className="px-16 py-0 mt-5">
        <button
          type="button"
          onClick={() => dialogRef.current?.showModal()}
          className="flex ml-auto text-black bg-[#7137f5] p-3 px-30 mr-35 text-white text-2xl rounded-full cursor-pointer hover:bg-[#8755ff]"
        >
          Editar perfil
        </button>
        <section className="px-16 pt-16 pb-10">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-bold text-[#171917]">
                Selena Gomez
              </h1>
              <p className="text-lg text-gray-600">@usuario</p>

              <div className="flex items-center gap-2">
                <Image
                  src="/images/emailico.png"
                  alt="Ícone de email"
                  width={20}
                  height={20}
                />
                <p className="text-lg text-gray-600">usuario@email.com</p>
              </div>
            </div>

            {ehDonoDoPerfil && (
              <button
                type="button"
                onClick={() => dialogRef.current?.showModal()}
                className="w-85 bg-[#7137f5] text-white px-6 py-3 rounded-full font-semibold cursor-pointer hover:bg-[#8755ff] -translate-y-20"
              >
                Editar Perfil
              </button>
            )}
          </div>

          <div className="mt-16">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#171917]">Produtos</h2>

              <button
                type="button"
                onClick={() => setMostrarMaisProdutos(!mostrarMaisProdutos)}
                className="text-[#7137f5] font-semibold cursor-pointer hover:underline"
              >
                {mostrarMaisProdutos ? "Ver menos" : "Ver mais"}
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-8 pb-4">
              {Array.from({ length: mostrarMaisProdutos ? 9 : 5 }, (_, i) => (
                <div
                  key={i}
                  className="w-[250px] h-75 shrink-0 rounded-4xl bg-white shadow-sm"
                ></div>
              ))}
            </div>

            <div className="mt-10 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#171917]">Lojas</h2>
              {ehDonoDoPerfil ? (
                <button
                  type="button"
                  className="text-[#7137f5] font-semibold cursor-pointer"
                >
                  Cadastrar loja
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setMostrarMaisLojas(!mostrarMaisLojas)}
                  className="text-[#7137f5] font-semibold cursor-pointer hover:underline"
                >
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

      {/* Pop-up perfil */}
      <dialog
        ref={dialogRef}
        onClose={limparCampos}
        className="open:flex flex-col rounded-4xl p-6 m-auto bg-[#EDEDED] w-180 h-225 backdrop:bg-black/60"
      >
        <button type="button" onClick={() => fechar_popup()}>
          <Image
            src="/img_esq_senha/x_fechar.png"
            alt="Fechar"
            width={1000}
            height={1000}
            className="flex w-8 h-8 mt-10 cursor-pointer ml-auto hover:w-10"
          ></Image>
        </button>

        <FotoPerfil preview={preview} setPreview={setPreview} />

        <div className="flex flex-col gap-4">
          <input
            placeholder="Nome"
            onChange={(e) => setNome(e.target.value)}
            className="bg-white w-100 self-center rounded-2xl text-2xl p-2 pl-5"
          ></input>
          <input
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
            className="bg-white w-100 self-center rounded-2xl text-2xl p-2 pl-5"
          ></input>
          <input
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white w-100 self-center rounded-2xl text-2xl p-2 pl-5"
          ></input>
        </div>
        <div className="flex flex-col mt-14 items-center gap-3 ">
          <button
            type="button"
            className="cursor-pointer hover:opacity-70 text-2xl text-red-800 border-3 border-red-500 w-100 shadow-2xl rounded-full p-3"
          >
            Deletar Conta
          </button>
          <button
            type="button"
            className="cursor-pointer hover:opacity-70 text-2xl text-[#6A38F3] border-3 border-[#6A38F3] w-100 shadow-2xl rounded-full p-3"
          >
            Alterar senha
          </button>
          <button
            type="button"
            onClick={() => fechar_popup()}
            className="cursor-pointer hover:opacity-70 text-2xl bg-[#6A38F3] text-white w-100 shadow-2xl rounded-full p-3"
          >
            Salvar
          </button>
        </div>
      </dialog>
    </main>
  );
}

// trocar foto
function FotoPerfil({
  preview,
  setPreview,
}: {
  preview: string | null;
  setPreview: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function aoEscolherArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    // Só aceita imagens
    if (!arquivo.type.startsWith("image/")) return;

    // Libera a URL anterior da memória
    if (preview) URL.revokeObjectURL(preview);

    setPreview(URL.createObjectURL(arquivo));

    // Permite escolher o mesmo arquivo de novo depois
    e.target.value = "";
  }

  function removerFoto() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  }

  return (
    <div className="flex flex-col items-center gap-3 mb-8">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={aoEscolherArquivo}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label="Alterar foto de perfil"
        className="relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-full bg-gray-300 cursor-pointer duration-200 hover:opacity-80"
      >
        {preview ? (
          <Image
            src={preview}
            alt="Pré-visualização da foto de perfil"
            width={400}
            height={400}
            unoptimized
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-6xl text-gray-600">U</span>
        )}
      </button>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="cursor-pointer text-lg font-semibold text-[#6A38F3] hover:underline"
        >
          {preview ? "Alterar foto" : "Adicionar foto"}
        </button>

        {preview && (
          <button
            type="button"
            onClick={removerFoto}
            className="cursor-pointer text-lg font-semibold text-red-800 hover:underline"
          >
            Remover
          </button>
        )}
      </div>
    </div>
  );
}
