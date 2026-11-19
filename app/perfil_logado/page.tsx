"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Usuario = {
  id: number;
  nome: string;
  email: string;
  username: string;
  foto_perfil_url?: string | null;
};

type Lojas = {
  id: number;
  nome: string;
  logo_url?: string | null;
};

type Produtos = {
  id: number;
  nome: string;
  preco: number;
  estoque: number;
  imagem: ImagemProduto[];
};

type ImagemProduto = {
  url_imagem: string;
};

export default function PerfilPage() {
  const [ehDonoDoPerfil, setEhDonoDoPerfil] = useState(false);
  const [mostrarMaisProdutos, setMostrarMaisProdutos] = useState(false);
  const [mostrarMaisLojas, setMostrarMaisLojas] = useState(false);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [lojas, setLojas] = useState<Lojas[]>([]);
  const [produtos, setProdutos] = useState<Produtos[]>([]);

  // Pop-up de edição de perfil
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  function limparCampos() {
    setNome("");
    setUsername("");
    setEmail("");
    setPreview(null);
  }
  function fechar_popup_perfil() {
    limparCampos();
    dialogRef.current?.close();
  }

  // Pop-up de esqueceu a senha
  const dialogRefSenha = useRef<HTMLDialogElement>(null);
  const [senhaAntiga, setSenhaAntiga] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarAntiga, setMostrarAntiga] = useState(false);
  const [mostrarNova, setMostrarNova] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  function limpa_input() {
    setSenhaAntiga("");
    setNovaSenha("");
    setConfirmarSenha("");
    setMostrarAntiga(false);
    setMostrarNova(false);
    setMostrarConfirmar(false);
    dialogRefSenha.current?.close();
  }
  function fechar_popup_senha() {
    limpa_input();
    dialogRefSenha.current?.close();
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
        console.log(usuario);
        setUsuario(usuario);
        setEhDonoDoPerfil(
          idNaUrl === null ||
            (idNaUrl.trim() !== "" && Number(idNaUrl) === Number(usuario.id)),
        );
      } catch (erro) {
        console.error("Erro ao verificar login:", erro);
        setEhDonoDoPerfil(false);
      }
    }

    verificarLogin();
  }, []);

  useEffect(() => {
    async function buscaLojas() {
      try {
        const resposta = await fetch("/api/lojas", { cache: "no-store" });

        if (!resposta.ok) {
          return "erro ao acessar a rota.";
        }

        const dados: Lojas[] = await resposta.json();
        console.log("lojas: ", dados);
        setLojas(dados);
      } catch {
        return "Não foi possível bucar as lojas cadastradas por você";
      }
    }
    buscaLojas();
  }, []);

  useEffect(() => {
    async function buscaProdutos() {
      try {
        const resposta = await fetch("/api/produtos");

        if (!resposta.ok) {
          return "erro ao acessar a rota";
        }

        const dados: Produtos[] = await resposta.json();

        setProdutos(dados);
      } catch {
        return "Não foi possível bucar os produtos cadastrados por você";
      }
    }
    buscaProdutos();
  }, []);

  return (
    <main className="min-h-screen bg-[#f7f4e8]">
      <section className="relative h-[280px] bg-black">
        <button className="ml-10">
          <Link href="/feed_logado">
            <Image
              src={"/img_feed/voltar.png"}
              alt=""
              width={30}
              height={30}
              className="mt-50 m-l10 transition duration-200 transform hover:scale-110"
            />
          </Link>
        </button>
        <span className="absolute left-30 bottom-0 translate-y-1/2 w-45 h-45 rounded-full bg-gray-300 flex items-center justify-center">
          <Image
            src={
              usuario?.foto_perfil_url && usuario?.foto_perfil_url.length > 0
                ? `http://localhost:3001${usuario.foto_perfil_url}`
                : "/sem-perfil.png"
            }
            alt="foto perfil"
            width={1000}
            height={1000}
            className="rounded-full transition duration-300 transform hover:scale-110"
          />
        </span>
      </section>

      <section className="px-16 py-0 mt-5">
        <section className="px-16 pt-16 pb-10">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-bold text-[#171917]">
                {usuario?.nome}
              </h1>
              <p className="text-lg text-gray-600">@{usuario?.username}</p>

              <div className="flex items-center gap-2">
                <p className="text-lg text-gray-600">{usuario?.email}</p>
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

          {/* PRODUTOS */}
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
              {produtos.map((produto) => (
                <div
                  key={produto.id}
                  className="flex flex-col bg-white rounded-2xl p-8 font-bold text-2xl gap-1"
                >
                  <span className="flex items-center justify-center">
                    <Image
                      src={
                        produto.imagem && produto.imagem.length > 0
                          ? `http://localhost:3001${produto.imagem[0].url_imagem}`
                          : "/img_feed/sem-imagem.png"
                      }
                      alt={produto.nome}
                      width={180}
                      height={180}
                      className="transition-transform duration-300 hover:scale-110 cursor-pointer"
                    />
                  </span>
                  <p className="text-black">{produto.nome}</p>
                  <p className="text-black">R${produto.preco}</p>
                  <p
                    className={
                      produto.estoque > 0 ? "text-green-600" : "text-red-600"
                    }
                  >
                    {produto.estoque > 0 ? "DISPONÍVEL" : "INDISPOONÍVEL"}
                  </p>
                </div>
              ))}
            </div>

            {/* LOJAS */}
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
              {lojas.map((loja) => (
                <div
                  key={loja.id}
                  className="flex flex-row w-[550px] h-45 shrink-0 rounded-2xl bg-white text-black shadow-sm p-10"
                >
                  <p className="text-5xl">{loja.nome}</p>
                  <Image
                    src={
                      loja.logo_url && loja.logo_url.length > 0
                        ? `http://localhost:3001${loja.logo_url[0]}`
                        : "/img_feed/loja-sem-imagem.png"
                    }
                    alt={loja.nome}
                    width={100}
                    height={100}
                    className="ml-auto rounded-full border-solid border-black border-1"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* AVALIACOES */}
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
        className="open:flex flex-col rounded-4xl p-6 m-auto bg-[#EDEDED] w-180 h-225 backdrop:bg-black/60"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            fechar_popup_perfil();
          }
        }}
      >
        <button
          type="button"
          onClick={() => {
            fechar_popup_perfil();
          }}
        >
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
            value={nome}
            className="bg-white w-100 self-center rounded-2xl text-2xl p-2 pl-5"
          ></input>
          <input
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            className="bg-white w-100 self-center rounded-2xl text-2xl p-2 pl-5"
          ></input>
          <input
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
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
            onClick={() => dialogRefSenha.current?.showModal()}
          >
            Alterar senha
          </button>
          <button
            type="button"
            onClick={() => fechar_popup_perfil()}
            className="cursor-pointer hover:opacity-70 text-2xl bg-[#6A38F3] text-white w-100 shadow-2xl rounded-full p-3"
          >
            Salvar
          </button>
        </div>
      </dialog>

      {/* POP-UP EDITAR SENHA */}
      <dialog
        ref={dialogRefSenha}
        className="open:flex flex-col  rounded-4xl p-6 m-auto bg-[#EDEDED] w-180 h-200 backdrop:bg-black/60"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            fechar_popup_senha();
          }
        }}
      >
        <button
          className="self-end mt-20 mr-10 cursor-pointer"
          type="button"
          onClick={() => {
            fechar_popup_senha();
          }}
        >
          <Image
            src="/img_esq_senha/x_fechar.png"
            alt="Fechar"
            width={32}
            height={32}
            className="w-8 h-8 hover:w-9"
          />
        </button>
        <Image
          src="/img_esq_senha/chave.png"
          alt=""
          width={1000}
          height={1000}
          className="self-center w-38 h-38 mb-10"
        ></Image>

        {/* senha antiga */}
        <div className="relative w-100 self-center">
          <input
            placeholder="Senha Antiga"
            type={mostrarAntiga ? "text" : "password"}
            value={senhaAntiga}
            onChange={(e) => setSenhaAntiga(e.target.value)}
            className="bg-[#FFFFFF] m-3 w-full rounded-2xl pl-5 pr-14 text-2xl p-2"
          />
          <button
            type="button"
            onClick={() => setMostrarAntiga(!mostrarAntiga)}
            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
          >
            <Image
              src="/images/iconamoon_eye-thin.png"
              alt={mostrarAntiga ? "Ocultar senha" : "Mostrar senha"}
              width={24}
              height={24}
              className={mostrarAntiga ? "opacity-100" : "opacity-50"}
            />
          </button>
        </div>

        {/* nova senha */}
        <div className="relative w-100 self-center">
          <input
            placeholder="Nova Senha"
            type={mostrarNova ? "text" : "password"}
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            className="bg-[#FFFFFF] m-3 w-full rounded-2xl pl-5 pr-14 text-2xl p-2"
          />
          <button
            type="button"
            onClick={() => setMostrarNova(!mostrarNova)}
            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
          >
            <Image
              src="/images/iconamoon_eye-thin.png"
              alt={mostrarNova ? "Ocultar senha" : "Mostrar senha"}
              width={24}
              height={24}
              className={mostrarNova ? "opacity-100" : "opacity-50"}
            />
          </button>
        </div>

        {/* Confirmar senha */}
        <div className="relative w-100 self-center">
          <input
            placeholder="Confirmar Senha"
            type={mostrarConfirmar ? "text" : "password"}
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            className="bg-[#FFFFFF] m-3 w-full rounded-2xl pl-5 pr-14 text-2xl p-2"
          />
          <button
            type="button"
            onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
          >
            <Image
              src="/images/iconamoon_eye-thin.png"
              alt={mostrarConfirmar ? "Ocultar senha" : "Mostrar senha"}
              width={24}
              height={24}
              className={mostrarConfirmar ? "opacity-100" : "opacity-50"}
            />
          </button>
        </div>
        <button
          type="button"
          className="bg-[#6A38F3] cursor-pointer hover:bg-[#8c77e6] self-center text-white m-5 w-100 rounded-2xl mt-10 text-2xl p-3"
          onClick={() => {}}
        >
          Salvar Senha
        </button>
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
