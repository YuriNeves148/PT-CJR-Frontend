import assert from "node:assert/strict";
import test from "node:test";
import { carregar } from "./helpers/carregar.mjs";

const BACKEND = "http://backend-isolado.test";
const json = (status, dados = {}) => new Response(JSON.stringify(dados), { status });
const redirecionar = {
  redirect: (location) => {
    throw Object.assign(Error("redirect"), { location });
  },
};
const idValido = (id) => /^[1-9][0-9]{0,9}$/.test(id) && Number(id) <= 2147483647;

for (const [sessao, destino] of [
  [null, "/feed_deslogado"],
  [{ id: 5 }, "/feed_logado"],
]) {
  test(`página inicial leva ${sessao ? "usuário logado" : "visitante"} para ${destino}`, async () => {
    const pagina = carregar("app/page.tsx", {
      imports: {
        "next/navigation": redirecionar,
        "@/app/lib/backend": { getUsuarioSessao: async () => sessao },
      },
    }).default;
    await assert.rejects(pagina(), (e) => e.location === destino);
  });
}

for (const [query, destino] of [
  [{ id: "12" }, "/produto/12"],
  [{}, "/catalogo"],
  [{ id: "0" }, "/catalogo"],
  [{ id: "//externo.example" }, "/catalogo"],
  [{ id: ["1", "2"] }, "/catalogo"],
]) {
  test(`/produtos_logado com ${JSON.stringify(query)} redireciona para ${destino}`, async () => {
    const pagina = carregar("app/produtos_logado/page.tsx", {
      imports: { "next/navigation": redirecionar, "@/app/lib/backend": { idValido } },
    }).default;
    await assert.rejects(pagina({ searchParams: Promise.resolve(query) }), (e) => e.location === destino);
  });
}

function trocarSenha(fetch) {
  return carregar("app/api/trocar-senha/route.ts", {
    fetch,
    imports: { "@/app/lib/backend": { BACKEND_URL: BACKEND } },
  }).POST;
}
const pedidoTroca = (corpo) =>
  new Request("http://frontend.test/api/trocar-senha", { method: "POST", body: JSON.stringify(corpo) });

test("troca de senha envia só os campos esperados ao backend", async () => {
  let chamada;
  const resposta = await trocarSenha(async (...args) => {
    chamada = args;
    return json(200, { mensagem: "Senha alterada com sucesso." });
  })(pedidoTroca({ email: "a@b.test", senha_atual: "antiga1", nova_senha: "novinha1", id: 9 }));

  assert.equal(resposta.status, 200);
  assert.equal(chamada[0], `${BACKEND}/trocar-senha`);
  assert.deepEqual(JSON.parse(chamada[1].body), { email: "a@b.test", senha_atual: "antiga1", nova_senha: "novinha1" });
  assert.equal((await resposta.json()).mensagem, "Senha alterada com sucesso.");
});

test("troca de senha repassa erros do backend e indisponibilidade", async () => {
  for (const [status, message] of [[401, "E-mail ou senha atual incorretos."], [400, ["A nova senha deve ter no mínimo 6 caracteres."]]]) {
    const resposta = await trocarSenha(async () => json(status, { message }))(pedidoTroca({}));
    assert.equal(resposta.status, status);
    assert.equal((await resposta.json()).mensagem, [message].flat().join(" "));
  }
  const offline = await trocarSenha(async () => {
    throw Error("offline");
  })(pedidoTroca({}));
  assert.equal(offline.status, 502);
});

function excluirConta(fetch, token = "jwt-ficticio") {
  return carregar("app/api/perfil/route.ts", {
    fetch,
    imports: { "@/app/lib/backend": { BACKEND_URL: BACKEND, getTokenSessao: async () => token } },
  }).DELETE;
}

test("excluir conta exige sessão e não chama o backend sem cookie", async () => {
  const resposta = await excluirConta(() => {
    throw Error("Não deve ser chamado");
  }, null)();
  assert.equal(resposta.status, 401);
});

test("excluir conta usa o id da sessão e apaga o cookie", async () => {
  const chamadas = [];
  const resposta = await excluirConta(async (url, opcoes) => {
    chamadas.push([url, opcoes]);
    return json(200, { id: 42 });
  })();

  assert.equal(resposta.status, 200);
  assert.equal(chamadas[1][0], `${BACKEND}/user/42`);
  assert.equal(chamadas[1][1].method, "DELETE");
  assert.equal(chamadas[1][1].headers.Authorization, "Bearer jwt-ficticio");
  assert.match(resposta.headers.get("set-cookie"), /session=;.*Max-Age=0/i);
});

test("excluir conta preserva a recusa do backend e mantém o cookie", async () => {
  const resposta = await excluirConta(async (url) =>
    url.endsWith("/user/me") ? json(200, { id: 42 }) : json(403, { message: "Sem permissão." })
  )();
  assert.equal(resposta.status, 403);
  assert.equal((await resposta.json()).message, "Sem permissão.");
  assert.equal(resposta.headers.get("set-cookie"), null);
});

test("rotas de avaliação de produto repassam método e caminho ao backend", async () => {
  const chamadas = [];
  const repassarParaBackend = async (_request, caminho, metodo) => {
    chamadas.push([caminho, metodo]);
    return json(200);
  };
  const imports = { "../_lib/backend": { repassarParaBackend }, "../../_lib/backend": { repassarParaBackend } };
  const colecao = carregar("app/api/avaliacoes-produtos/route.ts", { imports });
  const item = carregar("app/api/avaliacoes-produtos/[id]/route.ts", { imports });
  const contexto = { params: Promise.resolve({ id: "7" }) };

  await colecao.POST({});
  await item.PATCH({}, contexto);
  await item.DELETE({}, contexto);

  assert.deepEqual(chamadas, [
    ["/avaliacoes-produtos", "POST"],
    ["/avaliacoes-produtos/7", "PATCH"],
    ["/avaliacoes-produtos/7", "DELETE"],
  ]);
});

test("comentários de avaliação de produto usam o filtro avaliacao_produto_id", async () => {
  const urls = [];
  const comentarios = carregar("app/lib/comentarios.ts", {
    fetch: async (url) => {
      urls.push(url);
      return json(200, []);
    },
    imports: { "@/app/lib/backend": { BACKEND_URL: BACKEND, idValido } },
  });

  await comentarios.buscarComentarios("3");
  await comentarios.buscarComentarios("3", "produto");
  await comentarios.buscarAvaliacaoProduto("8");
  assert.deepEqual(urls, [
    `${BACKEND}/comentarios?avaliacao_loja_id=3`,
    `${BACKEND}/comentarios?avaliacao_produto_id=3`,
    `${BACKEND}/avaliacoes-produtos/8`,
  ]);
  assert.equal((await comentarios.buscarAvaliacaoProduto("abc")).status, "nao-encontrado");
});

test("feed e página de produto consultam apenas rotas públicas", async () => {
  const urls = [];
  const api = carregar("app/lib/backend.ts", {
    env: { BACKEND_URL: BACKEND },
    fetch: async (url, opcoes) => {
      urls.push(url);
      assert.equal(opcoes?.headers, undefined);
      return url.includes("/produtos/404") ? json(404) : json(200, []);
    },
    imports: { "next/headers": { cookies: async () => ({ get: () => undefined }) } },
  });

  const [categorias, lojas, produtos] = await api.buscarDadosFeed();
  assert.deepEqual([categorias.status, lojas.status, produtos.status], ["ok", "ok", "ok"]);
  await api.buscarAvaliacoesProduto(5);
  assert.equal((await api.buscarProduto("404")).status, "nao-encontrado");
  assert.equal((await api.buscarProduto("x")).status, "nao-encontrado");

  assert.deepEqual(urls, [
    `${BACKEND}/categorias`,
    `${BACKEND}/lojas`,
    `${BACKEND}/produtos`,
    `${BACKEND}/avaliacoes-produtos?produto_id=5`,
    `${BACKEND}/produtos/404`,
  ]);
});

test("validação de e-mail usada no cadastro e no login", () => {
  const { emailValido } = carregar("app/components/auth/elementosAuth.tsx", {
    imports: { "next/font/google": { Outfit: () => ({ className: "outfit" }) }, "react/jsx-runtime": { jsx: () => null, jsxs: () => null } },
  });
  for (const email of ["ana@stockio.test", " bruno.lima@exemplo.com.br "]) assert.equal(emailValido(email), true);
  for (const email of ["", "ana", "ana@", "ana@stockio", "a na@stockio.test"]) assert.equal(emailValido(email), false);
});

test("perfil junta avaliações de lojas e produtos do usuário, das mais recentes para as mais antigas", async () => {
  const respostas = {
    "/avaliacoes-loja?usuario_id=7": [{ id: 1, loja_id: 3, nota: 4, comentario: "Boa", createdAt: "2026-11-01T10:00:00Z" }],
    "/avaliacoes-produtos?usuario_id=7": [{ id: 9, produto_id: 5, nota: 0, comentario: null, createdAt: "2026-11-02T10:00:00Z" }],
    "/lojas": [{ id: 3, nome: "Ana Modas" }],
    "/produtos": [{ id: 5, nome: "Vestido" }],
  };
  const api = carregar("app/lib/backend.ts", {
    env: { BACKEND_URL: BACKEND },
    fetch: async (url) => json(200, respostas[url.replace(BACKEND, "")]),
    imports: { "next/headers": { cookies: async () => ({ get: () => undefined }) } },
  });

  const resultado = await api.buscarAvaliacoesDoUsuario(7);
  assert.equal(resultado.status, "ok");
  assert.deepEqual(
    JSON.parse(JSON.stringify(resultado.dados.map(({ tipo, alvo, href, nota }) => ({ tipo, alvo, href, nota })))),
    [
      { tipo: "produto", alvo: "Vestido", href: "/produto/5/avaliacoes/9", nota: 0 },
      { tipo: "loja", alvo: "Ana Modas", href: "/loja/3/avaliacoes/1", nota: 4 },
    ]
  );
});
