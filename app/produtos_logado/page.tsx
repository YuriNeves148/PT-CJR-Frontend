"use client";
import Image from "next/image";
import Link from "next/link";
export default function ProdutosLogado() {
  return (
    <main className="min-h-screen bg-[#f7f4e8]">
      {/* primeira parte */}
      <div className="flex flex-row ml-40 mr-40 mt-20 gap-7 shrink-0">
        <Link href="/">
          <Image
            src="/seta_voltar.png"
            alt="seta"
            width={100}
            height={100}
            className="w-8 h-12 hover:p-1 duration-200"
          />
        </Link>
        {/* imagens do produto */}
        <div className="flex flex-col gap-2 overflow-y-auto h-160 shrink-0">
          <Image
            src="/img_feed/adicione_imagem.png"
            alt=""
            width={173}
            height={173}
            className="rounded-4xl p-1"
          />
          <Image
            src="/img_feed/adicione_imagem.png"
            alt=""
            width={173}
            height={173}
            className="rounded-4xl p-1"
          />

          <Image
            src="/img_feed/adicione_imagem.png"
            alt=""
            width={173}
            height={173}
            className="rounded-4xl p-1"
          />
          <Image
            src="/img_feed/adicione_imagem.png"
            alt=""
            width={173}
            height={173}
            className="rounded-4xl p-1"
          />
        </div>
        {/* imagem maior */}
        <div className=" shrink-0">
          <Image
            src="/img_feed/adicione_imagem.png"
            alt=""
            width={600}
            height={600}
            className="rounded-4xl p-1"
          />{" "}
        </div>
        {/* descricao do produto */}
        <div>
          <div className="flex flex-row gap-5 mb-2">
            <p className="text-black font-bold text-5xl">Brownie Meio Amargo</p>
            <Image
              src="/editar_produto.png"
              alt=""
              width={100}
              height={100}
              className="w-10 h-10"
            />
          </div>
          <div className="flex flex-row text-black shrink-0 text-wrap gap-8 text-xl pb-2">
            <Image
              src="/estrela.png"
              alt=""
              width={100}
              height={100}
              className="w-7 h-7 "
            />
            <p>4.5 | 15 reviews</p>
            <p className="text-purple-800">categoria</p>
            <p className="text-purple-800">X disponiveis</p>
          </div>
          <p className="text-black text-6xl pt-2 pb-8">R$ 4,70</p>
          <section className="text-wrap text-black ">
            <h1 className="text-3xl pb-3 ">Descrição</h1>
            <p className="w-160 text-lg whitespace-pre-line">
              BROWNIE MEIO AMARGO 80g  Recheado com uma ganache de chocolate
              meio amargo bem cremosa, esse brownie conquistou o coração de
              muita gente! Ingredientes Achocolatado em pó, farinha de trigo
              enriquecida com ferro e ácido fólico, chocolate meio amargo,
              açúcar cristal, manteiga, água ,creme de leite, ovo em pó, glucose
              em pó, emulsificante: lecitina de soja, conservantes: sorbato de
              potássio, propionato de cálcio e conservante para doces (sal
              refinado sem iodo, açúcar refinado, conservantes INS 202 e INS 211
              e acidulante INS 330) e antioxidante: sal não iodado, amido de
              milho, antioxidantes INS 321 e INS 319.  CONTÉM GLÚTEN. CONTÉM
              LACTOSE. ALÉRGICOS: CONTÉM OVO E DERIVADOS DE LEITE, TRIGO E
              SOJA. 
            </p>
          </section>
        </div>
      </div>

      {/* segunda parte */}
      <div className="text-black ml-40 mr-40 mb-20">
        <p className="text-3xl pt-10 pb-4">Da mesma loja</p>
        <div className="flex flex-row overflow-x-auto gap-10 ">
          <div className="flex flex-row overflow-x-auto p-2 gap-8 w-500 text-2xl line-clamp-2 ">
            <Link href={"/"} className="bg-white p-2 shadow-lg">
              <Image
                src="/img_feed/adicione_imagem.png"
                alt=""
                width={100}
                height={100}
                className="w-45 h-45 rounded-4xl mb-2 hover:p-1  duration-250"
              />
              <p className="pb-3 w-50 text-wrap">
                akdmf nhhhh jjjj kkkk llll jnk
              </p>
              <p>R$ 4.25</p>
              <p>disponivel</p>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
