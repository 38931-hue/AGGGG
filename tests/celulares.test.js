import test, { describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../api/index.js';
import Celular from '../api/models/Celular.js';

let mongod;

describe('Suite de Testes da API de Celulares', () => {
  before(async () => {
    // Inicializa MongoDB em memória para testes isolados
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    process.env.MONGODB_URI = uri;

    // Conecta mongoose à instância em memória
    await mongoose.connect(uri);
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
  });

  beforeEach(async () => {
    // Limpa a coleção antes de cada teste
    await Celular.deleteMany({});
  });

  // 1. Verificação de Inicialização da API
  test('1. Deve iniciar a API e responder rota de saúde GET /api com status 200', async () => {
    const res = await request(app).get('/api');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.ok(res.body.endpoints);
  });

  // 2. Conexão com MongoDB
  test('2. Deve confirmar conexão ativa com o banco de dados MongoDB', async () => {
    assert.equal(mongoose.connection.readyState, 1); // 1 = connected
  });

  // 3. POST — Criação com dados válidos
  test('3. POST /api/celulares — Deve cadastrar um celular com sucesso (201)', async () => {
    const novoCelular = {
      marca: 'Samsung',
      modelo: 'Galaxy S25',
      preco: 4999.9,
      foto: 'https://exemplo.com/s25.jpg',
    };

    const res = await request(app)
      .post('/api/celulares')
      .send(novoCelular)
      .set('Content-Type', 'application/json');

    assert.equal(res.status, 201);
    assert.ok(res.body._id);
    assert.equal(res.body.marca, 'Samsung');
    assert.equal(res.body.modelo, 'Galaxy S25');
    assert.equal(res.body.preco, 4999.9);
    assert.equal(res.body.foto, 'https://exemplo.com/s25.jpg');
    assert.ok(res.body.createdAt);
  });

  // 4. Validação de campos obrigatórios
  test('4. POST /api/celulares — Deve rejeitar quando faltar campos obrigatórios (400)', async () => {
    const res = await request(app)
      .post('/api/celulares')
      .send({ marca: 'Motorola' }) // Faltam modelo, preco, foto
      .set('Content-Type', 'application/json');

    assert.equal(res.status, 400);
    assert.equal(res.body.error, true);
    assert.ok(res.body.message.includes('modelo'));
  });

  // 5. Validação de preço negativo e inválido
  test('5. POST /api/celulares — Deve rejeitar preço negativo (400)', async () => {
    const res = await request(app)
      .post('/api/celulares')
      .send({
        marca: 'Xiaomi',
        modelo: 'Redmi Note 14',
        preco: -150.0,
        foto: 'https://exemplo.com/redmi.jpg',
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.error, true);
    assert.ok(res.body.message.includes('negativo'));
  });

  test('5.1 POST /api/celulares — Deve rejeitar preço não numérico (400)', async () => {
    const res = await request(app)
      .post('/api/celulares')
      .send({
        marca: 'Xiaomi',
        modelo: 'Redmi Note 14',
        preco: 'cem-reais',
        foto: 'https://exemplo.com/redmi.jpg',
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.error, true);
  });

  // 6. GET — Listagem de celulares
  test('6. GET /api/celulares — Deve retornar lista vazia inicialmente (200)', async () => {
    const res = await request(app).get('/api/celulares');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.equal(res.body.length, 0);
  });

  test('6.1 GET /api/celulares — Deve retornar array com celulares cadastrados (200)', async () => {
    await Celular.create({
      marca: 'Apple',
      modelo: 'iPhone 16',
      preco: 7299.0,
      foto: 'https://exemplo.com/iphone.jpg',
    });

    const res = await request(app).get('/api/celulares');
    assert.equal(res.status, 200);
    assert.equal(res.body.length, 1);
    assert.equal(res.body[0].marca, 'Apple');
  });

  // 7. GET por ID
  test('7. GET /api/celulares/:id — Deve buscar celular existente por ID (200)', async () => {
    const criado = await Celular.create({
      marca: 'Google',
      modelo: 'Pixel 9',
      preco: 5800.0,
      foto: 'https://exemplo.com/pixel9.jpg',
    });

    const res = await request(app).get(`/api/celulares/${criado._id}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.marca, 'Google');
    assert.equal(res.body.modelo, 'Pixel 9');
  });

  test('7.1 GET /api/celulares/:id — Deve retornar 404 para ID inexistente', async () => {
    const idInexistente = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/celulares/${idInexistente}`);
    assert.equal(res.status, 404);
    assert.equal(res.body.error, true);
    assert.equal(res.body.message, 'Celular não encontrado.');
  });

  test('7.2 GET /api/celulares/:id — Deve retornar 400 para ID com formato inválido', async () => {
    const res = await request(app).get('/api/celulares/id-invalido-123');
    assert.equal(res.status, 400);
    assert.equal(res.body.error, true);
    assert.equal(res.body.message, 'Identificador inválido.');
  });

  // 8. PUT — Atualização
  test('8. PUT /api/celulares/:id — Deve atualizar celular com sucesso (200)', async () => {
    const criado = await Celular.create({
      marca: 'Motorola',
      modelo: 'Edge 50',
      preco: 2999.0,
      foto: 'https://exemplo.com/edge.jpg',
    });

    const res = await request(app)
      .put(`/api/celulares/${criado._id}`)
      .send({
        marca: 'Motorola',
        modelo: 'Edge 50 Ultra',
        preco: 3499.0,
        foto: 'https://exemplo.com/edge-ultra.jpg',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.modelo, 'Edge 50 Ultra');
    assert.equal(res.body.preco, 3499.0);
  });

  test('8.1 PUT /api/celulares/:id — Deve retornar 404 para ID inexistente', async () => {
    const idInexistente = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/celulares/${idInexistente}`)
      .send({
        marca: 'Motorola',
        modelo: 'Edge 50',
        preco: 2999.0,
        foto: 'https://exemplo.com/edge.jpg',
      });

    assert.equal(res.status, 404);
    assert.equal(res.body.error, true);
  });

  // 9. DELETE — Exclusão
  test('9. DELETE /api/celulares/:id — Deve remover celular existente (200)', async () => {
    const criado = await Celular.create({
      marca: 'Asus',
      modelo: 'Zenfone 11',
      preco: 4200.0,
      foto: 'https://exemplo.com/zenfone.jpg',
    });

    const res = await request(app).delete(`/api/celulares/${criado._id}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.error, false);
    assert.equal(res.body.message, 'Celular excluído com sucesso.');

    // Confirma que não existe mais no banco
    const busca = await Celular.findById(criado._id);
    assert.equal(busca, null);
  });

  test('9.1 DELETE /api/celulares/:id — Deve retornar 404 para ID inexistente', async () => {
    const idInexistente = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/api/celulares/${idInexistente}`);
    assert.equal(res.status, 404);
    assert.equal(res.body.error, true);
  });

  // 10. Tratamento de Erros e Rota Inexistente
  test('10. Deve retornar 404 para rota da API inexistente', async () => {
    const res = await request(app).get('/api/rota-desconhecida');
    assert.equal(res.status, 404);
    assert.equal(res.body.error, true);
  });

  test('11. Deve retornar 400 com mensagem apropriada para JSON mal formatado', async () => {
    const res = await request(app)
      .post('/api/celulares')
      .set('Content-Type', 'application/json')
      .send('{ "marca": "Apple", invalid_json }');

    assert.equal(res.status, 400);
    assert.equal(res.body.error, true);
    assert.ok(res.body.message.includes('JSON inválido'));
  });
});
