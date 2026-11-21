"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import CampoArquivo, { IconeBanner, IconeUpload } from "./CampoArquivoLoja";
import DialogoLoja from "./DialogoLoja";
import {
  ACEITAR_IMAGEM,
  mensagemDeErro,
  ROTULOS_IMAGEM,
  validarImagemLoja,
  type TipoImagemLoja,
} from "./enviarImagemLoja";
import {
  salvarEdicaoLoja,
  validarEdicaoLoja,
  TIPOS_IMAGEM,
  type ArquivosLoja,
  type DadosEdicaoLoja,
} from "./edicaoLoja";

export type LojaEditavel = DadosEdicaoLoja & {
  id: number;
  imagens: Record<TipoImagemLoja, string | null>;
};
type Categoria = { id: number; nome: string };
const TITULOS: Record<TipoImagemLoja, string> = {
  "foto-perfil": "Anexe a foto de perfil de sua loja",
  logo: "Anexe a logo em SVG de sua loja",
  banner: "Anexe o banner de sua loja",
};
const BOTAO =
  "min-h-11 cursor-pointer rounded-full px-6 text-white transition-colors disabled:cursor-wait disabled:opacity-60";

export default function ModalEditarLoja({
  loja,
  aoFechar,
  aoSalvar,
}: {
  loja: LojaEditavel;
  aoFechar: () => void;
  aoSalvar: () => void;
}) {
  const router = useRouter();
  const [referencia, setReferencia] = useState<DadosEdicaoLoja>({
    nome: loja.nome,
    categoria_id: loja.categoria_id,
  });
  const [nome, setNome] = useState(loja.nome);
  const [categoriaId, setCategoriaId] = useState(
    loja.categoria_id?.toString() ?? "",
  );
  const [arquivos, setArquivos] = useState<ArquivosLoja>({});
  const [imagensSalvas, setImagensSalvas] = useState<TipoImagemLoja[]>([]);
  const [salvos, setSalvos] = useState<string[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [consultaCategorias, setConsultaCategorias] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erroCategorias, setErroCategorias] = useState("");
  const [erros, setErros] = useState<string[]>([]);
  const [ocupado, setOcupado] = useState(false);
  const ocupadoRef = useRef(false);
  const [confirmacao, setConfirmacao] = useState<
    "descartar" | "excluir" | null
  >(null);
  const [erroExclusao, setErroExclusao] = useState("");

  useEffect(() => {
    const controlador = new AbortController();
    async function carregar() {
      try {
        const resposta = await fetch("/api/categorias", {
          cache: "no-store",
          signal: controlador.signal,
        });
        if (!resposta.ok) throw new Error("consulta de categorias");
        const dados: unknown = await resposta.json();
        if (
          !Array.isArray(dados) ||
          !dados.length ||
          !dados.every(
            (item) =>
              item &&
              Number.isInteger(item.id) &&
              item.id > 0 &&
              typeof item.nome === "string",
          )
        )
          throw new Error("categorias inválidas");
        if (!controlador.signal.aborted) setCategorias(dados);
      } catch {
        if (!controlador.signal.aborted)
          setErroCategorias(
            "Não foi possível carregar as categorias. Tente novamente para salvar a loja.",
          );
      } finally {
        if (!controlador.signal.aborted) setCarregando(false);
      }
    }
    carregar();
    return () => controlador.abort();
  }, [consultaCategorias]);

  const alterado =
    nome !== referencia.nome ||
    categoriaId !== (referencia.categoria_id?.toString() ?? "") ||
    Object.keys(arquivos).length > 0;

  function fechar() {
    if (ocupadoRef.current) return;
    if (alterado) setConfirmacao("descartar");
    else aoFechar();
  }

  function selecionar(tipo: TipoImagemLoja, arquivo: File | null) {
    const erro = arquivo ? validarImagemLoja(tipo, arquivo) : null;
    setErros(erro ? [erro] : []);
    setArquivos((anteriores) => {
      const novos = { ...anteriores };
      if (arquivo && !erro) novos[tipo] = arquivo;
      else delete novos[tipo];
      return novos;
    });
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (ocupadoRef.current) return;
    const dados = { nome: nome.trim(), categoria_id: Number(categoriaId) };
    const erro = validarEdicaoLoja(dados, categorias, arquivos);
    if (erro || carregando || erroCategorias) {
      setErros([erro || "Aguarde o carregamento das categorias."]);
      return;
    }
    ocupadoRef.current = true;
    setOcupado(true);
    setErros([]);
    try {
      const resultado = await salvarEdicaoLoja(
        loja.id,
        referencia,
        dados,
        arquivos,
      );
      if (resultado.dadosSalvos) {
        setReferencia(dados);
        setNome(dados.nome);
      }
      setArquivos((anteriores) => {
        const pendentes = { ...anteriores };
        resultado.imagensSalvas.forEach((tipo) => delete pendentes[tipo]);
        return pendentes;
      });
      setImagensSalvas((anteriores) => [
        ...new Set([...anteriores, ...resultado.imagensSalvas]),
      ]);
      setSalvos((anteriores) => [
        ...new Set([
          ...anteriores,
          ...(resultado.dadosSalvos && dados.nome !== referencia.nome
            ? ["Nome"]
            : []),
          ...(resultado.dadosSalvos &&
          dados.categoria_id !== referencia.categoria_id
            ? ["Categoria"]
            : []),
          ...resultado.imagensSalvas.map((tipo) => ROTULOS_IMAGEM[tipo]),
        ]),
      ]);
      if (resultado.dadosSalvos || resultado.imagensSalvas.length)
        router.refresh();
      if (resultado.erros.length) setErros(resultado.erros);
      else aoSalvar();
    } finally {
      ocupadoRef.current = false;
      setOcupado(false);
    }
  }

  async function excluir() {
    if (ocupadoRef.current) return;
    ocupadoRef.current = true;
    setOcupado(true);
    setErroExclusao("");
    try {
      const resposta = await fetch(`/api/lojas/${loja.id}`, {
        method: "DELETE",
      });
      if (!resposta.ok) {
        const resultado: unknown = await resposta.json().catch(() => null);
        setErroExclusao(
          resposta.status === 401
            ? "Sua sessão expirou. Faça login novamente."
            : mensagemDeErro(
                resultado,
                "Não foi possível excluir a loja. Ela pode possuir registros que impedem a exclusão.",
              ),
        );
        return;
      }
      aoFechar();
      router.replace("/perfil");
      router.refresh();
    } catch {
      setErroExclusao(
        "Falha de conexão. Não foi possível confirmar a exclusão da loja.",
      );
    } finally {
      ocupadoRef.current = false;
      setOcupado(false);
    }
  }

  return (
    <>
      <DialogoLoja titulo="Editar loja" ocupado={ocupado} aoFechar={fechar}>
        <form onSubmit={salvar}>
          <fieldset disabled={ocupado} className="flex min-w-0 flex-col gap-4">
            <div>
              <label htmlFor="editar-nome-loja" className="sr-only">
                Nome da loja
              </label>
              <input
                id="editar-nome-loja"
                data-foco-inicial
                type="text"
                required
                maxLength={255}
                value={nome}
                onChange={(evento) => setNome(evento.target.value)}
                className="h-[50px] w-full rounded-full bg-white px-6 text-base outline-none focus:ring-2 focus:ring-[#6A38F3]"
              />
            </div>
            <div className="relative">
              <label htmlFor="editar-categoria-loja" className="sr-only">
                Categoria
              </label>
              <select
                id="editar-categoria-loja"
                required
                value={categoriaId}
                disabled={ocupado || carregando || !!erroCategorias}
                onChange={(evento) => setCategoriaId(evento.target.value)}
                aria-describedby={
                  erroCategorias ? "erro-categorias-edicao" : undefined
                }
                className="h-[50px] w-full appearance-none rounded-full bg-white pl-6 pr-14 text-base outline-none focus:ring-2 focus:ring-[#6A38F3] disabled:opacity-60"
              >
                {!categorias.some(
                  (categoria) => String(categoria.id) === categoriaId,
                ) && (
                  <option value={categoriaId}>
                    {carregando
                      ? "Carregando categorias..."
                      : "Selecione uma categoria"}
                  </option>
                )}
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
              <svg
                width="26"
                height="16"
                viewBox="0 0 26 16"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
                className="pointer-events-none absolute right-6 top-[19px]"
              >
                <path d="m1 1 12 9L25 1" />
              </svg>
            </div>
            {erroCategorias && (
              <div
                id="erro-categorias-edicao"
                role="alert"
                className="text-sm text-red-700"
              >
                {erroCategorias}{" "}
                <button
                  type="button"
                  className="cursor-pointer underline"
                  onClick={() => {
                    setCarregando(true);
                    setErroCategorias("");
                    setConsultaCategorias((valor) => valor + 1);
                  }}
                >
                  Tentar novamente
                </button>
              </div>
            )}
            <div className="mt-1 flex flex-col gap-4">
              {TIPOS_IMAGEM.map((tipo) => (
                <CampoArquivo
                  key={tipo}
                  titulo={TITULOS[tipo]}
                  arquivo={arquivos[tipo] ?? null}
                  aceitar={ACEITAR_IMAGEM[tipo]}
                  imagemAtual={loja.imagens[tipo]}
                  salvo={imagensSalvas.includes(tipo)}
                  desabilitado={ocupado}
                  aoSelecionar={(arquivo) => selecionar(tipo, arquivo)}
                  icone={tipo === "banner" ? <IconeBanner /> : <IconeUpload />}
                />
              ))}
            </div>
            <p className="sr-only">
              Foto e banner: PNG, JPG, JPEG ou WebP, até 10 MB. Logo: SVG, PNG,
              JPG, JPEG ou WebP, até 2 MB. As imagens atuais serão mantidas se
              nenhum arquivo novo for selecionado.
            </p>
            {salvos.length > 0 && (
              <p role="status" className="text-sm text-green-800">
                Salvo: {salvos.join(", ")}. As operações confirmadas não serão
                repetidas.
              </p>
            )}
            {erros.length > 0 && (
              <div role="alert" className="text-sm text-red-700">
                {erros.map((erro, indice) => (
                  <p key={indice}>{erro}</p>
                ))}
                <p>
                  Revise as alterações pendentes e clique em Salvar para tentar
                  novamente.
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setErroExclusao("");
                setConfirmacao("excluir");
              }}
              className={`${BOTAO} mt-[22px] h-[50px] w-full bg-[#F12D20] hover:bg-red-700`}
            >
              DELETAR
            </button>
            <button
              type="submit"
              disabled={ocupado || carregando || !!erroCategorias}
              className={`${BOTAO} mx-auto mt-[22px] w-full max-w-[284px] bg-[#6A38F3] text-lg shadow-[0_3px_3px_#0006] hover:bg-[#5522D8]`}
            >
              {ocupado ? "Salvando..." : "Salvar"}
            </button>
          </fieldset>
        </form>
      </DialogoLoja>
      {confirmacao && (
        <DialogoLoja
          compacto
          titulo={
            confirmacao === "excluir"
              ? "Excluir loja?"
              : "Descartar alterações?"
          }
          ocupado={ocupado}
          aoFechar={() => setConfirmacao(null)}
        >
          <p className="mb-6 text-sm leading-relaxed">
            {confirmacao === "excluir"
              ? `A exclusão de “${referencia.nome}” é irreversível e também remove seus produtos, avaliações e comentários vinculados. Confirme somente se deseja apagar esses dados.`
              : "As alterações ainda não salvas serão descartadas. As operações já confirmadas permanecem salvas."}
          </p>
          {erroExclusao && (
            <p role="alert" className="mb-4 text-sm text-red-700">
              {erroExclusao}
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-3">
            <button
              data-foco-inicial
              type="button"
              disabled={ocupado}
              onClick={() => setConfirmacao(null)}
              className="min-h-11 cursor-pointer rounded-full border border-[#6A38F3] px-6 text-[#5522D8] disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={ocupado}
              onClick={confirmacao === "excluir" ? excluir : aoFechar}
              className={`${BOTAO} ${confirmacao === "excluir" ? "bg-[#F12D20] hover:bg-red-700" : "bg-[#6A38F3] hover:bg-[#5522D8]"}`}
            >
              {ocupado
                ? "Excluindo..."
                : confirmacao === "excluir"
                  ? "Excluir definitivamente"
                  : "Descartar"}
            </button>
          </div>
        </DialogoLoja>
      )}
    </>
  );
}
