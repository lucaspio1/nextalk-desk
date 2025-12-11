/**
 * SERVIDOR DE WEBHOOK PARA WHATSAPP BUSINESS API
 *
 * Este servidor Node.js recebe mensagens do WhatsApp via webhook da Meta
 * e integra com o Firebase Firestore para criar/atualizar tickets.
 *
 * Requisitos:
 * - Node.js 18+
 * - Firebase Admin SDK configurado
 * - Certificado de service account do Firebase
 * - Variáveis de ambiente configuradas (.env)
 *
 * Execução:
 * npm run webhook
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Carrega variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.VITE_WEBHOOK_PORT || 3000;
const VERIFY_TOKEN = process.env.VITE_WEBHOOK_VERIFY_TOKEN || 'nextalk_webhook_2024';
const WHATSAPP_TOKEN = process.env.VITE_WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.VITE_WHATSAPP_PHONE_NUMBER_ID;

// ===========================================
// INICIALIZAÇÃO DO FIREBASE ADMIN
// ===========================================

let db;
let firebaseInitialized = false;

try {
  // Tenta carregar o arquivo de credenciais do Firebase
  // Você deve baixar este arquivo do Firebase Console:
  // Configurações do Projeto > Contas de Serviço > Gerar nova chave privada
  const serviceAccount = JSON.parse(
    readFileSync('./firebase-service-account.json', 'utf8')
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  db = admin.firestore();
  firebaseInitialized = true;
  console.log('✅ Firebase Admin inicializado com sucesso');
} catch (error) {
  console.warn('⚠️  Firebase Admin não inicializado:', error.message);
  console.warn('⚠️  Webhook funcionará em modo somente-leitura (sem persistência)');
  console.warn('⚠️  Para habilitar persistência, configure firebase-service-account.json');
}

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
 * Cria ou atualiza um ticket no Firestore
 */
async function createOrUpdateTicket(phoneNumber, customerName, messageData) {
  if (!firebaseInitialized) {
    console.warn('⚠️  Firebase não inicializado, ticket não será salvo');
    return null;
  }

  try {
    const appId = 'default-app-id'; // Ou use uma variável de ambiente
    const ticketsRef = db.collection(`artifacts/${appId}/public/data/tickets`);

    // Procura por um ticket aberto ou ativo para este número
    const existingTickets = await ticketsRef
      .where('customerPhone', '==', phoneNumber)
      .where('status', 'in', ['open', 'active'])
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    const messageObj = {
      text: messageData.content,
      sender: 'customer',
      timestamp: Date.now(),
      type: messageData.type || 'text',
      ...(messageData.mediaId && { mediaId: messageData.mediaId }),
      ...(messageData.mimeType && { mimeType: messageData.mimeType })
    };

    if (!existingTickets.empty) {
      // Ticket existente - adiciona mensagem
      const ticketDoc = existingTickets.docs[0];
      const ticketData = ticketDoc.data();

      await ticketDoc.ref.update({
        messages: admin.firestore.FieldValue.arrayUnion(messageObj),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`✅ Mensagem adicionada ao ticket existente: ${ticketDoc.id}`);
      return ticketDoc.id;
    } else {
      // Novo ticket
      const newTicket = {
        customerName: customerName || phoneNumber,
        customerPhone: phoneNumber,
        status: 'open',
        agentId: null,
        messages: [messageObj],
        aiCategory: null,
        aiPriority: null,
        notes: '',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await ticketsRef.add(newTicket);
      console.log(`✅ Novo ticket criado: ${docRef.id}`);
      return docRef.id;
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
 * A Meta faz uma requisição GET para verificar se o webhook está configurado corretamente
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

    // Processa cada entrada (normalmente só há uma)
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value;

        // Processa mensagens recebidas
        if (value.messages && value.messages.length > 0) {
          for (const message of value.messages) {
            const messageId = message.id;
            const from = message.from; // Número do cliente
            const timestamp = message.timestamp;

            // Obtém nome do contato
            const contact = value.contacts?.find(c => c.wa_id === from);
            const customerName = contact?.profile?.name || from;

            console.log(`\n📥 Nova mensagem de ${customerName} (${from})`);
            console.log(`   Tipo: ${message.type}`);
            console.log(`   ID: ${messageId}`);

            // Processa conteúdo da mensagem
            const messageData = processMessageContent(message);
            console.log(`   Conteúdo: ${messageData.content}`);

            // Cria ou atualiza ticket no Firestore
            await createOrUpdateTicket(from, customerName, messageData);

            // Marca mensagem como lida
            await markMessageAsRead(messageId);
          }
        }

        // Processa status de mensagens enviadas
        if (value.statuses && value.statuses.length > 0) {
          for (const status of value.statuses) {
            console.log(`\n📊 Status de mensagem:`);
            console.log(`   ID: ${status.id}`);
            console.log(`   Status: ${status.status}`);
            console.log(`   Para: ${status.recipient_id}`);
          }
        }
      }
    }

    // Responde rapidamente para a Meta (importante!)
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
    service: 'NexTalk Desk - WhatsApp Webhook',
    version: '1.0.0',
    firebase: firebaseInitialized ? 'connected' : 'disconnected',
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
    firebase: firebaseInitialized,
    environment: {
      hasWebhookToken: !!VERIFY_TOKEN,
      hasWhatsAppToken: !!WHATSAPP_TOKEN,
      hasPhoneNumberId: !!PHONE_NUMBER_ID
    }
  });
});

// ===========================================
// INICIALIZAÇÃO DO SERVIDOR
// ===========================================

app.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   🚀 NEXTALK DESK - WEBHOOK SERVER INICIADO           ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  console.log(`📡 Servidor rodando na porta: ${PORT}`);
  console.log(`🔗 URL do webhook: http://localhost:${PORT}/webhook`);
  console.log(`🔐 Verify Token: ${VERIFY_TOKEN}`);
  console.log(`\n📋 Status da configuração:`);
  console.log(`   Firebase: ${firebaseInitialized ? '✅ Conectado' : '❌ Não configurado'}`);
  console.log(`   WhatsApp Token: ${WHATSAPP_TOKEN ? '✅ Configurado' : '❌ Não configurado'}`);
  console.log(`   Phone Number ID: ${PHONE_NUMBER_ID ? '✅ Configurado' : '❌ Não configurado'}`);
  console.log(`\n💡 Dicas:`);
  console.log(`   - Para expor localmente: use ngrok (ngrok http ${PORT})`);
  console.log(`   - Configure o webhook URL na Meta: https://developers.facebook.com`);
  console.log(`   - Verifique logs em tempo real para debug`);
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
