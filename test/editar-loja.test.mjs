import assert from "node:assert/strict";
import test from "node:test";
import { carregar } from "./helpers/carregar.mjs";

const resposta = (status, dados = {}) =>
  new Response(JSON.stringify(dados), { status });
const foto = (nome = "foto.png") => new File(["imagem-ficticia"], nome);
const anterior = { nome: "Loja de teste", categoria_id: 7 };
const categorias = [
  { id: 7, nome: "Beleza" },
  { id: 9, nome: "Alimentos" },
];
function edicao(fetch) {
  const imagens = carregar("app/components/loja/enviarImagemLoja.ts", {
    fetch,
  });
  return carregar("app/components/loja/edicaoLoja.ts", {
    fetch,
    imports: { "./enviarImagemLoja": imagens },
  });
}
function rota(fetch, token = "jwt-ficticio") {
  return carregar("app/api/lojas/[id]/route.ts", {
    fetch,
    imports: {
      "@/app/lib/backend": {
        BACKEND_URL: "http://backend-isolado.test",
        getTokenSessao: async () => token,
        idValido: (id) =>
          /^[1-9][0-9]{0,9}$/.test(id) && Number(id) <= 2147483647,
      },
    },
  });
}
const requisicao = (method, body, headers = {}) =>
  new Request("http://frontend.test/api/lojas/82", {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
const contexto = (id = "82") => ({ params: Promise.resolve({ id }) });

for (const method of ["PATCH", "DELETE"]) {
  test(`${method} exige sessão e não chama o backend sem cookie`, async () => {
    const api = rota(() => assert.fail("backend não deve ser chamado"), null);
    assert.equal(
      (
        await api[method](
          requisicao(method, method === "PATCH" ? { nome: "Novo" } : undefined),
          contexto(),
        )
      ).status,
      401,
    );
  });
  test(`${method} recusa ID inválido e requisições de outra origem`, async () => {
    const api = rota(() => assert.fail("backend não deve ser chamado"));
    for (const id of ["0", "-1", "2147483648", "../user"])
      assert.equal(
        (await api[method](requisicao(method), contexto(id))).status,
        400,
      );
    assert.equal(
      (
        await api[method](
          requisicao(method, undefined, { origin: "https://externo.test" }),
          contexto(),
        )
      ).status,
      403,
    );
    assert.equal(
      (
        await api[method](
          requisicao(method, undefined, { "sec-fetch-site": "cross-site" }),
          contexto(),
        )
      ).status,
      403,
    );
  });
  test(`${method} preserva recusas de autorização e erros do NestJS`, async () => {
    for (const status of [400, 401, 403, 404, 409, 500]) {
      const api = rota(async () =>
        resposta(status, { message: "Recusa fictícia" }),
      );
      const result = await api[method](
        requisicao(method, method === "PATCH" ? { nome: "Novo" } : undefined),
        contexto(),
      );
      assert.equal(result.status, status);
      assert.equal((await result.json()).message, "Recusa fictícia");
    }
  });
  test(`${method} envia JWT apenas ao backend e trata indisponibilidade`, async () => {
    let chamada;
    const api = rota(async (...args) => {
      chamada = args;
      return resposta(200, { id: 82, nome: "Novo" });
    });
    const result = await api[method](
      requisicao(method, method === "PATCH" ? { nome: " Novo " } : undefined),
      contexto(),
    );
    assert.equal(chamada[0], "http://backend-isolado.test/lojas/82");
    assert.equal(chamada[1].headers.Authorization, "Bearer jwt-ficticio");
    assert.equal(chamada[1].method, method);
    assert.equal((await result.text()).includes("jwt-ficticio"), false);
    if (method === "PATCH")
      assert.deepEqual(JSON.parse(chamada[1].body), { nome: "Novo" });
    else assert.equal(chamada[1].body, undefined);
    assert.equal(
      (
        await rota(async () => {
          throw Error("offline");
        })[method](
          requisicao(method, method === "PATCH" ? { nome: "Novo" } : undefined),
          contexto(),
        )
      ).status,
      502,
    );
  });
}

for (const body of [
  null,
  [],
  {},
  { nome: "" },
  { nome: "  " },
  { nome: "a".repeat(256) },
  { categoria_id: "7" },
  { categoria_id: 0 },
  { categoria_id: 7.1 },
  { categoria_id: 2147483648 },
  { nome: "Novo", usuario_id: 999 },
  { logo_url: null },
  { descricao: "não editável neste modal" },
]) {
  test(`PATCH recusa corpo inválido: ${JSON.stringify(body).slice(0, 85)}`, async () => {
    const result = await rota(() =>
      assert.fail("backend não deve ser chamado"),
    ).PATCH(requisicao("PATCH", body), contexto());
    assert.equal(result.status, 400);
  });
}
test("PATCH recusa JSON malformado e categoria inexistente antes da escrita", async () => {
  const api = rota(async (url) => {
    assert.equal(url.endsWith("/categorias"), true);
    return resposta(200, categorias);
  });
  assert.equal(
    (
      await api.PATCH(
        new Request("http://frontend.test/api/lojas/82", {
          method: "PATCH",
          body: "{",
        }),
        contexto(),
      )
    ).status,
    400,
  );
  assert.equal(
    (await api.PATCH(requisicao("PATCH", { categoria_id: 444 }), contexto()))
      .status,
    400,
  );
});
test("PATCH valida categoria real e mantém nome e imagens fora da atualização de categoria", async () => {
  const chamadas = [];
  const api = rota(async (url, init) => {
    chamadas.push([url, init]);
    return resposta(200, url.endsWith("/categorias") ? categorias : { id: 82 });
  });
  assert.equal(
    (await api.PATCH(requisicao("PATCH", { categoria_id: 9 }), contexto()))
      .status,
    200,
  );
  assert.deepEqual(JSON.parse(chamadas[1][1].body), { categoria_id: 9 });
});
test("DELETE aceita resposta sem conteúdo", async () => {
  assert.equal(
    (
      await rota(async () => new Response(null, { status: 204 })).DELETE(
        requisicao("DELETE"),
        contexto(),
      )
    ).status,
    204,
  );
});

test("aceita a origem do Host quando o Next usa um endereço interno e recusa origem opaca", async () => {
  const api = rota(async () => resposta(200, { id: 82 }));
  const headers = {
    origin: "https://stockio.example",
    host: "stockio.example",
  };
  assert.equal(
    (
      await api.PATCH(
        requisicao("PATCH", { nome: "Nome válido" }, headers),
        contexto(),
      )
    ).status,
    200,
  );
  assert.equal(
    (
      await api.PATCH(
        requisicao("PATCH", { nome: "Nome válido" }, { origin: "null" }),
        contexto(),
      )
    ).status,
    403,
  );
});

for (const [descricao, dados, arquivos, esperados] of [
  ["somente nome", { ...anterior, nome: "Novo nome" }, {}, ["/api/lojas/82"]],
  [
    "somente categoria",
    { ...anterior, categoria_id: 9 },
    {},
    ["/api/lojas/82"],
  ],
  [
    "nome e categoria",
    { nome: "Novo nome", categoria_id: 9 },
    {},
    ["/api/lojas/82"],
  ],
  [
    "somente foto",
    anterior,
    { "foto-perfil": foto() },
    ["/api/lojas/82/imagens/foto-perfil"],
  ],
  [
    "somente logo SVG",
    anterior,
    { logo: foto("logo.svg") },
    ["/api/lojas/82/imagens/logo"],
  ],
  [
    "somente banner",
    anterior,
    { banner: foto() },
    ["/api/lojas/82/imagens/banner"],
  ],
  [
    "dados e imagens",
    { ...anterior, nome: "Novo nome" },
    { logo: foto("logo.webp"), banner: foto() },
    [
      "/api/lojas/82",
      "/api/lojas/82/imagens/logo",
      "/api/lojas/82/imagens/banner",
    ],
  ],
  ["nenhuma alteração", anterior, {}, []],
]) {
  test(`salvamento: ${descricao}`, async () => {
    const chamadas = [];
    const api = edicao(async (url, init) => {
      chamadas.push([url, init]);
      return resposta(200);
    });
    const result = await api.salvarEdicaoLoja(82, anterior, dados, arquivos);
    assert.deepEqual(
      chamadas.map(([url]) => url),
      esperados,
    );
    assert.equal(result.erros.length, 0);
    for (const [, init] of chamadas) {
      if (init.method === "PATCH") {
        const patch = JSON.parse(init.body);
        assert.equal("usuario_id" in patch, false);
        assert.equal(
          Object.keys(patch).some((key) => key.endsWith("_url")),
          false,
        );
        if (dados.nome === anterior.nome) assert.equal("nome" in patch, false);
        if (dados.categoria_id === anterior.categoria_id)
          assert.equal("categoria_id" in patch, false);
      } else assert.ok(init.body.get("arquivo") instanceof File);
    }
  });
}
test("sucesso parcial permite repetir apenas banner pendente", async () => {
  const chamadas = [];
  let falhar = true;
  const api = edicao(async (url) => {
    chamadas.push(url);
    return resposta(url.endsWith("/banner") && falhar ? 502 : 200);
  });
  const dados = { ...anterior, nome: "Nome já persistido" };
  const arquivos = { logo: foto("logo.png"), banner: foto() };
  const parcial = await api.salvarEdicaoLoja(82, anterior, dados, arquivos);
  assert.equal(parcial.dadosSalvos, true);
  assert.equal(parcial.imagensSalvas.join(","), "logo");
  assert.equal(parcial.erros.length, 1);
  falhar = false;
  const repeticao = await api.salvarEdicaoLoja(82, dados, dados, {
    banner: arquivos.banner,
  });
  assert.equal(repeticao.erros.length, 0);
  assert.deepEqual(chamadas, [
    "/api/lojas/82",
    "/api/lojas/82/imagens/logo",
    "/api/lojas/82/imagens/banner",
    "/api/lojas/82/imagens/banner",
  ]);
});
test("falha textual permite salvar imagens e mantém dados textuais pendentes", async () => {
  const api = edicao(async (url) =>
    resposta(url.endsWith("/logo") ? 200 : 409, {
      message: "Nome já utilizado",
    }),
  );
  const result = await api.salvarEdicaoLoja(
    82,
    anterior,
    { ...anterior, nome: "Duplicado" },
    { logo: foto("logo.png") },
  );
  assert.equal(result.dadosSalvos, false);
  assert.equal(result.imagensSalvas.join(","), "logo");
  assert.equal(result.erros[0], "Nome já utilizado");
});
test("autorização recusada interrompe as operações seguintes; falha de conexão é compreensível", async () => {
  for (const status of [401, 403, 404]) {
    let chamadas = 0;
    const api = edicao(async () => {
      chamadas++;
      return resposta(status);
    });
    const result = await api.salvarEdicaoLoja(
      82,
      anterior,
      { ...anterior, nome: "Novo" },
      { logo: foto("logo.svg") },
    );
    assert.equal(chamadas, 1);
    assert.equal(result.erros.length, 1);
  }
  const result = await edicao(async () => {
    throw Error("offline");
  }).salvarEdicaoLoja(
    82,
    anterior,
    { ...anterior, nome: "Novo" },
    { logo: foto("logo.svg") },
  );
  assert.equal(result.erros.length, 2);
});
test("validação local de nome, categoria e todos os formatos e limites de arquivos", () => {
  const api = edicao();
  assert.ok(api.validarEdicaoLoja({ ...anterior, nome: "  " }, categorias, {}));
  assert.ok(
    api.validarEdicaoLoja(
      { ...anterior, nome: "a".repeat(256) },
      categorias,
      {},
    ),
  );
  assert.ok(
    api.validarEdicaoLoja({ ...anterior, categoria_id: 999 }, categorias, {}),
  );
  assert.equal(api.validarEdicaoLoja(anterior, categorias, {}), null);
  for (const tipo of ["foto-perfil", "logo", "banner"]) {
    for (const ext of [
      "png",
      "jpg",
      "jpeg",
      "webp",
      ...(tipo === "logo" ? ["svg"] : []),
    ])
      assert.equal(
        api.validarEdicaoLoja(anterior, categorias, {
          [tipo]: foto(`imagem.${ext}`),
        }),
        null,
      );
    for (const arquivo of [
      foto("imagem.exe"),
      new File([], "vazio.png"),
      {
        name: "grande.png",
        size: (tipo === "logo" ? 2 : 10) * 1024 * 1024 + 1,
      },
    ])
      assert.ok(
        api.validarEdicaoLoja(anterior, categorias, { [tipo]: arquivo }),
      );
    const limite = {
      name: "limite.PNG",
      size: (tipo === "logo" ? 2 : 10) * 1024 * 1024,
    };
    assert.equal(
      api.validarEdicaoLoja(anterior, categorias, { [tipo]: limite }),
      null,
    );
    if (tipo !== "logo")
      assert.ok(
        api.validarEdicaoLoja(anterior, categorias, {
          [tipo]: foto("imagem.svg"),
        }),
      );
  }
});
