/**
 * Ticket Service - API Version
 *
 * Este serviço consome a API REST (HTTP) ao invés do MongoDB direto
 * Funciona no browser sem problemas!
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const TicketService = {
  /**
   * Cria um novo ticket
   */
  async createTicket(ticketData) {
    try {
      const response = await fetch(`${API_URL}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
      });

      if (!response.ok) throw new Error('Erro ao criar ticket');

      const ticket = await response.json();
      console.log('✅ Ticket criado:', ticket.id);
      return { id: ticket.id };
    } catch (error) {
      console.error('❌ Erro ao criar ticket:', error);
      throw error;
    }
  },

  /**
   * Atualiza um ticket existente
   */
  async updateTicket(ticketId, data) {
    try {
      const response = await fetch(`${API_URL}/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Erro ao atualizar ticket');

      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar ticket:', error);
      return false;
    }
  },

  /**
   * Envia uma mensagem em um ticket (salva no MongoDB + envia para WhatsApp)
   * CORRIGIDO: Adicionado tratamento para erros de rede/HTML e validação de ID
   */
  async sendMessage(ticketId, currentMessages, newMessage, customerPhone) {
    // 1. Validação de Segurança: Impede envio sem ID
    if (!ticketId) {
      console.error('❌ Erro Crítico: ticketId está vazio ou indefinido ao tentar enviar mensagem.');
      return false;
    }

    try {
      // console.log(`📤 Enviando mensagem para ticket: [${ticketId}]`); 

      const response = await fetch(`${API_URL}/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newMessage,
          customerPhone: customerPhone
        })
      });

      // 2. Tratamento de erro robusto
      if (!response.ok) {
        const responseText = await response.text();
        try {
          // Tenta converter para JSON para ver se é um erro estruturado da API
          const errorData = JSON.parse(responseText);
          console.error('❌ Erro da API:', errorData);
          throw new Error(errorData.error || 'Erro ao enviar mensagem');
        } catch (e) {
          // Se falhar, é porque veio HTML (Erro 404/500 genérico ou rota errada)
          console.error('❌ Erro Crítico do Servidor (HTML retornado):', responseText);
          throw new Error(`Erro no servidor: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log('✅ Mensagem enviada com sucesso');
      return data.success;
    } catch (error) {
      console.error('❌ Falha na requisição sendMessage:', error);
      return false;
    }
  },

  /**
   * Busca todos os tickets
   */
  async getAllTickets() {
    try {
      const response = await fetch(`${API_URL}/tickets`);
      if (!response.ok) throw new Error('Erro ao buscar tickets');
      return await response.json();
    } catch (error) {
      console.error('❌ Erro ao buscar tickets:', error);
      return [];
    }
  },

  /**
   * Busca ticket por ID
   */
  async getTicketById(ticketId) {
    try {
      const response = await fetch(`${API_URL}/tickets/${ticketId}`);
      if (!response.ok) throw new Error('Erro ao buscar ticket');
      return await response.json();
    } catch (error) {
      console.error('❌ Erro ao buscar ticket:', error);
      return null;
    }
  },

  /**
   * Deleta um ticket
   */
  async deleteTicket(ticketId) {
    try {
      const response = await fetch(`${API_URL}/tickets/${ticketId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erro ao deletar ticket');
      return true;
    } catch (error) {
      console.error('❌ Erro ao deletar ticket:', error);
      return false;
    }
  },

  /**
   * Listener para mudanças em tickets (tempo real via Socket.io)
   * Retorna função para cancelar o listener
   */
  listenToTickets(callback) {
    console.log('🔔 Configurando listener para tickets via Socket.io...');

    // Busca inicial
    this.getAllTickets().then(tickets => {
      const sortedTickets = tickets.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : Date.now();
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : Date.now();
        return dateB - dateA;
      });
      callback(sortedTickets);
    });

    // Socket.io listener (pooling fallback) - Reduzido para 2s para melhor UX
    const interval = setInterval(async () => {
      const tickets = await this.getAllTickets();
      const sortedTickets = tickets.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : Date.now();
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : Date.now();
        return dateB - dateA;
      });
      callback(sortedTickets);
    }, 2000);

    // Retorna função para cancelar
    return () => {
      clearInterval(interval);
    };
  }
};