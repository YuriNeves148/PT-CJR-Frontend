"use client";
import { createUser } from '../service/userService';
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import {
  botaoOlho,
  botaoPrincipal,
  campo,
  estiloCartao,
  estiloPagina,
  emailValido,
  estiloInvalido,
  estiloTitulo,
  EyeIcon,
  MensagemCampo,
  outfit,
} from "@/app/components/auth/elementosAuth";

interface CadastroForm {
  nomeCompleto: string;
  username: string;
  email: string;
  senha: string;
  confirmarSenha: string;
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
  const [errosCampo, setErrosCampo] = useState<Partial<Record<keyof CadastroForm, string>>>({});
  const [enviando, setEnviando] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrosCampo({ ...errosCampo, [e.target.name]: undefined });
    setErro("");
  };

  function validar() {
    const erros: Partial<Record<keyof CadastroForm, string>> = {};
    if (!form.nomeCompleto.trim()) erros.nomeCompleto = "Informe seu nome completo.";
    if (!form.username.trim()) erros.username = "Informe um nome de usuário.";
    if (!form.email.trim()) erros.email = "Informe seu e-mail.";
    else if (!emailValido(form.email)) erros.email = "Informe um e-mail válido.";
    if (!form.senha) erros.senha = "Informe uma senha.";
    else if (form.senha.length < 6) erros.senha = "A senha deve ter no mínimo 6 caracteres.";
    if (!form.confirmarSenha) erros.confirmarSenha = "Confirme sua senha.";
    else if (form.senha !== form.confirmarSenha) erros.confirmarSenha = "As senhas não coincidem.";
    return erros;
  }

  const propsCampo = (nome: keyof CadastroForm) => ({
    name: nome,
    value: form[nome],
    onChange: handleChange,
    "aria-invalid": errosCampo[nome] ? true : undefined,
    "aria-describedby": errosCampo[nome] ? `erro-${nome}` : undefined,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const erros = validar();
    setErrosCampo(erros);
    const primeiro = Object.keys(erros)[0];
    if (primeiro) {
      e.currentTarget.querySelector<HTMLInputElement>(`[name="${primeiro}"]`)?.focus();
      return;
    }

    setEnviando(true);
    try {
      await createUser({
        nome: form.nomeCompleto,
        username: form.username,
        email: form.email,
        senha: form.senha,
      });

      router.push("/login");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message;
        setErro(
          Array.isArray(msg)
            ? msg[0]
            : msg ?? "Não foi possível conectar ao servidor."
        );
      } else {
        setErro("Erro inesperado.");
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main
       className={`${outfit.className} ${estiloPagina}`}
    >
      <section className={estiloCartao}>
        <h1 className={estiloTitulo}>
          Crie sua conta
        </h1>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <input className={`${campo} ${errosCampo.nomeCompleto ? estiloInvalido : ""}`} placeholder="Nome Completo"
            aria-label="Nome completo" autoComplete="name" {...propsCampo("nomeCompleto")} />
          <MensagemCampo id="erro-nomeCompleto" texto={errosCampo.nomeCompleto} />

          <input className={`${campo} ${errosCampo.username ? estiloInvalido : ""}`} placeholder="Username"
            aria-label="Nome de usuário" autoComplete="username" {...propsCampo("username")} />
          <MensagemCampo id="erro-username" texto={errosCampo.username} />

          <input className={`${campo} ${errosCampo.email ? estiloInvalido : ""}`} type="email" placeholder="Email"
            aria-label="E-mail" autoComplete="email" {...propsCampo("email")} />
          <MensagemCampo id="erro-email" texto={errosCampo.email} />

          <div className="relative">
            <input className={`${campo} pr-[68px] ${errosCampo.senha ? estiloInvalido : ""}`} placeholder="Senha"
              aria-label="Senha" autoComplete="new-password"
              type={mostrarSenha ? "text" : "password"} {...propsCampo("senha")} />
            <button type="button" className={botaoOlho}
              onClick={() => setMostrarSenha(!mostrarSenha)}
              aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}>
              <EyeIcon aberto={mostrarSenha} />
            </button>
          </div>
          <MensagemCampo id="erro-senha" texto={errosCampo.senha} />

          <div className="relative">
            <input className={`${campo} pr-[68px] ${errosCampo.confirmarSenha ? estiloInvalido : ""}`} placeholder="Confirmar Senha"
              aria-label="Confirmar senha" autoComplete="new-password"
              type={mostrarConfirmar ? "text" : "password"} {...propsCampo("confirmarSenha")} />
            <button type="button" className={botaoOlho}
              onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
              aria-label={mostrarConfirmar ? "Ocultar senha" : "Mostrar senha"}>
              <EyeIcon aberto={mostrarConfirmar} />
            </button>
          </div>
          <MensagemCampo id="erro-confirmarSenha" texto={errosCampo.confirmarSenha} />

          {erro && (
            <p className="text-center text-[0.95rem] text-[#ff8a8a]" role="alert">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className={botaoPrincipal}
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
      <aside className="mt-[10.7vh] hidden min-h-0 min-w-0 flex-1 flex-col items-center gap-8 md:flex">
  <Image
          className="transform -translate-y-30 relative w-full max-w-[460px] shrink-0"
          src="/logo-stockio.png"
          alt="Stock.io"
          width={421}
          height={222}
        />
        <Image
          className="transform -translate-y-35 block h-auto w-[min(100%,430px)] shrink-0"
          src="/stocklee.svg"
          alt=""
          width={497}
          height={799}
        />
</aside>
    </main>
  );
}
