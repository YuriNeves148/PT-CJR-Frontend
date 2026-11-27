"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErroInesperado({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-black px-6 py-24 text-center text-white">
      <h1 className="text-2xl font-semibold sm:text-3xl">Algo deu errado</h1>
      <p role="alert" className="max-w-md text-gray-300">
        Não foi possível carregar esta página agora. Tente novamente em instantes.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="cursor-pointer rounded-full bg-[#6A38F3] px-6 py-3 text-sm font-semibold transition-colors hover:bg-[#5522D8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6A38F3]"
        >
          TENTAR NOVAMENTE
        </button>
        <Link
          href="/"
          className="rounded-full border border-white px-6 py-3 text-sm font-semibold transition-colors hover:bg-white hover:text-black"
        >
          IR PARA O INÍCIO
        </Link>
      </div>
    </main>
  );
}
