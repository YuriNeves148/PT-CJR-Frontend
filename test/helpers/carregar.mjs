import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const root = new URL("../../", import.meta.url);
export function carregar(
  arquivo,
  {
    imports = {},
    fetch = async () => {
      throw Error("Requisição inesperada");
    },
    env = {},
  } = {},
) {
  const filename = fileURLToPath(new URL(arquivo, root));
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
    fileName: filename,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
    },
  });
  const modulo = { exports: {} };
  vm.runInNewContext(
    outputText,
    {
      module: modulo,
      exports: modulo.exports,
      URL,
      Request,
      Response,
      Headers,
      FormData,
      File,
      fetch,
      process: { env },
      require: (name) =>
        Object.hasOwn(imports, name) ? imports[name] : require(name),
    },
    { filename },
  );
  return modulo.exports;
}
