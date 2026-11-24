"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import EditarProdutoModal from "@/app/components/EditarProdutoModal";

// Lápis do produto: só é renderizado para o dono da loja.
export default function EditarProduto({ produtoId }: { produtoId: number }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        aria-label="Editar produto"
        className="h-10 w-10 shrink-0 cursor-pointer duration-200 hover:opacity-70"
      >
        <Image src="/editar_produto.png" alt="" width={40} height={40} className="h-10 w-10" />
      </button>

      {aberto && (
        <EditarProdutoModal
          produtoId={produtoId}
          onFechar={() => setAberto(false)}
          onAlterado={() => router.refresh()}
          onDeletado={() => router.replace("/feed_logado")}
        />
      )}
    </>
  );
}
