import mongoose from 'mongoose';

/**
 * Middleware centralizado de tratamento de erros.
 * Garante que todas as falhas retornem o padrão uniforme:
 * { "error": true, "message": "..." }
 */
export function errorHandler(err, req, res, next) {
  // Trata erro de JSON mal formatado no corpo da requisição (body-parser)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: true,
      message: 'JSON inválido no corpo da requisição.',
    });
  }

  // Trata erro de ID inválido do Mongoose (CastError)
  if (err.name === 'CastError' || err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      error: true,
      message: `Identificador inválido: ${err.value}`,
    });
  }

  // Trata erros de validação do Mongoose
  if (err.name === 'ValidationError' || err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      error: true,
      message: messages.join(' '),
    });
  }

  // Trata erros de conexão com MongoDB
  if (
    err.name === 'MongoServerSelectionError' ||
    err.name === 'MongoNetworkError' ||
    err.message?.includes('MONGODB_URI')
  ) {
    console.error('Erro de conexão com MongoDB:', err.message);
    return res.status(503).json({
      error: true,
      message: 'Não foi possível conectar ao banco de dados. Verifique a configuração.',
    });
  }

  // Erros com status code customizado já definidos
  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode === 500
    ? 'Erro interno do servidor. Tente novamente mais tarde.'
    : (err.message || 'Ocorreu um erro.');

  if (statusCode === 500) {
    console.error('Erro não tratado na API:', err);
  }

  return res.status(statusCode).json({
    error: true,
    message,
  });
}

export default errorHandler;
