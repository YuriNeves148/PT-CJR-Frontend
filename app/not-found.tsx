import Link from "next/link";

export default function NaoEncontrado() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-black px-6 py-24 text-center text-white">
      <p className="text-7xl font-semibold text-[#C6E700]">404</p>
      <h1 className="text-2xl font-semibold sm:text-3xl">Página não encontrada</h1>
      <p className="max-w-md text-gray-300">
        O endereço que você tentou acessar não existe ou foi removido.
      </p>
      <Link
        href="/"
        className="rounded-full bg-[#6A38F3] px-6 py-3 text-sm font-semibold transition-colors hover:bg-[#5522D8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6A38F3]"
      >
        VOLTAR AO INÍCIO
      </Link>
    </main>
  );
}
