"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const rotasLogadas = ["/feed_logado", "/perfil_logado"];
  const isLoggedIn = rotasLogadas.some((rota) => pathname.startsWith(rota));

  // Logout provisório: apenas leva para o feed deslogado
  function fazerLogout() {
    router.push("/feed_deslogado");
  }

  if (pathname === "/login" || pathname === "/cadastro") {
    return null;
  }

  // Estilo compartilhado dos ícones
  const estiloIcone =
    "block h-6 w-6 bg-white transition-colors duration-300 group-hover:bg-[#C6E700]";

  // Aplica os SVGs originais como máscaras
  const estiloMascara = (arquivo: string) => ({
    maskImage: `url('/icones_navbar/${arquivo}')`,
    maskSize: "contain" as const,
    maskRepeat: "no-repeat" as const,
    maskPosition: "center" as const,
  });

  return (
    <header className="flex w-full items-center justify-between bg-black px-6 py-4 text-white md:px-10">
      {/* Logo Stock.io */}
      <Link href="/" aria-label="Página inicial Stock.io">
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
        {/* Sacola - Entrega 3 */}
        <Link
          href="/teste_nav/telas_provisorias"
          aria-label="Sacola"
          className="group block"
        >
          <span
            aria-hidden="true"
            className={estiloIcone}
            style={estiloMascara("bag.svg")}
          />
        </Link>

        {/* Loja - Entrega 3 */}
        <Link
          href="/teste_nav/telas_provisorias"
          aria-label="Loja"
          className="group block"
        >
          <span
            aria-hidden="true"
            className={estiloIcone}
            style={estiloMascara("store.svg")}
          />
        </Link>

        {/* Elementos dependentes da autenticação */}
        {isLoggedIn ? (
          <>
            {/* Perfil */}
            <Link
              href="/perfil"
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
    </header>
  );
}
