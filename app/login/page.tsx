"use client";
import { useRef, useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  // Pop-up de esqueceu a senha
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [senhaAntiga, setSenhaAntiga] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarAntiga, setMostrarAntiga] = useState(false);
  const [mostrarNova, setMostrarNova] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  // Limpa os campos e fecha o pop-up
  function limpa_input() {
    setSenhaAntiga("");
    setNovaSenha("");
    setConfirmarSenha("");
    setMostrarAntiga(false);
    setMostrarNova(false);
    setMostrarConfirmar(false);
    dialogRef.current?.close();
  }

  function exibirSenha(): void {
    setMostrarSenha(!mostrarSenha);
  }

  async function enviarLogin(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setMensagem("");
    setCarregando(true);

    try {
      const resposta = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      if (!resposta.ok) {
        if (resposta.status === 401) {
          setMensagem("E-mail ou senha incorretos.");
        } else if (resposta.status >= 500) {
          setMensagem(
            "Servidor indisponível ou ocorreu um erro. Tente novamente.",
          );
        } else {
          setMensagem("Não foi possível realizar o login.");
        }
        return;
      }

      const dados = await resposta.json();

      if (dados.sucesso === true) {
        router.push("/feed_logado");
      }
    } catch (erro) {
      console.error("Erro ao conectar com o backend:", erro);
      setMensagem("Erro de conexão com o servidor. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f4e8] grid grid-cols-2 pl-8 pr-15">
      <section className="flex flex-col items-center gap-5 ">
        <Image
          src="/images/LOGO Stock.io.png"
          alt="Logotipo da STOCK"
          width={300}
          height={100}
        />
        <Image
          src="/images/Stockles - Mascote da Stock.io.png"
          alt="Logotipo da STOCK"
          width={300}
          height={100}
          unoptimized
          className="w-[450px] max-w-full h-auto"
        />
      </section>

      <section
        className="bg-[#171917] p-10 flex flex-col justify-center items-center gap-5"
        style={{ marginTop: "55px", borderRadius: "24px 24px 0 0" }}
      >
        <h2 className="text-3xl font-bold text-[#f7f4e8] mb-4">
          BEM VINDO DE VOLTA!
        </h2>
        <form
          className="w-full max-w-sm flex flex-col gap-2"
          onSubmit={enviarLogin}
        >
          <label
            htmlFor="email"
            className="text-[#f7f4e8] text-sm font-semibold"
          >
            Email
          </label>
          <input
            required
            id="email"
            className="bg-[#f7f4e8] text-black w-full px-5 py-3 rounded-full"
            type="email"
            placeholder="Digite seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label
            htmlFor="password"
            className="text-[#f7f4e8] text-sm font-semibold mt-4"
          >
            Senha
          </label>
          <div className="relative">
            <input
              required
              id="password"
              className="bg-[#f7f4e8] text-black w-full px-5 py-3 rounded-full"
              type={mostrarSenha ? "text" : "password"}
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-black cursor-pointer"
              onClick={exibirSenha}
            >
              {mostrarSenha ? (
                <Image
                  src="/images/iconamoon_eye-thin.png"
                  alt="Ocultar senha"
                  width={20}
                  height={20}
                />
              ) : (
                <Image
                  src="/images/iconamoon_eye-thin.png"
                  alt="Mostrar senha"
                  width={20}
                  height={20}
                />
              )}
            </button>
          </div>
          <button
            className="text-white text-center text-sm hover:underline mt-3 cursor-pointer"
            type="button"
            onClick={() => dialogRef.current?.showModal()}
          >
            Esqueceu sua senha?
          </button>

          {/* popup */}
          <dialog
            ref={dialogRef}
            className="open:flex flex-col  rounded-4xl p-6 m-auto bg-[#EDEDED] w-180 h-200 backdrop:bg-black/60"
          >
            <button
              className="self-end mt-20 mr-10 cursor-pointer"
              type="button"
              onClick={limpa_input}
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

          <button
            type="submit"
            disabled={carregando}
            className="bg-[#7137f5] text-white w-full px-5 py-3 rounded-full cursor-pointer mt-5 font-semibold hover:bg-[#8755ff] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {carregando ? "ENTRANDO..." : "ENTRAR"}
          </button>
          {mensagem && <p className="text-red-500 text-sm mt-2">{mensagem}</p>}
        </form>
        <p className="mt-5 text-left">
          Não tem uma conta?{" "}
          <Link
            href="/cadastro"
            className="text-[#6A38F3] hover:underline cursor-pointer"
          >
            Cadastre-se
          </Link>
        </p>
      </section>
    </main>
  );
}
