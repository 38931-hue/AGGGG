import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import celularesRoutes from './routes/celulares.js';
import { errorHandler } from './middlewares/errorHandler.js';

// Carrega variáveis de ambiente se não estiverem no ambiente global
dotenv.config();

const app = express();

// Configuração de CORS - permite requisições do frontend local e de produção
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Parser de JSON com limite seguro
app.use(express.json({ limit: '1mb' }));

// Rota de status / saúde da API
app.get(['/api', '/api/status'], (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API de Gerenciamento de Celulares está online.',
    version: '1.0.0',
    endpoints: {
      listar: 'GET /api/celulares',
      buscarPorId: 'GET /api/celulares/:id',
      criar: 'POST /api/celulares',
      atualizar: 'PUT /api/celulares/:id',
      excluir: 'DELETE /api/celulares/:id',
    },
  });
});

// Montagem das rotas de Celulares (compatível com ou sem prefixo /api na Vercel)
app.use('/api/celulares', celularesRoutes);
app.use('/celulares', celularesRoutes);

// Tratamento de rotas inexistentes dentro de /api
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: true,
    message: `Endpoint não encontrado: ${req.method} ${req.originalUrl}`,
  });
});

// Middleware global de tratamento de erros
app.use(errorHandler);

export default app;
