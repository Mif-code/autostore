# 🚗 Vroomly AutoStore

Aplicação web desenvolvida para o desafio técnico **AutoStore**, com o objetivo de criar uma plataforma inteligente para consulta, comparação e descoberta de veículos.

O projeto permite explorar um catálogo de veículos, visualizar informações técnicas, comparar modelos, registrar interesses comerciais e conversar com o **VroomAI**, um assistente inteligente integrado à API Gemini e a uma arquitetura RAG (Retrieval-Augmented Generation).

---

## 📌 Sobre o projeto

O Vroomly AutoStore foi desenvolvido como solução para facilitar a escolha de veículos dentro de uma loja virtual.

Além das funcionalidades tradicionais de um catálogo automotivo, o sistema utiliza Inteligência Artificial para responder perguntas utilizando informações recuperadas da base técnica fornecida no desafio.

O VroomAI utiliza busca semântica para localizar os trechos mais relevantes dos documentos técnicos e fornecer essas informações como contexto para geração das respostas.

Dessa forma, o assistente consegue responder perguntas sobre:

- preços;
- consumo;
- autonomia;
- motorização;
- potência;
- câmbio;
- cores disponíveis;
- equipamentos;
- veículos elétricos e híbridos;
- comparação entre modelos;
- custo-benefício;
- características técnicas dos veículos.

Quando uma pergunta é ambígua, o VroomAI ajuda o usuário a escolher o veículo desejado antes de continuar a consulta.

---

## ✨ Funcionalidades

### 🚘 Catálogo de veículos

- Exibição de 15 veículos.
- Busca por modelo, montadora e motor.
- Filtros por características dos veículos.
- Ordenação por relevância e preço.
- Exibição da quantidade de resultados encontrados.
- Cards responsivos com informações principais.
- Navegação para detalhes dos veículos.
- Seleção de veículos para comparação.
- Formulário de interesse comercial.

### 🔎 Detalhes do veículo

- Imagem do veículo.
- Montadora.
- Modelo.
- Ano.
- Categoria.
- Motor.
- Potência.
- Câmbio.
- Consumo ou autonomia.
- Combustível ou tipo de energia.
- Cores disponíveis.
- Itens de série.
- Preço de referência.
- Veículos comparáveis.
- Acesso ao VroomAI.
- Adição do veículo à comparação.
- Registro de interesse comercial.

### ⚖️ Comparação de veículos

- Comparação de até 3 veículos simultaneamente.
- Adição de veículos pelo catálogo.
- Sugestões de veículos quando nenhuma opção está selecionada.
- Animação personalizada na tela vazia.
- Remoção individual de veículos.
- Comparação de:
  - preço;
  - categoria;
  - ano;
  - motor;
  - potência;
  - câmbio;
  - combustível ou energia;
  - consumo ou autonomia;
  - cores;
  - equipamentos;
  - perfil do comprador.
- Destaques automáticos para características relevantes, como menor preço e maior potência.
- Acesso aos detalhes e ao VroomAI diretamente pela comparação.

### 🤖 VroomAI

Assistente inteligente para consulta dos veículos disponíveis no catálogo.

Principais recursos:

- Integração com a API Gemini.
- Geração de embeddings.
- Busca semântica.
- Arquitetura RAG.
- Recuperação de informações da base técnica.
- Respostas contextualizadas.
- Exibição dos veículos relacionados às perguntas.
- Cards de veículos nas respostas.
- Exibição discreta das fontes consultadas.
- Indicação de relevância dos trechos recuperados.
- Tratamento de perguntas ambíguas.
- Sugestão de modelos para o usuário escolher.
- Histórico de conversas salvo no navegador.
- Criação de novas conversas.
- Seleção de conversas anteriores.
- Limpeza do histórico.
- Sugestões de perguntas.
- Chat flutuante disponível durante a navegação.

### 📚 RAG e busca semântica

O sistema utiliza uma arquitetura **Retrieval-Augmented Generation (RAG)**.

O fluxo implementado é:

1. Leitura da base técnica fornecida no desafio.
2. Divisão do conteúdo em chunks.
3. Geração dos embeddings utilizando a API Gemini.
4. Criação e armazenamento do índice vetorial.
5. Geração do embedding da pergunta enviada pelo usuário.
6. Comparação semântica entre a pergunta e os chunks indexados.
7. Recuperação dos trechos mais relevantes.
8. Envio do contexto recuperado para o modelo de IA.
9. Geração da resposta.
10. Exibição das fontes consultadas para o usuário.

Durante os testes, a base técnica utilizada pelo projeto gerou **23 chunks**, com embeddings de **3072 dimensões**.

### 👥 Gestão de leads

- Registro de interesse em veículos.
- Nome do interessado.
- E-mail.
- Telefone.
- Veículo selecionado.
- Mensagem.
- Data de criação.
- Busca de leads por nome, e-mail ou veículo.
- Organização visual dos leads por status durante a sessão.
- Alteração visual do status do lead durante a sessão.
- Exclusão de leads persistidos.
- Atualização da listagem.
- Painel lateral com informações detalhadas do interessado.

### 🌙 Tema claro e escuro

- Alternância entre tema claro e escuro.
- Aplicação do tema nas páginas do sistema.
- Persistência da preferência do usuário no navegador.

### 📱 Responsividade

Interface adaptada para diferentes tamanhos de tela, incluindo desktop, tablet e dispositivos móveis.

---

## 🛠️ Tecnologias utilizadas

### Front-end

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Next.js App Router
- Next/Image
- LocalStorage

### Back-end

- Next.js Route Handlers
- Node.js Runtime
- API REST
- Persistência local em JSON

### Inteligência Artificial

- Google Gemini API
- `gemini-embedding-001`
- `gemini-3.1-flash-lite`
- Embeddings com `RETRIEVAL_DOCUMENT` para indexação.
- Embeddings com `RETRIEVAL_QUERY` para consultas.
- Busca semântica.
- Similaridade vetorial.
- Retrieval-Augmented Generation (RAG).

### Ferramentas

- Git
- GitHub
- GitHub Desktop
- Visual Studio Code
- ESLint

---

## 📁 Estrutura principal do projeto

```text
autostore/
├── data/
│   ├── leads/
│   └── rag/
├── public/
│   ├── images/
│   │   └── CREDITOS_FOTOS.csv
│   ├── carrinho-comparacao.png
│   ├── vroom-ai-icon.png
│   └── vroomly-logo.png
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── carros/
│   │   ├── chat/
│   │   ├── comparar/
│   │   ├── leads/
│   │   └── page.tsx
│   ├── components/
│   ├── data/
│   ├── lib/
│   └── types/
├── .env.example
├── .gitignore
├── next.config.ts
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

---

## ⚙️ Como executar o projeto

### 1. Clonar o repositório

```bash
git clone URL_DO_REPOSITORIO
```

### 2. Entrar na pasta do projeto

```bash
cd autostore
```

### 3. Instalar as dependências

```bash
npm install
```

### 4. Configurar a variável de ambiente

Crie um arquivo `.env.local` na raiz do projeto.

Adicione:

```env
GEMINI_API_KEY=SUA_CHAVE_GEMINI
```

> A chave da API não deve ser enviada para o GitHub.

O arquivo `.env.local` deve permanecer configurado no `.gitignore`.

### 5. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

Acesse a aplicação pelo navegador utilizando o endereço exibido pelo Next.js no terminal. Por padrão, em ambiente local, o endereço utilizado é:

```text
http://localhost:3000
```

---

## 🧠 Como criar o índice vetorial

Antes de utilizar o VroomAI pela primeira vez, é necessário criar o índice vetorial da base técnica.

Com o servidor em execução, utilize uma requisição POST para:

```text
/api/rag/indexar
```

No Windows CMD:

```cmd
curl.exe -X POST http://localhost:3000/api/rag/indexar
```

Quando a indexação for concluída corretamente, a API retornará informações sobre:

- criação do índice vetorial;
- quantidade de chunks;
- dimensões dos embeddings;
- documento utilizado como fonte.

O índice criado será utilizado posteriormente pela busca semântica.

---

## 🔍 Verificar o índice vetorial

Para verificar se o índice está disponível:

```text
GET /api/rag/indexar
```

Com o projeto executando localmente, acesse:

```text
http://localhost:3000/api/rag/indexar
```

A API informará:

- se a chave Gemini está configurada;
- se o índice existe;
- quantidade de chunks disponíveis;
- dimensões dos embeddings.

---

## 🔎 Verificar a busca semântica

Para verificar se a busca semântica está disponível:

```text
GET /api/rag/buscar
```

Exemplo no Windows CMD:

```cmd
curl.exe --get --data-urlencode "pergunta=Qual carro elétrico tem maior autonomia?" http://localhost:3000/api/rag/buscar
```

---

## 💬 Exemplos de perguntas para o VroomAI

```text
Qual carro elétrico tem maior autonomia?
```

```text
Quero saber mais sobre o BYD Seal.
```

```text
Compare o BYD Dolphin e o BYD Seal.
```

```text
Quais SUVs estão disponíveis?
```

```text
Qual veículo tem melhor custo-benefício?
```

```text
Quero saber mais sobre um modelo da BYD.
```

No último exemplo, existe ambiguidade porque há mais de um veículo da BYD no catálogo. Nesse caso, o VroomAI apresenta os modelos disponíveis para o usuário escolher antes de continuar a consulta.

---

## 🔐 Segurança

A chave da API Gemini é armazenada apenas no arquivo local:

```text
.env.local
```

Esse arquivo não deve ser versionado.

Antes de realizar commits, é recomendado verificar:

```bash
git status
```

Também é importante nunca incluir chaves, tokens ou outras credenciais diretamente no código-fonte.

---

## 🧪 Validação do projeto

Para verificar a qualidade do código:

```bash
npm run lint
```

Para validar a compilação de produção:

```bash
npm run build
```

Antes da apresentação, recomenda-se executar o sistema e testar:

- catálogo;
- busca;
- filtros;
- ordenação;
- detalhes dos veículos;
- comparação;
- formulário de interesse;
- criação e exclusão persistente de leads;
- busca e consulta das informações dos leads;
- alteração visual do status dos leads durante a sessão;
- histórico do VroomAI;
- limpeza das conversas;
- chat flutuante;
- tema claro e escuro;
- criação e disponibilidade do índice vetorial;
- busca semântica;
- respostas do VroomAI;
- fontes consultadas;
- tratamento de perguntas ambíguas.

---

## 🎯 Objetivo técnico

O principal objetivo técnico do projeto foi desenvolver uma aplicação completa utilizando Next.js e integrar Inteligência Artificial com uma arquitetura RAG.

A implementação busca demonstrar conhecimentos em:

- desenvolvimento front-end;
- desenvolvimento back-end;
- criação de APIs;
- TypeScript;
- React;
- Next.js;
- manipulação e persistência de dados;
- integração com APIs externas;
- embeddings;
- busca semântica;
- recuperação de contexto;
- engenharia de prompt;
- experiência do usuário;
- Git e GitHub.

---

## 🚧 Decisões de implementação

O projeto foi desenvolvido para execução local durante a avaliação técnica.

Por esse motivo:

- os leads são armazenados localmente em arquivo JSON;
- os status utilizados na interface de gestão de leads são mantidos durante a sessão da página e não são persistidos no arquivo JSON;
- o índice vetorial é criado e armazenado localmente;
- o histórico das conversas é salvo no navegador;
- a chave Gemini é configurada exclusivamente por variável de ambiente.

Em um ambiente de produção, a evolução natural da arquitetura seria utilizar um banco de dados persistente para os leads e seus status, além de uma solução de armazenamento vetorial persistente para os embeddings.

Outra evolução prevista para o projeto é a implementação de um painel administrativo para o CRUD completo dos veículos, permitindo cadastrar, editar e remover veículos com sincronização e reindexação da base utilizada pelo RAG.

---

## 👨‍💻 Autor

**Moisés Ferreira**

Projeto desenvolvido para o desafio técnico AutoStore.

GitHub: `Mif-code`

---

## 📄 Licença

Projeto desenvolvido para fins educacionais e de avaliação técnica.
