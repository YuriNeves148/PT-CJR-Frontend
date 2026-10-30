import Link from "next/link";

// Navbar provisória: substituir este arquivo pela navbar final quando ela estiver pronta.
// As páginas importam daqui, então basta trocar o conteúdo mantendo o export default.
export default function Navbar() {
  return (
    <header className="flex items-center justify-between bg-black px-6 py-5 text-white md:px-[7vw]">
      <Link href="/">
        <img src="/logo-stockio-branco.png" alt="Stock.io" className="h-10 w-auto" />
      </Link>
      <nav className="flex items-center gap-8">
        <Link href="/login" className="text-[11px] font-semibold text-white">
          LOGIN
        </Link>
        <Link
          href="/cadastro"
          className="rounded-full bg-[#6c3df0] px-12 py-1 text-[11px] font-semibold text-white"
        >
          CADASTRE-SE
        </Link>
      </nav>
    </header>
  );
}
