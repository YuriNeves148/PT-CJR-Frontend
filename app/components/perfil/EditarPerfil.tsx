"use client";

import Image from "next/image";
import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { mensagemDeErro } from "@/app/components/loja/enviarImagemLoja";

type DadosPerfil = {
  nome: string;
  username: string;
  email: string;
  fotoUrl: string | null;
};

// Diálogo e campos reaproveitados do perfil de Yuri, agora com dados reais.
export default function EditarPerfil(dados: DadosPerfil) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [nome, setNome] = useState(dados.nome);
  const [username, setUsername] = useState(dados.username);
  const [email, setEmail] = useState(dados.email);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  function abrir() {
    setNome(dados.nome);
    setUsername(dados.username);
    setEmail(dados.email);
    setErro("");
    dialogRef.current?.showModal();
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (salvando) return;
    setErro("");
    setSalvando(true);

    try {
      const resposta = await fetch("/api/perfil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome.trim(), username: username.trim(), email: email.trim() }),
      });
      if (!resposta.ok) {
        throw new Error(mensagemDeErro(await resposta.json().catch(() => null), "Não foi possível salvar o perfil."));
      }
      dialogRef.current?.close();
      router.refresh();
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Falha de conexão ao salvar o perfil.");
    } finally {
      setSalvando(false);
    }
  }

  const estiloCampo = "bg-white w-full rounded-2xl text-xl p-2 pl-5";

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        className="w-full cursor-pointer rounded-full bg-[#7137f5] px-6 py-3 text-center font-semibold text-white hover:bg-[#8755ff] md:w-85 md:-translate-y-20"
      >
        Editar Perfil
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="titulo-editar-perfil"
        onCancel={(evento) => { if (salvando) evento.preventDefault(); }}
        className="m-auto max-h-[90dvh] w-[min(45rem,calc(100%-2rem))] overflow-y-auto rounded-4xl bg-[#EDEDED] p-6 text-black backdrop:bg-black/60"
      >
        <button type="button" disabled={salvando} onClick={() => dialogRef.current?.close()} className="ml-auto block cursor-pointer" aria-label="Fechar edição">
          <Image src="/img_esq_senha/x_fechar.png" alt="" width={32} height={32} />
        </button>
        <h2 id="titulo-editar-perfil" className="mb-6 text-center text-2xl font-bold">Editar perfil</h2>
        <FotoPerfil fotoUrl={dados.fotoUrl} nome={dados.nome} />

        <form onSubmit={salvar} className="mx-auto flex w-full max-w-100 flex-col gap-4">
          <fieldset disabled={salvando} className="flex flex-col gap-4">
            <label>Nome
              <input name="nome" value={nome} onChange={(e) => setNome(e.target.value)} required maxLength={255} className={estiloCampo} />
            </label>
            <label>Username
              <input name="username" value={username} onChange={(e) => setUsername(e.target.value)} required maxLength={255} className={estiloCampo} />
            </label>
            <p className="text-sm text-gray-600">Usernames com formato de e-mail não são exibidos publicamente.</p>
            <label>E-mail
              <input name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} className={estiloCampo} />
            </label>
            {erro && <p role="alert" className="text-sm text-red-700">{erro}</p>}
            <button type="submit" className="mt-6 cursor-pointer rounded-full bg-[#6A38F3] p-3 text-2xl text-white shadow-2xl hover:opacity-70 disabled:opacity-50">
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </fieldset>
        </form>
      </dialog>
    </>
  );
}

// Apresentação da foto do componente original. O backend ainda não possui
// upload de foto de usuário; não oferece prévia que aparente ser persistida.
function FotoPerfil({ fotoUrl, nome }: { fotoUrl: string | null; nome: string }) {
  return (
    <div className="mb-8 flex flex-col items-center gap-3">
      <div className="relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-full bg-gray-300">
        {fotoUrl ? (
          <Image src={fotoUrl} alt={`Foto de ${nome}`} width={400} height={400} unoptimized className="h-full w-full object-cover" />
        ) : (
          <span className="text-6xl text-gray-600">{nome.charAt(0).toUpperCase()}</span>
        )}
      </div>
      <p className="text-center text-sm text-gray-600">A alteração da foto de perfil ainda não está disponível.</p>
    </div>
  );
}
