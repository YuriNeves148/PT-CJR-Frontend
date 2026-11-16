import CadastroLoja from "@/app/components/loja/CadastroLoja";

// Página de teste do cadastro de lojas (mesmo fluxo usado no perfil).
export default function TesteModalLojaPage() {
  return (
    <main className="min-h-screen bg-[#F8F5E9] px-6 py-16 text-black">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-3xl font-bold">
          Cadastro de Loja
        </h1>

        <p className="mb-6 text-gray-700">
          Cadastre uma loja com nome, categoria, foto de perfil, logo (SVG)
          e banner. É necessário estar logado.
        </p>

        <CadastroLoja />
      </div>
    </main>
  );
}
