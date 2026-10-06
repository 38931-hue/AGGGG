import mongoose from 'mongoose';
import Celular from '../models/Celular.js';

/**
 * Validação manual prévia para enriquecer mensagens de erro amigáveis
 */
function validarDadosCelular(dados, isUpdate = false) {
  const erros = [];
  const { marca, modelo, preco, foto } = dados;

  if (!isUpdate || marca !== undefined) {
    if (marca === undefined || marca === null || String(marca).trim() === '') {
      erros.push('O campo marca é obrigatório e não pode ser vazio.');
    }
  }

  if (!isUpdate || modelo !== undefined) {
    if (modelo === undefined || modelo === null || String(modelo).trim() === '') {
      erros.push('O campo modelo é obrigatório e não pode ser vazio.');
    }
  }

  if (!isUpdate || preco !== undefined) {
    if (preco === undefined || preco === null || preco === '') {
      erros.push('O campo preço é obrigatório.');
    } else {
      const precoNum = Number(preco);
      if (Number.isNaN(precoNum) || !Number.isFinite(precoNum)) {
        erros.push('O preço deve ser um valor numérico válido.');
      } else if (precoNum < 0) {
        erros.push('O preço não pode ser negativo.');
      }
    }
  }

  if (!isUpdate || foto !== undefined) {
    if (foto === undefined || foto === null || String(foto).trim() === '') {
      erros.push('O campo foto é obrigatório e não pode ser vazio.');
    }
  }

  return erros;
}

/**
 * GET /api/celulares
 * Lista todos os celulares cadastrados
 */
export async function listarCelulares(req, res, next) {
  try {
    const celulares = await Celular.find().sort({ createdAt: -1 });
    return res.status(200).json(celulares);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/celulares/:id
 * Busca celular por ID
 */
export async function obterCelularPorId(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: true,
        message: 'Identificador inválido.',
      });
    }

    const celular = await Celular.findById(id);

    if (!celular) {
      return res.status(404).json({
        error: true,
        message: 'Celular não encontrado.',
      });
    }

    return res.status(200).json(celular);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/celulares
 * Cria um novo celular
 */
export async function criarCelular(req, res, next) {
  try {
    const { marca, modelo, preco, foto } = req.body || {};

    const errosValidacao = validarDadosCelular({ marca, modelo, preco, foto }, false);
    if (errosValidacao.length > 0) {
      return res.status(400).json({
        error: true,
        message: errosValidacao.join(' '),
      });
    }

    const novoCelular = await Celular.create({
      marca: String(marca).trim(),
      modelo: String(modelo).trim(),
      preco: Number(preco),
      foto: String(foto).trim(),
    });

    return res.status(201).json(novoCelular);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/celulares/:id
 * Atualiza os dados de um celular existente
 */
export async function atualizarCelular(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: true,
        message: 'Identificador inválido.',
      });
    }

    const { marca, modelo, preco, foto } = req.body || {};

    const errosValidacao = validarDadosCelular({ marca, modelo, preco, foto }, false);
    if (errosValidacao.length > 0) {
      return res.status(400).json({
        error: true,
        message: errosValidacao.join(' '),
      });
    }

    const celularAtualizado = await Celular.findByIdAndUpdate(
      id,
      {
        marca: String(marca).trim(),
        modelo: String(modelo).trim(),
        preco: Number(preco),
        foto: String(foto).trim(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!celularAtualizado) {
      return res.status(404).json({
        error: true,
        message: 'Celular não encontrado para atualização.',
      });
    }

    return res.status(200).json(celularAtualizado);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/celulares/:id
 * Remove um celular por ID
 */
export async function excluirCelular(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: true,
        message: 'Identificador inválido.',
      });
    }

    const celularRemovido = await Celular.findByIdAndDelete(id);

    if (!celularRemovido) {
      return res.status(404).json({
        error: true,
        message: 'Celular não encontrado para exclusão.',
      });
    }

    return res.status(200).json({
      error: false,
      message: 'Celular excluído com sucesso.',
      id,
    });
  } catch (err) {
    next(err);
  }
}
