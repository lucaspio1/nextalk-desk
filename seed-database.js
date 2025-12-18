/**
 * SEED DATABASE - NexTalk Desk
 *
 * Script para popular o MongoDB com dados iniciais
 * Execução: node seed-database.js
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.VITE_MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB_NAME = process.env.VITE_MONGODB_DB_NAME || 'nextalk_desk';
const MONGODB_USER = process.env.VITE_MONGODB_USER;
const MONGODB_PASSWORD = process.env.VITE_MONGODB_PASSWORD;

function buildMongoUri() {
  if (MONGODB_USER && MONGODB_PASSWORD) {
    const encodedUser = encodeURIComponent(MONGODB_USER);
    const encodedPassword = encodeURIComponent(MONGODB_PASSWORD);
    return `mongodb://${encodedUser}:${encodedPassword}@${MONGODB_URI.replace('mongodb://', '')}`;
  }
  return MONGODB_URI;
}

// Dados iniciais
const seedData = {
  // Departamentos
  departments: [
    {
      name: 'Suporte Técnico',
      description: 'Atendimento para problemas técnicos e suporte ao cliente',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Vendas',
      description: 'Equipe comercial e vendas',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Financeiro',
      description: 'Dúvidas sobre pagamentos, faturas e cobranças',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Atendimento Geral',
      description: 'Atendimento geral ao cliente',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  // Usuários
  users: [
    {
      name: 'Lucas Pio',
      email: 'admin@nextalk.com',
      password: '123', // Em produção, use hash bcrypt
      role: 'manager',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Atendente 1',
      email: 'agente1@nextalk.com',
      password: '123',
      role: 'agent',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Atendente 2',
      email: 'agente2@nextalk.com',
      password: '123',
      role: 'agent',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  // Etiquetas
  tags: [
    {
      name: 'Urgente',
      color: '#ef4444',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Importante',
      color: '#f59e0b',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Dúvida',
      color: '#3b82f6',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Reclamação',
      color: '#dc2626',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Sugestão',
      color: '#10b981',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Elogio',
      color: '#8b5cf6',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  // Motivos de Finalização
  reasons: [
    {
      name: 'Resolvido',
      description: 'Problema resolvido com sucesso',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Dúvida Esclarecida',
      description: 'Dúvida do cliente foi esclarecida',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Engano',
      description: 'Cliente entrou em contato por engano',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Cliente não respondeu',
      description: 'Cliente não respondeu após tentativas de contato',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Transferido',
      description: 'Ticket transferido para outro departamento',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  // Respostas Rápidas
  quickResponses: [
    {
      title: 'Boas-vindas',
      description: 'Olá! Seja bem-vindo(a) ao NexTalk Desk. Como posso ajudá-lo(a) hoje?',
      type: 'Texto',
      visibility: 'Todos',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Aguarde',
      description: 'Por favor, aguarde um momento enquanto verifico isso para você.',
      type: 'Texto',
      visibility: 'Todos',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Horário de Atendimento',
      description: 'Nosso horário de atendimento é de Segunda a Sexta, das 9h às 18h.',
      type: 'Texto',
      visibility: 'Todos',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Agradecimento',
      description: 'Obrigado por entrar em contato! Estamos sempre à disposição.',
      type: 'Texto',
      visibility: 'Todos',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Despedida',
      description: 'Foi um prazer ajudá-lo(a)! Tenha um ótimo dia!',
      type: 'Texto',
      visibility: 'Todos',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  // Configurações Gerais
  settings: [
    {
      type: 'general',
      identifyUser: false,
      hidePhoneNumbers: false,
      hideDispatchedConversations: false,
      inactivityTimeout: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
};

async function seedDatabase() {
  let client;

  try {
    console.log('🌱 Iniciando seed do banco de dados...');
    console.log(`📦 Conectando ao MongoDB: ${MONGODB_DB_NAME}`);

    const uri = buildMongoUri();
    client = new MongoClient(uri);
    await client.connect();

    const db = client.db(MONGODB_DB_NAME);
    console.log('✅ Conectado ao MongoDB');

    // Verifica se já existem dados
    const existingDepts = await db.collection('departments').countDocuments();
    if (existingDepts > 0) {
      console.log('⚠️  Banco de dados já contém dados. Deseja limpar e reiniciar? (Ctrl+C para cancelar)');

      // Aguarda 3 segundos antes de continuar
      await new Promise(resolve => setTimeout(resolve, 3000));

      console.log('🗑️  Limpando collections existentes...');
      await db.collection('departments').deleteMany({});
      await db.collection('users').deleteMany({});
      await db.collection('tags').deleteMany({});
      await db.collection('reasons').deleteMany({});
      await db.collection('quickResponses').deleteMany({});
      await db.collection('settings').deleteMany({});
      console.log('✅ Collections limpas');
    }

    // Inserir dados
    console.log('\n📝 Inserindo dados iniciais...\n');

    // Departamentos
    const deptResult = await db.collection('departments').insertMany(seedData.departments);
    console.log(`✅ ${deptResult.insertedCount} departamentos inseridos`);

    // Usuários
    const userResult = await db.collection('users').insertMany(seedData.users);
    console.log(`✅ ${userResult.insertedCount} usuários inseridos`);

    // Etiquetas
    const tagResult = await db.collection('tags').insertMany(seedData.tags);
    console.log(`✅ ${tagResult.insertedCount} etiquetas inseridas`);

    // Motivos
    const reasonResult = await db.collection('reasons').insertMany(seedData.reasons);
    console.log(`✅ ${reasonResult.insertedCount} motivos de finalização inseridos`);

    // Respostas Rápidas
    const quickResult = await db.collection('quickResponses').insertMany(seedData.quickResponses);
    console.log(`✅ ${quickResult.insertedCount} respostas rápidas inseridas`);

    // Configurações
    const settingsResult = await db.collection('settings').insertMany(seedData.settings);
    console.log(`✅ ${settingsResult.insertedCount} configurações inseridas`);

    console.log('\n🎉 Seed concluído com sucesso!\n');
    console.log('📊 Resumo:');
    console.log(`   - ${deptResult.insertedCount} departamentos`);
    console.log(`   - ${userResult.insertedCount} usuários`);
    console.log(`   - ${tagResult.insertedCount} etiquetas`);
    console.log(`   - ${reasonResult.insertedCount} motivos de finalização`);
    console.log(`   - ${quickResult.insertedCount} respostas rápidas`);
    console.log(`   - ${settingsResult.insertedCount} configurações`);
    console.log('\n🚀 Você já pode iniciar o servidor com: npm run api\n');

  } catch (error) {
    console.error('❌ Erro ao fazer seed:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Conexão fechada');
    }
  }
}

// Executar seed
seedDatabase();
