/**
 * Inicialização do MongoDB
 *
 * Este arquivo conecta ao MongoDB quando o app inicializar
 */

import { connectToMongoDB } from './config/mongodb.js';

// Conecta ao MongoDB
connectToMongoDB().catch(err => {
  console.error('❌ Erro ao conectar MongoDB:', err);
  console.error('Verifique suas credenciais no arquivo .env');
});
