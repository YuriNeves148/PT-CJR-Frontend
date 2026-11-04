"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, ChangeEvent } from "react";

function FotoPerfil({
  preview,
  setPreview,
}: {
  preview: string | null;
  setPreview: (url: string | null) => void;
}) {
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (preview) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(file));
    }
    e.target.value = ""; // permite escolher o mesmo arquivo de novo
  }

  return (
    <span className="flex flex-col justify-center items-center">
      <label
        htmlFor="foto-perfil"
        className="w-38 h-38 mb-2 rounded-full bg-black text-white cursor-pointer hover:opacity-85 flex items-center justify-center overflow-hidden text-center text-sm"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Foto de perfil"
            className="w-full h-full object-cover"
          />
        ) : (
          "Adicione uma foto"
        )}
      </label>

      <input
        id="foto-perfil"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <p className="flex flex-col mb-15 self-center">editar foto</p>
    </span>
  );
}

export default function Home() {
  const disponivel = false;
  const [nome, setNome] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDialogElement>(null);

  // limpa tudo: roda ao fechar pelo X, pelo ESC ou por qualquer outro meio
  function limparCampos() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setNome("");
    setUsername("");
    setEmail("");
  }

  function fechar_popup() {
    dialogRef.current?.close(); // dispara o onClose do <dialog>, que chama limparCampos
  }

  return (
    <main className="w-full overflow-x-hidden">
      <nav className="flex w-screen h-22 bg-[#000000] p-3">
        <Link href="/feed">
          <Image
            src="/img_feed/LOGO Stock.io.png"
            alt="Logotipo da STOCK"
            width={1000}
            height={1000}
            className="shadow-xl shadow-gray-700/50 rounded-2xl ml-15 p-2 m-1 w-70 h-18 transition-500 cursor-pointer hover:opacity-50 transition-opacity "
          />
        </Link>
        <nav className="ml-auto flex flex-row-reverse gap-x-13 items-center pr-30 bg-[#000000]">
          <Link
            href="/feed_deslogado"
            className="text-2xl  p-1 pr-8 pl-8 rounded-4xl font-bold hover:bg-[#6A38F3] duration-200 hover:m-1"
          >
            <Image
              src="/img_feed/deslogar.png"
              alt="Sair"
              width={1000}
              height={1000}
              className="w-11 h-10 cursor-pointer duration-200 hover:w-11 hover:h-11 rounded-full duration-200 "
            ></Image>
          </Link>

          {/* POPUP */}
          <button
            type="button"
            onClick={() => dialogRef.current?.showModal()}
            className="text-2xl"
          >
            <Image
              src="/img_feed/pessoa.png"
              alt="Editar perfil"
              width={1000}
              height={1000}
              className="w-11 h-10 cursor-pointer duration-200 hover:bg-[#6A38F3] hover:w-11 hover:h-11 hover:m-2 rounded-full"
            ></Image>
          </button>
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
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="bg-white w-100 self-center rounded-2xl text-2xl p-2 pl-5"
              ></input>
              <input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white w-100 self-center rounded-2xl text-2xl p-2 pl-5"
              ></input>
              <input
                placeholder="Email"
                value={email}
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
                className="cursor-pointer hover:opacity-70 text-2xl bg-[#6A38F3] text-white w-100 shadow-2xl rounded-full p-3"
              >
                Salvar
              </button>
            </div>
          </dialog>

          <Link href="">
            <Image
              src="/img_feed/loja.png"
              alt="loja"
              width={400}
              height={500}
              className="w-11 h-10 cursor-pointer duration-200 hover:bg-[#6A38F3] hover:w-11 hover:h-11 rounded-full duration-200 hover:m-2"
            />
          </Link>
          <Link href="">
            <Image
              src="/img_feed/sacolinha.png"
              alt="carrinho"
              width={40}
              height={50}
              className="w-11 h-10  cursor-pointer hover:bg-[#6A38F3] rounded-full hover:w-11 hover:h-11 duration-200 hover:m-2"
            />
          </Link>
        </nav>
      </nav>
      <div className="flex flex-row justify-center bg-[#000000]">
        <div className="flex flex-col mt-27">
          <p className="text-7xl font-semibold">Do CAOS à organização,</p>
          <p className="text-6xl  font-semibold flex ml-auto">
            em alguns cliques
          </p>
        </div>
        <Image
          src="/img_feed/moca_em_pe.png"
          alt="moça em pé"
          width={100000}
          height={10000}
          className="w-130 h-170"
        />
      </div>

      {/* INFO.DE CATEGORIAS */}
      <div className="bg-[#F6F3E4] relative z-10 h-auto w-screen -mt-67">
        <div className=" w-330 pt-10 justify-self-center ">
          <input
            className="flex ml-auto text-base w-200 p-3 rounded-4xl bg-[#FFFFFF] text-black"
            placeholder="Procurar por..."
          ></input>
          <p className="text-black font-semibold text-3xl pt-10">Categorias</p>
          <nav className=" overflow-hidden flex flex-block flex-row gap-15 pb-5 pt-10">
            <Image
              src="/img_feed/mercado.png"
              alt="mercado"
              width={100}
              height={100}
              className="w-30 h-30 shrink-0 object-cover"
            />
          </nav>

          {/* INFO. DE PRODUTOS */}
          <div>
            <details className="peer">
              <summary className="flex cursor-pointer list-none items-end [&::-webkit-details-marker]:hidden">
                <span className="text-black font-semibold text-3xl pt-10">
                  Produtos
                </span>
                <span className="ml-auto pr-10 text-blue-600 text-lg hover:text-blue-900">
                  ver mais / menos
                </span>
              </summary>
            </details>
            <nav className="flex flex-nowrap gap-10 overflow-hidden pb-5 pt-10 peer-open:flex-wrap">
              <span className="bg-[#FFFFFF] p-5 pb-11 shrink-0 rounded-2xl w-65 flex flex-col items-center">
                <Image
                  src="/img_feed/prd_relogio.png"
                  alt="relógio"
                  width={100}
                  height={100}
                  className="w-30 h-30 shrink-0 object-cover"
                />
                <div className="pt-5 mr-auto">
                  <p className="line-clamp-2 break-words text-black font-bold text-2xl">
                    titulo
                  </p>
                  <p className="text-black font-bold text-2xl">R$ preço</p>
                  <p
                    className={`font-bold text-2xl ${disponivel ? "text-green-600" : "text-red-600"}`}
                  >
                    {disponivel ? "Disponível" : "Indisponível"}
                    {/* está sendo pego da variavel global */}
                  </p>{" "}
                </div>
              </span>
            </nav>
          </div>

          {/* INFO. DE LOJAS */}
          <div className="relative">
            <details className="peer ">
              <summary className="flex cursor-pointer  list-none items-end [&::-webkit-details-marker]:hidden">
                <span className="text-black font-semibold text-3xl pt-10">
                  Lojas
                </span>
                <details className="group relative  mt-4 w-fit ml-auto ">
                  <summary className="flex w-120 cursor-pointer list-none items-center gap-2 rounded-2xl bg-white pl-6 py-2 text-2xl text-black [&::-webkit-details-marker]:hidden hover:bg-gray-100">
                    filtros
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={5}
                      className="h-4 w-4 transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </summary>

                  <div className="absolute top-full z-20 w-120 rounded-lg border border-gray-300 bg-white p-4 text-xl text-black shadow-lg">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="categoria" value="mercado" />
                      Mercado
                    </label>
                  </div>
                </details>
                <span className="ml-10 pr-10 text-blue-600 text-lg hover:text-blue-900">
                  ver mais / menos
                </span>
              </summary>
            </details>

            <nav className="flex flex-nowrap shrink-0 items-center gap-11 overflow-hidden pb-40 pt-10 peer-open:flex-wrap">
              <span className="shrink-0 p-5 max-w-48 flex flex-col items-center">
                <Image
                  src="/img_feed/logo_amoca.png"
                  alt="loja amoca"
                  width={100}
                  height={100}
                  className="w-30 h-30 shrink-0 rounded-full object-cover"
                />
                <div className="flex flex-col items-center pt-5">
                  <p className="text-black text-3xl text-center line-clamp-2 break-words">
                    titulo
                  </p>
                  <p className="text-blue-800 text-xl text-center truncate max-w-full">
                    categoria
                  </p>
                </div>
              </span>
            </nav>
          </div>
        </div>
      </div>
    </main>
  );
}
