"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdicionarProdutoModal from "@/app/components/AdicionarProdutoModal";

export default function AdicionarProdutoBotao({ lojaId }: { lojaId: number }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={aberto}
        onClick={() => setAberto(true)}
        className="flex cursor-pointer items-center gap-2 rounded-full bg-[#6A38F3] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#5522D8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6A38F3] active:bg-[#481BB8]"
      >
        <svg width="14" height="14" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
          <path d="M16 4v24M4 16h24" />
        </svg>
        ADICIONAR PRODUTO
      </button>

      {aberto && (
        <AdicionarProdutoModal
          lojaId={lojaId}
          onFechar={() => setAberto(false)}
          onCriado={() => router.refresh()}
        />
      )}
    </>
  );
}
