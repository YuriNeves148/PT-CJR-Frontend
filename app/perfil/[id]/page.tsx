type PerfilPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PerfilPage({
  params,
}: PerfilPageProps) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-[#F8F5E9]">
      <section className="h-[300px] w-full bg-black" />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-bold text-black">
          Perfil do proprietário
        </h1>

        <p className="mt-3 text-gray-600">
          ID do usuário: {id}
        </p>
      </div>
    </main>
  );
}