import mongoose from 'mongoose';

const CelularSchema = new mongoose.Schema(
  {
    marca: {
      type: String,
      required: [true, 'O campo marca é obrigatório.'],
      trim: true,
      minlength: [1, 'O campo marca não pode ficar vazio.'],
    },
    modelo: {
      type: String,
      required: [true, 'O campo modelo é obrigatório.'],
      trim: true,
      minlength: [1, 'O campo modelo não pode ficar vazio.'],
    },
    preco: {
      type: Number,
      required: [true, 'O campo preço é obrigatório.'],
      min: [0, 'O preço não pode ser negativo.'],
      validate: {
        validator: (val) => !Number.isNaN(val) && Number.isFinite(val),
        message: 'O preço deve ser um valor numérico válido.',
      },
    },
    foto: {
      type: String,
      required: [true, 'O campo foto é obrigatório.'],
      trim: true,
      minlength: [1, 'A URL da foto não pode ficar vazia.'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Evita recriação do modelo durante hot reload e re-execuções
const Celular = mongoose.models.Celular || mongoose.model('Celular', CelularSchema);

export default Celular;
