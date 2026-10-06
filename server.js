import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import dotenv from 'dotenv';
import app from './api/index.js';
import { connectDB } from './api/config/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

// Servir arquivos estáticos (public tem prioridade para paridade total com a Vercel)
const publicPath = path.join(__dirname, 'public');
const frontendPath = path.join(__dirname, 'frontend');
const staticPath = fs.existsSync(publicPath) ? publicPath : frontendPath;

app.use(express.static(staticPath));
if (fs.existsSync(frontendPath)) {
  app.use('/frontend', express.static(frontendPath));
}
if (fs.existsSync(publicPath)) {
  app.use('/public', express.static(publicPath));
}

// Redireciona qualquer rota web para a interface Single Page
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = fs.existsSync(path.join(publicPath, 'index.html'))
    ? path.join(publicPath, 'index.html')
    : path.join(frontendPath, 'index.html');
  return res.sendFile(indexPath);
});

// Inicialização do servidor HTTP e conexão prévia com o banco
const server = app.listen(PORT, async () => {
  console.log(`===============================================`);
  console.log(`📱 Mini Gerenciamento de Celulares`);
  console.log(`🌐 Servidor rodando em: http://localhost:${PORT}`);
  console.log(`🔌 API REST disponível em: http://localhost:${PORT}/api/celulares`);
  console.log(`===============================================`);

  try {
    await connectDB();
    console.log(`✅ Banco de dados pronto para operações.`);
  } catch (err) {
    console.warn(`⚠️ Aviso de conexão com banco de dados: ${err.message}`);
  }
});

// Encerramento gracioso
process.on('SIGINT', async () => {
  console.log('\nEncerrando servidor...');
  server.close(async () => {
    if (global.__mongoMemoryServer) {
      try {
        await global.__mongoMemoryServer.stop();
      } catch (_) {}
    }
    process.exit(0);
  });
});

