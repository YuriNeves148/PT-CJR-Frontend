"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import { useRouter } from "next/navigation";
import { mensagemDeErro } from "@/app/components/loja/enviarImagemLoja";

type DadosPerfil = {
  id: number;
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
  const [excluindo, setExcluindo] = useState(false);
  const [aviso, setAviso] = useState("");
  const dialogSenhaRef = useRef<HTMLDialogElement>(null);
  // Enquanto salva ou exclui, nenhuma outra ação do pop-up pode começar.
  const ocupado = salvando || excluindo;

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
    setAviso("");
    dialogRef.current?.showModal();
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (ocupado) return;
    setErro("");
    setAviso("");
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

  async function deletarConta() {
    if (ocupado) return;
    if (!confirm("Tem certeza que deseja excluir sua conta? Suas lojas, produtos e avaliações também serão apagados. Essa ação não pode ser desfeita.")) return;
    setErro("");
    setAviso("");
    setExcluindo(true);

    try {
      const resposta = await fetch(`/api/user/${dados.id}`, { method: "DELETE" });
      if (!resposta.ok) {
        throw new Error(mensagemDeErro(await resposta.json().catch(() => null), "Não foi possível excluir a conta."));
      }
      // A conta não existe mais: apaga o cookie da sessão antes de sair.
      await fetch("/api/logout", { method: "POST" }).catch(() => undefined);
      router.push("/login");
      router.refresh();
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Falha de conexão ao excluir a conta.");
      setExcluindo(false);
    }
  }

  const estiloCampo = "bg-white w-full rounded-2xl text-xl p-2 pl-5";
  const estiloBotao = "w-full cursor-pointer rounded-full p-3 text-2xl shadow-2xl hover:opacity-70 disabled:opacity-50";

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        className="w-full cursor-pointer rounded-full bg-[#7137f5] px-6 py-3 text-center font-semibold text-white hover:bg-[#8755ff] md:w-85 md:-translate-y-20"
      >
        Editar Perfil
      </button>

      {/* O espaçamento fica na div interna: assim, só um clique no fundo
          escuro tem o próprio dialog como alvo (e fecha o pop-up). */}
      <dialog
        ref={dialogRef}
        aria-labelledby="titulo-editar-perfil"
        onCancel={(evento) => { if (ocupado) evento.preventDefault(); }}
        onClose={() => selecionarFoto(null)}
        onClick={(evento) => {
          if (evento.target === evento.currentTarget && !ocupado) dialogRef.current?.close();
        }}
        className="m-auto max-h-[90dvh] w-[min(45rem,calc(100%-2rem))] overflow-y-auto rounded-4xl bg-[#EDEDED] text-black backdrop:bg-black/60"
      >
       <div className="p-6">
        <button type="button" disabled={ocupado} onClick={() => dialogRef.current?.close()} className="ml-auto block cursor-pointer" aria-label="Fechar edição">
          <Image src="/img_esq_senha/x_fechar.png" alt="" width={32} height={32} />
        </button>
        <h2 id="titulo-editar-perfil" className="mb-6 text-center text-2xl font-bold">Editar perfil</h2>
        <FotoPerfil fotoUrl={preview ?? fotoAtualizada ?? dados.fotoUrl} nome={dados.nome} aoSelecionar={selecionarFoto} selecionada={!!foto} desabilitado={ocupado} />

        <form onSubmit={salvar} className="mx-auto flex w-full max-w-100 flex-col gap-4">
          <fieldset disabled={ocupado} className="flex flex-col gap-4">
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
            {aviso && <p role="status" className="text-sm text-green-700">{aviso}</p>}
            <div className="mt-6 flex flex-col gap-3">
              <button type="button" onClick={deletarConta} className={`${estiloBotao} border-3 border-red-500 text-red-800`}>
                {excluindo ? "Excluindo..." : "Deletar Conta"}
              </button>
              <button type="button" onClick={() => { setErro(""); setAviso(""); dialogSenhaRef.current?.showModal(); }} className={`${estiloBotao} border-3 border-[#6A38F3] text-[#6A38F3]`}>
                Alterar senha
              </button>
              <button type="submit" className={`${estiloBotao} bg-[#6A38F3] text-white`}>
                {salvando ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </fieldset>
        </form>
       </div>
      </dialog>

      <AlterarSenha dialogRef={dialogSenhaRef} aoAlterar={() => setAviso("Senha alterada com sucesso!")} />
    </>
  );
}

// Pop-up de alterar senha. A senha antiga é conferida pelo backend.
function AlterarSenha({ dialogRef, aoAlterar }: {
  dialogRef: RefObject<HTMLDialogElement | null>;
  aoAlterar: () => void;
}) {
  const [senhaAntiga, setSenhaAntiga] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  // Muda a cada fechamento para os campos voltarem com a senha escondida.
  const [abertura, setAbertura] = useState(0);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  function limparCampos() {
    setSenhaAntiga("");
    setNovaSenha("");
    setConfirmarSenha("");
    setErro("");
    setAbertura((atual) => atual + 1);
  }

  async function salvarSenha(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (salvando) return;
    if (novaSenha.length < 6) {
      setErro("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErro("A confirmação não é igual à nova senha.");
      return;
    }
    setErro("");
    setSalvando(true);

    try {
      const resposta = await fetch("/api/perfil/senha", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senhaAntiga, novaSenha }),
      });
      if (!resposta.ok) {
        throw new Error(mensagemDeErro(await resposta.json().catch(() => null), "Não foi possível alterar a senha."));
      }
      dialogRef.current?.close();
      aoAlterar();
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Falha de conexão ao alterar a senha.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="titulo-alterar-senha"
      onCancel={(evento) => { if (salvando) evento.preventDefault(); }}
      onClose={limparCampos}
      onClick={(evento) => {
        if (evento.target === evento.currentTarget && !salvando) dialogRef.current?.close();
      }}
      className="m-auto max-h-[90dvh] w-[min(45rem,calc(100%-2rem))] overflow-y-auto rounded-4xl bg-[#EDEDED] text-black backdrop:bg-black/60"
    >
      <div className="flex flex-col p-6">
        <button type="button" disabled={salvando} onClick={() => dialogRef.current?.close()} className="ml-auto block cursor-pointer" aria-label="Fechar alteração de senha">
          <Image src="/img_esq_senha/x_fechar.png" alt="" width={32} height={32} />
        </button>
        <Image src="/img_esq_senha/chave.png" alt="" width={120} height={120} className="mb-4 self-center" />
        <h2 id="titulo-alterar-senha" className="mb-6 text-center text-2xl font-bold">Alterar senha</h2>

        <form onSubmit={salvarSenha} className="mx-auto flex w-full max-w-100 flex-col">
          <fieldset disabled={salvando} className="flex flex-col gap-4">
            <div key={abertura} className="flex flex-col gap-4">
              <CampoSenha rotulo="Senha antiga" valor={senhaAntiga} aoMudar={setSenhaAntiga} autoComplete="current-password" />
              <CampoSenha rotulo="Nova senha" valor={novaSenha} aoMudar={setNovaSenha} autoComplete="new-password" />
              <CampoSenha rotulo="Confirmar senha" valor={confirmarSenha} aoMudar={setConfirmarSenha} autoComplete="new-password" />
            </div>

            {erro && <p role="alert" className="text-sm text-red-700">{erro}</p>}

            <button type="submit" className="mt-6 cursor-pointer rounded-full bg-[#6A38F3] p-3 text-2xl text-white shadow-2xl hover:opacity-70 disabled:opacity-50">
              {salvando ? "Salvando..." : "Salvar senha"}
            </button>
          </fieldset>
        </form>
      </div>
    </dialog>
  );
}

function CampoSenha({ rotulo, valor, aoMudar, autoComplete }: {
  rotulo: string; valor: string;
  aoMudar: (valor: string) => void; autoComplete: string;
}) {
  const [mostrar, setMostrar] = useState(false);
  return (
    <label>{rotulo}
      <span className="relative block">
        <input
          type={mostrar ? "text" : "password"}
          autoComplete={autoComplete}
          required
          value={valor}
          onChange={(e) => aoMudar(e.target.value)}
          className="w-full rounded-2xl bg-white p-2 pr-14 pl-5 text-xl"
        />
        <button type="button" onClick={() => setMostrar(!mostrar)} className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer">
          <Image
            src="/images/iconamoon_eye-thin.png"
            alt={mostrar ? "Ocultar senha" : "Mostrar senha"}
            width={24}
            height={24}
            className={mostrar ? "opacity-100" : "opacity-50"}
          />
        </button>
      </span>
    </label>
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
