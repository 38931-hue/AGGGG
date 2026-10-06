import dotenv from 'dotenv';
import { connectDB } from './api/config/db.js';
import Celular from './api/models/Celular.js';
import { celularesIniciais } from './api/config/dadosIniciais.js';

dotenv.config();

async function seed() {
  try {
    if (!process.env.MONGODB_URI) {
      console.log('⚠️ Variável MONGODB_URI não encontrada no .env.');
      console.log('💡 Para gravar em um banco permanente, defina MONGODB_URI no arquivo .env.');
    }
    console.log('🌱 Conectando ao banco de dados...');
    await connectDB();

    console.log('🧹 Limpando coleção de celulares...');
    await Celular.deleteMany({});

    console.log('📦 Inserindo celulares de demonstração...');
    const inseridos = await Celular.insertMany(celularesIniciais);

    console.log(`✅ ${inseridos.length} celulares cadastrados com sucesso!`);
    inseridos.forEach((c) => {
      console.log(`   - ${c.marca} ${c.modelo} (R$ ${c.preco.toFixed(2)})`);
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Erro ao popular banco:', err);
    process.exit(1);
  }
}

seed();

