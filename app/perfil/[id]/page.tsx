import Link from "next/link";
import { notFound } from "next/navigation";
import EditarPerfil from "@/app/components/perfil/EditarPerfil";
import CadastroLoja from "@/app/components/loja/CadastroLoja";
import {
  buscarPerfil,
  getUsuarioSessao,
  urlImagemSegura,
} from "@/app/lib/backend";

type PerfilPageProps = {
  params: Promise<{ id: string }>;
};

// Perfil público de um usuário (ex.: proprietário de uma loja).
// As opções de edição só são
// renderizadas para o próprio usuário autenticado; o backend continua
// validando a autorização em todas as operações de edição.
export default async function PerfilPage({
  params,
}: PerfilPageProps) {
  const { id } = await params;

  const [consulta, sessao] = await Promise.all([
    buscarPerfil(id),
    getUsuarioSessao(),
  ]);

  if (consulta.status === "nao-encontrado") notFound();

  if (consulta.status === "erro") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f4e8] px-6 text-center">
        <p role="alert" className="text-[#171917]">
          Não foi possível carregar o perfil agora. Tente novamente em instantes.
        </p>
      </main>
    );
  }

  const perfil = consulta.dados;
  const ehDono = sessao?.id === perfil.id;
  const fotoPerfil = urlImagemSegura(perfil.foto_perfil_url);
  const usernamePublico = perfil.username && /^[A-Za-z0-9_.-]+$/.test(perfil.username)
    ? perfil.username : null;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f4e8]">
      <section className="relative h-[200px] bg-black md:h-[280px]">
        <div className="absolute bottom-0 left-6 flex h-28 w-28 translate-y-1/2 items-center justify-center overflow-hidden rounded-full bg-gray-300 md:left-30 md:h-45 md:w-45">
          {fotoPerfil ? (
            <img
              src={fotoPerfil}
              alt={`Foto de ${perfil.nome}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-5xl text-gray-600">
              {perfil.nome.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </section>

      <section className="px-6 pb-10 pt-20 md:px-32 md:pt-28">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 flex-col gap-2">
            <h1 className="break-words text-3xl font-bold text-[#171917] md:text-4xl">
              {perfil.nome}
            </h1>
            {usernamePublico && (
              <p className="text-lg text-gray-600">@{usernamePublico}</p>
            )}

            {ehDono && sessao?.email && (
              <p className="break-all text-lg text-gray-600">{sessao.email}</p>
            )}
          </div>

          {ehDono && sessao && (
            <EditarPerfil
              nome={perfil.nome}
              username={sessao.username ?? ""}
              email={sessao.email ?? ""}
              fotoUrl={fotoPerfil}
            />
          )}
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-[#171917]">Produtos</h2>
          <p className="mt-6 text-gray-600">
            Nenhum produto para exibir.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold text-[#171917]">Lojas</h2>

            {ehDono && (
              <CadastroLoja
                aria-label="Cadastrar loja"
                className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#6A38F3] text-white transition-colors hover:bg-[#5522D8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6A38F3] active:bg-[#481BB8] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 32 32"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M16 4v24M4 16h24" />
                </svg>
              </CadastroLoja>
            )}
          </div>

          {perfil.lojas.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-5 pb-4">
              {perfil.lojas.map((loja) => {
                const imagem =
                  urlImagemSegura(loja.foto_perfil_url) ??
                  urlImagemSegura(loja.logo_url);
                const banner = urlImagemSegura(loja.banner_url);

                return (
                  <Link
                    key={loja.id}
                    href={`/loja/${loja.id}`}
                    className="relative flex h-45 w-full max-w-[550px] items-center gap-5 overflow-hidden rounded-2xl bg-white bg-cover bg-center p-5 shadow-sm transition-opacity hover:opacity-90"
                    style={
                      banner
                        ? { backgroundImage: `url("${banner}")` }
                        : undefined
                    }
                  >
                    {banner && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 bg-black/45"
                      />
                    )}

                    <span className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                      {imagem ? (
                        <img
                          src={imagem}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl text-gray-600">
                          {loja.nome.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </span>

                    <span
                      className={`relative min-w-0 ${
                        banner ? "text-white" : "text-[#171917]"
                      }`}
                    >
                      <span className="block truncate text-2xl font-bold">
                        {loja.nome}
                      </span>
                      <span className="block text-sm">
                        {loja.categoria?.nome ?? "Sem categoria"}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="mt-6 text-gray-600">
              {ehDono
                ? "Você ainda não possui lojas."
                : "Este usuário ainda não possui lojas."}
            </p>
          )}
        </div>

        <section className="mt-16">
          <h2 className="text-2xl font-bold text-[#171917]">Avaliações</h2>
          <p className="mt-6 text-gray-600">
            Nenhuma avaliação para exibir.
          </p>
        </section>
      </section>
    </main>
  );
}
