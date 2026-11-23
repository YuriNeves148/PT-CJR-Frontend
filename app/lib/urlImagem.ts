// Endereço público do backend, usado nas imagens exibidas pelo navegador.
const BACKEND_PUBLICO = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
).replace(/\/+$/, "");

// O backend pode devolver a imagem como "/uploads/..." (registros antigos) ou
// com a URL completa. Qualquer outro endereço usa a imagem padrão.
export function urlImagem(url: string | null | undefined, padrao: string) {
  if (url?.startsWith("/uploads/")) return `${BACKEND_PUBLICO}${url}`;
  if (url?.startsWith(`${BACKEND_PUBLICO}/uploads/`)) return url;
  return padrao;
}
