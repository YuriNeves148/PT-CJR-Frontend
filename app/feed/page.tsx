import Image from "next/image";
import Link from "next/link";

export default function home() {
  const disponivel = false;

  return (
    <main className="h-135 ">
      <nav className="flex w-screen h-22 bg-[#000000] p-3">
        <Link href="">
          <Image
            src="/img_feed/LOGO Stock.io.png"
            alt="Logotipo da STOCK"
            width={300}
            height={100}

            className="pl-15 p-2 m-1 cursor-pointer opacity-100 hover:opacity-50 transition-opacity duration-200"
          />
        </Link>
        <nav className="ml-auto flex flex-row-reverse gap-x-13 items-center pr-30 bg-[#000000]">
          <Link
            href="/cadastro"
            className="text-2xl bg-[#6A38F3] p-1 pr-8 pl-8 rounded-4xl font-bold hover:bg-white hover:text-[#6A38F3]"
          >
            CADASTRE-SE
          </Link>

          <Link href="/login" className="text-2xl hover:text-[#6A38F3]">
            LOGIN
          </Link>
          <Link href="">
            <Image
              src="/img_feed/loja.png"
              alt="loja"
              width={400}
              height={500}
              className="w-11 h-10 cursor-pointer duration-200 hover:bg-[#6A38F3] rounded-full"
            />
          </Link>
          <Link href="">
            <Image
              src="/img_feed/sacolinha.png"
              alt="carrinho"
              width={40}
              height={50}
              className="w-11 h-10  cursor-pointer hover:bg-[#6A38F3] rounded-full"
            />
          </Link>
        </nav>
      </nav>
      <div className="flex felx-row justify-center bg-[#000000]">
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
              className="w-30 h-30 shrink-0"
            />
            <Image
              src="/img_feed/farmacia.png"
              alt="farmacia"
              width={100}
              height={100}
              className="w-30 h-30 shrink-0"
            />
            <Image
              src="/img_feed/farmacia.png"
              alt="farmacia"
              width={100}
              height={100}
              className="w-30 h-30 shrink-0"
            />
            <Image
              src="/img_feed/beleza.png"
              alt="beleza"
              width={100}
              height={100}
              className="w-30 h-30 shrink-0"
            />
            <Image
              src="/img_feed/moda.png"
              alt="moda"
              width={100}
              height={100}
              className="w-30 h-30 shrink-0"
            />
            <Image
              src="/img_feed/eletronicos.png"
              alt="eletronicos"
              width={100}
              height={100}
              className="w-30 h-30 shrink-0"
            />
            <Image
              src="/img_feed/brinquedos.png"
              alt="brinquedos"
              width={100}
              height={100}
              className="w-30 h-30 rounded-4xl shrink-0"
            />
            <Image
              src="/img_feed/casa.jpg"
              alt="casa"
              width={100}
              height={100}
              className="w-30 h-30 rounded-4xl shrink-0"
            />
          </nav>

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
                  alt="mercado"
                  width={100}
                  height={100}
                  className="w-44 h-44 shrink-0"
                />
                <div className="pt-5 mr-auto">
                  <p className="text-black font-bold text-2xl">titulo</p>
                  <p className="text-black font-bold text-2xl">R$ preço</p>
                  <p
                    className={`font-bold text-2xl ${disponivel ? "text-green-600" : "text-red-600"}`}
                  >
                    {disponivel ? "Disponível" : "Indisponível"}
                  </p>{" "}
                </div>
              </span>
              <span className="bg-[#FFFFFF] p-5 pb-11 shrink-0 rounded-2xl w-60 flex flex-col items-center">
                <Image
                  src="/img_feed/prd_computador.png"
                  alt="mercado"
                  width={100}
                  height={100}
                  className="w-44 h-44 shrink-0"
                />
                <div className="pt-5 mr-auto">
                  <p className="text-black font-bold text-2xl">titulo</p>
                  <p className="text-black font-bold text-2xl">R$ preço</p>
                  <p
                    className={`font-bold text-2xl ${disponivel ? "text-green-600" : "text-red-600"}`}
                  >
                    {disponivel ? "Disponível" : "Indisponível"}
                  </p>{" "}
                </div>
              </span>
              <span className="bg-[#FFFFFF] p-5 pb-11 shrink-0 rounded-2xl w-60 flex flex-col items-center">
                <Image
                  src="/img_feed/prd_caixa.png"
                  alt="mercado"
                  width={100}
                  height={100}
                  className="w-44 h-44 shrink-0"
                />
                <div className="pt-5 mr-auto">
                  <p className="text-black font-bold text-2xl">titulo</p>
                  <p className="text-black font-bold text-2xl">R$ preço</p>
                  <p
                    className={`font-bold text-2xl ${disponivel ? "text-green-600" : "text-red-600"}`}
                  >
                    {disponivel ? "Disponível" : "Indisponível"}
                  </p>{" "}
                </div>
              </span>
              <span className="bg-[#FFFFFF] p-5 pb-11 shrink-0 rounded-2xl w-60 flex flex-col items-center">
                <Image
                  src="/img_feed/prd_relogio.png"
                  alt="mercado"
                  width={100}
                  height={100}
                  className="w-44 h-44 shrink-0"
                />
                <div className="pt-5 mr-auto">
                  <p className="text-black font-bold text-2xl">titulo</p>
                  <p className="text-black font-bold text-2xl">R$ preço</p>
                  <p
                    className={`font-bold text-2xl ${disponivel ? "text-green-600" : "text-red-600"}`}
                  >
                    {disponivel ? "Disponível" : "Indisponível"}
                  </p>{" "}
                </div>
              </span>
              <span className="bg-[#FFFFFF] p-5 pb-11 shrink-0 rounded-2xl w-60 flex flex-col items-center">
                <Image
                  src="/img_feed/prd_caixa.png"
                  alt="mercado"
                  width={100}
                  height={100}
                  className="w-44 h-44 shrink-0"
                />
                <div className="pt-5 mr-auto">
                  <p className="text-black font-bold text-2xl">titulo</p>
                  <p className="text-black font-bold text-2xl">R$ preço</p>
                  <p
                    className={`font-bold text-2xl ${disponivel ? "text-green-600" : "text-red-600"}`}
                  >
                    {disponivel ? "Disponível" : "Indisponível"}
                  </p>
                </div>
              </span>
            </nav>
          </div>

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

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="categoria"
                        value="farmacia"
                      />
                      Farmácia
                    </label>
                  </div>
                </details>
                <span className="ml-10 pr-10 text-blue-600 text-lg hover:text-blue-900">
                  ver mais / menos
                </span>
              </summary>
            </details>

            <nav className="flex flex-nowrap shrink-0 items-center gap-11 overflow-hidden pb-40 pt-10 peer-open:flex-wrap">
              <span className="shrink-0 p-5">
                <Image
                  src="/img_feed/logo_amoca.png"
                  alt="mercado"
                  width={100}
                  height={100}
                  className="w-30 h-30 shrink-0 rounded-full"
                />
                <div className="flex flex-col items-center pt-5">
                  <p className="text-black text-3xl">titulo</p>
                  <p className="text-blue-800 text-xl">categoria</p>
                </div>
              </span>
              <span className="shrink-0 p-5">
                <Image
                  src="/img_feed/logo_cjr.png"
                  alt="mercado"
                  width={100}
                  height={100}
                  className="w-30 h-30 shrink-0 rounded-full"
                />
                <div className="flex flex-col items-center pt-5">
                  <p className="text-black text-3xl">titulo</p>
                  <p className="text-blue-800 text-xl">categoria</p>
                </div>
              </span>
              <span className="shrink-0 p-5">
                <Image
                  src="/img_feed/logo_amoca.png"
                  alt="mercado"
                  width={100}
                  height={100}
                  className="w-30 h-30 shrink-0 rounded-full"
                />
                <div className="flex flex-col items-center pt-5">
                  <p className="text-black text-3xl">titulo</p>
                  <p className="text-blue-800 text-xl">categoria</p>
                </div>
              </span>
              <span className="shrink-0 p-5">
                <Image
                  src="/img_feed/logo_cjr.png"
                  alt="mercado"
                  width={100}
                  height={100}
                  className="w-30 h-30 shrink-0 rounded-full"
                />
                <div className="flex flex-col items-center pt-5">
                  <p className="text-black text-3xl">titulo</p>
                  <p className="text-blue-800 text-xl">categoria</p>
                </div>
              </span>
              <span className="shrink-0 p-5">
                <Image
                  src="/img_feed/logo_amoca.png"
                  alt="mercado"
                  width={100}
                  height={100}
                  className="w-30 h-30 shrink-0 rounded-full"
                />
                <div className="flex flex-col items-center pt-5">
                  <p className="text-black text-3xl">titulo</p>
                  <p className="text-blue-800 text-xl">categoria</p>
                </div>
              </span>
              <span className="shrink-0 p-5">
                <Image
                  src="/img_feed/logo_cjr.png"
                  alt="mercado"
                  width={100}
                  height={100}
                  className="w-30 h-30 shrink-0 rounded-full"
                />
                <div className="flex flex-col items-center pt-5">
                  <p className="text-black text-3xl">titulo</p>
                  <p className="text-blue-800 text-xl">categoria</p>
                </div>
              </span>
              <span className="shrink-0 p-5">
                <Image
                  src="/img_feed/logo_amoca.png"
                  alt="mercado"
                  width={100}
                  height={100}
                  className="w-30 h-30 shrink-0 rounded-full"
                />
                <div className="flex flex-col items-center pt-5">
                  <p className="text-black text-3xl">titulo</p>
                  <p className="text-blue-800 text-xl">categoria</p>
                </div>
              </span>
            </nav>
          </div>
        </div>
      </div>
    </main>
  );
}
