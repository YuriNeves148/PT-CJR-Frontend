"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
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
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fotoAtualizada, setFotoAtualizada] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);

  useEffect(() => () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
  }, []);

  function selecionarFoto(arquivo: File | null) {
    if (arquivo && (!/\.png$/i.test(arquivo.name) || arquivo.size === 0 || arquivo.size > 2 * 1024 * 1024)) {
      setErro("Escolha uma imagem PNG válida de até 2 MB.");
      return;
    }
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = arquivo ? URL.createObjectURL(arquivo) : null;
    setPreview(previewRef.current);
    setFoto(arquivo);
    setErro("");
  }

  function abrir() {
    selecionarFoto(null);
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

    let camposSalvos = false;
    try {
      const resposta = await fetch("/api/perfil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome.trim(), username: username.trim(), email: email.trim() }),
      });
      if (!resposta.ok) {
        throw new Error(mensagemDeErro(await resposta.json().catch(() => null), "Não foi possível salvar o perfil."));
      }
      camposSalvos = true;
      if (foto) {
        const corpo = new FormData();
        corpo.append("foto", foto, foto.name);
        const upload = await fetch("/api/perfil/foto", { method: "POST", body: corpo });
        const resultado = await upload.json().catch(() => null);
        if (!upload.ok || typeof resultado?.foto_perfil_url !== "string") {
          throw new Error(mensagemDeErro(resultado, "Não foi possível enviar a foto."));
        }
        setFotoAtualizada(resultado.foto_perfil_url);
        selecionarFoto(null);
      }
      dialogRef.current?.close();
      router.refresh();
    } catch (falha) {
      const mensagem = falha instanceof Error ? falha.message : "Falha de conexão ao salvar o perfil.";
      setErro(camposSalvos ? `Os campos do perfil foram salvos, mas a foto não foi atualizada. ${mensagem} Tente novamente.` : mensagem);
      if (camposSalvos) router.refresh();
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
        <FotoPerfil fotoUrl={preview ?? fotoAtualizada ?? dados.fotoUrl} nome={dados.nome} aoSelecionar={selecionarFoto} selecionada={!!foto} desabilitado={salvando} />

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

function FotoPerfil({ fotoUrl, nome, aoSelecionar, selecionada, desabilitado }: {
  fotoUrl: string | null; nome: string;
  aoSelecionar: (arquivo: File | null) => void;
  selecionada: boolean; desabilitado: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="mb-8 flex flex-col items-center gap-3">
      <div className="relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-full bg-gray-300">
        {fotoUrl ? (
          <Image src={fotoUrl} alt={`Foto de ${nome}`} width={400} height={400} unoptimized className="h-full w-full object-cover" />
        ) : (
          <span className="text-6xl text-gray-600">{nome.charAt(0).toUpperCase()}</span>
        )}
      </div>
      <input ref={inputRef} type="file" accept=".png,image/png" disabled={desabilitado} className="sr-only"
        aria-label="Selecionar foto PNG"
        onChange={(evento) => {
          const arquivo = evento.target.files?.[0];
          evento.target.value = "";
          if (arquivo) aoSelecionar(arquivo);
        }} />
      <button type="button" disabled={desabilitado} onClick={() => inputRef.current?.click()}
        className="cursor-pointer text-lg font-semibold text-[#6A38F3] hover:underline disabled:opacity-50">
        {fotoUrl ? "Alterar foto" : "Adicionar foto"}
      </button>
      {selecionada && <button type="button" disabled={desabilitado} onClick={() => aoSelecionar(null)} className="text-sm text-red-800 hover:underline">Cancelar seleção</button>}
      <p className="text-center text-sm text-gray-600">PNG de até 2 MB. A prévia será salva ao clicar em Salvar.</p>
    </div>
  );
}
