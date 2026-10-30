import Image from "next/image";
import Link from "next/link";

export default function home() {
  return (
    <main className="h-135 ">
      <nav className="flex w-screen h-22 bg-[#000000] p-3">
        <Image
          src="/img_feed/LOGO Stock.io.png"
          alt="Logotipo da STOCK"
          width={300}
          height={100}

          className="pl-15 p-2"
        />
        <nav className="ml-auto flex flex-row-reverse gap-x-13 items-center pr-30 bg-[#000000]">
          <Link
            href="/cadastro"
            className="text-2xl bg-[#6A38F3] p-1 pr-8 pl-8 rounded-4xl font-bold"
          >
            CADASTRE-SE
          </Link>

          <Link href="/login" className="text-2xl">
            LOGIN
          </Link>
          <Image
            src="/img_feed/loja.png"
            alt="loja"
            width={400}
            height={500}
            className="w-11 h-10"
          />
          <Image
            src="/img_feed/sacolinha.png"
            alt="carrinho"
            width={40}
            height={50}
            className="w-11 h-10"
          />
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
        <div className="w-380 pt-10 justify-self-center">
          <input
            className="flex ml-auto text-base w-200 p-3 rounded-4xl bg-[#FFFFFF] text-black"
            placeholder="Procurar por..."
          ></input>
          <p className="text-black font-semibold text-3xl pt-10">Categorias</p>
          <nav className=" overflow-x-auto flex flex-block flex-row gap-18 pl-25 pr-25 p-5 pt-10">
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

          <div className="flex items-center gap-8">
            <p className="text-black font-semibold text-3xl pt-10">Produtos</p>
            <button className="text-black ml-auto text-blue-600 text-lg self-end pr-10 hover:cursor-pointer hover:text-blue-900">
              ver mais
            </button>
          </div>
          <nav className=" overflow-x-auto flex flex-block flex-row gap-18 pl-25 pr-25 p-5 pt-10">
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
          </nav>
          <div className="flex flex-row">
            <p className="text-black font-semibold text-3xl pt-10">Lojas</p>

            <details className="group relative ml-auto self-end mr-6">
              <summary className="flex w-120 cursor-pointer list-none items-center justify-start gap-2 rounded-2xl bg-white px-6 py-2 text-2xl text-black [&::-webkit-details-marker]:hidden">
                filtros
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={5}
                  className="h-4 w- transition-transform group-open:rotate-180"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </summary>

              <div className="absolute top-full z-20 w-120 rounded-lg border border-gray-300 bg-white p-4 text-xl text-black shadow-lg">
                <label className="flex items-center gap-2 ">
                  <input type="checkbox" name="categoria" value="mercado" />
                  Mercado
                </label>
                <label className="flex items-center gap-2 ">
                  <input type="checkbox" name="categoria" value="mercado" />
                  Farmácia
                </label>
              </div>
            </details>

            <button className="text-black text-blue-600 text-lg self-end pr-10 hover:cursor-pointer hover:text-blue-900">
              ver mais
            </button>
          </div>
          <nav className=" overflow-x-auto flex flex-block flex-row gap-18 pl-25 pr-25 p-5 pt-10">
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
          </nav>
        </div>
      </div>
    </main>
  );
}
