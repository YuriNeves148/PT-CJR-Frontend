import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

// Executa o código TypeScript real com as fronteiras Next/fetch controladas.
// Nenhum servidor, cookie real ou banco de dados é utilizado.
const require = createRequire(import.meta.url);
const root = new URL('../', import.meta.url);
function carregar(arquivo, { imports = {}, env = {}, fetch = async () => { throw Error('fetch inesperado'); } } = {}) {
  const filename = fileURLToPath(new URL(arquivo, root));
  const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
    fileName: filename,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  });
  const moduloTestado = { exports: {} };
  vm.runInNewContext(outputText, {
    module: moduloTestado, exports: moduloTestado.exports, process: { env }, URL, fetch,
    require: (name) => Object.hasOwn(imports, name) ? imports[name] : require(name),
  }, { filename });
  return moduloTestado.exports;
}
const backend = (opcoes = {}) => carregar('app/lib/backend.ts', {
  ...opcoes,
  imports: { 'next/headers': { cookies: async () => ({ get: () => undefined }) }, ...opcoes.imports },
});
const env = { BACKEND_URL: 'http://interno.example:3101/', BACKEND_PUBLIC_URL: 'https://imagens.example/' };

test('normaliza uploads relativos e absolutos para o endereço público configurado', () => {
  const api = backend({ env });
  assert.equal(api.BACKEND_URL, 'http://interno.example:3101');
  assert.equal(api.urlImagemSegura('/uploads/produtos/foto.jpg'), 'https://imagens.example/uploads/produtos/foto.jpg');
  assert.equal(api.urlImagemSegura('https://imagens.example/uploads/produtos/201/foto.webp'), 'https://imagens.example/uploads/produtos/201/foto.webp');
  assert.equal(api.urlImagemSegura('http://interno.example:3101/uploads/produtos/201/foto.webp'), 'https://imagens.example/uploads/produtos/201/foto.webp');
  assert.equal(backend({ env: { BACKEND_URL: 'https://api.example' } }).urlImagemSegura('/uploads/lojas/logo.webp'), 'https://api.example/uploads/lojas/logo.webp');
});

for (const url of [null, '', 'javascript:alert(1)', 'data:image/png;base64,abc', '//externo.example/uploads/foto.png', 'https://externo.example/uploads/foto.png', 'https://imagens.example.evil/uploads/foto.png', 'https://imagens.example@evil/uploads/foto.png', '/uploads/../privado.png', '/uploads/./foto.png', '/uploads/%2e%2e/privado.png', '/uploads/%252e%252e/privado.png', '/uploads/a%2fb.png', '/uploads/foto.png?x=1', '/uploads/foto.png#x', '/uploads/"foto.png', '/uploads/a\\b.png', '/uploads/a b.png']) {
  test(`recusa URL de imagem fora do contrato: ${url}`, () => {
    assert.equal(backend({ env }).urlImagemSegura(url), null);
  });
}

test('ordena imagens de produto, normaliza o caminho e rejeita imagens externas', () => {
  const api = backend({ env });
  const produto = { id: 10, nome: 'Demonstração', preco: '12.50', estoque: 3, imagem: [{ ordem: 1, url_imagem: '/uploads/segunda.webp' }, { ordem: 0, url_imagem: '/uploads/primeira.webp' }] };
  const resultado = api.mapearProduto(produto);
  assert.equal(resultado.imagemUrl, 'https://imagens.example/uploads/primeira.webp');
  assert.equal(resultado.preco, 12.5);
  assert.equal(api.mapearProduto({ ...produto, imagem: [{ ordem: 0, url_imagem: 'https://externo.example/foto.png' }] }).imagemUrl, null);
  assert.equal(api.mapearProduto({ ...produto, imagem: [] }).imagemUrl, null);
});

test('consulta /user/me pelo servidor com cookie e BACKEND_URL, sem expor o JWT', async () => {
  const chamadas = [];
  const api = backend({ env, imports: { 'next/headers': { cookies: async () => ({ get: () => ({ value: 'sessao-apenas-do-teste' }) }) } }, fetch: async (...args) => {
    chamadas.push(args); return { ok: true, json: async () => ({ id: 101, nome: 'Demo' }) };
  } });
  assert.equal((await api.getUsuarioSessao()).id, 101);
  assert.equal(chamadas[0][0], 'http://interno.example:3101/user/me');
  assert.equal(chamadas[0][1].headers.Authorization, 'Bearer sessao-apenas-do-teste');
  assert.equal(chamadas[0][1].cache, 'no-store');
  assert.equal(await backend({ env }).getUsuarioSessao(), null);
});

function perfil(sessao = null) {
  return carregar('app/perfil/page.tsx', { imports: {
    '@/app/lib/backend': { idValido: backend().idValido, getUsuarioSessao: async () => sessao },
    'next/navigation': { redirect: (location) => { throw Object.assign(Error('redirect'), { location }); } },
  } }).default;
}
for (const [query, sessao, destino] of [
  [{}, null, '/login'], [{}, { id: 101 }, '/perfil/101'], [{ id: '12' }, null, '/perfil/12'],
  [{ id: '12' }, { id: 101 }, '/perfil/12'], [{ id: '0' }, { id: 101 }, '/perfil/101'],
  [{ id: '2147483648' }, null, '/login'], [{ id: '//externo.example' }, null, '/login'],
  [{ id: ['12', '13'] }, null, '/login'],
]) {
  test(`/perfil redireciona com parâmetros ${JSON.stringify(query)} para ${destino}`, async () => {
    await assert.rejects(perfil(sessao)({ searchParams: Promise.resolve(query) }), (e) => e.location === destino);
  });
}

function comentarios(fetch) {
  return carregar('app/api/comentarios/route.ts', { fetch, imports: { '@/app/lib/backend': { BACKEND_URL: 'http://interno.example:3101' } } }).POST;
}
const requisicao = (token, corpo = { conteudo: 'Demonstração', avaliacao_loja_id: 301 }) => ({ cookies: { get: () => token ? { value: token } : undefined }, json: async () => corpo });

test('proxy de comentários exige cookie e não chama o backend sem autenticação', async () => {
  const resposta = await comentarios(() => { throw Error('Não deve ser chamado'); })(requisicao(null));
  assert.equal(resposta.status, 401);
});
test('proxy preserva comentário e autorização, respeitando BACKEND_URL', async () => {
  let chamada;
  const resposta = await comentarios(async (...args) => { chamada = args; return { ok: true, json: async () => ({ id: 1, conteudo: 'Demonstração' }) }; })(requisicao('sessao-apenas-do-teste', { conteudo: 'Demonstração', avaliacao_loja_id: 301, usuario_id: 999 }));
  assert.equal(resposta.status, 201);
  assert.equal(chamada[0], 'http://interno.example:3101/comentarios');
  assert.equal(chamada[1].headers.Authorization, 'Bearer sessao-apenas-do-teste');
  assert.deepEqual(JSON.parse(chamada[1].body), { conteudo: 'Demonstração', avaliacao_loja_id: 301 });
  assert.equal((await resposta.text()).includes('sessao-apenas-do-teste'), false);
});
test('proxy preserva falhas de validação e autorização do backend', async () => {
  for (const status of [400, 401, 403, 404]) {
    const resposta = await comentarios(async () => ({ ok: false, status, json: async () => ({ message: ['Erro de teste'] }) }))(requisicao('sessao-apenas-do-teste'));
    assert.equal(resposta.status, status);
    assert.equal((await resposta.json()).mensagem, 'Erro de teste');
  }
});
test('proxy informa indisponibilidade do backend', async () => {
  const resposta = await comentarios(async () => { throw Error('offline'); })(requisicao('sessao-apenas-do-teste'));
  assert.equal(resposta.status, 502);
});
