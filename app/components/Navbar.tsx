"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  // Sessão real: consulta /api/me (cookie HTTP-only) a cada navegação
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [saindo, setSaindo] = useState(false);
  const [erroLogout, setErroLogout] = useState("");
  const isLoggedIn = usuarioId !== null;

  useEffect(() => {
    const controlador = new AbortController();

    fetch("/api/me", { cache: "no-store", signal: controlador.signal })
      .then((resposta) => {
        if (resposta.status === 401) return null;
        if (!resposta.ok) throw new Error("Falha ao consultar sessão.");
        return resposta.json();
      })
      .then((usuario: { id?: unknown } | null) => {
        if (!controlador.signal.aborted) {
          setUsuarioId(typeof usuario?.id === "number" ? usuario.id : null);
        }
      })
      .catch(() => undefined);

    return () => controlador.abort();
  }, [pathname]);

  // Encerra a sessão (remove o cookie) e leva para o feed deslogado
  async function fazerLogout() {
    if (saindo) return;
    setSaindo(true);
    setErroLogout("");
    try {
      const resposta = await fetch("/api/logout", { method: "POST" });
      if (!resposta.ok) throw new Error("Falha ao encerrar sessão.");
      // Confirma que o navegador já não envia uma sessão válida.
      const sessao = await fetch("/api/me", { cache: "no-store" });
      if (sessao.status !== 401)
        throw new Error("Não foi possível confirmar o logout.");
      setUsuarioId(null);
      router.push("/feed_deslogado");
      router.refresh();
    } catch {
      setErroLogout("Não foi possível confirmar a saída. Tente novamente.");
    } finally {
      setSaindo(false);
    }
  }

  if (pathname === "/login" || pathname === "/cadastro") {
    return null;
  }

  // Estilo compartilhado dos ícones
  const estiloIcone =
    "block h-6 w-6 bg-white transition-colors duration-300 group-hover:bg-[#C6E700]";
    const estiloIconeAtivo =
    "block h-6 w-6 bg-[#C6E700] transition-colors duration-300";

  // Aplica os SVGs originais como máscaras
  const estiloMascara = (arquivo: string) => ({
    maskImage: `url('/icones_navbar/${arquivo}')`,
    maskSize: "contain" as const,
    maskRepeat: "no-repeat" as const,
    maskPosition: "center" as const,
  });

  return (
    <header className="relative flex w-full items-center justify-between bg-black px-6 py-4 text-white md:px-10">
      {/* Logo Stock.io */}
      <Link href="/feed_logado" aria-label="Página inicial Stock.io">
        <Image
          src="/logo-stockio-branco.png"
          alt="Stock.io"
          width={160}
          height={45}
          className="h-8 w-auto"
          priority
        />
      </Link>

      {/* Navegação principal */}
      <nav
        aria-label="Navegação principal"
        className="flex items-center gap-4 md:gap-8"
      >
        {/* Sacola - catálogo de produtos */}
        <Link href="/catalogo" aria-label="Sacola" className="group block">
          <span
            aria-hidden="true"
            className={estiloIcone}
            style={estiloMascara("bag.svg")}
          />
        </Link>

        {/* Loja - listagem de lojas */}
        <Link href="/lojas" aria-label="Loja" className="group block">
          <span
            aria-hidden="true"
            className={pathname === "/lojas" ? estiloIconeAtivo : estiloIcone}
            style={estiloMascara("store.svg")}
          />
        </Link>

        {/* Elementos dependentes da autenticação */}
        {isLoggedIn ? (
          <>
            {/* Perfil */}
            <Link
              href={`/perfil/${usuarioId}`}
              aria-label="Meu perfil"
              className="group block"
            >
              <span
                aria-hidden="true"
                className={estiloIcone}
                style={estiloMascara("person.svg")}
              />
            </Link>

            {/* Sair da conta */}
            <button
              type="button"
              onClick={fazerLogout}
              disabled={saindo}
              aria-label="Sair da conta"
              className="block h-6 w-6 cursor-pointer bg-white transition-colors duration-300 hover:bg-[#AF052A] focus-visible:bg-[#AF052A]"
              style={estiloMascara("arrow-exit.svg")}
            />
          </>
        ) : (
          <>
            {/* Login */}
            <Link
              href="/login"
              className="text-[11px] font-semibold text-white transition-colors duration-300 hover:text-[#6A38F3]"
            >
              LOGIN
            </Link>

            {/* Cadastro */}
            <Link
              href="/cadastro"
              className="rounded-full bg-[#6A38F3] px-4 py-2 text-[11px] font-semibold text-white transition-colors duration-300 hover:bg-white hover:text-[#6A38F3]"
            >
              CADASTRE-SE
            </Link>
          </>
        )}
      </nav>
      {erroLogout && (
        <p
          role="alert"
          className="absolute right-6 top-full z-50 max-w-xs rounded-lg bg-black p-3 text-sm text-white shadow-lg"
        >
          {erroLogout}
        </p>
      )}
    </header>
  );
}
