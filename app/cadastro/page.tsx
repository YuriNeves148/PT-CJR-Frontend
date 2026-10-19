"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Outfit } from "next/font/google";
import Image from "next/image";

const outfit = Outfit({ subsets: ["latin"], weight: ["300", "500", "800"] });

interface CadastroForm {
  nomeCompleto: string;
  username: string;
  email: string;
  senha: string;
  confirmarSenha: string;
}

const campo =
  "block h-[52px] w-full rounded-full bg-[#f4f1e3] px-9 text-[1.3rem] font-light text-[#202020] " +
  "placeholder:text-[#7a7a72] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#5e3dec]";

const botaoOlho =
  "absolute right-5 top-1/2 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center " +
  "rounded-full text-[#7a7a72] focus-visible:outline-2 focus-visible:outline-[#5e3dec]";

function EyeIcon({ aberto }: { aberto: boolean }) {
  return (
    <svg
      className="size-[22px] shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M1.5 12s3.8-7 10.5-7 10.5 7 10.5 7-3.8 7-10.5 7S1.5 12 1.5 12Z" />
      <circle cx="12" cy="12" r="3" />
      {!aberto && <path d="M3 3l18 18" />}
    </svg>
  );
}

export default function Cadastro() {
  const router = useRouter();
  const [form, setForm] = useState<CadastroForm>({
    nomeCompleto: "",
    username: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErro("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.senha !== form.confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setEnviando(true);
    try {
      const resposta = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          //nomes do DTO do backend
          nomeCompleto: form.nomeCompleto,
          username: form.username,
          email: form.email,
          senha: form.senha,
        }),
      });

      if (!resposta.ok) {
        const dados = await resposta.json().catch(() => null);
        const mensagem = Array.isArray(dados?.message) ? dados.message[0] : dados?.message;
        throw new Error(mensagem || "Não foi possível criar a conta. Tente novamente.");
      }

      router.push("/login");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main
       className={`${outfit.className} flex min-h-screen items-stretch gap-[6vw] bg-[#f4f1e3] px-4 md:h-screen md:overflow-hidden md:px-[6vw]`}
    >
      <section className="mt-[10.7vh] flex-1 rounded-t-[40px] bg-[#202020] px-6 pb-10 pt-14 text-[#f4f1e3] md:max-w-[710px] md:flex-none md:basis-[46.5%] md:rounded-t-[70px] md:px-20 md:pb-[60px] md:pt-[100px]">
        <h1 className="mb-12 text-center text-[clamp(1.8rem,2.6vw,2.6rem)] font-extrabold uppercase leading-[1.1] tracking-[0.01em]">
          Crie sua conta
        </h1>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input className={campo} name="nomeCompleto" placeholder="Nome Completo" autoComplete="name"
            value={form.nomeCompleto} onChange={handleChange} required />

          <input className={campo} name="username" placeholder="Username" autoComplete="username"
            value={form.username} onChange={handleChange} required />

          <input className={campo} name="email" type="email" placeholder="Email" autoComplete="email"
            value={form.email} onChange={handleChange} required />

          <div className="relative">
            <input className={`${campo} pr-[68px]`} name="senha" placeholder="Senha" autoComplete="new-password"
              type={mostrarSenha ? "text" : "password"}
              value={form.senha} onChange={handleChange} required minLength={6} />
            <button type="button" className={botaoOlho}
              onClick={() => setMostrarSenha(!mostrarSenha)}
              aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}>
              <EyeIcon aberto={mostrarSenha} />
            </button>
          </div>

          <div className="relative">
            <input className={`${campo} pr-[68px]`} name="confirmarSenha" placeholder="Confirmar Senha" autoComplete="new-password"
              type={mostrarConfirmar ? "text" : "password"}
              value={form.confirmarSenha} onChange={handleChange} required />
            <button type="button" className={botaoOlho}
              onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
              aria-label={mostrarConfirmar ? "Ocultar senha" : "Mostrar senha"}>
              <EyeIcon aberto={mostrarConfirmar} />
            </button>
          </div>

          {erro && (
            <p className="text-center text-[0.95rem] text-[#ff8a8a]" role="alert">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="mt-7 h-14 w-full cursor-pointer rounded-full bg-[#5e3dec] text-[1.4rem] font-medium uppercase text-[#f4f1e3] transition enabled:hover:brightness-110 disabled:cursor-default disabled:opacity-60 focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#f4f1e3]"
          >
            {enviando ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <p className="mt-7 text-[1.25rem] font-light">
          Já possui uma conta?{" "}
          <Link href="/login" className="font-medium text-[#5e3dec] hover:underline">
            Login
          </Link>
        </p>
      </section>
      <aside className="mt-[10.7vh] hidden min-h-0 min-w-0 flex-1 flex-col items-center gap-8 overflow-hidden md:flex">
  <img
    className=" w-full max-w-[460px] shrink-0"
    src="/logo-stockio.png"
    alt="Stock.io"
  /> 
  <img
   className="block h-auto w-[min(100%,340px)] shrink-0"
    src="/stocklee.svg"
    alt=""
  />
</aside>
    </main>
  );
}
