# Documentação da API de Celulares

Esta documentação descreve todos os endpoints, formatos de dados, códigos de status HTTP e exemplos práticos para consumo da API REST do **SmartManage — Mini Sistema de Gerenciamento de Celulares**.

---

## Informações Gerais

- **Formato dos Dados**: JSON (`Content-Type: application/json`)
- **URL Base Local**: `http://localhost:3000`
- **URL Base em Produção (Vercel)**: `https://<seu-projeto>.vercel.app`

> **Nota para Produção**: Substitua `http://localhost:3000` pela URL fornecida pela Vercel após o deploy.

---

## Formato Padrão de Resposta de Erro

Em qualquer situação de falha (validação, formato inválido, recurso inexistente ou falha de servidor), a resposta segue o padrão consistente:

```json
{
  "error": true,
  "message": "Descrição amigável do erro."
}
```

---

## Sumário de Endpoints

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api` | Status de saúde da API e catálogo de rotas |
| `GET` | `/api/celulares` | Lista todos os celulares cadastrados |
| `GET` | `/api/celulares/:id` | Obtém os detalhes de um celular por ID |
| `POST` | `/api/celulares` | Cadastra um novo aparelho celular |
| `PUT` | `/api/celulares/:id` | Atualiza os dados de um celular existente |
| `DELETE` | `/api/celulares/:id` | Remove um celular do sistema |

---

## 1. Verificação de Saúde da API

### `GET /api`
Verifica se a API está online e lista os endpoints disponíveis.

#### Exemplo com cURL
```bash
curl -X GET http://localhost:3000/api
```

#### Resposta de Sucesso (`200 OK`)
```json
{
  "status": "ok",
  "message": "API de Gerenciamento de Celulares está online.",
  "version": "1.0.0",
  "endpoints": {
    "listar": "GET /api/celulares",
    "buscarPorId": "GET /api/celulares/:id",
    "criar": "POST /api/celulares",
    "atualizar": "PUT /api/celulares/:id",
    "excluir": "DELETE /api/celulares/:id"
  }
}
```

---

## 2. Listar Celulares

### `GET /api/celulares`
Retorna a lista de todos os celulares cadastrados ordenados decrescentemente pela data de criação.

#### Parâmetros
*Nenhum.*

#### Exemplo com cURL
```bash
curl -X GET http://localhost:3000/api/celulares
```

#### Resposta de Sucesso (`200 OK`)
```json
[
  {
    "_id": "67041a9f8f1b2c0012345678",
    "marca": "Samsung",
    "modelo": "Galaxy S25 Ultra",
    "preco": 6999.90,
    "foto": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500",
    "createdAt": "2026-10-02T14:30:00.000Z",
    "updatedAt": "2026-10-02T14:30:00.000Z"
  }
]
```

#### Possíveis Códigos HTTP
- `200 OK`: Lista retornada com sucesso (array vazio se não houver registros).
- `503 Service Unavailable`: Falha de conexão com o MongoDB.

---

## 3. Buscar Celular por ID

### `GET /api/celulares/:id`
Busca um aparelho específico pelo seu identificador único (`_id`).

#### Parâmetros de URL
- `id` *(string, obrigatório)*: `ObjectId` de 24 caracteres hexadecimais do MongoDB.

#### Exemplo com cURL
```bash
curl -X GET http://localhost:3000/api/celulares/67041a9f8f1b2c0012345678
```

#### Resposta de Sucesso (`200 OK`)
```json
{
  "_id": "67041a9f8f1b2c0012345678",
  "marca": "Samsung",
  "modelo": "Galaxy S25 Ultra",
  "preco": 6999.90,
  "foto": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500",
  "createdAt": "2026-10-02T14:30:00.000Z",
  "updatedAt": "2026-10-02T14:30:00.000Z"
}
```

#### Respostas de Erro
- **`400 Bad Request`** (ID inválido):
```json
{
  "error": true,
  "message": "Identificador inválido."
}
```

- **`404 Not Found`** (ID inexistente):
```json
{
  "error": true,
  "message": "Celular não encontrado."
}
```

---

## 4. Cadastrar Celular

### `POST /api/celulares`
Cria um novo registro de celular.

#### Cabeçalho Obrigatório
`Content-Type: application/json`

#### Corpo da Requisição (Body)
| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `marca` | String | Sim | Marca do aparelho (Ex: Apple, Samsung, Xiaomi) |
| `modelo` | String | Sim | Modelo do aparelho (Ex: iPhone 16 Pro) |
| `preco` | Number | Sim | Valor numérico maior ou igual a 0 |
| `foto` | String | Sim | URL completa da imagem do aparelho |

#### Exemplo de Body
```json
{
  "marca": "Apple",
  "modelo": "iPhone 16 Pro",
  "preco": 8999.90,
  "foto": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500"
}
```

#### Exemplo com cURL
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

#### Resposta de Sucesso (`201 Created`)
```json
{
  "_id": "67041b3a8f1b2c0012345679",
  "marca": "Apple",
  "modelo": "iPhone 16 Pro",
  "preco": 8999.90,
  "foto": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500",
  "createdAt": "2026-10-02T14:35:00.000Z",
  "updatedAt": "2026-10-02T14:35:00.000Z"
}
```

#### Respostas de Erro
- **`400 Bad Request`** (Campos ausentes ou preço negativo):
```json
{
  "error": true,
  "message": "O campo marca é obrigatório e não pode ser vazio."
}
```
- **`400 Bad Request`** (Preço negativo):
```json
{
  "error": true,
  "message": "O preço não pode ser negativo."
}
```

---

## 5. Atualizar Celular

### `PUT /api/celulares/:id`
Atualiza todos os dados de um celular existente pelo seu `id`.

#### Parâmetros de URL
- `id` *(string, obrigatório)*: `ObjectId` do celular a ser editado.

#### Cabeçalho Obrigatório
`Content-Type: application/json`

#### Exemplo com cURL
```bash
curl -X PUT http://localhost:3000/api/celulares/67041b3a8f1b2c0012345679 \
  -H "Content-Type: application/json" \
  -d '{
    "marca": "Apple",
    "modelo": "iPhone 16 Pro Max",
    "preco": 9499.00,
    "foto": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500"
  }'
```

#### Resposta de Sucesso (`200 OK`)
```json
{
  "_id": "67041b3a8f1b2c0012345679",
  "marca": "Apple",
  "modelo": "iPhone 16 Pro Max",
  "preco": 9499.00,
  "foto": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500",
  "createdAt": "2026-10-02T14:35:00.000Z",
  "updatedAt": "2026-10-02T14:40:00.000Z"
}
```

#### Respostas de Erro
- **`400 Bad Request`**: ID inválido ou dados inconsistentes.
- **`404 Not Found`**: Celular não encontrado para o ID informado.

---

## 6. Excluir Celular

### `DELETE /api/celulares/:id`
Exclui definitivamente um aparelho celular pelo seu `id`.

#### Parâmetros de URL
- `id` *(string, obrigatório)*: `ObjectId` do celular a ser excluído.

#### Exemplo com cURL
```bash
curl -X DELETE http://localhost:3000/api/celulares/67041b3a8f1b2c0012345679
```

#### Resposta de Sucesso (`200 OK`)
```json
{
  "error": false,
  "message": "Celular excluído com sucesso.",
  "id": "67041b3a8f1b2c0012345679"
}
```

#### Respostas de Erro
- **`400 Bad Request`**: Identificador inválido.
- **`404 Not Found`**: Celular não encontrado para exclusão.
```json
{
  "error": true,
  "message": "Celular não encontrado para exclusão."
}
```
