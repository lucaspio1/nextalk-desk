import { LocalStorageService } from './LocalStorageService';
import { WhatsAppService } from './WhatsAppService';

const COLLECTION_NAME = 'tickets';

export const TicketService = {
  async createTicket(ticketData) {
    console.log('[TicketService] Criando novo ticket no localStorage...');
    try {
      // Processa mensagens com timestamp
      const processedData = {
        ...ticketData,
        messages: ticketData.messages.map(m => ({
          ...m,
          timestamp: m.timestamp || Date.now()
        })),
        createdAt: new Date().toISOString()
      };

      const docRef = LocalStorageService.addDoc(COLLECTION_NAME, processedData);

      console.log('[TicketService] Ticket criado com sucesso:', docRef.id);

      // Dispara múltiplos eventos para garantir atualização
      window.dispatchEvent(new CustomEvent('ticketsUpdated'));
      window.dispatchEvent(new Event('storage'));

      // Força atualização do estado global
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('ticketsUpdated'));
      }, 100);

      return docRef;
    } catch (error) {
      console.error('[TicketService] Erro ao criar ticket:', error);
      console.error('[TicketService] Detalhes do erro:', {
        message: error.message,
        name: error.name
      });
      throw error;
    }
  },

  async updateTicket(ticketId, data) {
    console.log('[TicketService] Atualizando ticket:', ticketId);
    try {
      LocalStorageService.updateDoc(COLLECTION_NAME, ticketId, data);

      // Dispara evento para atualizar UI
      window.dispatchEvent(new CustomEvent('ticketsUpdated'));

      console.log('[TicketService] Ticket atualizado com sucesso');
    } catch (error) {
      console.error('[TicketService] Erro ao atualizar ticket:', error);
      throw error;
    }
  },

  async sendMessage(ticketId, ticketMessages, newMessage, customerPhone) {
    console.log(`[TicketService] Enviando mensagem. Cliente: ${customerPhone}`);

    try {
      // 1. Salva no localStorage (Atualiza a UI Localmente)
      await this.updateTicket(ticketId, {
        messages: [...ticketMessages, { ...newMessage, timestamp: Date.now() }]
      });
    } catch (e) {
      console.error("[TicketService] Erro ao salvar no localStorage:", e);
      throw e;
    }

    // 2. Envia para o WhatsApp (Meta API)
    // Só envia se for mensagem do agente e tiver telefone
    if (newMessage.sender === 'agent' && customerPhone) {
      const cleanPhone = customerPhone.replace(/\D/g, '');
      await WhatsAppService.sendMessage(cleanPhone, newMessage.text);
    } else if (newMessage.sender === 'agent' && !customerPhone) {
      console.warn("[TicketService] Mensagem salva, mas não enviada ao WhatsApp: Telefone ausente.");
    }
  },

  // Função para obter todos os tickets (usado no hook)
  getTickets() {
    return LocalStorageService.getCollection(COLLECTION_NAME);
  },

  // Função para limpar todos os tickets (útil para debug)
  clearAllTickets() {
    localStorage.removeItem(COLLECTION_NAME);
    window.dispatchEvent(new CustomEvent('ticketsUpdated'));
  }
};
