import { Outfit } from "next/font/google";

export const outfit = Outfit({ subsets: ["latin"], weight: ["300", "500", "800"] });

export const estiloPagina =
  "flex min-h-screen items-stretch gap-[6vw] bg-[#f4f1e3] px-4 md:h-screen md:overflow-hidden md:px-[6vw]";

export const estiloCartao =
  "mt-[10.7vh] flex-1 rounded-t-[40px] bg-[#202020] px-6 pb-10 pt-14 text-[#f4f1e3] md:max-w-[710px] md:flex-none md:basis-[46.5%] md:rounded-t-[70px] md:px-20 md:pb-[60px] md:pt-[100px]";

export const estiloTitulo =
  "mb-12 text-center text-[clamp(1.8rem,2.6vw,2.6rem)] font-extrabold uppercase leading-[1.1] tracking-[0.01em]";

export const campo =
  "block h-[52px] w-full rounded-full bg-[#f4f1e3] px-9 text-[1.3rem] font-light text-[#202020] " +
  "placeholder:text-[#7a7a72] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#5e3dec]";

export const botaoOlho =
  "absolute right-5 top-1/2 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center " +
  "rounded-full text-[#7a7a72] focus-visible:outline-2 focus-visible:outline-[#5e3dec]";

export const botaoPrincipal =
  "mt-7 h-14 w-full cursor-pointer rounded-full bg-[#5e3dec] text-[1.4rem] font-medium uppercase text-[#f4f1e3] transition enabled:hover:brightness-110 disabled:cursor-default disabled:opacity-60 focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#f4f1e3]";

export const estiloInvalido = "ring-2 ring-[#ff8a8a]";

export const emailValido = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export function MensagemCampo({ id, texto, className = "-mt-2 pl-9" }: { id: string; texto?: string; className?: string }) {
  if (!texto) return null;
  return (
    <p id={id} className={`${className} text-[0.95rem] text-[#ff8a8a]`}>
      {texto}
    </p>
  );
}

export function EyeIcon({ aberto }: { aberto: boolean }) {
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
