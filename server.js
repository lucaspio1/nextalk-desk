/**
 * SERVIDOR DE WEBHOOK (Node.js)
 * Este arquivo deve rodar no seu VPS para receber mensagens do WhatsApp.
 * Instale dependências: npm install express body-parser firebase-admin cors
 */
/*
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Importante para permitir chamadas do front
const admin = require('firebase-admin');

// Inicialize o Firebase Admin com sua chave de serviço (baixe do console do Firebase)
// admin.initializeApp({ credential: admin.credential.cert(require('./serviceAccountKey.json')) });
// const db = admin.firestore();

const app = express();
app.use(cors()); // Habilita CORS
app.use(bodyParser.json());

const WEBHOOK_VERIFY_TOKEN = 'nextalk_token_seguro'; // Configure isso no painel da Meta

// Verificação do Webhook (GET)
app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === WEBHOOK_VERIFY_TOKEN) {
    console.log('Webhook verificado!');
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.sendStatus(403);
  }
});

// Recebimento de Mensagens (POST)
app.post('/webhook', async (req, res) => {
  const body = req.body;
  if (body.object === 'whatsapp_business_account') {
    body.entry?.forEach(entry => {
      entry.changes?.forEach(async change => {
        if (change.value.messages) {
          const message = change.value.messages[0];
          const from = message.from; // Número do cliente
          const text = message.text?.body;
          const name = change.value.contacts[0]?.profile?.name || from;
          
          console.log(`Mensagem de ${name} (${from}): ${text}`);
          
          // Lógica simplificada de salvamento (Ideal: procurar ticket aberto ou criar novo)
          // const ticketsRef = db.collection('artifacts').doc('default-app-id').collection('public/data/tickets');
          // ... lógica de busca/criação ...
        }
      });
    });
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.listen(3000, () => console.log('Webhook rodando na porta 3000'));
*/
console.log("Para receber mensagens, configure este servidor com suas credenciais Firebase Admin.");