import { db, appId } from '../../config/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

const collectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'tickets');

export const TicketService = {
  collectionRef,

  async createTicket(ticketData) {
    return await addDoc(collectionRef, {
      ...ticketData,
      createdAt: serverTimestamp(),
      messages: ticketData.messages.map(m => ({ ...m, timestamp: Date.now() }))
    });
  },

  async updateTicket(ticketId, data) {
    return await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tickets', ticketId), data);
  },

  async sendMessage(ticketId, ticketMessages, newMessage) {
    return await this.updateTicket(ticketId, {
      messages: [...ticketMessages, { ...newMessage, timestamp: Date.now() }]
    });
  }
};
