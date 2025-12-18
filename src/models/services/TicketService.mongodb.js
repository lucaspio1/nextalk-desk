/**
 * Ticket Service - MongoDB Version
 *
 * Este serviço gerencia tickets usando MongoDB
 * Mantém a mesma interface do Firebase para compatibilidade
 */

import { DatabaseService, COLLECTIONS } from '../../config/database.js';

export const TicketService = {
  /**
   * Cria um novo ticket
   */
  async createTicket(ticketData) {
    try {
      const ticket = await DatabaseService.create(COLLECTIONS.TICKETS, {
        ...ticketData,
        messages: ticketData.messages.map(m => ({
          ...m,
          timestamp: m.timestamp || Date.now()
        }))
      });

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
      // Tratamento especial para campos de data
      const updateData = { ...data };

      if (data.status === 'closed' && !data.closedAt) {
        updateData.closedAt = new Date();
      }

      if (data.status === 'active' && !updateData.startedAt) {
        updateData.startedAt = new Date();
      }

      const success = await DatabaseService.update(COLLECTIONS.TICKETS, ticketId, updateData);
      return success;
    } catch (error) {
      console.error('❌ Erro ao atualizar ticket:', error);
      return false;
    }
  },

  /**
   * Envia uma mensagem em um ticket
   */
  async sendMessage(ticketId, currentMessages, newMessage) {
    try {
      const messageWithTimestamp = {
        ...newMessage,
        timestamp: Date.now()
      };

      // Atualiza o ticket com a nova mensagem
      const success = await DatabaseService.update(COLLECTIONS.TICKETS, ticketId, {
        messages: [...currentMessages, messageWithTimestamp]
      });

      return success;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      return false;
    }
  },

  /**
   * Busca todos os tickets
   */
  async getAllTickets() {
    try {
      return await DatabaseService.getAll(COLLECTIONS.TICKETS);
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
      return await DatabaseService.getById(COLLECTIONS.TICKETS, ticketId);
    } catch (error) {
      console.error('❌ Erro ao buscar ticket:', error);
      return null;
    }
  },

  /**
   * Busca tickets por status
   */
  async getTicketsByStatus(status) {
    try {
      return await DatabaseService.find(COLLECTIONS.TICKETS, { status });
    } catch (error) {
      console.error('❌ Erro ao buscar tickets por status:', error);
      return [];
    }
  },

  /**
   * Busca tickets por telefone do cliente
   */
  async getTicketsByPhone(phone) {
    try {
      return await DatabaseService.find(
        COLLECTIONS.TICKETS,
        { customerPhone: phone },
        { sort: { createdAt: -1 } }
      );
    } catch (error) {
      console.error('❌ Erro ao buscar tickets por telefone:', error);
      return [];
    }
  },

  /**
   * Busca ticket aberto ou ativo para um telefone
   */
  async getOpenTicketByPhone(phone) {
    try {
      const tickets = await DatabaseService.find(
        COLLECTIONS.TICKETS,
        {
          customerPhone: phone,
          status: { $in: ['open', 'active'] }
        },
        {
          sort: { createdAt: -1 },
          limit: 1
        }
      );

      return tickets.length > 0 ? tickets[0] : null;
    } catch (error) {
      console.error('❌ Erro ao buscar ticket aberto:', error);
      return null;
    }
  },

  /**
   * Listener para mudanças em tickets (tempo real)
   * Retorna função para cancelar o listener
   */
  listenToTickets(callback) {
    try {
      console.log('🔔 Configurando listener para tickets...');

      return DatabaseService.listenToCollection(COLLECTIONS.TICKETS, (tickets) => {
        // Ordena os tickets por data (mais recentes primeiro)
        const sortedTickets = tickets.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : Date.now();
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : Date.now();
          return dateB - dateA;
        });

        callback(sortedTickets);
      });
    } catch (error) {
      console.error('❌ Erro ao configurar listener de tickets:', error);
      // Retorna função vazia em caso de erro
      return () => {};
    }
  },

  /**
   * Listener para um ticket específico
   */
  listenToTicket(ticketId, callback) {
    try {
      return DatabaseService.listenToDocument(COLLECTIONS.TICKETS, ticketId, callback);
    } catch (error) {
      console.error('❌ Erro ao configurar listener de ticket:', error);
      return () => {};
    }
  },

  /**
   * Deleta um ticket
   */
  async deleteTicket(ticketId) {
    try {
      return await DatabaseService.delete(COLLECTIONS.TICKETS, ticketId);
    } catch (error) {
      console.error('❌ Erro ao deletar ticket:', error);
      return false;
    }
  },

  /**
   * Busca estatísticas de tickets
   */
  async getTicketStats() {
    try {
      const allTickets = await this.getAllTickets();

      const stats = {
        total: allTickets.length,
        open: allTickets.filter(t => t.status === 'open').length,
        active: allTickets.filter(t => t.status === 'active').length,
        closed: allTickets.filter(t => t.status === 'closed').length,
        analyzing: allTickets.filter(t => t.status === 'analyzing').length
      };

      return stats;
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      return {
        total: 0,
        open: 0,
        active: 0,
        closed: 0,
        analyzing: 0
      };
    }
  }
};
