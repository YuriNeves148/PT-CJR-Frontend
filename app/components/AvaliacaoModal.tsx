"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import type { AvaliacaoFormData } from "@/app/service/avaliacaoLojaService";

interface AvaliacaoModalProps {
  lojaNome: string; // aparece em "Você está avaliando <loja>"
  textoBotao: string; // "Avaliar" ou "Salvar"
  valoresIniciais?: Partial<AvaliacaoFormData>; // preenchido só no modo editar
  onSalvar: (dados: AvaliacaoFormData) => Promise<void>;
  onDeletar?: () => Promise<void>; // se for passado, aparece o botão DELETAR
  onFechar: () => void;
}

const ROXO = "#6c3df0";
const NOTAS = [1, 2, 3, 4, 5];

// Visual dos modais "Fazer uma avaliação" e "Editar uma avaliação" do Figma.
// Para o formulário começar limpo toda vez, a página deve renderizar o modal
// só quando ele estiver aberto: {aberto && <AdicionarAvaliacaoModal ... />}
export default function AvaliacaoModal({
  lojaNome,
  textoBotao,
  valoresIniciais,
  onSalvar,
  onDeletar,
  onFechar,
}: AvaliacaoModalProps) {
  const [nota, setNota] = useState(valoresIniciais?.nota ?? 0); // 0 = nenhuma estrela escolhida
  const [notaEmFoco, setNotaEmFoco] = useState(0); // estrela com o mouse em cima (só visual)
  const [comentario, setComentario] = useState(valoresIniciais?.comentario ?? "");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro("");

    if (nota < 1) return setErro("Escolha de 1 a 5 estrelas.");

    setSalvando(true);
    try {
      // Vazio vira null: assim, no editar, apagar o texto apaga o comentário no banco
      await onSalvar({ nota, comentario: comentario.trim() || null });
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível salvar a avaliação.");
    } finally {
      setSalvando(false);
    }
  }

  async function deletar() {
    if (!onDeletar || !confirm("Tem certeza que deseja deletar esta avaliação?")) return;
    setErro("");
    setSalvando(true);
    try {
      await onDeletar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível deletar a avaliação.");
    } finally {
      setSalvando(false);
    }
  }

  const notaExibida = notaEmFoco || nota;
  const botao =
    "w-full max-w-[280px] rounded-full py-2 text-sm text-white shadow-[0_3px_4px_rgba(0,0,0,0.3)] disabled:opacity-60";

  return (
    <FundoModal onFechar={onFechar}>
      <h2 id="titulo-modal-avaliacao" className="pr-8 text-2xl font-light text-black sm:text-[28px]">
        Você está avaliando <span className="font-semibold">{lojaNome}</span>
      </h2>

      <form onSubmit={enviar} className="mt-7 flex flex-col">
        {/* Estrelas: são radios escondidos, então funcionam com Tab + setas do teclado */}
        <fieldset
          className="flex justify-center gap-2 sm:gap-4"
          onMouseLeave={() => setNotaEmFoco(0)}
        >
          <legend className="sr-only">Nota da loja, de 1 a 5 estrelas</legend>
          {NOTAS.map((valor) => (
            <label
              key={valor}
              className="cursor-pointer rounded-lg p-0.5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#6c3df0]"
              onMouseEnter={() => setNotaEmFoco(valor)}
            >
              <input
                type="radio"
                name="nota"
                value={valor}
                checked={nota === valor}
                onChange={() => setNota(valor)}
                className="sr-only"
                aria-label={`${valor} ${valor === 1 ? "estrela" : "estrelas"}`}
              />
              <Estrela cheia={valor <= notaExibida} />
            </label>
          ))}
        </fieldset>

        <textarea
          placeholder="Avaliação da loja"
          aria-label="Avaliação da loja"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          maxLength={2000}
          className="mt-6 h-52 w-full resize-none rounded-2xl bg-white px-6 py-5 text-sm text-neutral-800 outline-none placeholder:text-xs placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-[#6c3df0] sm:h-64"
        />

        {erro && (
          <p role="alert" className="mt-4 text-center text-sm text-[#d6003f]">
            {erro}
          </p>
        )}

        <div className={`mt-8 flex flex-col items-center ${onDeletar ? "gap-8" : ""}`}>
          {onDeletar && (
            <button
              type="button"
              onClick={deletar}
              disabled={salvando}
              className={`${botao} bg-[#ff0000] hover:bg-[#e00000]`}
            >
              DELETAR
            </button>
          )}
          <button type="submit" disabled={salvando} className={`${botao} bg-[#6c3df0] hover:bg-[#5a2fd6]`}>
            {salvando ? "Salvando..." : textoBotao}
          </button>
        </div>
      </form>
    </FundoModal>
  );
}

// Fundo escuro + cartão cinza com o X. Também usado enquanto os dados carregam.
export function FundoModal({ onFechar, children }: { onFechar: () => void; children: ReactNode }) {
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

  return (
    // Clicar fora do cartão fecha o modal
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:items-center"
      onMouseDown={(e) => e.target === e.currentTarget && onFechar()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-avaliacao"
        className="relative w-full max-w-[600px] rounded-3xl bg-[#ececec] px-5 pb-9 pt-10 shadow-xl sm:px-12"
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
        {children}
      </div>
    </div>
  );
}

// Mostrado no lugar do formulário enquanto os dados carregam (ou se der erro ao carregar)
export function AvisoCarregando({ erro, texto, onFechar }: { erro: string; texto: string; onFechar: () => void }) {
  return (
    <FundoModal onFechar={onFechar}>
      <p id="titulo-modal-avaliacao" role={erro ? "alert" : "status"} className={`py-6 text-center ${erro ? "text-[#d6003f]" : "text-[#6c3df0]"}`}>
        {erro || texto}
      </p>
    </FundoModal>
  );
}

function Estrela({ cheia }: { cheia: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-11 w-11 transition-colors sm:h-14 sm:w-14"
      fill={cheia ? ROXO : "none"}
      stroke={ROXO}
      strokeWidth="0.8"
      strokeLinejoin="round"
    >
      <path d="M12 2.5l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.7l7.1-.6z" />
    </svg>
  );
}
