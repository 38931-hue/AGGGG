import express from 'express';
import { connectDB } from '../config/db.js';
import {
  listarCelulares,
  obterCelularPorId,
  criarCelular,
  atualizarCelular,
  excluirCelular,
} from '../controllers/celularController.js';

const router = express.Router();

/**
 * Middleware para garantir conexão ativa com o MongoDB
 * antes de executar qualquer rota da API
 */
router.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Rotas CRUD da entidade Celular
router.get('/', listarCelulares);
router.get('/:id', obterCelularPorId);
router.post('/', criarCelular);
router.put('/:id', atualizarCelular);
router.delete('/:id', excluirCelular);

export default router;
