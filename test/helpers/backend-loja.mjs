import { createServer } from "node:http";

// Somente memória. Nenhuma conexão com NestJS, Prisma ou PostgreSQL.
export async function criarBackendLoja() {
  const categorias = [
    { id: 7, nome: "Beleza" },
    { id: 9, nome: "Alimentos" },
  ];
  const usuario = {
    id: 101,
    nome: "Proprietária de teste",
    foto_perfil_url: null,
  };
  const estado = {
    chamadas: [],
    falharBanner: false,
    falharCategorias: false,
    atraso: 0,
    excluida: false,
    falharExclusao: false,
  };
  const loja = {
    id: 82,
    nome: "Rare Beauty",
    usuario_id: 101,
    categoria_id: 7,
    categoria: categorias[0],
    usuario,
    produtos: [],
    avaliacoes_loja: [],
    media_avaliacoes: null,
    total_avaliacoes: 0,
    foto_perfil_url: "/uploads/foto.png",
    logo_url: "/uploads/logo.png",
    banner_url: "/uploads/banner.png",
  };
  const lojasCriadas = [];
  const server = createServer(async (req, res) => {
    const json = (status, dados) => {
      res.writeHead(status, { "Content-Type": "application/json" });
      res.end(JSON.stringify(dados));
    };
    if (req.url.startsWith("/uploads/")) {
      res.writeHead(200, { "Content-Type": "image/png" });
      res.end(
        Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aGDcAAAAASUVORK5CYII=",
          "base64",
        ),
      );
      return;
    }
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (req.url === "/user/me")
      return token === "dona-fixture"
        ? json(200, usuario)
        : token === "outro-fixture"
          ? json(200, { id: 202, nome: "Outro usuário" })
          : json(401, { message: "Sessão expirada" });
    if (req.url === "/user/101")
      return json(200, {
        ...usuario,
        lojas: [...(estado.excluida ? [] : [loja]), ...lojasCriadas],
      });
    if (req.url === "/categorias")
      return json(
        estado.falharCategorias ? 502 : 200,
        estado.falharCategorias
          ? { message: "Falha simulada de categorias" }
          : categorias,
      );
    if (req.url === "/lojas/82" && req.method === "GET")
      return json(estado.excluida ? 404 : 200, loja);
    if (
      (req.url === "/lojas" || /^\/lojas\/(82|83)(\/|$)/.test(req.url)) &&
      ["PATCH", "POST", "DELETE"].includes(req.method)
    ) {
      let body = "";
      for await (const chunk of req) body += chunk;
      estado.chamadas.push({ method: req.method, url: req.url, body });
      if (!token || token === "expirada-fixture")
        return json(401, { message: "Sessão expirada" });
      if (token !== "dona-fixture")
        return json(403, {
          message: "Apenas o proprietário pode alterar a loja",
        });
      if (estado.atraso)
        await new Promise((resolve) => setTimeout(resolve, estado.atraso));
      if (req.method === "PATCH") {
        const dados = JSON.parse(body);
        Object.assign(loja, dados);
        loja.categoria = categorias.find(({ id }) => id === loja.categoria_id);
        return json(200, { id: loja.id, nome: loja.nome });
      }
      if (req.method === "DELETE") {
        if (estado.falharExclusao)
          return json(409, {
            message: "A loja está bloqueada para exclusão nesta simulação.",
          });
        estado.excluida = true;
        return json(200, { id: 82 });
      }
      if (req.url === "/lojas") {
        const dados = JSON.parse(body);
        const novaLoja = {
          ...loja,
          ...dados,
          id: 83,
          categoria: categorias.find(({ id }) => id === dados.categoria_id),
        };
        lojasCriadas.push(novaLoja);
        return json(201, novaLoja);
      }
      if (req.url.endsWith("/banner") && estado.falharBanner)
        return json(502, { message: "Banner indisponível para teste" });
      return json(200, loja);
    }
    return json(404, { message: "Rota da fixture não encontrada" });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    server,
    url: `http://127.0.0.1:${server.address().port}`,
    estado,
    loja,
  };
}
