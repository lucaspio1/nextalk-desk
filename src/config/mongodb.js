import { MongoClient } from 'mongodb';

/**
 * Configuração do MongoDB
 *
 * Este arquivo gerencia a conexão com o MongoDB rodando no VPS
 */

// Configuração da conexão
const MONGODB_URI = import.meta.env.VITE_MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB_NAME = import.meta.env.VITE_MONGODB_DB_NAME || 'nextalk_desk';
const MONGODB_USER = import.meta.env.VITE_MONGODB_USER;
const MONGODB_PASSWORD = import.meta.env.VITE_MONGODB_PASSWORD;

let client = null;
let db = null;
let isConnected = false;

/**
 * Constrói a URI de conexão com autenticação se necessário
 */
function buildConnectionUri() {
  if (MONGODB_USER && MONGODB_PASSWORD) {
    // Com autenticação
    const encodedUser = encodeURIComponent(MONGODB_USER);
    const encodedPassword = encodeURIComponent(MONGODB_PASSWORD);
    return `mongodb://${encodedUser}:${encodedPassword}@${MONGODB_URI.replace('mongodb://', '')}`;
  }
  return MONGODB_URI;
}

/**
 * Conecta ao MongoDB
 */
export async function connectToMongoDB() {
  if (isConnected && client) {
    return { client, db };
  }

  try {
    const uri = buildConnectionUri();

    client = new MongoClient(uri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    await client.connect();
    db = client.db(MONGODB_DB_NAME);
    isConnected = true;

    console.log('✅ MongoDB conectado com sucesso');
    console.log(`📦 Database: ${MONGODB_DB_NAME}`);

    return { client, db };
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
    isConnected = false;
    throw error;
  }
}

/**
 * Obtém a instância do banco de dados
 */
export function getDB() {
  if (!db) {
    throw new Error('MongoDB não conectado. Chame connectToMongoDB() primeiro.');
  }
  return db;
}

/**
 * Obtém uma coleção específica
 */
export function getCollection(collectionName) {
  const database = getDB();
  return database.collection(collectionName);
}

/**
 * Desconecta do MongoDB
 */
export async function disconnectFromMongoDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    isConnected = false;
    console.log('🔌 MongoDB desconectado');
  }
}

/**
 * Verifica se está conectado
 */
export function isMongoDBConnected() {
  return isConnected;
}

/**
 * Nomes das coleções
 */
export const COLLECTIONS = {
  TICKETS: 'tickets',
  QUICK_RESPONSES: 'quickResponses',
  DEPARTMENTS: 'departments',
  USERS: 'users',
  CONTACTS: 'contacts',
  TAGS: 'tags',
  REASONS: 'reasons',
  SETTINGS: 'settings'
};

// Exporta a configuração para uso no servidor
export const mongoConfig = {
  uri: MONGODB_URI,
  dbName: MONGODB_DB_NAME,
  user: MONGODB_USER,
  password: MONGODB_PASSWORD
};
