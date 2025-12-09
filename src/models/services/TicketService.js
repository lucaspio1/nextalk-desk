import { db, appId } from '../../config/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { WhatsAppService } from './WhatsAppService';

const collectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'tickets');

export const TicketService = {
  collectionRef,

  async createTicket(ticketData) {
    console.log('[TicketService] Iniciando criação no Firebase...');
    try {
      const docRef = await addDoc(collectionRef, {
        ...ticketData,
        createdAt: serverTimestamp(),
        messages: ticketData.messages.map(m => ({ ...m, timestamp: Date.now() }))
      });
      console.log('[TicketService] Ticket criado com sucesso no Firebase:', docRef.id);
      return docRef;
    } catch (error) {
      console.error('[TicketService] Erro ao criar ticket no Firebase:', error);
      console.error('[TicketService] Detalhes do erro:', {
        code: error.code,
        message: error.message,
        name: error.name
      });
      throw error;
    }
  },

  async updateTicket(ticketId, data) {
    return await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tickets', ticketId), data);
  },

  // Atualizado para receber customerPhone explicitamente
  async sendMessage(ticketId, ticketMessages, newMessage, customerPhone) {
    console.log(`[TicketService] Enviando mensagem. Cliente: ${customerPhone}`);

    try {
        // 1. Salva no Firebase (Atualiza a UI Localmente)
        await this.updateTicket(ticketId, {
          messages: [...ticketMessages, { ...newMessage, timestamp: Date.now() }]
        });
    } catch (e) {
        console.error("[TicketService] Erro ao salvar no Firebase:", e);
        throw e; // Se falhar no banco, nem tenta mandar no zap
    }

    // 2. Envia para o WhatsApp (Meta API)
    // Só envia se for mensagem do agente e tiver telefone
    if (newMessage.sender === 'agent' && customerPhone) {
      // Remove caracteres não numéricos do telefone para evitar erros na API
      const cleanPhone = customerPhone.replace(/\D/g, '');
      await WhatsAppService.sendMessage(cleanPhone, newMessage.text);
    } else if (newMessage.sender === 'agent' && !customerPhone) {
      console.warn("[TicketService] Mensagem salva, mas não enviada ao WhatsApp: Telefone ausente.");
    }
  }
};