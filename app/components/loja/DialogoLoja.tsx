"use client";

import {
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  type ReactNode,
} from "react";

let dialogosAbertos = 0;
let overflowAnterior = "";

export default function DialogoLoja({
  titulo,
  ocupado = false,
  aoFechar,
  children,
  compacto = false,
}: {
  titulo: string;
  ocupado?: boolean;
  aoFechar: () => void;
  children: ReactNode;
  compacto?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const tituloId = useId();
  const pressionarTecla = useEffectEvent((evento: KeyboardEvent) => {
    const abertos = document.querySelectorAll("dialog[open]");
    if (
      evento.key !== "Escape" ||
      abertos.item(abertos.length - 1) !== ref.current
    )
      return;
    evento.preventDefault();
    if (!ocupado) aoFechar();
  });

  useEffect(() => {
    const dialogo = ref.current!;
    const focoAnterior =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    if (dialogosAbertos === 0) overflowAnterior = document.body.style.overflow;
    dialogosAbertos += 1;
    document.body.style.overflow = "hidden";
    dialogo.showModal();
    dialogo.querySelector<HTMLElement>("[data-foco-inicial]")?.focus();
    document.addEventListener("keydown", pressionarTecla, true);
    return () => {
      document.removeEventListener("keydown", pressionarTecla, true);
      dialogo.close();
      dialogosAbertos -= 1;
      if (dialogosAbertos === 0)
        document.body.style.overflow = overflowAnterior;
      queueMicrotask(() => {
        if (focoAnterior?.isConnected) focoAnterior.focus();
      });
    };
  }, []);

  return (
    <dialog
      ref={ref}
      closedby="none"
      role="dialog"
      aria-modal="true"
      aria-labelledby={tituloId}
      aria-busy={ocupado}
      onCancel={(evento) => {
        evento.preventDefault();
        if (!ocupado) aoFechar();
      }}
      onClick={(evento) => {
        if (evento.target !== evento.currentTarget || ocupado) return;
        const rect = evento.currentTarget.getBoundingClientRect();
        if (
          evento.clientX < rect.left ||
          evento.clientX > rect.right ||
          evento.clientY < rect.top ||
          evento.clientY > rect.bottom
        )
          aoFechar();
      }}
      className={`fixed inset-0 m-auto max-h-[calc(100dvh-24px)] w-[calc(100%-24px)] overflow-y-auto rounded-[24px] border-0 bg-[#EEEEEE] px-5 pb-10 pt-7 text-black shadow-2xl backdrop:bg-black/65 sm:max-h-[calc(100dvh-48px)] sm:w-[calc(100%-48px)] ${compacto ? "max-w-[480px] sm:px-8" : "max-w-[774px] sm:px-[72px]"}`}
    >
      <button
        type="button"
        aria-label={`Fechar ${titulo.toLowerCase()}`}
        disabled={ocupado}
        onClick={aoFechar}
        className="absolute right-4 top-3 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full hover:text-[#6A38F3] focus-visible:outline-2 focus-visible:outline-[#6A38F3] disabled:cursor-wait disabled:opacity-50 sm:right-4 sm:top-3"
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden="true"
        >
          <path d="m4 4 24 24M28 4 4 28" />
        </svg>
      </button>
      <h2
        id={tituloId}
        className={`mb-5 px-8 text-center font-normal ${compacto ? "text-2xl" : "text-3xl sm:text-4xl"}`}
      >
        {titulo}
      </h2>
      {children}
    </dialog>
  );
}
