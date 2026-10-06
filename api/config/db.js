import mongoose from 'mongoose';

/**
 * Conexão com MongoDB otimizada para Serverless (Vercel) e Servidor Local.
 * Mantém em cache a conexão ativa para reutilização em invocações quentes (warm lambdas),
 * evitando a sobrecarga de abrir novas conexões a cada requisição.
 */

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

let memoryServer = global.__mongoMemoryServer;

export async function connectDB() {
  let uri = process.env.MONGODB_URI;

  // Se nenhuma URI for fornecida e não estiver em produção/Vercel, usa fallback em memória
  if (!uri) {
    const isVercel = Boolean(process.env.VERCEL);
    const isProduction = process.env.NODE_ENV === 'production' || isVercel;

    if (!isProduction) {
      if (!memoryServer) {
        try {
          // Utiliza variável para evitar que o bundler da Vercel rastreie o pacote de dev
          const memPkg = 'mongodb-memory-server';
          const { MongoMemoryServer } = await import(memPkg);
          memoryServer = global.__mongoMemoryServer = await MongoMemoryServer.create();
          uri = memoryServer.getUri();
          process.env.MONGODB_URI = uri;
          console.log('⚡ MongoDB em memória iniciado automaticamente para desenvolvimento local.');
        } catch (memErr) {
          console.error('Falha ao iniciar MongoDB em memória:', memErr.message);
        }
      } else {
        uri = memoryServer.getUri();
      }
    }

    if (!uri) {
      if (isVercel) {
        throw new Error('A variável MONGODB_URI não foi configurada na Vercel. Adicione em Project Settings > Environment Variables.');
      }
      throw new Error('A variável de ambiente MONGODB_URI não foi definida.');
    }
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const isVercel = Boolean(process.env.VERCEL);
    const opts = {
      bufferCommands: false,
      maxPoolSize: isVercel ? 2 : 10,
      serverSelectionTimeoutMS: 5000,
    };

    if (process.env.MONGODB_DB) {
      opts.dbName = process.env.MONGODB_DB;
    }

    cached.promise = mongoose.connect(uri, opts).then(async (mongooseInstance) => {
      // Se estiver rodando com o servidor em memória e ainda não foi populado, insere dados iniciais
      if (memoryServer && !global.__mongoMemoryServerSeeded) {
        global.__mongoMemoryServerSeeded = true;
        try {
          const { default: Celular } = await import('../models/Celular.js');
          const count = await Celular.countDocuments();
          if (count === 0) {
            const { celularesIniciais } = await import('./dadosIniciais.js');
            await Celular.insertMany(celularesIniciais);
            console.log('🌱 Celulares de demonstração carregados com sucesso no banco.');
          }
        } catch (seedErr) {
          console.warn('Aviso ao carregar dados iniciais:', seedErr.message);
        }
      }
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}

export default connectDB;
