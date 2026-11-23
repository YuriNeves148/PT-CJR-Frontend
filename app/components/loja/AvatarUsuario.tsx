type AvatarUsuarioProps = {
  nome: string;
  fotoUrl?: string | null;
  tamanho?: string;
};

export default function AvatarUsuario({
  nome,
  fotoUrl,
  tamanho = "h-10 w-10",
}: AvatarUsuarioProps) {
  return (
    <div
      className={`flex ${tamanho} shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-300 text-gray-700`}
    >
      {fotoUrl ? (
        <img
          src={fotoUrl}
          alt={`Foto de ${nome}`}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{nome.charAt(0)}</span>
      )}
    </div>
  );
}