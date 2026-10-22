"use client";
import { useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";

export default function LoginPage() {
  const[email, setEmail] = useState("");
  const[senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  function exibirSenha(): void{
    setMostrarSenha(!mostrarSenha);
  }
  function enviarLogin(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    console.log(email);
  }
  return (
    
    <main className="min-h-screen bg-[#f7f4e8] grid grid-cols-2 pl-8 pr-15">

      <section className="flex flex-col items-center gap-5 ">
        <Image src="/images/LOGO Stock.io.png" alt="Logotipo da STOCK" width={300} height={100}/>
        <Image src="/images/Stockles - Mascote da Stock.io.png" alt="Logotipo da STOCK" width={300} height={100}  unoptimized className="w-[450px] max-w-full h-auto"/>
      </section>

      <section className="bg-[#171917] p-10 flex flex-col justify-center items-center gap-5" style={{ marginTop: "55px", borderRadius: "24px 24px 0 0" }}>
        <h2 className="text-3xl font-bold text-[#f7f4e8] mb-4">BEM VINDO DE VOLTA!</h2>
          <form className="w-full max-w-sm flex flex-col gap-2" onSubmit={enviarLogin}>
            <label htmlFor="email" className="text-[#f7f4e8] text-sm font-semibold">Email</label>
            <input required id="email" className="bg-[#f7f4e8] text-black w-full px-5 py-3 rounded-full" type="email" placeholder="Digite seu email" value={email} onChange={(e) => setEmail(e.target.value)}/>
            <label htmlFor="password" className="text-[#f7f4e8] text-sm font-semibold mt-4">Senha</label>
              <div className="relative">
                <input required id="password" className="bg-[#f7f4e8] text-black w-full px-5 py-3 rounded-full" type={mostrarSenha ? "text" : "password"} placeholder="Digite sua senha" value={senha} onChange={(e) => setSenha(e.target.value)}/>
                <button type="button" className="absolute right-3 top-3 text-black cursor-pointer" onClick={exibirSenha}>
                  {mostrarSenha ? <Image src="/images/iconamoon_eye-thin.png" alt="Ocultar senha" width={20} height={20}/> : <Image src="/images/iconamoon_eye-thin.png" alt="Mostrar senha" width={20} height={20}/>}
                </button>
              </div>
              <button type="button" className="text-white text-center text-sm hover:underline mt-3 cursor-pointer">Esqueceu sua senha?</button>
            <button type="submit" className="bg-[#7137f5] text-white w-full px-5 py-3 rounded-full cursor-pointer mt-5 font-semibold hover:bg-[#8755ff] transition-colors">ENTRAR</button>
          </form>  
        <p className="mt-5 text-left">Não tem uma conta? <button className="text-[#7137f5] hover:underline cursor-pointer">Cadastre-se</button></p>
      </section>
    </main>
  );
}