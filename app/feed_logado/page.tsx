"use client";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const disponivel = false;

  return (
    <main className="w-full overflow-x-hidden">
      <div className="flex flex-row justify-center bg-[#000000]">
        <div className="flex flex-col mt-27">
          <p className="text-7xl font-semibold">Do CAOS à organização,</p>
          <p className="text-6xl  font-semibold flex ml-auto">
            em alguns cliques
          </p>
        </div>
        <Image
          src="/img_feed/moca_em_pe.png"
          alt="moça em pé"
          width={100000}
          height={10000}
          className="w-130 h-170"
        />
      </div>

      {/* INFO.DE CATEGORIAS */}
      <div className="bg-[#F6F3E4] relative z-10 h-auto w-screen -mt-67">
        <div className=" w-330 pt-10 justify-self-center ">
          <input
            className="flex ml-auto text-base w-200 p-3 rounded-4xl bg-[#FFFFFF] text-black"
            placeholder="Procurar por..."
          ></input>
          <p className="text-black font-semibold text-3xl pt-10">Categorias</p>
          <nav className=" overflow-hidden flex flex-block flex-row gap-15 pb-5 pt-10">
            <Image
              src="/img_feed/mercado.png"
              alt="mercado"
              width={100}
              height={100}
              className="w-30 h-30 shrink-0 object-cover"
            />
          </nav>

          {/* INFO. DE PRODUTOS */}
          <div>
            <details className="peer">
              <summary className="flex cursor-pointer list-none items-end [&::-webkit-details-marker]:hidden">
                <span className="text-black font-semibold text-3xl pt-10">
                  Produtos
                </span>
                <span className="ml-auto pr-10 text-blue-600 text-lg hover:text-blue-900">
                  ver mais / menos
                </span>
              </summary>
            </details>
            <nav className="flex flex-nowrap gap-10 overflow-hidden pb-5 pt-10 peer-open:flex-wrap">
              <span className="bg-[#FFFFFF] p-5 pb-11 shrink-0 rounded-2xl w-65 flex flex-col items-center">
                <Image
                  src="/img_feed/prd_relogio.png"
                  alt="relógio"
                  width={100}
                  height={100}
                  className="w-30 h-30 shrink-0 object-cover"
                />
                <div className="pt-5 mr-auto">
                  <p className="line-clamp-2 break-words text-black font-bold text-2xl">
                    titulo
                  </p>
                  <p className="text-black font-bold text-2xl">R$ preço</p>
                  <p
                    className={`font-bold text-2xl ${disponivel ? "text-green-600" : "text-red-600"}`}
                  >
                    {disponivel ? "Disponível" : "Indisponível"}
                    {/* está sendo pego da variavel global */}
                  </p>{" "}
                </div>
              </span>
            </nav>
          </div>

          {/* INFO. DE LOJAS */}
          <div className="relative">
            <details className="peer ">
              <summary className="flex cursor-pointer  list-none items-end [&::-webkit-details-marker]:hidden">
                <span className="text-black font-semibold text-3xl pt-10">
                  Lojas
                </span>
                <details className="group relative  mt-4 w-fit ml-auto ">
                  <summary className="flex w-120 cursor-pointer list-none items-center gap-2 rounded-2xl bg-white pl-6 py-2 text-2xl text-black [&::-webkit-details-marker]:hidden hover:bg-gray-100">
                    filtros
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={5}
                      className="h-4 w-4 transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </summary>

                  <div className="absolute top-full z-20 w-120 rounded-lg border border-gray-300 bg-white p-4 text-xl text-black shadow-lg">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="categoria" value="mercado" />
                      Mercado
                    </label>
                  </div>
                </details>
                <span className="ml-10 pr-10 text-blue-600 text-lg hover:text-blue-900">
                  ver mais / menos
                </span>
              </summary>
            </details>

            <nav className="flex flex-nowrap shrink-0 items-center gap-11 overflow-hidden pb-40 pt-10 peer-open:flex-wrap">
              <span className="shrink-0 p-5 max-w-48 flex flex-col items-center">
                <Image
                  src="/img_feed/logo_amoca.png"
                  alt="loja amoca"
                  width={100}
                  height={100}
                  className="w-30 h-30 shrink-0 rounded-full object-cover"
                />
                <div className="flex flex-col items-center pt-5">
                  <p className="text-black text-3xl text-center line-clamp-2 break-words">
                    titulo
                  </p>
                  <p className="text-blue-800 text-xl text-center truncate max-w-full">
                    categoria
                  </p>
                </div>
              </span>
            </nav>
          </div>
        </div>
      </div>
    </main>
  );
}
