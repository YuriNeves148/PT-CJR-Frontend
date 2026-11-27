# Stock.io — Frontend

Frontend do Stock.io, o marketplace do Processo Trainee da CJR. Feito com Next.js 16 (App Router), React 19 e Tailwind CSS 4. Ele consome a API NestJS do repositório `PT-CJR-Backend`.

## Como rodar

1. Suba o backend (porta `3001` por padrão) seguindo o README daquele repositório.
2. Crie um arquivo `.env` nesta pasta:

   ```bash
   NEXT_PUBLIC_API_URL="http://localhost:3001"
   ```

3. Instale as dependências e inicie o servidor de desenvolvimento:

   ```bash
   npm install
   npm run dev
   ```

4. Abra [http://localhost:3000](http://localhost:3000).

### Variáveis de ambiente

| Variável | Para que serve | Padrão |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Endereço do backend usado pelo navegador (leituras públicas e imagens) | `http://localhost:3001` |
| `BACKEND_URL` | Endereço do backend usado pelo servidor do Next (páginas e rotas `/api`) | `http://localhost:3001` |
| `BACKEND_PUBLIC_URL` | Endereço público das imagens enviadas, quando diferente de `BACKEND_URL` | valor de `BACKEND_URL` |

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` / `npm start` | Build e servidor de produção |
| `npm run lint` | ESLint |
| `npm test` | Testes automatizados (`test/*.test.mjs`) |
| `npm run test:browser` | Teste de navegador do modal de editar loja |

## Páginas

| Rota | Conteúdo |
| --- | --- |
| `/` | Redireciona para o feed (logado ou deslogado) |
| `/feed_logado`, `/feed_deslogado` | Feed com categorias, produtos e lojas, com busca e filtro de lojas |
| `/catalogo`, `/categoria/[slug]` | Catálogo geral e produtos de uma categoria |
| `/lojas` | Listagem de lojas |
| `/loja/[id]` | Página da loja; o dono edita a loja e adiciona produtos |
| `/loja/[id]/avaliacoes` e `/[avaliacaoId]` | Avaliações da loja e comentários de uma avaliação |
| `/produto/[id]` | Página do produto, com galeria, produtos da mesma loja e avaliações |
| `/produto/[id]/avaliacoes/[avaliacaoId]` | Comentários de uma avaliação de produto |
| `/perfil/[id]` | Perfil do usuário; o dono edita o perfil, cadastra lojas e exclui a conta |
| `/login`, `/cadastro` | Entrar (com troca de senha) e criar conta |

## Autenticação

O login grava o JWT em um cookie `httpOnly` chamado `session`. O navegador não consegue ler esse cookie, então toda escrita passa pelas rotas de `app/api`, que repassam a requisição ao backend com o token. As leituras públicas (lojas, produtos, avaliações) vão direto ao backend.

## Demonstração Sabor da Vila

Os dados e as imagens da demonstração são preparados pelo comando opcional `npm run seed:demo` no repositório backend. Consulte `docs/seed-demo.md` naquele repositório. Use `/loja/ID` com o ID retornado pelo seed e a configuração de backend local existente.
