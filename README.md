# AutoStore

Aplicação web para consulta, comparação e recomendação de veículos, desenvolvida como projeto de desafio técnico.

O AutoStore oferece um catálogo com 15 veículos, filtros de pesquisa, página de detalhes, comparação entre até 3 veículos, registro e gerenciamento de interessados (leads) e um assistente de inteligência artificial baseado em RAG (Retrieval-Augmented Generation).

## Funcionalidades

- Catálogo com 15 veículos de 5 montadoras.
- Busca por modelo, montadora, categoria, motor e combustível/energia.
- Filtros combinados.
- Filtro por faixa de preço.
- Ordenação dos veículos.
- Página individual de detalhes.
- Comparação visual de até 3 veículos.
- Destaque automático de menor preço e maior potência na comparação.
- Formulário "Tenho interesse".
- Registro e persistência local de leads.
- Página pública para consulta e gerenciamento dos leads.
- Pesquisa e filtros por status dos leads.
- AutoStoreAI com interface de chat.
- Sugestões de perguntas.
- Histórico de conversas armazenado no navegador.
- Criação e exclusão de conversas.
- Busca semântica baseada no conteúdo do PDF técnico.
- Recuperação dos trechos mais relevantes para geração das respostas.
- Exibição das fontes utilizadas pelo RAG.
- Tratamento para ausência da chave da API.

## Tecnologias

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- ESLint
- Gemini API
- Embeddings
- Busca semântica
- Similaridade por cosseno
- RAG (Retrieval-Augmented Generation)
- Local Storage
- Git e GitHub

## Estrutura principal

```text
autostore/
├── data/
│   ├── leads.json
│   └── rag/
│       └── indice-vetorial.json
├── public/
│   └── assets/
│       └── RAG-AutoStore_Base_Tecnica.pdf
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/
│   │   │   ├── leads/
│   │   │   └── rag/
│   │   ├── carros/[id]/
│   │   ├── chat/new/
│   │   ├── comparar/
│   │   ├── leads/
│   │   └── page.tsx
│   ├── components/
│   ├── data/
│   │   └── carros_catalogo.json
│   ├── lib/
│   └── types/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Arquitetura do RAG

O AutoStoreAI utiliza uma arquitetura RAG para responder perguntas com base nos documentos técnicos fornecidos no projeto.

O fluxo implementado é:

```text
PDF técnico
    ↓
Extração do conteúdo
    ↓
Divisão do conteúdo em chunks
    ↓
Geração de embeddings
    ↓
Índice vetorial local
    ↓
Pergunta do usuário
    ↓
Embedding da pergunta
    ↓
Busca por similaridade de cosseno
    ↓
Recuperação dos chunks mais relevantes
    ↓
Envio do contexto recuperado para o Gemini
    ↓
Geração da resposta
    ↓
Exibição da resposta e das fontes
```

O modelo recebe instruções para responder somente sobre os veículos presentes na base do projeto e utilizar o contexto recuperado dos documentos técnicos.

## Fonte dos dados

Os dados dos veículos e o conteúdo utilizado pelo RAG são provenientes exclusivamente dos arquivos fornecidos para o desafio técnico:

- Catálogo estruturado de veículos em JSON.
- PDF com fichas técnicas e informações dos veículos.

Não são utilizadas fontes externas para atualizar preços ou especificações.

## Pré-requisitos

Antes de executar o projeto, instale:

- Node.js
- npm
- Git

## Instalação

Clone o repositório:

```bash
git clone URL_DO_REPOSITORIO
```

Entre na pasta do projeto:

```bash
cd autostore
```

Instale as dependências:

```bash
npm install
```

## Configuração da API

Crie o arquivo `.env.local` na raiz do projeto.

Utilize o `.env.example` como referência:

```env
GEMINI_API_KEY=
```

Adicione sua chave:

```env
GEMINI_API_KEY=sua_chave_aqui
```

Nunca envie o arquivo `.env.local` ou a chave da API para o GitHub.

## Executando o projeto

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse a aplicação pelo endereço exibido no terminal.

Por padrão:

```text
http://localhost:3000
```

## Preparação do índice vetorial

Com o servidor iniciado e a `GEMINI_API_KEY` configurada, gere o índice vetorial através do endpoint:

```text
POST /api/rag/indexar
```

O índice gerado é armazenado localmente e não deve ser enviado ao GitHub.

## Endpoints principais

| Método | Endpoint | Descrição |
| --- | --- | --- |
| GET | `/api/rag/teste` | Testa a leitura e divisão do PDF técnico |
| GET | `/api/rag/indexar` | Consulta o estado do índice vetorial |
| POST | `/api/rag/indexar` | Gera o índice vetorial |
| GET | `/api/rag/busca` | Consulta a disponibilidade da busca semântica |
| POST | `/api/rag/busca` | Executa uma busca semântica |
| POST | `/api/chat` | Processa perguntas do AutoStoreAI utilizando RAG |
| GET | `/api/leads` | Lista os leads cadastrados |
| POST | `/api/leads` | Registra um novo lead |

## Validação do projeto

Antes de finalizar uma alteração, execute:

```bash
npm run lint
```

Para validar a compilação de produção:

```bash
npm run build
```

O projeto deve concluir os dois comandos sem erros antes da entrega.

## Status atual

As funcionalidades principais da aplicação estão implementadas.

O processamento do PDF técnico, divisão em chunks, geração de embeddings, índice vetorial, busca semântica, integração do chat com RAG e exibição de fontes estão implementados no código.

A validação completa do fluxo com a Gemini API depende da configuração de uma `GEMINI_API_KEY` válida.

Após configurar a chave, devem ser executados:

1. Geração do índice vetorial.
2. Teste da busca semântica.
3. Teste completo do AutoStoreAI.
4. Validação das respostas e fontes recuperadas.
5. Testes finais de integração.

## Autor

Moisés Ferreira

Projeto desenvolvido para fins de avaliação técnica.