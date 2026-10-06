# Roadmap do Projeto — Mini Sistema de Gerenciamento de Celulares

Este documento registra o plano oficial e o acompanhamento de todas as etapas de desenvolvimento do projeto.

---

## Fases de Execução

### Fase 1: Análise e Planejamento
- [x] Analisar requisitos e escopo funcional
- [x] Definir arquitetura de software (Frontend separado + API REST Node.js + MongoDB + Vercel)
- [x] Identificar dependências e estrutura de pastas
- [x] Criar `Roadmap.md` inicial
- [x] Criar `Contexto.md` inicial

### Fase 2: Configuração e Backend
- [x] Inicializar projeto Node.js (`package.json`)
- [x] Instalar dependências essenciais (`express`, `mongoose`, `cors`, `dotenv`)
- [x] Configurar conexão com MongoDB compatível com Vercel (cache de conexão serverless)
- [x] Criar modelo `Celular` com validações (marca, modelo, preço >= 0, foto, timestamps)
- [x] Criar middleware de tratamento consistente de erros (`{ error: true, message: ... }`)
- [x] Implementar rotas e controladores do CRUD:
  - [x] `GET /api/celulares` (Listagem)
  - [x] `GET /api/celulares/:id` (Busca por ID com validação de ObjectId)
  - [x] `POST /api/celulares` (Criação com validação de campos obrigatórios e preço)
  - [x] `PUT /api/celulares/:id` (Atualização com validação)
  - [x] `DELETE /api/celulares/:id` (Exclusão por ID)
- [x] Configurar servidor local e preparar handler para Vercel (`vercel.json`)
- [x] Criar `.env.example`

### Fase 3: Frontend (HTML, CSS, JavaScript Puro)
- [x] Criar `frontend/index.html` com estrutura semântica, acessível e responsiva
- [x] Criar `frontend/css/style.css` com design moderno voltado para smartphones/tecnologia
- [x] Criar `frontend/js/app.js` com manipulação do DOM e consumo exclusivo da API:
  - [x] Listagem de celulares em cards com foto, marca, modelo, preço
  - [x] Modal / Formulário interativo para cadastro e edição
  - [x] Exclusão com confirmação do usuário
  - [x] Estados de carregamento (*skeleton* / *spinner*)
  - [x] Estado vazio quando não houver aparelhos cadastrados
  - [x] Tratamento e fallback para imagens inválidas/quebradas
  - [x] Notificações visuais (*toast*) para sucesso e erro

### Fase 4: Integração Frontend e Backend
- [x] Servir frontend localmente pelo Express para desenvolvimento fácil
- [x] Configurar detecção automática da URL base da API (local vs produção)
- [x] Testar fluxo completo ponta a ponta na interface (Criação, Leitura, Edição e Exclusão)

### Fase 5: Testes Automatizados e Validação
- [x] Configurar suíte de testes automatizados com `supertest` e `node:test`
- [x] Testar endpoints com banco de dados em memória / simulado:
  - [x] Inicialização da API (`GET /api` retorna 200)
  - [x] Conexão e persistência com MongoDB
  - [x] GET listagem e GET por ID
  - [x] POST com dados válidos e com campos ausentes/inválidos
  - [x] PUT com atualização válida e ID inexistente/inválido
  - [x] DELETE com ID existente e inexistente
  - [x] Validação de preço negativo e tipo incorreto
  - [x] Tratamento consistente de erro JSON e rotas desconhecidas
- [x] Executar testes, diagnosticar e corrigir eventuais falhas (17 testes executados com 100% de sucesso)
- [x] Reexecutar testes e garantir estabilidade

### Fase 6: Documentação Completa
- [x] Criar `api.md` com documentação detalhada de cada endpoint, códigos HTTP e exemplos com `curl`
- [x] Criar `README.md` completo com guia de instalação, configuração, testes e deploy na Vercel
- [x] Atualizar `Contexto.md` com o estado final consolidado
- [x] Atualizar `Roadmap.md` marcando todas as tarefas concluídas

### Fase 7: Revisão Final de Qualidade
- [x] Verificar integridade de rotas e respostas HTTP
- [x] Verificar segurança (sem credenciais expostas, sanitização, CORS)
- [x] Verificar responsividade em resoluções mobile, tablet e desktop
- [x] Validar compatibilidade com deploy na Vercel
