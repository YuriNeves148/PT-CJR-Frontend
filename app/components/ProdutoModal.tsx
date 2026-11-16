"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { getCategorias, type Categoria, type ProdutoFormData } from "@/app/service/produtoService";

// Foto escolhida no computador + endereço temporário para mostrar a prévia
type Foto = { arquivo: File; previa: string };

// 4 espaços de foto: [0] é o grande, [1..3] são os pequenos
export type FotosProduto = (File | null)[];

interface ProdutoModalProps {
  titulo: string; // "Adicionar Produto" ou "Editar Produto"
  textoBotao: string; // "Adicionar" ou "Salvar"
  valoresIniciais?: Partial<ProdutoFormData>; // preenchido só no modo editar
  onSalvar: (dados: ProdutoFormData, fotos: FotosProduto) => Promise<void>;
  onDeletar?: () => Promise<void>; // se for passado, aparece o botão DELETAR
  onFechar: () => void;
}

const ROXO = "#6c3df0";

const formatarPreco = (centavos: string) =>
  centavos
    ? (Number(centavos) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : "";

// Para o formulário começar limpo toda vez, a página deve renderizar o modal
// só quando ele estiver aberto: {aberto && <ProdutoModal ... />}
export default function ProdutoModal({
  titulo,
  textoBotao,
  valoresIniciais,
  onSalvar,
  onDeletar,
  onFechar,
}: ProdutoModalProps) {
  const [nome, setNome] = useState(valoresIniciais?.nome ?? "");
  const [categoriaId, setCategoriaId] = useState(
    valoresIniciais?.categoria_id ? String(valoresIniciais.categoria_id) : ""
  );
  const [descricao, setDescricao] = useState(valoresIniciais?.descricao ?? "");
  // Preço guardado em centavos, só dígitos: "470" -> R$ 4,70
  const [precoCentavos, setPrecoCentavos] = useState(
    valoresIniciais?.preco !== undefined ? String(Math.round(valoresIniciais.preco * 100)) : ""
  );
  const [estoque, setEstoque] = useState(valoresIniciais?.estoque ?? 0);
  const [fotos, setFotos] = useState<(Foto | null)[]>([null, null, null, null]);

  const [subcategorias, setSubcategorias] = useState<Categoria[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  // Carrega as opções do select: as subcategorias (têm categoria mãe) e,
  // se alguma categoria principal ainda não tiver subcategorias, ela mesma
  useEffect(() => {
    getCategorias()
      .then((cats) =>
        setSubcategorias(
          cats.filter(
            (c) => c.categoria_pai_id !== null || !cats.some((filha) => filha.categoria_pai_id === c.id)
          )
        )
      )
      .catch(() => setErro("Não foi possível carregar as subcategorias."));
  }, []);

  // Fecha com Esc e trava a rolagem da página enquanto o modal está aberto
  useEffect(() => {
    const aoApertarTecla = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    document.addEventListener("keydown", aoApertarTecla);
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", aoApertarTecla);
      document.body.style.overflow = overflowAnterior;
    };
  }, [onFechar]);

  // Libera as prévias da memória quando o modal fecha
  const previasRef = useRef<string[]>([]);
  useEffect(() => () => previasRef.current.forEach((url) => URL.revokeObjectURL(url)), []);

  function escolherFoto(indice: number, arquivo: File | undefined) {
    if (!arquivo) return;
    const previa = URL.createObjectURL(arquivo);
    previasRef.current.push(previa);
    setFotos((atuais) => atuais.map((f, i) => (i === indice ? { arquivo, previa } : f)));
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro("");

    if (!nome.trim()) return setErro("Informe o nome do produto.");
    if (!categoriaId) return setErro("Escolha uma subcategoria.");
    if (!precoCentavos) return setErro("Informe o preço do produto.");

    setSalvando(true);
    try {
      await onSalvar(
        {
          nome: nome.trim(),
          categoria_id: Number(categoriaId),
          descricao: descricao.trim() || undefined,
          preco: Number(precoCentavos) / 100,
          estoque,
        },
        fotos.map((f) => f?.arquivo ?? null)
      );
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível salvar o produto.");
    } finally {
      setSalvando(false);
    }
  }

  async function deletar() {
    if (!onDeletar || !confirm("Tem certeza que deseja deletar este produto?")) return;
    setErro("");
    setSalvando(true);
    try {
      await onDeletar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível deletar o produto.");
    } finally {
      setSalvando(false);
    }
  }

  const campoBase =
    "w-full rounded-full bg-white px-5 py-2.5 text-sm outline-none placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-[#6c3df0]";
  const campo = `${campoBase} text-neutral-800`;

  return (
    // Fundo escuro: clicar fora do card fecha o modal
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:items-center"
      onMouseDown={(e) => e.target === e.currentTarget && onFechar()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-produto"
        className="relative w-full max-w-[560px] rounded-3xl bg-[#ececec] px-5 pb-8 pt-7 shadow-xl sm:px-12"
      >
        <button
          type="button"
          onClick={onFechar}
          aria-label="Fechar"
          className="absolute right-5 top-5 rounded-full p-1 text-black hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-[#6c3df0]"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M5 5l14 14M19 5L5 19" />
          </svg>
        </button>

        <h2 id="titulo-modal-produto" className="mb-6 text-center text-3xl font-medium text-black">
          {titulo}
        </h2>

        <form onSubmit={enviar} className="flex flex-col gap-3">
          {/* Fotos: 1 grande + 3 pequenas */}
          <EspacoFoto foto={fotos[0]} onEscolher={(a) => escolherFoto(0, a)} grande />
          <div className="mb-2 grid grid-cols-3 gap-4 sm:gap-9">
            {[1, 2, 3].map((i) => (
              <EspacoFoto key={i} foto={fotos[i]} onEscolher={(a) => escolherFoto(i, a)} />
            ))}
          </div>

          <input
            type="text"
            placeholder="Nome do produto"
            aria-label="Nome do produto"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            maxLength={255}
            className={campo}
          />

          <div className="relative">
            <select
              aria-label="Subcategoria"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className={`${campoBase} cursor-pointer appearance-none pr-12 ${categoriaId ? "text-neutral-800" : "text-neutral-400"}`}
            >
              <option value="" disabled>
                Subcategoria
              </option>
              {subcategorias.map((c) => (
                <option key={c.id} value={c.id} className="text-neutral-800">
                  {c.nome}
                </option>
              ))}
            </select>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500"
            >
              <path d="m4 9 8 6 8-6" />
            </svg>
          </div>

          <textarea
            placeholder="Descrição do produto"
            aria-label="Descrição do produto"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={3}
            className={`${campo} resize-none rounded-3xl text-xs`}
          />

          <input
            type="text"
            inputMode="numeric"
            placeholder="Preço do produto"
            aria-label="Preço do produto"
            value={formatarPreco(precoCentavos)}
            onChange={(e) => setPrecoCentavos(e.target.value.replace(/\D/g, "").replace(/^0+/, "").slice(0, 10))}
            className={campo}
          />

          {onDeletar && (
            <button
              type="button"
              onClick={deletar}
              disabled={salvando}
              className="mt-1 w-full rounded-full bg-[#ff0000] py-2.5 text-sm font-medium text-white hover:bg-[#e00000] disabled:opacity-60"
            >
              DELETAR
            </button>
          )}

          {/* Quantidade em estoque */}
          <div className={`flex items-center justify-center gap-14 ${onDeletar ? "mt-6" : "mt-2"}`}>
            <BotaoContador
              rotulo="Diminuir quantidade"
              onClick={() => setEstoque((q) => Math.max(0, q - 1))}
              disabled={estoque === 0}
              icone="M5 12h14"
            />
            <span aria-live="polite" aria-label="Quantidade em estoque" className="min-w-[2ch] text-center text-4xl" style={{ color: ROXO }}>
              {estoque}
            </span>
            <BotaoContador rotulo="Aumentar quantidade" onClick={() => setEstoque((q) => q + 1)} icone="M5 12h14M12 5v14" />
          </div>

          {erro && (
            <p role="alert" className="text-center text-sm text-[#d6003f]">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={salvando}
            className="mx-auto mt-3 w-full max-w-[200px] rounded-full bg-[#6c3df0] py-2 text-sm text-white shadow-[0_3px_4px_rgba(0,0,0,0.3)] hover:bg-[#5a2fd6] disabled:opacity-60"
          >
            {salvando ? "Salvando..." : textoBotao}
          </button>
        </form>
      </div>
    </div>
  );
}

// Área tracejada que abre o seletor de arquivos e mostra a prévia da foto
function EspacoFoto({
  foto,
  onEscolher,
  grande = false,
}: {
  foto: Foto | null;
  onEscolher: (arquivo: File | undefined) => void;
  grande?: boolean;
}) {
  return (
    <label
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed border-[#6c3df0] focus-within:ring-2 focus-within:ring-[#6c3df0] hover:bg-white/50 ${
        grande ? "h-[100px]" : "h-[82px]"
      }`}
    >
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label={grande ? "Foto principal do produto" : "Foto adicional do produto"}
        onChange={(e) => onEscolher(e.target.files?.[0])}
      />
      {foto ? (
        // A prévia é um endereço "blob:" do navegador, que o <Image /> do Next não aceita
        // eslint-disable-next-line @next/next/no-img-element
        <img src={foto.previa} alt="Prévia da foto do produto" className="h-full w-full object-cover" />
      ) : (
        <>
          <IconeCameraMais />
          {grande && <span className="text-xs text-black">Anexe as fotos do seu produto</span>}
        </>
      )}
    </label>
  );
}

function IconeCameraMais() {
  return (
    <svg aria-hidden="true" viewBox="0 0 40 36" className="h-9 w-10">
      {/* Corpo da câmera */}
      <path
        d="M4 8h7l3-4h10l3 4h5a3 3 0 0 1 3 3v16a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V11a3 3 0 0 1 3-3z"
        fill={ROXO}
      />
      <circle cx="16" cy="18" r="6.5" fill="none" stroke="#fff" strokeWidth="2.5" />
      {/* Bolinha branca com o "+" */}
      <circle cx="31" cy="27" r="7.5" fill="#fff" />
      <path d="M31 23v8M27 27h8" stroke={ROXO} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function BotaoContador({
  rotulo,
  onClick,
  disabled,
  icone,
}: {
  rotulo: string;
  onClick: () => void;
  disabled?: boolean;
  icone: string;
}) {
  return (
    <button
      type="button"
      aria-label={rotulo}
      onClick={onClick}
      disabled={disabled}
      className="flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-[#6c3df0] text-[#6c3df0] hover:bg-[#6c3df0]/10 disabled:opacity-40"
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d={icone} />
      </svg>
    </button>
  );
}
