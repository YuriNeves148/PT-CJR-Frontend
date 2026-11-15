export const lojaExemplo = {
  id: 1,
  nome: "Rare Beauty",
  categoria: "beleza",
  bannerUrl: "/lojas/rare-beauty-banner.jpg",
  proprietario: "Selena Gomez",
};

export const avaliacoesExemplo = [
  {
    id: 1,
    nome: "Sofia Figueiredo",
    fotoUrl: null,
    nota: 5,
    comentario:
      "Esses produtos realmente transformaram minha rotina de beleza e elevaram minha confiança a novos patamares! O rímel não só dá volume e comprimento incríveis aos meus cílios.",
  },
  {
    id: 2,
    nome: "Mariana Silva",
    fotoUrl: null,
    nota: 5,
    comentario:
      "Recebi recomendações excelentes e fiquei muito satisfeita com a qualidade dos produtos.",
  },
  {
    id: 3,
    nome: "Ana Carolina",
    fotoUrl: null,
    nota: 4,
    comentario:
      "Produtos de ótima qualidade, com acabamento muito bonito e boa durabilidade.",
  },

  {
  id: 4,
  nome: "Pedro Freitas",
  fotoUrl: null,
  nota: 5,
  comentario:
    "Não consigo descrever o quanto gostei dos produtos. A experiência de compra foi excelente.",
},
{
  id: 5,
  nome: "Camila Oliveira",
  fotoUrl: null,
  nota: 3.5,
  comentario:
    "Gostei da qualidade dos produtos, mas acredito que alguns aspectos ainda podem melhorar.",
},
];


import type { ProdutoLoja } from "@/app/components/loja/ProdutoCard";

export const produtosExemplo: ProdutoLoja[] = [
  {
    id: 1,
    nome: "Bronzer",
    preco: 254.99,
    estoque: 10,
    imagemUrl: null,
  },
  {
    id: 2,
    nome: "Blush",
    preco: 199.99,
    estoque: 0,
    imagemUrl: null,
  },
  {
    id: 3,
    nome: "Perfume Rare",
    preco: 599.90,
    estoque: 8,
    imagemUrl: null,
  },
  {
    id: 4,
    nome: "Iluminador",
    preco: 249.90,
    estoque: 5,
    imagemUrl: null,
  },
  {
    id: 5,
    nome: "Mini Blush",
    preco: 99.99,
    estoque: 0,
    imagemUrl: null,
  },
  {
    id: 6,
    nome: "Batom Líquido",
    preco: 149.90,
    estoque: 7,
    imagemUrl: null,
  },
  {
    id: 7,
    nome: "Gel de Banho",
    preco: 99.50,
    estoque: 12,
    imagemUrl: null,
  },
  {
    id: 8,
    nome: "Mist Perfumado",
    preco: 249.90,
    estoque: 3,
    imagemUrl: null,
  },
];