/**
 * SERVIDOR DE WEBHOOK PARA WHATSAPP BUSINESS API - MONGODB VERSION
 *
 * Este servidor Node.js recebe mensagens do WhatsApp via webhook da Meta
 * e integra com o MongoDB para criar/atualizar tickets.
 *
 * Requisitos:
 * - Node.js 18+
 * - MongoDB 8.0+
 * - Variáveis de ambiente configuradas (.env)
 *
 * Execução:
 * npm run webhook
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import { createClient } from 'redis';

// Carrega variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.VITE_WEBHOOK_PORT || 3000;
const VERIFY_TOKEN = process.env.VITE_WEBHOOK_VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.VITE_WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.VITE_WHATSAPP_PHONE_NUMBER_ID;

// MongoDB Configuration
const MONGODB_URI = process.env.VITE_MONGODB_URI;
const MONGODB_DB_NAME = process.env.VITE_MONGODB_DB_NAME;
const MONGODB_USER = process.env.VITE_MONGODB_USER;
const MONGODB_PASSWORD = process.env.VITE_MONGODB_PASSWORD;

// Redis Configuration
const REDIS_HOST = process.env.VITE_REDIS_HOST;
const REDIS_PORT = process.env.VITE_REDIS_PORT;
const REDIS_PASSWORD = process.env.VITE_REDIS_PASSWORD;

// ===========================================
// INICIALIZAÇÃO DO MONGODB
// ===========================================

let mongoClient = null;
let db = null;
let mongoInitialized = false;

let redisClient = null;
let redisInitialized = false;

/**
 * Constrói URI de conexão com autenticação
 */
function buildMongoUri() {
  if (MONGODB_USER && MONGODB_PASSWORD) {
    const encodedUser = encodeURIComponent(MONGODB_USER);
    const encodedPassword = encodeURIComponent(MONGODB_PASSWORD);
    return `mongodb://${encodedUser}:${encodedPassword}@${MONGODB_URI.replace('mongodb://', '')}`;
  }
  return MONGODB_URI;
}

/**
 * Conecta ao MongoDB
 */
async function connectMongoDB() {
  try {
    const uri = buildMongoUri();

    mongoClient = new MongoClient(uri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
    });

    await mongoClient.connect();
    db = mongoClient.db(MONGODB_DB_NAME);
    mongoInitialized = true;

    console.log('✅ MongoDB conectado com sucesso');
    console.log(`📦 Database: ${MONGODB_DB_NAME}`);

    // Cria índices para melhor performance
    await createIndexes();
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
    console.warn('⚠️  Webhook funcionará em modo somente-leitura (sem persistência)');
    mongoInitialized = false;
  }
}

/**
 * Cria índices no MongoDB para melhor performance
 */
async function createIndexes() {
  try {
    const ticketsCollection = db.collection('tickets');

    // Índice para busca por telefone e status
    await ticketsCollection.createIndex({ customerPhone: 1, status: 1 });

    // Índice para ordenação por data
    await ticketsCollection.createIndex({ createdAt: -1 });

    console.log('✅ Índices criados com sucesso');
  } catch (error) {
    console.warn('⚠️  Erro ao criar índices:', error.message);
  }
}

/**
 * Conecta ao Redis
 */
async function connectRedis() {
  try {
    redisClient = createClient({
      socket: {
        host: REDIS_HOST,
        port: REDIS_PORT
      },
      password: REDIS_PASSWORD
    });

    await redisClient.connect();
    redisInitialized = true;

    console.log('✅ Redis conectado com sucesso');
    console.log(`📮 Redis: ${REDIS_HOST}:${REDIS_PORT}`);
  } catch (error) {
    console.error('❌ Erro ao conectar ao Redis:', error.message);
    console.warn('⚠️  Eventos em tempo real não funcionarão');
    redisInitialized = false;
  }
}

// Conecta ao MongoDB e Redis na inicialização
connectMongoDB();
connectRedis();

// ===========================================
// MIDDLEWARES
// ===========================================

app.use(cors());
app.use(express.json());

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ===========================================
// FUNÇÕES AUXILIARES
// ===========================================

/**
 * Marca uma mensagem como lida no WhatsApp
 */
async function markMessageAsRead(messageId) {
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    console.warn('⚠️  Token ou Phone Number ID não configurado');
    return false;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId
        })
      }
    );

    if (response.ok) {
      console.log(`✅ Mensagem ${messageId} marcada como lida`);
      return true;
    } else {
      const error = await response.json();
      console.error('❌ Erro ao marcar mensagem como lida:', error);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao marcar mensagem:', error);
    return false;
  }
}

/**
 * Processa o conteúdo da mensagem baseado no tipo
 */
function processMessageContent(message) {
  const messageType = message.type;

  switch (messageType) {
    case 'text':
      return {
        type: 'text',
        content: message.text.body
      };

    case 'image':
      return {
        type: 'image',
        content: message.image.caption || '[Imagem]',
        mediaId: message.image.id,
        mimeType: message.image.mime_type
      };

    case 'document':
      return {
        type: 'document',
        content: message.document.caption || message.document.filename || '[Documento]',
        mediaId: message.document.id,
        filename: message.document.filename,
        mimeType: message.document.mime_type
      };

    case 'audio':
      return {
        type: 'audio',
        content: '[Áudio]',
        mediaId: message.audio.id,
        mimeType: message.audio.mime_type
      };

    case 'video':
      return {
        type: 'video',
        content: message.video.caption || '[Vídeo]',
        mediaId: message.video.id,
        mimeType: message.video.mime_type
      };

    case 'location':
      return {
        type: 'location',
        content: `📍 Localização: ${message.location.latitude}, ${message.location.longitude}`,
        latitude: message.location.latitude,
        longitude: message.location.longitude,
        name: message.location.name,
        address: message.location.address
      };

    case 'contacts':
      return {
        type: 'contacts',
        content: `👤 Contato: ${message.contacts[0]?.name?.formatted_name || 'Sem nome'}`,
        contacts: message.contacts
      };

    default:
      return {
        type: messageType,
        content: `[Mensagem não suportada: ${messageType}]`
      };
  }
}

/**
 * Normaliza número de telefone brasileiro
 * ⚠️ DESATIVADO TEMPORARIAMENTE para evitar conflito de IDs
 * Retorna o número original enviado pela Meta
 */
function normalizeBrazilianPhone(phoneNumber) {
  return phoneNumber;
}

/**
 * Cria ou atualiza um ticket no MongoDB
 */
async function createOrUpdateTicket(phoneNumber, customerName, messageData) {
  if (!mongoInitialized) {
    console.warn('⚠️  MongoDB não inicializado, ticket não será salvo');
    return null;
  }

  // Usa o número original sem normalização forçada
  const normalizedPhone = normalizeBrazilianPhone(phoneNumber);

  try {
    const ticketsCollection = db.collection('tickets');

    // Procura por um ticket aberto ou ativo para este número
    let existingTicket = await ticketsCollection.findOne({
      customerPhone: normalizedPhone,
      status: { $in: ['open', 'active'] }
    }, {
      sort: { createdAt: -1 }
    });

    const messageObj = {
      text: messageData.content,
      sender: 'customer',
      timestamp: Date.now(),
      type: messageData.type || 'text',
      ...(messageData.mediaId && { mediaId: messageData.mediaId }),
      ...(messageData.mimeType && { mimeType: messageData.mimeType })
    };

    if (existingTicket) {
      // Ticket existente - adiciona mensagem
      await ticketsCollection.updateOne(
        { _id: existingTicket._id },
        {
          $push: { messages: messageObj },
          $set: {
            updatedAt: new Date(),
            customerPhone: normalizedPhone // Garante consistência
          }
        }
      );

      console.log(`✅ Mensagem adicionada ao ticket existente: ${existingTicket._id}`);

      // Publica evento no Redis para notificar frontend
      if (redisClient && redisInitialized) {
        try {
          await redisClient.publish('tickets:updated', JSON.stringify({
            event: 'updated',
            ticketId: existingTicket._id.toString(),
            timestamp: Date.now()
          }));
        } catch (error) {
          console.warn('⚠️  Erro ao publicar no Redis:', error.message);
        }
      }

      return existingTicket._id.toString();
    } else {
      // Novo ticket
      const newTicket = {
        customerName: customerName || normalizedPhone,
        customerPhone: normalizedPhone,
        status: 'open',
        agentId: null,
        messages: [messageObj],
        aiCategory: null,
        aiPriority: null,
        notes: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await ticketsCollection.insertOne(newTicket);
      console.log(`✅ Novo ticket criado: ${result.insertedId}`);

      // Publica evento no Redis para notificar frontend
      if (redisClient && redisInitialized) {
        try {
          await redisClient.publish('tickets:updated', JSON.stringify({
            event: 'created',
            ticketId: result.insertedId.toString(),
            timestamp: Date.now()
          }));
        } catch (error) {
          console.warn('⚠️  Erro ao publicar no Redis:', error.message);
        }
      }

      return result.insertedId.toString();
    }
  } catch (error) {
    console.error('❌ Erro ao criar/atualizar ticket:', error);
    return null;
  }
}

// ===========================================
// ROTAS DO WEBHOOK
// ===========================================

/**
 * GET /webhook - Verificação do webhook pela Meta
 */
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verificado pela Meta');
    res.status(200).send(challenge);
  } else {
    console.error('❌ Falha na verificação do webhook');
    res.sendStatus(403);
  }
});

/**
 * POST /webhook - Recebe mensagens e eventos do WhatsApp
 */
app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;

    // Verifica se é um evento do WhatsApp Business
    if (body.object !== 'whatsapp_business_account') {
      console.log('⚠️  Evento não é do WhatsApp Business');
      return res.sendStatus(404);
    }

    // Processa cada entrada
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value;

        // Processa mensagens recebidas
        if (value.messages && value.messages.length > 0) {
          for (const message of value.messages) {
            const messageId = message.id;
            const from = message.from;
            
            // Obtém nome do contato
            const contact = value.contacts?.find(c => c.wa_id === from);
            const customerName = contact?.profile?.name || from;

            console.log(`\n📥 Nova mensagem de ${customerName} (${from})`);
            console.log(`   Tipo: ${message.type}`);
            console.log(`   ID: ${messageId}`);

            // Processa conteúdo da mensagem
            const messageData = processMessageContent(message);
            console.log(`   Conteúdo: ${messageData.content}`);

            // Cria ou atualiza ticket no MongoDB
            await createOrUpdateTicket(from, customerName, messageData);

            // Marca mensagem como lida
            await markMessageAsRead(messageId);
          }
        }

        // Processa status de mensagens enviadas (COM LOGS DE ERRO DETALHADOS)
        if (value.statuses && value.statuses.length > 0) {
          for (const status of value.statuses) {
            console.log(`\n📊 Status de mensagem:`);
            console.log(`   ID: ${status.id}`);
            console.log(`   Status: ${status.status}`);
            console.log(`   Para: ${status.recipient_id}`);

            // Se houver erro, loga os detalhes completos
            if (status.errors) {
              console.error('   ❌ ERRO DETALHADO DO WHATSAPP:');
              status.errors.forEach((err, idx) => {
                console.error(`      Erro #${idx + 1}:`);
                console.error(`      Código: ${err.code}`);
                console.error(`      Título: ${err.title}`);
                console.error(`      Mensagem: ${err.message}`);
                console.error(`      Detalhes Técnicos: ${err.error_data?.details || 'N/A'}`);
                
                // Dicas de debug para erros comuns
                if (err.code === 131047) console.error('      💡 Dica: Janela de 24h fechada. Tente enviar um template.');
                if (err.code === 131026) console.error('      💡 Dica: Erro genérico (número inválido, bloqueio ou falha temporária).');
                if (err.code === 131009) console.error('      💡 Dica: Parâmetro inválido ou tipo de arquivo não suportado.');
              });
            }
          }
        }
      }
    }

    // Responde rapidamente para a Meta
    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    res.sendStatus(500);
  }
});

/**
 * GET / - Health check
 */
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'NexTalk Desk - WhatsApp Webhook (MongoDB)',
    version: '2.1.0 (Debug Enabled)',
    database: mongoInitialized ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /health - Status do servidor
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    mongodb: mongoInitialized,
    environment: {
      hasWebhookToken: !!VERIFY_TOKEN,
      hasWhatsAppToken: !!WHATSAPP_TOKEN,
      hasPhoneNumberId: !!PHONE_NUMBER_ID,
      mongodbUri: MONGODB_URI,
      mongodbDbName: MONGODB_DB_NAME
    }
  });
});

// ===========================================
// INICIALIZAÇÃO DO SERVIDOR
// ===========================================

app.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   🚀 NEXTALK DESK - WEBHOOK SERVER (MONGODB + DEBUG)  ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  console.log(`📡 Servidor rodando na porta: ${PORT}`);
  console.log(`🔗 URL do webhook: http://localhost:${PORT}/webhook`);
  console.log(`🔐 Verify Token: ${VERIFY_TOKEN}`);
  console.log(`\n📋 Status da configuração:`);
  console.log(`   MongoDB: ${mongoInitialized ? '✅ Conectado' : '❌ Não configurado'}`);
  console.log(`   Redis: ${redisInitialized ? '✅ Conectado' : '❌ Não configurado'}`);
  console.log(`   WhatsApp Token: ${WHATSAPP_TOKEN ? '✅ Configurado' : '❌ Não configurado'}`);
  console.log(`   Phone Number ID: ${PHONE_NUMBER_ID ? '✅ Configurado' : '❌ Não configurado'}`);
  console.log(`\n💡 Dicas:`);
  console.log(`   - Para expor localmente: use ngrok (ngrok http ${PORT})`);
  console.log(`   - Configure o webhook URL na Meta: https://developers.facebook.com`);
  console.log(`   - Verifique logs em tempo real para debug de erros`);
  console.log(`\n⏰ Aguardando mensagens...\n`);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (error) => {
  console.error('❌ Erro não tratado:', error);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Exceção não capturada:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando servidor...');
  if (mongoClient) {
    await mongoClient.close();
    console.log('🔌 MongoDB desconectado');
  }
  if (redisClient) {
    await redisClient.quit();
    console.log('🔌 Redis desconectado');
  }
  process.exit(0);
});