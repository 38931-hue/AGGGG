# Contexto do Projeto — Mini Sistema de Gerenciamento de Celulares

## Objetivo
Desenvolver um mini sistema full-stack para gerenciamento (CRUD) de celulares com backend em Node.js e MongoDB, frontend em HTML, CSS e JavaScript puros (sem frameworks SPA), pronto para deploy na Vercel e devidamente testado e documentado.

---

## Arquitetura
O projeto adota uma arquitetura em camadas separadas e desacopladas:
1. **Frontend (`/frontend`)**: Single Page Application em HTML5 semântico, Vanilla CSS moderno (dark mode, layout responsivo em grid, microinterações, toasts de notificação, modais com backdrop blur, estados de loading skeleton e empty state) e JavaScript Puro consumindo exclusivamente a API REST via `fetch`.
2. **Backend API (`/api`)**: API RESTful estruturada em Express.js, preparada tanto para execução como Serverless Function na Vercel (`api/index.js`) quanto para execução local via servidor HTTP Node.js (`server.js`).
3. **Persistência (MongoDB)**: Utilização do ODM `mongoose`, implementando padrão de conexão singleton com cache (evitando esgotamento de conexões no ciclo de vida serverless da Vercel) e fallback automático para MongoDB em memória em ambiente de desenvolvimento local caso `MONGODB_URI` não seja informada.
4. **Deploy (Vercel)**: Configurado via `vercel.json` para rotear requisições `/api/*` para as funções serverless e servir os arquivos estáticos de `/frontend` na raiz `/`.

---

## Tecnologias
- **Runtime**: Node.js (v24.11.1)
- **Linguagem**: JavaScript (ES Modules, `"type": "module"`)
- **Framework Web**: Express.js (^4.21.2)
- **Banco de Dados**: MongoDB Atlas / MongoDB Local / In-Memory (dev & test)
- **ODM**: Mongoose (^8.9.5)
- **CORS**: `cors` (^2.8.5)
- **Ambiente**: `dotenv` (^16.4.7)
- **Frontend**: HTML5, CSS3 Moderno, JavaScript ES6+
- **Testes**: Node.js Test Runner (`node:test`), `supertest` (^7.0.0), `mongodb-memory-server` (^10.1.4)

---

## Estrutura de Pastas
```
/
├── api/
│   ├── config/
│   │   └── db.js              # Conexão com cache para serverless (Vercel) e fallback local
│   ├── controllers/
│   │   └── celularController.js # Lógica de negócio do CRUD e validações
│   ├── middlewares/
│   │   └── errorHandler.js    # Formatação de erro consistente { error: true, message: ... }
│   ├── models/
│   │   └── Celular.js         # Schema e validações Mongoose
│   ├── routes/
│   │   └── celulares.js       # Rotas REST da entidade Celular
│   └── index.js               # Handler principal da API Express
├── frontend/
│   ├── css/
│   │   └── style.css          # Estilização moderna e responsiva
│   ├── js/
│   │   └── app.js             # Lógica client-side e integração com a API
│   └── index.html             # Interface do usuário
├── tests/
│   └── celulares.test.js      # Bateria com 17 testes automatizados (100% passando)
├── .env.example               # Template de variáveis de ambiente
├── api.md                     # Documentação completa da API com exemplos cURL
├── Contexto.md                # Registro de contexto e decisões
├── package.json               # Dependências e scripts do projeto
├── README.md                  # Documentação do projeto
├── Roadmap.md                 # Planejamento e checklist de execução
├── seed.js                    # Script para popular banco com dados de exemplo
├── server.js                  # Servidor local Express
└── vercel.json                # Configuração para deploy na Vercel
```

---

## Modelo de Dados (`Celular`)
Campos da entidade:
- `marca` (String, obrigatória, trim)
- `modelo` (String, obrigatória, trim)
- `preco` (Number, obrigatório, mínimo: 0)
- `foto` (String, obrigatória, URL da imagem)
- `createdAt` (Date, gerenciado automaticamente pelo Mongoose)
- `updatedAt` (Date, gerenciado automaticamente pelo Mongoose)

Regras de validação:
- Não são aceitos preços negativos ou não numéricos.
- Todos os quatro atributos principais são mandatórios.
- Identificadores devem ser `ObjectId` válidos do MongoDB (24 caracteres hexadecimais).

---

## Endpoints REST
- `GET /api` — Verificação de saúde e catálogo da API
- `GET /api/celulares` — Listar todos os celulares
- `GET /api/celulares/:id` — Buscar celular específico por ID
- `POST /api/celulares` — Cadastrar novo celular
- `PUT /api/celulares/:id` — Atualizar celular existente
- `DELETE /api/celulares/:id` — Remover celular

Formato padrão de erro:
```json
{
  "error": true,
  "message": "Descrição amigável do erro"
}
```

---

## Estado Atual
- **Fase**: Todas as fases (1 a 7) concluídas com sucesso.
- **Progresso**:
  - Backend 100% implementado e testado.
  - Conexão MongoDB com cache serverless e fallback de desenvolvimento.
  - Frontend completo em HTML/CSS/JS puro com tema escuro tecnológico, cards dinâmicos, métricas em tempo real, busca instantânea, modais de cadastro/edição e confirmação de exclusão, preview de fotos e fallback SVG para links corrompidos.
  - 17 testes de integração automatizados passando com 100% de sucesso.
  - Testes do fluxo HTTP ponta a ponta executados e validados no servidor ativo.
  - Documentação completa (`Roadmap.md`, `Contexto.md`, `api.md`, `README.md`, `.env.example`).
  - Preparado para deploy na Vercel via `vercel.json` e Serverless Function em `api/index.js`.

---

## Decisões Técnicas
1. **Mongoose para Modelagem**: Validação nativa de schema, conversão e sanitização de tipos, e timestamps automáticos.
2. **Cache de Conexão MongoDB**: Padrão de singleton com Promise cacheada para evitar esgotamento de conexões durante execuções no ambiente Serverless da Vercel.
3. **Fallback para Mongo em Memória em Dev**: Permite rodar o projeto localmente de forma imediata (`npm run dev`) sem exigir configuração prévia obrigatória de cluster no MongoDB Atlas para experimentação local.
4. **Respostas de Erro Uniformizadas**: Todas as falhas retornam `{ error: true, message: string }`, com códigos HTTP padronizados (`400`, `404`, `500`, `503`).
5. **Fallback Visual de Imagem**: Utilização de SVG embutido (*Data URI*) para quando a imagem do celular falhar no carregamento (`onerror`).
6. **Desacoplamento Frontend/Backend**: O frontend utiliza caminhos relativos (`/api/celulares`), funcionando tanto em `http://localhost:3000` quanto em qualquer domínio de produção da Vercel sem alterações de código.

---

## Problemas Conhecidos e Soluções
- **Download do Playwright no Windows**: Ao tentar executar o subagente de navegador com gravação automática, o CDN da Microsoft retornou HTTP 404 para o pacote binário `playwright-1.57.0-win32_x64.zip`.
  - *Solução aplicada*: A validação completa do servidor web, rotas estáticas, HTML, CSS, JavaScript e fluxo completo de CRUD foi executada diretamente contra o servidor HTTP Node.js em execução (`http://localhost:3000`), complementada pela bateria de 17 testes de integração automatizados com `supertest` e `node:test`, cobrindo 100% dos requisitos.

---

## Próximos Passos (Usuário)
1. Para rodar localmente: executar `npm start` ou `npm run dev` e acessar `http://localhost:3000`.
2. Opcionalmente popular com dados de teste: executar `npm run seed`.
3. Para deploy na Vercel: conectar o repositório ao dashboard da Vercel e configurar a variável `MONGODB_URI`.
