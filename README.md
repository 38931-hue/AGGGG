# SmartManage — Mini Sistema de Gerenciamento de Celulares 📱

Sistema completo para cadastro, listagem, edição e exclusão (CRUD) de aparelhos celulares. Desenvolvido com arquitetura moderna, desacoplada e pronto para deploy na **Vercel**, utilizando **Node.js** e **MongoDB** no backend, e **HTML5**, **CSS3** e **JavaScript puro (Vanilla)** no frontend.

---

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js** (v20+ / v24+)
- **Express.js** (Framework HTTP para rotas e middlewares REST)
- **MongoDB** (Banco de dados NoSQL)
- **Mongoose** (ODM com validações e esquemas)
- **CORS** (Controle de acesso de origens cruzadas)
- **Dotenv** (Gerenciamento de variáveis de ambiente)

### Frontend
- **HTML5 Semântico** (Acessibilidade, meta tags e formulários)
- **CSS3 Moderno** (Variáveis CSS, Dark Theme com inspiração tech, Grid responsivo, Glassmorphism, Microinterações)
- **JavaScript Puro (ES6+)** (Consumo da API REST via `fetch`, manipulação do DOM, feedback via Toasts e modais)

### Testes & Qualidade
- **Node.js Test Runner** (`node:test`)
- **Supertest** (Testes de integração HTTP)
- **MongoMemoryServer** (Banco MongoDB isolado em memória para testes automatizados)

---

## 📋 Pré-requisitos

Antes de iniciar, certifique-se de possuir instalado em sua máquina:
- **Node.js** (versão 20 ou superior recomendada)
- **NPM** (versão 9 ou superior)
- Conexão com a internet (para dependências e conexão com MongoDB Atlas)
- Cluster no **MongoDB Atlas** (gratuito) ou instância local do MongoDB

---

## 📂 Estrutura de Diretórios

```
/
├── api/
│   ├── config/
│   │   └── db.js                # Conexão com MongoDB com cache para Serverless
│   ├── controllers/
│   │   └── celularController.js # Lógica do CRUD e validações de negócio
│   ├── middlewares/
│   │   └── errorHandler.js      # Tratamento uniforme de erros { error: true, message: ... }
│   ├── models/
│   │   └── Celular.js           # Schema Mongoose com regras de validação
│   ├── routes/
│   │   └── celulares.js         # Definição das rotas REST
│   └── index.js                 # App Express e handler para Vercel
│
├── frontend/
│   ├── css/
│   │   └── style.css            # Estilização completa e responsiva
│   ├── js/
│   │   └── app.js               # Lógica client-side e integração com a API
│   └── index.html               # Interface web do sistema
│
├── tests/
│   └── celulares.test.js        # Bateria de testes automatizados
│
├── .env.example                 # Exemplo de configuração de variáveis
├── api.md                       # Documentação detalhada da API REST
├── Contexto.md                  # Contexto arquitetural e decisões do projeto
├── package.json                 # Dependências e scripts npm
├── README.md                    # Manual completo do projeto
├── Roadmap.md                   # Checklist e progresso de desenvolvimento
├── server.js                    # Servidor local Express
└── vercel.json                  # Configuração de roteamento para a Vercel
```

---

## ⚙️ Instalação e Configuração

### 1. Clonar o repositório ou abrir a pasta do projeto
```bash
cd AG
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:

```bash
cp .env.example .env
```

Edite o `.env` e insira sua string de conexão do MongoDB:
```env
MONGODB_URI=mongodb+srv://<usuario>:<senha>@<cluster>.mongodb.net/celulares_db?retryWrites=true&w=majority
MONGODB_DB=celulares_db
PORT=3000
```

---

## 🍃 Como Configurar o MongoDB (Atlas)

1. Crie uma conta gratuita em [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Crie um novo cluster compartilhado (*Shared / Free M0*).
3. Em **Database Access**, crie um usuário e senha (ex: `admin` / senha segura).
4. Em **Network Access**, adicione o IP `0.0.0.0/0` (permitir acesso de qualquer local, necessário para as funções serverless da Vercel).
5. Em **Database**, clique em **Connect** > **Drivers** e copie a string `mongodb+srv://...`.
6. Substitua `<usuario>` e `<senha>` no arquivo `.env`.

---

## 💻 Execução Local

### Modo de Produção Local
```bash
npm start
```

### Modo de Desenvolvimento (com auto-reload)
```bash
npm run dev
```

Abra seu navegador em:
- **Interface Web**: [http://localhost:3000](http://localhost:3000)
- **API REST**: [http://localhost:3000/api/celulares](http://localhost:3000/api/celulares)
- **Status da API**: [http://localhost:3000/api](http://localhost:3000/api)

---

## 🧪 Testes Automatizados

A aplicação conta com uma suíte de testes de integração cobrindo 100% dos requisitos de negócio e cenários de erro.

Para executar os testes:
```bash
npm test
```

### Cenários validados nos testes:
- [x] Inicialização e verificação de saúde da API (`GET /api`)
- [x] Conexão ativa com o banco de dados
- [x] Listagem geral de celulares (`GET /api/celulares`)
- [x] Busca por ID existente e tratamento de 404 para ID inexistente
- [x] Tratamento de erro 400 para ID com formato inválido
- [x] Cadastro com sucesso (`POST /api/celulares` retornando 201)
- [x] Validação de campos obrigatórios (`marca`, `modelo`, `preco`, `foto`)
- [x] Validação de preço negativo e preço não numérico
- [x] Atualização completa (`PUT /api/celulares/:id`)
- [x] Exclusão (`DELETE /api/celulares/:id`)
- [x] Tratamento de rotas inexistentes

---

## 📡 Documentação Resumida da API

Consulte o arquivo [`api.md`](file:///c:/Users/Aluno/Documents/AG/api.md) para documentação exaustiva com exemplos `curl`.

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api` | Status de integridade da API |
| `GET` | `/api/celulares` | Lista todos os celulares |
| `GET` | `/api/celulares/:id` | Busca celular por ID |
| `POST` | `/api/celulares` | Cadastra novo celular |
| `PUT` | `/api/celulares/:id` | Atualiza celular existente |
| `DELETE` | `/api/celulares/:id` | Exclui celular |

### Exemplo de criação via cURL:
```bash
curl -X POST http://localhost:3000/api/celulares \
  -H "Content-Type: application/json" \
  -d '{
    "marca": "Apple",
    "modelo": "iPhone 16 Pro",
    "preco": 8999.90,
    "foto": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500"
  }'
```

---

## ☁️ Deploy na Vercel

O projeto foi estruturado seguindo as diretrizes oficiais de Serverless Functions da Vercel.

### Passo a passo para o Deploy:

1. Instale a Vercel CLI (opcional) ou conecte via GitHub no dashboard da [Vercel](https://vercel.com):
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Configuração de Variáveis de Ambiente na Vercel**:
   No painel da Vercel (ou durante o CLI), acesse **Project Settings > Environment Variables** e adicione:
   - `MONGODB_URI`: Sua string de conexão do MongoDB Atlas.
   - `MONGODB_DB`: `celulares_db` (opcional).

3. **Como funciona o roteamento**:
   O arquivo `vercel.json` direciona automaticamente:
   - Qualquer requisição `/api/*` para a Serverless Function `api/index.js`.
   - Todas as demais requisições para os arquivos estáticos de `frontend/`.

4. **URL de Produção**:
   Após o deploy, a Vercel gerará um domínio público (ex: `https://meu-sistema-celulares.vercel.app`).
   - O frontend detecta automaticamente a origem relativa e consome a API sem necessidade de reconfiguração de URL!
