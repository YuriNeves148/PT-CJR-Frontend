import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { criarBackendLoja } from "./helpers/backend-loja.mjs";
import { abrirChrome, aguardar, pausa } from "./helpers/chrome.mjs";

// Requer um build existente. Executa o Next.js real e Chrome com backend em memória.
// Todas as escritas, inclusive DELETE, ficam restritas à fixture localhost criada aqui.
const root = fileURLToPath(new URL("../", import.meta.url));
const backend = await criarBackendLoja();
const reserva = createServer();
await new Promise((resolve) => reserva.listen(0, "127.0.0.1", resolve));
const porta = reserva.address().port;
await new Promise((resolve) => reserva.close(resolve));
const base = `http://127.0.0.1:${porta}`;
const next = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    String(porta),
  ],
  {
    cwd: root,
    env: {
      ...process.env,
      BACKEND_URL: backend.url,
      BACKEND_PUBLIC_URL: backend.url,
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let log = "";
next.stdout.on("data", (chunk) => (log += chunk));
next.stderr.on("data", (chunk) => (log += chunk));
let chrome;
let verificacoes = 0;
const artefatos =
  process.env.TEST_ARTIFACTS ??
  (await mkdtemp(join(tmpdir(), "stockio-modal-")));
const ok = (descricao) => {
  verificacoes++;
  console.log(`OK ${descricao}`);
};
try {
  await aguardar(
    async () => (await fetch(`${base}/api/categorias`)).ok,
    "iniciar Next com fixture",
    20000,
  );
  chrome = await abrirChrome();
  const { avaliar, chamar } = chrome;
  const esperar = (expression, descricao) =>
    aguardar(() => avaliar(expression), descricao);
  const clicar = (texto) =>
    avaliar(
      `(() => { const b = [...document.querySelectorAll('button')].find(b => b.getAttribute('aria-label') === ${JSON.stringify(texto)} || b.textContent.trim() === ${JSON.stringify(texto)}); if(!b) throw Error('Botão ausente: '+${JSON.stringify(texto)}); b.focus(); b.click(); })()`,
    );
  const preencher = (selector, valor) =>
    avaliar(
      `(() => { const e = document.querySelector(${JSON.stringify(selector)}); Object.getOwnPropertyDescriptor(${selector.includes("categoria") ? "HTMLSelectElement" : "HTMLInputElement"}.prototype, 'value').set.call(e, ${JSON.stringify(valor)}); e.dispatchEvent(new Event(${selector.includes("categoria") ? "'change'" : "'input'"}, {bubbles:true})); })()`,
    );
  const navegar = async (token = "dona-fixture", caminho = "/loja/82") => {
    await chamar("Network.clearBrowserCookies");
    if (token)
      await chamar("Network.setCookie", {
        name: "session",
        value: token,
        url: base,
        httpOnly: true,
        sameSite: "Lax",
      });
    await chamar("Page.navigate", { url: `${base}${caminho}` });
    await esperar(
      `location.pathname === ${JSON.stringify(caminho)} && document.querySelector('h1')?.textContent.trim() === ${JSON.stringify(caminho.startsWith("/perfil/") ? backend.loja.usuario.nome : backend.loja.nome)}`,
      "carregar loja",
    );
    // Aguarda hidratação do controle (fetch da Navbar é disparado pelo React).
    await esperar(
      "document.querySelector('nav') !== null && document.readyState === 'complete'",
      "hidratar página",
    );
    await pausa(150);
  };
  const abrir = async () => {
    await clicar("Editar loja");
    await esperar(
      "document.querySelector('dialog[open] input[type=text]') && !document.querySelector('dialog button[type=submit]').disabled",
      "abrir modal e carregar categorias",
    );
  };
  const fechar = async () => {
    await avaliar(
      "document.querySelector('button[aria-label=\"Fechar editar loja\"]').click()",
    );
    await esperar(
      "document.querySelectorAll('dialog[open]').length === 0",
      "fechar modal",
    );
  };
  const arquivo = (tipo, nome) =>
    avaliar(
      `(() => { const i = [...document.querySelectorAll('[role=dialog] input[type=file]')][${tipo}]; const d = new DataTransfer(); d.items.add(new File(['fixture'], ${JSON.stringify(nome)}, {type:'image/png'})); i.files = d.files; i.dispatchEvent(new Event('change',{bubbles:true})); })()`,
    );
  const screenshot = async (nome) => {
    await mkdir(artefatos, { recursive: true });
    const { data } = await chamar("Page.captureScreenshot", { format: "png" });
    await writeFile(join(artefatos, nome), Buffer.from(data, "base64"));
  };

  for (const token of [null, "outro-fixture", "expirada-fixture"]) {
    await navegar(token);
    assert.equal(
      await avaliar(
        "!!document.querySelector('button[aria-label=\"Editar loja\"]')",
      ),
      false,
    );
    ok(`botão oculto para ${token ?? "visitante"}`);
  }
  // Exercita o proxy real contra a recusa da fixture, sem acesso ao banco.
  await navegar("outro-fixture");
  for (const method of ["PATCH", "DELETE"]) {
    assert.equal(
      await avaliar(
        `fetch('/api/lojas/82',{method:${JSON.stringify(method)},headers:{'Content-Type':'application/json'},${method === "PATCH" ? "body:JSON.stringify({nome:'Tentativa indevida'})," : ""}}).then(r=>r.status)`,
      ),
      403,
    );
    ok(`${method} direto recusado ao não proprietário`);
  }
  await navegar("expirada-fixture");
  const expirado = await avaliar(
    "fetch('/api/lojas/82',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({nome:'Teste'})}).then(async r=>({status:r.status,body:await r.text()}))",
  );
  assert.equal(expirado.status, 401, expirado.body);
  ok("API recusa token expirado");

  for (const token of [null, "outro-fixture", "expirada-fixture"]) {
    await navegar(token, "/perfil/101");
    assert.equal(
      await avaliar(
        "!!document.querySelector('button[aria-label=\"Cadastrar loja\"]')",
      ),
      false,
    );
  }
  ok(
    "cadastro no perfil oculto para visitantes, outro usuário e sessão expirada",
  );
  await navegar("dona-fixture", "/perfil/101");
  await esperar(
    "!document.querySelector('button[aria-label=\"Cadastrar loja\"]').disabled",
    "habilitar cadastro no perfil",
  );
  for (const width of [1440, 768, 375, 320]) {
    await chamar("Emulation.setDeviceMetricsOverride", {
      width,
      height: 960,
      deviceScaleFactor: 1,
      mobile: width < 768,
    });
    assert.equal(
      await avaliar(`(() => {
      const botoes = document.querySelectorAll('button[aria-label="Cadastrar loja"]');
      const botao = botoes[0], r = botao.getBoundingClientRect();
      const titulo = botao.parentElement.querySelector('h2').getBoundingClientRect();
      return botoes.length === 1 && !botao.textContent.trim() && r.width === 44 && r.height === 44 && r.right <= innerWidth && Math.abs((r.top + r.height/2) - (titulo.top + titulo.height/2)) < 2;
    })()`),
      true,
    );
    await avaliar(
      "document.querySelector('button[aria-label=\"Cadastrar loja\"]').scrollIntoView({block:'center'})",
    );
    if ([1440, 375].includes(width))
      await screenshot(`acao-cadastrar-${width}.png`);
  }
  const antesDeCancelarCadastro = backend.estado.chamadas.length;
  await clicar("Cadastrar loja");
  await esperar(
    "!!document.querySelector('#nome-nova-loja')",
    "abrir cadastro pelo mais no perfil",
  );
  assert.equal(await avaliar("location.pathname"), "/perfil/101");
  assert.equal(
    await avaliar(
      "document.querySelectorAll('[role=dialog] input[type=file]').length",
    ),
    3,
  );
  await avaliar(
    "document.querySelector('button[aria-label=\"Fechar modal\"]').click()",
  );
  await esperar(
    "!document.querySelector('[role=dialog]')",
    "cancelar cadastro no perfil",
  );
  assert.equal(backend.estado.chamadas.length, antesDeCancelarCadastro);
  ok(
    "mais de cadastro alinhado ao título Lojas, responsivo, abre modal e cancela sem escrita",
  );

  await navegar();
  for (const width of [1440, 768, 375, 320]) {
    await chamar("Emulation.setDeviceMetricsOverride", {
      width,
      height: 960,
      deviceScaleFactor: 1,
      mobile: width < 768,
    });
    assert.equal(
      await avaliar(`(() => {
      const botoes = document.querySelectorAll('button[aria-label="Editar loja"]');
      const botao = botoes[0], r = botao.getBoundingClientRect();
      const hero = botao.closest('section').getBoundingClientRect();
      return botoes.length === 1 && !botao.textContent.trim() && r.width === 44 && r.height === 44 && r.right <= hero.right && r.left > hero.left + hero.width/2 && Math.abs(r.top - hero.top - hero.height*0.2) < 1;
    })()`),
      true,
    );
    if ([1440, 375].includes(width))
      await screenshot(`acao-editar-${width}.png`);
  }
  ok(
    "mais de edição único sobre o banner, no canto superior direito, sem texto nem lápis em desktop e mobile",
  );

  await chamar("Emulation.setDeviceMetricsOverride", {
    width: 848,
    height: 960,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await navegar();
  await avaliar(
    "document.querySelector('button[aria-label=\"Editar loja\"]').focus()",
  );
  assert.equal(
    await avaliar("document.activeElement.getAttribute('aria-label')"),
    "Editar loja",
  );
  await chamar("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: "Enter",
    code: "Enter",
    windowsVirtualKeyCode: 13,
    text: "\r",
    unmodifiedText: "\r",
  });
  await chamar("Input.dispatchKeyEvent", {
    type: "keyUp",
    key: "Enter",
    code: "Enter",
    windowsVirtualKeyCode: 13,
  });
  await esperar(
    "document.querySelector('dialog[open] input[type=text]') && !document.querySelector('dialog button[type=submit]').disabled",
    "abrir edição com Enter",
  );
  assert.equal(await avaliar("location.pathname"), "/loja/82");
  assert.equal(
    await avaliar("document.querySelector('#editar-nome-loja').value"),
    "Rare Beauty",
  );
  assert.equal(
    await avaliar("document.querySelector('#editar-categoria-loja').value"),
    "7",
  );
  assert.equal(await avaliar("document.activeElement.id"), "editar-nome-loja");
  assert.equal(
    await avaliar("document.querySelectorAll('dialog img').length"),
    3,
  );
  assert.equal(await avaliar("document.cookie.includes('session')"), false);
  ok(
    "proprietário abre diálogo com dados, imagens mantidas, foco e cookie HttpOnly",
  );
  await screenshot("modal-desktop.png");
  for (let i = 0; i < 12; i++) {
    await chamar("Input.dispatchKeyEvent", {
      type: "keyDown",
      key: "Tab",
      code: "Tab",
      windowsVirtualKeyCode: 9,
    });
    await chamar("Input.dispatchKeyEvent", {
      type: "keyUp",
      key: "Tab",
      code: "Tab",
      windowsVirtualKeyCode: 9,
    });
    assert.equal(
      await avaliar("!!document.activeElement.closest('dialog')"),
      true,
    );
  }
  ok("Tab mantém foco no diálogo");
  await chamar("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: "Escape",
    code: "Escape",
    windowsVirtualKeyCode: 27,
  });
  await chamar("Input.dispatchKeyEvent", {
    type: "keyUp",
    key: "Escape",
    code: "Escape",
    windowsVirtualKeyCode: 27,
  });
  await esperar("!document.querySelector('dialog[open]')", "fechar com Escape");
  assert.equal(
    await avaliar("document.activeElement.getAttribute('aria-label')"),
    "Editar loja",
  );
  ok("Escape fecha e devolve foco");

  await abrir();
  await chamar("Input.dispatchMouseEvent", {
    type: "mousePressed",
    x: 2,
    y: 2,
    button: "left",
    clickCount: 1,
  });
  await chamar("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x: 2,
    y: 2,
    button: "left",
    clickCount: 1,
  });
  await esperar(
    "!document.querySelector('dialog[open]')",
    "fechar ao clicar fora",
  );
  ok("clique no fundo fecha o modal sem alterações");

  await abrir();
  const antes = backend.estado.chamadas.length;
  await preencher("#editar-nome-loja", "Alteração descartada");
  await avaliar(
    "document.querySelector('button[aria-label=\"Fechar editar loja\"]').click()",
  );
  await esperar(
    "document.querySelectorAll('dialog[open]').length===2",
    "confirmar descarte",
  );
  await clicar("Cancelar");
  await esperar(
    "document.querySelectorAll('dialog[open]').length===1",
    "cancelar descarte",
  );
  await avaliar(
    "document.querySelector('button[aria-label=\"Fechar editar loja\"]').click()",
  );
  await clicar("Descartar");
  await esperar("!document.querySelector('dialog[open]')", "descartar");
  assert.equal(backend.estado.chamadas.length, antes);
  assert.equal(await avaliar("document.body.style.overflow"), "");
  ok("cancelamento descarta apenas dados temporários e restaura rolagem");

  await abrir();
  await preencher("#editar-nome-loja", "  ");
  await clicar("Salvar");
  await esperar(
    "document.querySelector('[role=alert]')?.textContent.includes('nome')",
    "nome vazio",
  );
  assert.equal(backend.estado.chamadas.length, antes);
  await preencher("#editar-nome-loja", backend.loja.nome);
  await arquivo(1, "arquivo.exe");
  await esperar(
    "document.querySelector('[role=alert]')?.textContent.includes('Formato inválido')",
    "arquivo inválido",
  );
  ok("nome vazio e formato inválido bloqueados localmente");
  await fechar();

  for (const [nome, categoria] of [
    ["Nome alterado", "7"],
    ["Nome alterado", "9"],
    ["Nome e categoria", "7"],
  ]) {
    await abrir();
    await preencher("#editar-nome-loja", nome);
    await preencher("#editar-categoria-loja", categoria);
    const inicio = backend.estado.chamadas.length;
    await clicar("Salvar");
    await esperar("!document.querySelector('dialog[open]')", "salvar dados");
    await esperar(
      `document.querySelector('h1')?.textContent.trim()===${JSON.stringify(nome)}`,
      "atualizar dados na página",
    );
    assert.equal(backend.estado.chamadas.length, inicio + 1);
    assert.equal(backend.estado.chamadas.at(-1).method, "PATCH");
    await navegar();
    assert.equal(backend.loja.categoria_id, Number(categoria));
  }
  ok(
    "nome, categoria e ambos persistem após navegar novamente; nenhum upload sem arquivo",
  );
  for (const [indice, nome, endpoint] of [
    [0, "foto.png", "foto-perfil"],
    [1, "logo.svg", "logo"],
    [2, "banner.webp", "banner"],
  ]) {
    await abrir();
    await arquivo(indice, nome);
    const inicio = backend.estado.chamadas.length;
    await clicar("Salvar");
    await esperar("!document.querySelector('dialog[open]')", "salvar imagem");
    assert.equal(backend.estado.chamadas.length, inicio + 1);
    assert.equal(
      backend.estado.chamadas.at(-1).url,
      `/lojas/82/imagens/${endpoint}`,
    );
  }
  ok("foto, logo SVG e banner usam os proxies existentes individualmente");

  backend.estado.falharBanner = true;
  backend.estado.atraso = 300;
  await abrir();
  await preencher("#editar-nome-loja", "Nome salvo parcialmente");
  await arquivo(1, "logo.png");
  await arquivo(2, "banner.png");
  const inicio = backend.estado.chamadas.length;
  await avaliar(
    "const f=document.querySelector('dialog form'); f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})); f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));",
  );
  await esperar(
    "document.querySelector('dialog button[type=submit]').disabled",
    "bloquear duplicação",
  );
  await chamar("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: "Escape",
    code: "Escape",
    windowsVirtualKeyCode: 27,
  });
  assert.equal(
    await avaliar("document.querySelectorAll('dialog[open]').length"),
    1,
  );
  await esperar(
    "document.querySelector('[role=alert]')?.textContent.includes('Banner') && !document.querySelector('dialog button[type=submit]').disabled",
    "falha parcial",
  );
  assert.equal(backend.estado.chamadas.length, inicio + 3);
  assert.equal(
    await avaliar(
      "document.querySelector('dialog [role=status]').textContent.includes('Nome, Logo')",
    ),
    true,
  );
  backend.estado.falharBanner = false;
  backend.estado.atraso = 0;
  await clicar("Salvar");
  await esperar(
    "!document.querySelector('dialog[open]')",
    "repetir upload pendente",
  );
  assert.equal(backend.estado.chamadas.length, inicio + 4);
  assert.equal(backend.estado.chamadas.at(-1).url, "/lojas/82/imagens/banner");
  ok(
    "sucesso parcial, repetição apenas do banner, bloqueio de envio duplicado e Escape durante envio",
  );

  backend.estado.falharCategorias = true;
  await clicar("Editar loja");
  await esperar(
    "document.querySelector('[role=alert]')?.textContent.includes('categorias')",
    "falha de categorias",
  );
  assert.equal(
    await avaliar(
      "document.querySelector('dialog button[type=submit]').disabled",
    ),
    true,
  );
  backend.estado.falharCategorias = false;
  await clicar("Tentar novamente");
  await esperar(
    "!document.querySelector('dialog button[type=submit]').disabled",
    "reconsultar categorias",
  );
  ok("falha de categorias visível e nova tentativa funcional");

  for (const [width, height, nome] of [
    [768, 1024, "tablet"],
    [375, 812, "mobile"],
    [320, 568, "mobile-320"],
  ]) {
    await chamar("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: true,
    });
    assert.equal(
      await avaliar(
        "document.querySelector('dialog').scrollWidth <= document.querySelector('dialog').clientWidth",
      ),
      true,
    );
    assert.equal(
      await avaliar(
        "document.querySelector('dialog').getBoundingClientRect().width < innerWidth",
      ),
      true,
    );
    await avaliar("document.querySelector('dialog').scrollTop=0");
    await screenshot(`modal-${nome}.png`);
  }
  ok(
    "desktop, tablet, celular e 320px sem transbordamento horizontal e com rolagem interna",
  );
  const chamadasAntesDeExcluir = backend.estado.chamadas.length;
  await clicar("DELETAR");
  await esperar(
    "document.querySelectorAll('dialog[open]').length===2",
    "confirmação de exclusão",
  );
  assert.equal(backend.estado.chamadas.length, chamadasAntesDeExcluir);
  assert.equal(
    await avaliar("document.activeElement.textContent.trim()"),
    "Cancelar",
  );
  await clicar("Cancelar");
  assert.equal(backend.estado.excluida, false);
  assert.equal(backend.estado.chamadas.length, chamadasAntesDeExcluir);
  ok(
    "DELETAR exige confirmação separada, foca Cancelar e não exclui ao cancelar",
  );
  await clicar("DELETAR");
  backend.estado.falharExclusao = true;
  await clicar("Excluir definitivamente");
  await esperar(
    "[...document.querySelectorAll('dialog [role=alert]')].some(e=>e.textContent.includes('bloqueada'))",
    "exibir bloqueio de exclusão",
  );
  assert.equal(backend.estado.excluida, false);
  assert.equal(await avaliar("location.pathname"), "/loja/82");
  ok("erro de exclusão mantém a loja e a confirmação aberta");
  backend.estado.falharExclusao = false;
  await clicar("Excluir definitivamente");
  await esperar(
    "location.pathname==='/perfil/101'",
    "redirecionar após exclusão confirmada da fixture",
  );
  assert.equal(backend.estado.excluida, true);
  assert.equal(backend.estado.chamadas.at(-1).method, "DELETE");
  assert.equal(await avaliar("document.body.style.overflow"), "");
  ok(
    "exclusão confirmada somente na fixture em memória e redirecionamento ao perfil",
  );

  await chamar("Emulation.setDeviceMetricsOverride", {
    width: 1024,
    height: 960,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await esperar(
    "!!document.querySelector('button[aria-label=\"Cadastrar loja\"]') && !document.querySelector('button[aria-label=\"Cadastrar loja\"]').disabled",
    "carregar cadastro existente",
  );
  await clicar("Cadastrar loja");
  await esperar(
    "!!document.querySelector('#nome-nova-loja')",
    "abrir modal de cadastro",
  );
  await preencher("#nome-nova-loja", "Cadastro após refatoração");
  await preencher("#categoria-nova-loja", "9");
  await arquivo(0, "foto.png");
  await clicar("Remover arquivo");
  await arquivo(0, "foto.png");
  await arquivo(1, "logo.svg");
  await arquivo(2, "banner.webp");
  const inicioCadastro = backend.estado.chamadas.length;
  await clicar("Adicionar");
  await esperar(
    "document.body.innerText.includes('Loja criada com sucesso!') && !document.querySelector('[role=dialog]')",
    "concluir cadastro com três uploads",
  );
  assert.deepEqual(
    backend.estado.chamadas
      .slice(inicioCadastro)
      .map(({ method, url }) => `${method} ${url}`),
    [
      "POST /lojas",
      "POST /lojas/83/imagens/foto-perfil",
      "POST /lojas/83/imagens/logo",
      "POST /lojas/83/imagens/banner",
    ],
  );
  ok(
    "cadastro existente preservado: criação, seleção e remoção de arquivo, foto, logo SVG e banner",
  );
  await esperar(
    "[...document.querySelectorAll('a[href=\"/loja/83\"]')].some(a=>a.textContent.includes('Cadastro após refatoração'))",
    "atualizar lista de lojas no perfil após cadastro",
  );
  ok("loja cadastrada pelo mais aparece na lista do perfil após refresh");
  console.log(
    `${verificacoes} verificações de navegador concluídas. Capturas: ${artefatos}`,
  );
} catch (erro) {
  if (chrome) {
    try {
      const { data } = await chrome.chamar("Page.captureScreenshot", {
        format: "png",
      });
      await mkdir(artefatos, { recursive: true });
      await writeFile(
        join(artefatos, "falha.png"),
        Buffer.from(data, "base64"),
      );
      console.error(
        "Página na falha:",
        await chrome.avaliar("document.body.innerText"),
      );
    } catch {
      /* diagnóstico opcional */
    }
  }
  console.error(log);
  throw erro;
} finally {
  await chrome?.fechar();
  next.kill("SIGTERM");
  await new Promise((resolve) =>
    next.exitCode !== null ? resolve() : next.once("exit", resolve),
  );
  await new Promise((resolve) => backend.server.close(resolve));
}
