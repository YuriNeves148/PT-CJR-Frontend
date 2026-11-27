"use client";
import { useRef, useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  emailValido,
  estiloInvalido,
  estiloPagina,
  EyeIcon,
  MensagemCampo,
  outfit,
} from "@/app/components/auth/elementosAuth";

const campo =
  "block h-12 w-full rounded-full bg-[#f4f1e3] pl-[34px] pr-6 text-[1.375rem] font-light text-[#202020] " +
  "placeholder:text-[#7a7a72] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#5e3dec]";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [errosCampo, setErrosCampo] = useState<{ email?: string; senha?: string }>({});
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  // Pop-up de esqueceu a senha
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [emailTroca, setEmailTroca] = useState("");
  const [mensagemTroca, setMensagemTroca] = useState<{ texto: string; sucesso: boolean } | null>(null);
  const [salvandoSenha, setSalvandoSenha] = useState(false);
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
    setMensagemTroca(null);
    dialogRef.current?.close();
  }

  function abrirTrocaSenha() {
    setEmailTroca(email);
    setMensagemTroca(null);
    dialogRef.current?.showModal();
  }

  async function trocarSenha(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensagemTroca(null);

    if (novaSenha.length < 6) {
      return setMensagemTroca({ texto: "A nova senha deve ter no mínimo 6 caracteres.", sucesso: false });
    }
    if (novaSenha !== confirmarSenha) {
      return setMensagemTroca({ texto: "A confirmação não confere com a nova senha.", sucesso: false });
    }

    setSalvandoSenha(true);
    try {
      const resposta = await fetch("/api/trocar-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailTroca, senha_atual: senhaAntiga, nova_senha: novaSenha }),
      });
      const dados = await resposta.json().catch(() => null);

      if (!resposta.ok) {
        setMensagemTroca({ texto: dados?.mensagem ?? "Não foi possível alterar a senha.", sucesso: false });
        return;
      }

      setSenhaAntiga("");
      setNovaSenha("");
      setConfirmarSenha("");
      setEmail(emailTroca);
      setMensagemTroca({ texto: "Senha alterada! Agora é só entrar com a nova senha.", sucesso: true });
    } catch {
      setMensagemTroca({ texto: "Erro de conexão com o servidor. Tente novamente.", sucesso: false });
    } finally {
      setSalvandoSenha(false);
    }
  }

  function exibirSenha(): void {
    setMostrarSenha(!mostrarSenha);
  }

  async function enviarLogin(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setMensagem("");

    const erros = {
      email: !email.trim() ? "Informe seu e-mail." : !emailValido(email) ? "Informe um e-mail válido." : undefined,
      senha: !senha ? "Informe sua senha." : undefined,
    };
    setErrosCampo(erros);
    if (erros.email || erros.senha) {
      event.currentTarget.querySelector<HTMLInputElement>(erros.email ? "#email" : "#password")?.focus();
      return;
    }

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
    <main className={`${outfit.className} ${estiloPagina}`}>
      <aside className="mt-[calc(10.7vh-112px)] hidden min-h-0 min-w-0 flex-1 flex-col items-start pl-4 md:flex">
        <Image
          src="/images/LOGO Stock.io.png"
          alt="Stock.io"
          width={421}
          height={222}
          priority
          className="h-auto w-[min(100%,421px)] shrink-0"
        />
        <Image
          src="/images/Stockles - Mascote da Stock.io.png"
          alt="Mascote Stockles"
          width={513}
          height={1117}
          unoptimized
          className="h-auto w-[min(100%,513px)] shrink-0"
        />
      </aside>

      <section className="mt-[10.7vh] flex-1 rounded-t-[40px] bg-[#202020] px-6 pb-10 pt-14 text-[#f4f1e3] md:w-[45.4vw] md:max-w-[650px] md:flex-none md:rounded-t-[50px] md:px-[clamp(2rem,5.2vw,74px)] md:pt-[104px]">
        <h1 className="mb-[52px] text-center text-[clamp(1.8rem,2.8vw,2.5rem)] font-extrabold uppercase leading-[1.1] tracking-[0.015em]">
          Bem vindo de volta!
        </h1>

        <form className="flex flex-col gap-7" onSubmit={enviarLogin} noValidate>
          <label htmlFor="email" className="sr-only">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={`${campo} ${errosCampo.email ? estiloInvalido : ""}`}
            placeholder="Email"
            value={email}
            aria-invalid={errosCampo.email ? true : undefined}
            aria-describedby={errosCampo.email ? "erro-email" : undefined}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrosCampo({ ...errosCampo, email: undefined });
            }}
          />
          <MensagemCampo id="erro-email" texto={errosCampo.email} className="-mt-5 pl-[34px]" />

          <label htmlFor="password" className="sr-only">
            Senha
          </label>
          <div className="relative">
            <input
              id="password"
              autoComplete="current-password"
              className={`${campo} pr-14 ${errosCampo.senha ? estiloInvalido : ""}`}
              type={mostrarSenha ? "text" : "password"}
              placeholder="Senha"
              value={senha}
              aria-invalid={errosCampo.senha ? true : undefined}
              aria-describedby={errosCampo.senha ? "erro-senha" : undefined}
              onChange={(e) => {
                setSenha(e.target.value);
                setErrosCampo({ ...errosCampo, senha: undefined });
              }}
            />
            <button
              type="button"
              className="absolute right-2.5 top-1/2 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[#7a7a72] focus-visible:outline-2 focus-visible:outline-[#5e3dec]"
              onClick={exibirSenha}
              aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
            >
              <EyeIcon aberto={!mostrarSenha} />
            </button>
          </div>
          <MensagemCampo id="erro-senha" texto={errosCampo.senha} className="-mt-5 pl-[34px]" />

          <button
            type="button"
            onClick={abrirTrocaSenha}
            className="self-center cursor-pointer text-[1.2rem] font-light text-[#f4f1e3] underline underline-offset-4 hover:text-white focus-visible:outline-2 focus-visible:outline-[#5e3dec]"
          >
            Esqueceu sua senha?
          </button>

          {mensagem && (
            <p className="text-center text-[0.95rem] text-[#ff8a8a]" role="alert">
              {mensagem}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="h-[52px] w-full cursor-pointer rounded-full bg-[#5e3dec] text-[1.375rem] font-medium uppercase text-[#f4f1e3] transition enabled:hover:brightness-110 disabled:cursor-default disabled:opacity-60 focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#f4f1e3]"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <dialog
          ref={dialogRef}
          aria-label="Trocar senha"
          className="open:flex flex-col rounded-4xl p-6 m-auto bg-[#EDEDED] w-180 max-w-[95vw] max-h-[95dvh] overflow-y-auto backdrop:bg-black/60"
          onClose={limpa_input}
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

          <form onSubmit={trocarSenha} className="flex flex-col">
            <div className="relative w-100 max-w-full self-center">
              <input
                required
                type="email"
                placeholder="Email"
                aria-label="Email"
                autoComplete="email"
                value={emailTroca}
                onChange={(e) => setEmailTroca(e.target.value)}
                className="bg-[#FFFFFF] m-3 w-full rounded-2xl pl-5 pr-14 text-2xl p-2 text-black"
              />
            </div>

            {/* senha antiga */}
            <div className="relative w-100 max-w-full self-center">
              <input
                required
                placeholder="Senha Antiga"
                aria-label="Senha antiga"
                autoComplete="current-password"
                type={mostrarAntiga ? "text" : "password"}
                value={senhaAntiga}
                onChange={(e) => setSenhaAntiga(e.target.value)}
                className="bg-[#FFFFFF] m-3 w-full rounded-2xl pl-5 pr-14 text-2xl p-2 text-black"
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
            <div className="relative w-100 max-w-full self-center">
              <input
                required
                placeholder="Nova Senha"
                aria-label="Nova senha"
                autoComplete="new-password"
                type={mostrarNova ? "text" : "password"}
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="bg-[#FFFFFF] m-3 w-full rounded-2xl pl-5 pr-14 text-2xl p-2 text-black"
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
            <div className="relative w-100 max-w-full self-center">
              <input
                required
                placeholder="Confirmar Senha"
                aria-label="Confirmar nova senha"
                autoComplete="new-password"
                type={mostrarConfirmar ? "text" : "password"}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="bg-[#FFFFFF] m-3 w-full rounded-2xl pl-5 pr-14 text-2xl p-2 text-black"
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
            {mensagemTroca && (
              <p
                role={mensagemTroca.sucesso ? "status" : "alert"}
                className={`mt-4 self-center text-center text-lg ${mensagemTroca.sucesso ? "text-[#4f7a00]" : "text-red-600"}`}
              >
                {mensagemTroca.texto}
              </p>
            )}
            <button
              type="submit"
              disabled={salvandoSenha}
              className="bg-[#6A38F3] cursor-pointer hover:bg-[#8c77e6] self-center text-white m-5 w-100 max-w-full rounded-2xl mt-10 text-2xl p-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {salvandoSenha ? "Salvando..." : "Salvar Senha"}
            </button>
          </form>
        </dialog>
        <p className="mt-5 text-[clamp(1.1rem,1.62vw,1.45rem)] font-light">
          Não possui uma conta?{" "}
          <Link href="/cadastro" className="whitespace-nowrap font-medium text-[#5e3dec] hover:underline">
            Cadastre-se
          </Link>
        </p>
      </section>
    </main>
  );
}
