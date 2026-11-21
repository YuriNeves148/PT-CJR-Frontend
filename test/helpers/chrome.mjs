import { spawn } from "node:child_process";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const pausa = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export async function aguardar(consulta, descricao, prazo = 15000) {
  const limite = Date.now() + prazo;
  let ultimoErro;
  while (Date.now() < limite) {
    try {
      const valor = await consulta();
      if (valor) return valor;
    } catch (erro) {
      ultimoErro = erro;
    }
    await pausa(80);
  }
  throw Error(
    `Tempo excedido: ${descricao}${ultimoErro ? ` (${ultimoErro.message})` : ""}`,
  );
}

// Chrome DevTools Protocol nativo: dispensa dependências de teste adicionais.
export async function abrirChrome() {
  const pasta = await mkdtemp(join(tmpdir(), "stockio-chrome-"));
  const binario =
    process.env.CHROME_BIN ??
    (process.platform === "darwin"
      ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
      : "google-chrome");
  const processo = spawn(
    binario,
    [
      "--headless=new",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-background-networking",
      "--disable-component-update",
      "--disable-sync",
      "--disable-extensions",
      `--user-data-dir=${pasta}`,
      "--remote-debugging-port=0",
      "about:blank",
    ],
    { stdio: "ignore" },
  );
  let ws;
  try {
    const porta = await aguardar(
      async () =>
        (await readFile(join(pasta, "DevToolsActivePort"), "utf8")).split(
          "\n",
        )[0],
      "iniciar Chrome",
    );
    const paginas = await (
      await fetch(`http://127.0.0.1:${porta}/json/list`)
    ).json();
    ws = new WebSocket(
      paginas.find((pagina) => pagina.type === "page").webSocketDebuggerUrl,
    );
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });
    let sequencia = 0;
    const pendentes = new Map();
    ws.onmessage = ({ data }) => {
      const resposta = JSON.parse(data);
      const pendente = pendentes.get(resposta.id);
      if (!pendente) return;
      pendentes.delete(resposta.id);
      if (resposta.error) pendente.reject(Error(resposta.error.message));
      else pendente.resolve(resposta.result);
    };
    const chamar = (method, params = {}) =>
      new Promise((resolve, reject) => {
        const id = ++sequencia;
        pendentes.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    await chamar("Page.enable");
    await chamar("Runtime.enable");
    await chamar("Network.enable");
    return {
      chamar,
      async avaliar(expression) {
        const resposta = await chamar("Runtime.evaluate", {
          expression,
          awaitPromise: true,
          returnByValue: true,
        });
        if (resposta.exceptionDetails)
          throw Error(
            resposta.exceptionDetails.exception?.description ??
              resposta.exceptionDetails.text,
          );
        return resposta.result.value;
      },
      async fechar() {
        ws.close();
        processo.kill("SIGTERM");
        await new Promise((resolve) =>
          processo.exitCode !== null
            ? resolve()
            : processo.once("exit", resolve),
        );
        await rm(pasta, { recursive: true, force: true, maxRetries: 5 });
      },
    };
    return {
      chamar,
      async avaliar(expression) {
        const result = await chamar("Runtime.evaluate", {
          expression,
          awaitPromise: true,
          returnByValue: true,
          userGesture: true,
        });
        if (result.exceptionDetails)
          throw Error(
            result.exceptionDetails.exception?.description ??
              result.exceptionDetails.text,
          );
        return result.result.value;
      },
      async fechar() {
        ws.close();
        processo.kill("SIGTERM");
        await pausa(150);
        await rm(pasta, { recursive: true, force: true, maxRetries: 5 });
      },
    };
  } catch (erro) {
    ws?.close();
    processo.kill("SIGTERM");
    await rm(pasta, { recursive: true, force: true, maxRetries: 5 });
    throw erro;
  }
}
