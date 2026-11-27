"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import EditarProdutoModal from "@/app/components/EditarProdutoModal";

type EditarProdutoBotaoProps = {
  produtoId: number;
  lojaId: number;
};

export default function EditarProdutoBotao({ produtoId, lojaId }: EditarProdutoBotaoProps) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Editar produto"
        aria-haspopup="dialog"
        aria-expanded={aberto}
        onClick={() => setAberto(true)}
        className="shrink-0 cursor-pointer rounded-full transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6A38F3]"
      >
        <Image src="/editar_produto.png" alt="" width={44} height={44} className="h-10 w-10 sm:h-11 sm:w-11" />
      </button>

      {aberto && (
        <EditarProdutoModal
          produtoId={produtoId}
          onFechar={() => setAberto(false)}
          onAlterado={() => router.refresh()}
          onDeletado={() => {
            router.push(`/loja/${lojaId}`);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
