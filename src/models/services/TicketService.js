import { db, appId } from '../../config/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp, onSnapshot } from 'firebase/firestore';

// Detecta se está rodando sem configuração real
const IS_DEMO = false;

// --- MOCK LOCAL (SIMULAÇÃO) ---
let mockTickets = [];
let mockListeners = [];

const notifyListeners = () => {
  const docs = mockTickets.map(t => ({ id: t.id, ...t }));
  mockListeners.forEach(cb => cb(docs));
};

const MockService = {
  async createTicket(ticketData) {
    const newTicket = {
      id: Math.random().toString(36).substr(2, 9),
      ...ticketData,
      createdAt: { toMillis: () => Date.now(), seconds: Date.now() / 1000 },
      messages: ticketData.messages.map(m => ({ ...m, timestamp: Date.now() }))
    };
    mockTickets.push(newTicket);
    notifyListeners();
    return { id: newTicket.id };
  },

  async updateTicket(ticketId, data) {
    const index = mockTickets.findIndex(t => t.id === ticketId);
    if (index !== -1) {
      mockTickets[index] = { ...mockTickets[index], ...data };
      if (data.status === 'closed') {
         mockTickets[index].closedAt = { toMillis: () => Date.now(), seconds: Date.now() / 1000 };
      }
      if (data.status === 'active' && !mockTickets[index].startedAt) {
         mockTickets[index].startedAt = { toMillis: () => Date.now(), seconds: Date.now() / 1000 };
      }
      notifyListeners();
    }
    return true;
  },

  async sendMessage(ticketId, ticketMessages, newMessage) {
    const msg = { ...newMessage, timestamp: Date.now() };
    return this.updateTicket(ticketId, {
      messages: [...ticketMessages, msg]
    });
  },

  // Simula o onSnapshot do Firebase
  listen(callback) {
    mockListeners.push(callback);
    // Chama imediatamente com os dados atuais
    callback(mockTickets.map(t => ({ id: t.id, ...t }))); 
    return () => {
      mockListeners = mockListeners.filter(l => l !== callback);
    };
  }
};
// -----------------------------

// Referência real (só usada se não for demo)
const collectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'tickets');

export const TicketService = {
  collectionRef, // Mantém compatibilidade caso precise acessar fora

  async createTicket(ticketData) {
    if (IS_DEMO) return MockService.createTicket(ticketData);
    
    return await addDoc(collectionRef, {
      ...ticketData,
      createdAt: serverTimestamp(),
      messages: ticketData.messages.map(m => ({ ...m, timestamp: Date.now() }))
    });
  },

  async updateTicket(ticketId, data) {
    if (IS_DEMO) return MockService.updateTicket(ticketId, data);

    return await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tickets', ticketId), data);
  },

  async sendMessage(ticketId, ticketMessages, newMessage) {
    if (IS_DEMO) return MockService.sendMessage(ticketId, ticketMessages, newMessage);

    return await this.updateTicket(ticketId, {
      messages: [...ticketMessages, { ...newMessage, timestamp: Date.now() }]
    });
  },

  // Nova função unificada para ouvir alterações (Real ou Mock)
  listenToTickets(callback) {
    if (IS_DEMO) {
      return MockService.listen(callback);
    } else {
      return onSnapshot(collectionRef, (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(docs);
      });
    }
  }
};