/**
 * API SERVER - NexTalk Desk
 *
 * Servidor REST API com Socket.io para tempo real
 * Conecta: MongoDB (dados) + Redis (PubSub para real-time)
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import { createClient } from 'redis';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

const PORT = process.env.VITE_API_PORT || 4000;

// MongoDB Configuration
const MONGODB_URI = process.env.VITE_MONGODB_URI || 'mongodb://172.18.0.2:27017';
const MONGODB_DB_NAME = process.env.VITE_MONGODB_DB_NAME || 'nextalk_desk';
const MONGODB_USER = process.env.VITE_MONGODB_USER;
const MONGODB_PASSWORD = process.env.VITE_MONGODB_PASSWORD;

// Redis Configuration
const REDIS_HOST = process.env.VITE_REDIS_HOST || '172.18.0.5';
const REDIS_PORT = process.env.VITE_REDIS_PORT || 6379;
const REDIS_PASSWORD = process.env.VITE_REDIS_PASSWORD || 'redis_TFxfeP';

// WhatsApp Configuration
const WHATSAPP_TOKEN = process.env.VITE_WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.VITE_WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_API_VERSION = process.env.VITE_WHATSAPP_API_VERSION || 'v24.0';

// Configuração do Microsserviço Pagamento
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://172.18.0.8:4001';
const INTERNAL_SECRET = process.env.INTERNAL_SERVICE_SECRET || 'nextalk_segredo_interno_super_seguro_2025';

let mongoClient = null;
let db = null;
let redisClient = null;
let redisSubscriber = null;

// ===========================================
// CONEXÃO MONGODB
// ===========================================

function buildMongoUri() {
  if (MONGODB_USER && MONGODB_PASSWORD) {
    const encodedUser = encodeURIComponent(MONGODB_USER);
    const encodedPassword = encodeURIComponent(MONGODB_PASSWORD);
    return `mongodb://${encodedUser}:${encodedPassword}@${MONGODB_URI.replace('mongodb://', '')}`;
  }
  return MONGODB_URI;
}

async function connectMongoDB() {
  try {
    const uri = buildMongoUri();
    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
    db = mongoClient.db(MONGODB_DB_NAME);
    console.log('✅ MongoDB conectado');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar MongoDB:', error.message);
    return false;
  }
}

// ===========================================
// CONEXÃO REDIS
// ===========================================

async function connectRedis() {
  try {
    // Cliente para publicar
    redisClient = createClient({
      socket: {
        host: REDIS_HOST,
        port: REDIS_PORT
      },
      password: REDIS_PASSWORD
    });

    // Cliente para subscrever (precisa ser separado)
    redisSubscriber = redisClient.duplicate();

    await redisClient.connect();
    await redisSubscriber.connect();

    console.log('✅ Redis conectado');

    // Escutar eventos do Redis
    await redisSubscriber.subscribe('tickets:updated', (message) => {
      const data = JSON.parse(message);
      console.log('📢 Redis evento:', data.event);

      // Emitir via Socket.io para todos os clientes conectados
      io.emit('ticket:updated', data);
    });

    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar Redis:', error.message);
    return false;
  }
}

// ===========================================
// MIDDLEWARES
// ===========================================

app.use(cors());
app.use(express.json());

// Logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ===========================================
// HELPER FUNCTIONS
// ===========================================

function normalizeDocument(doc) {
  if (!doc) return null;
  return {
    ...doc,
    id: doc._id.toString(),
    _id: undefined
  };
}

function normalizeDocuments(docs) {
  return docs.map(normalizeDocument);
}

/**
 * Normaliza número de telefone brasileiro
 * ⚠️ ATENÇÃO: Desabilitado para evitar conflito de IDs com WhatsApp API
 */
function normalizeBrazilianPhone(phoneNumber) {
  if (!phoneNumber) return phoneNumber;
  // Retorna o número original
  return phoneNumber;

  /* CÓDIGO ANTIGO DESATIVADO:
  // Remove espaços e caracteres especiais
  const cleaned = phoneNumber.replace(/\D/g, '');

  // Verifica se é número brasileiro (começa com 55)
  if (!cleaned.startsWith('55')) {
    return cleaned; // Retorna como está se não for brasileiro
  }

  // Verifica se tem 12 dígitos (55 + 2 DDD + 8 número)
  if (cleaned.length === 12) {
    const ddd = cleaned.substring(2, 4);
    const number = cleaned.substring(4);

    // DDDs válidos no Brasil (11-99)
    const dddNum = parseInt(ddd);
    if (dddNum >= 11 && dddNum <= 99) {
      // Adiciona o 9 na frente do número
      const normalized = `55${ddd}9${number}`;
      console.log(`📞 Número normalizado (API): ${phoneNumber} → ${normalized}`);
      return normalized;
    }
  }

  // Se já tem 13 dígitos ou formato diferente, retorna como está
  return cleaned;
  */
}

// ===========================================
// ROTAS - TICKETS
// ===========================================

// GET /api/tickets - Lista todos os tickets
app.get('/api/tickets', async (req, res) => {
  try {
    const tickets = await db.collection('tickets')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json(normalizeDocuments(tickets));
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Erro ao buscar tickets' });
  }
});

// GET /api/tickets/:id - Busca um ticket específico
app.get('/api/tickets/:id', async (req, res) => {
  try {
    const ticket = await db.collection('tickets')
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    res.json(normalizeDocument(ticket));
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: 'Erro ao buscar ticket' });
  }
});

// POST /api/tickets - Cria novo ticket
app.post('/api/tickets', async (req, res) => {
  try {
    const newTicket = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('tickets').insertOne(newTicket);
    const ticket = { ...newTicket, id: result.insertedId.toString() };

    // Publicar evento no Redis
    if (redisClient) {
      await redisClient.publish('tickets:updated', JSON.stringify({
        event: 'created',
        ticket
      }));
    }

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Erro ao criar ticket' });
  }
});

// PUT /api/tickets/:id - Atualiza ticket
app.put('/api/tickets/:id', async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    // Remove campos undefined
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const result = await db.collection('tickets').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    // Buscar ticket atualizado
    const ticket = await db.collection('tickets')
      .findOne({ _id: new ObjectId(req.params.id) });

    // Publicar evento no Redis
    if (redisClient) {
      await redisClient.publish('tickets:updated', JSON.stringify({
        event: 'updated',
        ticket: normalizeDocument(ticket)
      }));
    }

    res.json(normalizeDocument(ticket));
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Erro ao atualizar ticket' });
  }
});

// POST /api/tickets/:id/messages - Envia mensagem (salva no MongoDB + envia para WhatsApp)
app.post('/api/tickets/:id/messages', async (req, res) => {
  try {
    const { message, customerPhone } = req.body;

    if (!message || !message.text) {
      return res.status(400).json({ error: 'Mensagem inválida' });
    }

    // 1. Buscar ticket atual
    const ticket = await db.collection('tickets')
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    // CORREÇÃO: Usa o número do ticket preferencialmente
    const phoneNumber = ticket.customerPhone || customerPhone;

    // Normalização removida/neutra
    const normalizedPhone = normalizeBrazilianPhone(phoneNumber);

    // 2. Adicionar timestamp à mensagem
    const messageWithTimestamp = {
      ...message,
      timestamp: new Date().getTime()
    };

    // 3. Atualizar MongoDB 
    await db.collection('tickets').updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $push: { messages: messageWithTimestamp },
        $set: {
          updatedAt: new Date(),
          customerPhone: normalizedPhone // Garante número consistente
        }
      }
    );

    // 4. Enviar para WhatsApp (apenas mensagens do agente)
    if (message.sender === 'agent' && WHATSAPP_TOKEN && PHONE_NUMBER_ID && normalizedPhone) {
      try {
        console.log(`📤 Tentando enviar para: ${normalizedPhone}`);

        const whatsappResponse = await fetch(
          `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${PHONE_NUMBER_ID}/messages`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: normalizedPhone,
              type: 'text',
              text: { body: message.text }
            })
          }
        );

        const whatsappData = await whatsappResponse.json();

        if (!whatsappResponse.ok) {
          console.error('❌ Erro detalhado WhatsApp:', JSON.stringify(whatsappData, null, 2));
          console.error(`   Código: ${whatsappData.error?.code}`);
          console.error(`   Tipo: ${whatsappData.error?.type}`);
          console.error(`   Mensagem: ${whatsappData.error?.message}`);
          console.error(`   Fbtrace: ${whatsappData.error?.fbtrace_id}`);

          // Se erro for de janela de 24h, não retornar erro (mensagem foi salva no MongoDB)
          if (whatsappData.error?.code === 131047 || whatsappData.error?.code === 131026) {
            console.warn('⚠️  Erro de janela 24h - Mensagem salva mas não enviada ao WhatsApp');
            // Não retorna erro para não quebrar o fluxo
          } else {
            return res.status(500).json({
              error: 'Erro ao enviar para WhatsApp',
              details: whatsappData
            });
          }
        } else {
          console.log('✅ Mensagem enviada para WhatsApp:', whatsappData.messages[0].id);
        }
      } catch (whatsappError) {
        console.error('❌ Erro ao chamar API do WhatsApp:', whatsappError);
        return res.status(500).json({
          error: 'Erro ao enviar para WhatsApp',
          details: whatsappError.message
        });
      }
    }

    // 5. Buscar ticket atualizado
    const updatedTicket = await db.collection('tickets')
      .findOne({ _id: new ObjectId(req.params.id) });

    // 6. Publicar evento no Redis
    if (redisClient) {
      await redisClient.publish('tickets:updated', JSON.stringify({
        event: 'message_sent',
        ticket: normalizeDocument(updatedTicket)
      }));
    }

    res.json({ success: true, ticket: normalizeDocument(updatedTicket) });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
});

// DELETE /api/tickets/:id - Deleta ticket
app.delete('/api/tickets/:id', async (req, res) => {
  try {
    const result = await db.collection('tickets')
      .deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    // Publicar evento no Redis
    if (redisClient) {
      await redisClient.publish('tickets:updated', JSON.stringify({
        event: 'deleted',
        ticketId: req.params.id
      }));
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ error: 'Erro ao deletar ticket' });
  }
});

// ===========================================
// ROTAS - SETTINGS (Quick Responses, etc)
// ===========================================

// GET /api/quickResponses
app.get('/api/quickResponses', async (req, res) => {
  try {
    const items = await db.collection('quickResponses').find({}).toArray();
    res.json(normalizeDocuments(items));
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar respostas rápidas' });
  }
});

// POST /api/quickResponses
app.post('/api/quickResponses', async (req, res) => {
  try {
    const newItem = { ...req.body, createdAt: new Date(), updatedAt: new Date() };
    const result = await db.collection('quickResponses').insertOne(newItem);
    res.status(201).json({ ...newItem, id: result.insertedId.toString() });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar resposta rápida' });
  }
});

// PUT /api/quickResponses/:id
app.put('/api/quickResponses/:id', async (req, res) => {
  try {
    const updateData = { ...req.body, updatedAt: new Date() };
    await db.collection('quickResponses').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar resposta rápida' });
  }
});

// DELETE /api/quickResponses/:id
app.delete('/api/quickResponses/:id', async (req, res) => {
  try {
    await db.collection('quickResponses').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar resposta rápida' });
  }
});

const collections = ['departments', 'users', 'contacts', 'tags', 'reasons'];

collections.forEach(collectionName => {
  // GET
  app.get(`/api/${collectionName}`, async (req, res) => {
    try {
      const items = await db.collection(collectionName).find({}).toArray();
      res.json(normalizeDocuments(items));
    } catch (error) {
      res.status(500).json({ error: `Erro ao buscar ${collectionName}` });
    }
  });

  // POST
  app.post(`/api/${collectionName}`, async (req, res) => {
    try {
      const newItem = { ...req.body, createdAt: new Date(), updatedAt: new Date() };
      const result = await db.collection(collectionName).insertOne(newItem);
      res.status(201).json({ ...newItem, id: result.insertedId.toString() });
    } catch (error) {
      res.status(500).json({ error: `Erro ao criar ${collectionName}` });
    }
  });

  // PUT
  app.put(`/api/${collectionName}/:id`, async (req, res) => {
    try {
      const updateData = { ...req.body, updatedAt: new Date() };
      await db.collection(collectionName).updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: updateData }
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: `Erro ao atualizar ${collectionName}` });
    }
  });

  // DELETE
  app.delete(`/api/${collectionName}/:id`, async (req, res) => {
    try {
      await db.collection(collectionName).deleteOne({ _id: new ObjectId(req.params.id) });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: `Erro ao deletar ${collectionName}` });
    }
  });
});

// ===========================================
// ROTAS ESPECÍFICAS - CONTACTS
// ===========================================

// GET /api/contacts/:id/conversations - Busca todos os tickets (conversas) de um contato
app.get('/api/contacts/:id/conversations', async (req, res) => {
  try {
    const contact = await db.collection('contacts')
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!contact) {
      return res.status(404).json({ error: 'Contato não encontrado' });
    }

    // Busca tickets pelo telefone do contato
    const tickets = await db.collection('tickets')
      .find({ customerPhone: contact.phone })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(normalizeDocuments(tickets));
  } catch (error) {
    console.error('Error fetching contact conversations:', error);
    res.status(500).json({ error: 'Erro ao buscar conversas do contato' });
  }
});

// GET /api/contacts/:id/activity-logs - Busca logs de atividade do contato
app.get('/api/contacts/:id/activity-logs', async (req, res) => {
  try {
    const contact = await db.collection('contacts')
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!contact) {
      return res.status(404).json({ error: 'Contato não encontrado' });
    }

    // Busca tickets do contato e extrai eventos relevantes
    const tickets = await db.collection('tickets')
      .find({ customerPhone: contact.phone })
      .sort({ createdAt: -1 })
      .toArray();

    // Gera logs de atividade baseado nos tickets
    const activityLogs = [];

    tickets.forEach(ticket => {
      // Log de criação do ticket
      activityLogs.push({
        id: `${ticket._id}_created`,
        type: 'ticket_created',
        description: `Ticket criado: ${ticket.customerName}`,
        timestamp: ticket.createdAt,
        ticketId: ticket._id.toString()
      });

      // Log de início do atendimento
      if (ticket.startedAt) {
        activityLogs.push({
          id: `${ticket._id}_started`,
          type: 'ticket_started',
          description: `Atendimento iniciado por ${ticket.agentId || 'Sistema'}`,
          timestamp: ticket.startedAt,
          ticketId: ticket._id.toString()
        });
      }

      // Log de finalização
      if (ticket.closedAt) {
        activityLogs.push({
          id: `${ticket._id}_closed`,
          type: 'ticket_closed',
          description: 'Ticket finalizado',
          timestamp: ticket.closedAt,
          ticketId: ticket._id.toString()
        });
      }

      // Logs de mensagens do sistema (transferências, etc)
      if (ticket.messages) {
        ticket.messages
          .filter(msg => msg.sender === 'system')
          .forEach((msg, idx) => {
            activityLogs.push({
              id: `${ticket._id}_msg_${idx}`,
              type: 'system_message',
              description: msg.text,
              timestamp: msg.timestamp ? new Date(msg.timestamp) : ticket.updatedAt,
              ticketId: ticket._id.toString()
            });
          });
      }
    });

    // Ordena por timestamp decrescente
    activityLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(activityLogs);
  } catch (error) {
    console.error('Error fetching contact activity logs:', error);
    res.status(500).json({ error: 'Erro ao buscar logs de atividade' });
  }
});

// PUT /api/contacts/:id/block - Bloqueia ou desbloqueia um contato
app.put('/api/contacts/:id/block', async (req, res) => {
  try {
    const { blocked } = req.body;

    if (typeof blocked !== 'boolean') {
      return res.status(400).json({ error: 'Parâmetro "blocked" deve ser boolean' });
    }

    const result = await db.collection('contacts').updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          blocked,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Contato não encontrado' });
    }

    // Buscar contato atualizado
    const contact = await db.collection('contacts')
      .findOne({ _id: new ObjectId(req.params.id) });

    res.json(normalizeDocument(contact));
  } catch (error) {
    console.error('Error blocking/unblocking contact:', error);
    res.status(500).json({ error: 'Erro ao bloquear/desbloquear contato' });
  }
});

// GET /api/settings/general
app.get('/api/settings/general', async (req, res) => {
  try {
    const settings = await db.collection('settings').findOne({ type: 'general' });

    if (!settings) {
      return res.json({
        identifyUser: false,
        hidePhoneNumbers: false,
        hideDispatchedConversations: false,
        inactivityTimeout: 0
      });
    }

    res.json(normalizeDocument(settings));
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar configurações' });
  }
});

// PUT /api/settings/general
app.put('/api/settings/general', async (req, res) => {
  try {
    const settings = await db.collection('settings').findOne({ type: 'general' });

    if (settings) {
      await db.collection('settings').updateOne(
        { type: 'general' },
        { $set: { ...req.body, updatedAt: new Date() } }
      );
    } else {
      await db.collection('settings').insertOne({
        type: 'general',
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar configurações' });
  }
});

// Rota Proxy: Frontend -> Backend (4000) -> Payment Service (4001) -> Asaas
app.post('/api/asaas/create-payment', async (req, res) => {
  try {
    console.log('🔄 Proxy: Iniciando pagamento via serviço seguro...');
    
    // Repassa a requisição para o serviço seguro (porta 4001)
    const response = await fetch(`${PAYMENT_SERVICE_URL}/api/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': INTERNAL_SECRET // Autenticação entre seus serviços
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Erro no serviço de pagamento:', data);
      return res.status(response.status).json({ error: data.error || 'Erro no processamento do pagamento' });
    }

    console.log('✅ Pagamento gerado com sucesso pelo serviço seguro.');
    res.json(data);

  } catch (error) {
    console.error('🚨 Erro crítico na rota proxy de pagamento:', error);
    // Retorna erro amigável para não quebrar o frontend
    res.status(500).json({ error: 'Serviço de pagamento indisponível no momento.' });
  }
});

// ===========================================
// SOCKET.IO
// ===========================================

io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado:', socket.id);

  socket.on('disconnect', () => {
    console.log('🔌 Cliente desconectado:', socket.id);
  });
});

// ===========================================
// HEALTH CHECK
// ===========================================

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    mongodb: !!db,
    redis: redisClient?.isOpen || false,
    uptime: process.uptime()
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'NexTalk Desk API',
    version: '1.0.0',
    status: 'online'
  });
});

// ===========================================
// INICIALIZAÇÃO
// ===========================================

async function start() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   🚀 NEXTALK DESK - API SERVER                        ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // Conectar MongoDB
  const mongoOk = await connectMongoDB();

  // Conectar Redis
  const redisOk = await connectRedis();

  if (!mongoOk) {
    console.error('❌ API não pode iniciar sem MongoDB');
    process.exit(1);
  }

  // Iniciar servidor
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`\n📡 API rodando na porta: ${PORT}`);
    console.log(`🔗 URL: http://0.0.0.0:${PORT}`);
    console.log(`🌐 Externo: https://nextalk-desk-api.vps6622.panel.icontainer.run`);
    console.log(`\n📋 Status:`);
    console.log(`   MongoDB: ${mongoOk ? '✅' : '❌'}`);
    console.log(`   Redis: ${redisOk ? '✅' : '❌'}`);
    console.log(`   Socket.io: ✅`);
    console.log(`\n⏰ Aguardando requisições...\n`);
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando servidor...');

  if (mongoClient) await mongoClient.close();
  if (redisClient) await redisClient.quit();
  if (redisSubscriber) await redisSubscriber.quit();

  process.exit(0);
});

start();