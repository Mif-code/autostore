# Vroomly AutoStore

Aplicação web desenvolvida para o desafio técnico **AutoStore**, com foco em catálogo automotivo, comparação de veículos, gestão de leads e atendimento inteligente com IA.

O projeto reúne uma experiência completa de loja virtual: catálogo com filtros, página de detalhes, comparação de modelos, formulário de interesse, painel administrativo, páginas institucionais e o **VroomAI**, um assistente integrado à API Gemini e a uma arquitetura RAG (*Retrieval-Augmented Generation*).

---

## Sobre o projeto

O **Vroomly AutoStore** foi criado para facilitar a pesquisa, a comparação e a escolha de veículos em uma plataforma moderna e responsiva.

Além das funcionalidades tradicionais de um catálogo automotivo, o sistema utiliza inteligência artificial para responder perguntas com base nas informações técnicas fornecidas no desafio.

O VroomAI utiliza busca semântica para localizar os trechos mais relevantes da base técnica e enviar esse conteúdo como contexto para a geração das respostas.

O assistente pode responder perguntas sobre:

- preços;
- consumo e autonomia;
- motor, potência e câmbio;
- cores e itens de série;
- veículos elétricos e híbridos;
- comparação entre modelos;
- custo-benefício;
- características técnicas dos veículos disponíveis.

Quando uma pergunta é ampla ou ambígua, o VroomAI apresenta opções para o usuário refinar a busca antes de continuar.

---

## Atualizações recentes

A interface recebeu uma revisão visual e institucional para reforçar a identidade da **Vroomly AutoStore**.

Principais ajustes:

- identidade visual padronizada em tons `slate`;
- nova barra institucional no topo;
- cabeçalho fixo com navegação principal;
- logotipo, ícone e nome Vroomly AutoStore padronizados;
- seção “Sobre nós”;
- formulário demonstrativo de contato;
- seção de localização com mapa ilustrativo;
- endereço e dados de contato fictícios para demonstração;
- rodapé institucional completo;
- links de navegação, redes sociais e formas de pagamento demonstrativas;
- cores padronizadas nos cards, detalhes dos veículos e VroomAI;
- melhoria visual dos botões “Tenho interesse”, comparação e chat;
- histórico do chat com estados visuais consistentes;
- layout responsivo para desktop, tablet e dispositivos móveis.

> As informações institucionais, contatos, endereço, redes sociais e formas de pagamento exibidas na interface são fictícias e utilizadas somente para demonstração acadêmica.

---

## Funcionalidades

### Catálogo de veículos

- Exibição de 15 veículos.
- Veículos de Toyota, Volkswagen, Chevrolet, Hyundai e BYD.
- Busca por modelo, montadora, categoria e motor.
- Filtros por montadora, categoria, combustível e faixa de preço.
- Ordenação por relevância, ano, preço e economia.
- Contador de resultados.
- Cards responsivos com informações principais.
- Visualização das cores disponíveis.
- Seleção de até 3 veículos para comparação.
- Acesso à página de detalhes.
- Formulário “Tenho interesse”.

### Detalhes do veículo

- Imagem principal com efeito de zoom.
- Montadora, modelo, ano e categoria.
- Motor, potência, câmbio e consumo.
- Combustível ou tipo de energia.
- Cores disponíveis.
- Itens de série.
- Preço de referência e valor estimado das parcelas.
- Veículos comparáveis.
- Acesso direto ao VroomAI.
- Adição à comparação.
- Registro de interesse comercial.

### Comparação de veículos

- Comparação de até 3 veículos simultaneamente.
- Adição de veículos pelo catálogo ou página de detalhes.
- Remoção individual.
- Limpeza da seleção.
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
- Destaques automáticos para características relevantes.
- Acesso aos detalhes e ao VroomAI.

### VroomAI

Assistente inteligente para consulta dos veículos disponíveis no catálogo.

Principais recursos:

- integração com a API Gemini;
- geração de embeddings;
- busca semântica;
- arquitetura RAG;
- recuperação de informações da base técnica;
- respostas contextualizadas;
- exibição dos veículos relacionados;
- cards de veículos nas respostas;
- exibição das fontes consultadas;
- indicação de relevância dos trechos;
- tratamento de perguntas ambíguas;
- sugestões de refinamento;
- histórico salvo no navegador;
- criação e seleção de conversas;
- limpeza do histórico;
- sugestões de perguntas;
- saudação automática conforme o horário;
- chat flutuante durante a navegação.

### RAG e busca semântica

Fluxo implementado:

1. Leitura da base técnica em PDF.
2. Divisão do conteúdo em chunks.
3. Geração dos embeddings com a API Gemini.
4. Criação do índice vetorial local.
5. Geração do embedding da pergunta.
6. Cálculo de similaridade entre a consulta e os chunks.
7. Recuperação dos trechos mais relevantes.
8. Envio do contexto para o modelo de IA.
9. Geração da resposta.
10. Exibição das fontes consultadas.

Durante os testes do projeto, a base técnica gerou **23 chunks**, com embeddings de **3072 dimensões**.

### Gestão de leads

- Registro de interesse em veículos.
- Nome, e-mail, telefone, veículo e mensagem.
- Data de criação.
- Busca por nome, e-mail ou veículo.
- Organização visual por status durante a sessão.
- Painel lateral com detalhes do interessado.
- Atualização da listagem.
- Exclusão de leads persistidos.

### Administração de veículos

O projeto possui um painel administrativo em:

```text
/admin/carros
```

Recursos disponíveis:

- cadastro de veículos;
- listagem dos veículos persistidos;
- busca por veículo;
- edição;
- exclusão;
- visualização da página de detalhes;
- persistência em arquivo JSON;
- atualização refletida no catálogo e na página de detalhes.

### Interface institucional

- navegação institucional no topo;
- seção “Sobre nós”;
- formulário de contato demonstrativo;
- localização e mapa ilustrativo;
- dados fictícios de atendimento;
- redes sociais demonstrativas;
- formas de pagamento ilustrativas;
- aviso de projeto acadêmico;
- rodapé institucional responsivo.

### Tema claro e escuro

- alternância entre tema claro e escuro;
- aplicação do tema nas páginas do sistema;
- preferência salva no navegador.

### Responsividade

A interface foi adaptada para desktop, tablet e dispositivos móveis.

---

## Tecnologias utilizadas

### Front-end

- Next.js 16.2.10
- React 19.2.4
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
- Leitura de PDF com `pdf-parse`

### Inteligência Artificial

- Google Gemini API
- `@google/genai`
- `gemini-embedding-001`
- `gemini-3.1-flash-lite`
- Embeddings para documentos e consultas
- Similaridade vetorial
- Busca semântica
- Retrieval-Augmented Generation (RAG)

### Ferramentas

- Git
- GitHub
- GitHub Desktop
- Visual Studio Code
- ESLint

---

## Estrutura principal

```text
autostore/
├── data/
│   ├── carros/
│   ├── leads/
│   └── rag/
├── public/
│   ├── images/
│   ├── assets/
│   ├── vroom-ai-icon.png
│   └── vroomly-logo.png
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   └── carros/
│   │   ├── api/
│   │   ├── carros/
│   │   │   └── [id]/
│   │   ├── chat/
│   │   │   └── new/
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
├── tsconfig.json
└── README.md
```

---

## Como executar

### 1. Clonar o repositório

```bash
git clone https://github.com/Mif-code/autostore.git
```

### 2. Entrar na pasta

```bash
cd autostore
```

### 3. Instalar as dependências

```bash
npm install
```

### 4. Configurar a variável de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
GEMINI_API_KEY=SUA_CHAVE_GEMINI
```

> Nunca envie a chave da API para o GitHub. O arquivo `.env.local` deve permanecer no `.gitignore`.

### 5. Iniciar o projeto

```bash
npm run dev
```

Acesse:

```text
http://localhost:3000
```

---

## Criar o índice vetorial

Antes de utilizar o VroomAI pela primeira vez, gere o índice vetorial:

```bash
curl.exe -X POST http://localhost:3000/api/rag/indexar
```

A resposta informa:

- se a indexação foi concluída;
- quantidade de chunks;
- dimensões dos embeddings;
- documento utilizado como fonte.

### Verificar o índice

```text
GET /api/rag/indexar
```

No navegador:

```text
http://localhost:3000/api/rag/indexar
```

---

## Testar a busca semântica

A rota de busca semântica aceita consultas por `POST`:

```text
POST /api/rag/buscar
```

Exemplo de corpo:

```json
{
  "pergunta": "Qual carro elétrico tem maior autonomia?",
  "quantidadeResultados": 4
}
```

Também é possível consultar o status da busca:

```text
GET /api/rag/buscar
```

---

## Exemplos de perguntas para o VroomAI

```text
Qual carro elétrico tem maior autonomia?

Quero saber mais sobre o BYD Seal.

Compare o BYD Dolphin e o BYD Seal.

Quais SUVs estão disponíveis?

Qual veículo tem melhor custo-benefício?

Quero saber mais sobre um modelo da BYD.
```

No último exemplo, o pedido é ambíguo porque existem vários modelos da BYD. Nesse caso, o VroomAI apresenta as opções disponíveis antes de continuar.

---

## Validação do projeto

Executar o ESLint:

```bash
npm run lint
```

Validar a compilação:

```bash
npm run build
```

Checklist recomendado:

- catálogo;
- busca, filtros e ordenação;
- detalhes dos veículos;
- zoom da imagem;
- comparação;
- formulário de interesse;
- contato e localização;
- painel de leads;
- CRUD de veículos;
- histórico do VroomAI;
- chat flutuante;
- tema claro e escuro;
- índice vetorial;
- busca semântica;
- respostas e fontes do VroomAI;
- responsividade.

---

## Decisões de implementação

O projeto foi desenvolvido para execução local durante a avaliação técnica.

Por esse motivo:

- os leads são armazenados em arquivo JSON;
- os status dos leads são mantidos durante a sessão;
- os veículos administrados são persistidos localmente em JSON;
- o índice vetorial é criado e armazenado localmente;
- o histórico das conversas é salvo no navegador;
- a chave Gemini é configurada por variável de ambiente;
- os dados institucionais e de contato são fictícios.

Em produção, a evolução natural seria utilizar banco de dados, autenticação, armazenamento vetorial persistente, controle de acesso ao painel administrativo e serviços externos para envio de contatos.

---

## Objetivo técnico

O projeto demonstra conhecimentos em:

- desenvolvimento front-end;
- desenvolvimento back-end;
- React e Next.js;
- TypeScript;
- criação de APIs REST;
- persistência e manipulação de dados;
- integração com APIs externas;
- embeddings;
- busca semântica;
- arquitetura RAG;
- engenharia de prompt;
- experiência do usuário;
- responsividade;
- Git e GitHub.

---

## Autor

**Moisés Ferreira**

GitHub: **Mif-code**

Projeto desenvolvido para o desafio técnico AutoStore.

---

## Licença

Projeto desenvolvido para fins educacionais, acadêmicos e de avaliação técnica.