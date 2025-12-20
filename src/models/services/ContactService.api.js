/**
 * Contact Service - API Version
 *
 * Serviço para gerenciar contatos via API REST
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const ContactService = {
  // ==========================================
  // CRUD BÁSICO
  // ==========================================

  /**
   * Busca todos os contatos
   */
  async getAllContacts() {
    try {
      const response = await fetch(`${API_URL}/contacts`);
      if (!response.ok) throw new Error('Erro ao buscar contatos');
      return await response.json();
    } catch (error) {
      console.error('Error fetching contacts:', error);
      return [];
    }
  },

  /**
   * Busca contato por ID
   */
  async getContactById(contactId) {
    try {
      const response = await fetch(`${API_URL}/contacts/${contactId}`);
      if (!response.ok) throw new Error('Erro ao buscar contato');
      return await response.json();
    } catch (error) {
      console.error('Error fetching contact:', error);
      return null;
    }
  },

  /**
   * Cria um novo contato
   */
  async createContact(contactData) {
    try {
      const response = await fetch(`${API_URL}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData)
      });

      if (!response.ok) throw new Error('Erro ao criar contato');

      const contact = await response.json();
      console.log('✅ Contato criado:', contact.id);
      return contact;
    } catch (error) {
      console.error('❌ Erro ao criar contato:', error);
      throw error;
    }
  },

  /**
   * Atualiza um contato existente
   */
  async updateContact(contactId, data) {
    try {
      const response = await fetch(`${API_URL}/contacts/${contactId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Erro ao atualizar contato');
      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar contato:', error);
      return false;
    }
  },

  /**
   * Deleta um contato
   */
  async deleteContact(contactId) {
    try {
      const response = await fetch(`${API_URL}/contacts/${contactId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erro ao deletar contato');
      return true;
    } catch (error) {
      console.error('❌ Erro ao deletar contato:', error);
      return false;
    }
  },

  // ==========================================
  // MÉTODOS ESPECÍFICOS
  // ==========================================

  /**
   * Busca todas as conversas (tickets) de um contato
   */
  async getContactConversations(contactId) {
    try {
      const response = await fetch(`${API_URL}/contacts/${contactId}/conversations`);
      if (!response.ok) throw new Error('Erro ao buscar conversas do contato');
      return await response.json();
    } catch (error) {
      console.error('Error fetching contact conversations:', error);
      return [];
    }
  },

  /**
   * Busca logs de atividade de um contato
   */
  async getContactActivityLogs(contactId) {
    try {
      const response = await fetch(`${API_URL}/contacts/${contactId}/activity-logs`);
      if (!response.ok) throw new Error('Erro ao buscar logs de atividade');
      return await response.json();
    } catch (error) {
      console.error('Error fetching contact activity logs:', error);
      return [];
    }
  },

  /**
   * Bloqueia ou desbloqueia um contato
   */
  async blockContact(contactId, blocked) {
    try {
      const response = await fetch(`${API_URL}/contacts/${contactId}/block`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocked })
      });

      if (!response.ok) throw new Error('Erro ao bloquear/desbloquear contato');
      const contact = await response.json();
      console.log(`✅ Contato ${blocked ? 'bloqueado' : 'desbloqueado'}:`, contact.id);
      return contact;
    } catch (error) {
      console.error('❌ Erro ao bloquear/desbloquear contato:', error);
      throw error;
    }
  },

  /**
   * Busca ou cria contato pelo telefone
   * Útil para integração automática com tickets
   */
  async findOrCreateByPhone(phone, defaultData = {}) {
    try {
      // Busca todos os contatos
      const contacts = await this.getAllContacts();

      // Procura contato existente pelo telefone
      const existingContact = contacts.find(c => c.phone === phone);

      if (existingContact) {
        return existingContact;
      }

      // Se não existe, cria um novo
      const newContact = await this.createContact({
        phone,
        name: defaultData.name || `Contato ${phone}`,
        email: defaultData.email || '',
        landline: defaultData.landline || '',
        gender: defaultData.gender || '',
        address: defaultData.address || '',
        complement: defaultData.complement || '',
        avatar: defaultData.avatar || '',
        notes: defaultData.notes || '',
        tags: defaultData.tags || [],
        blocked: false
      });

      return newContact;
    } catch (error) {
      console.error('❌ Erro ao buscar/criar contato:', error);
      throw error;
    }
  },

  /**
   * Listener para mudanças em contatos (polling)
   * Retorna função para cancelar o listener
   */
  listenToContacts(callback) {
    console.log('🔔 Configurando listener para contatos...');

    // Busca inicial
    this.getAllContacts().then(contacts => {
      const sortedContacts = contacts.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : Date.now();
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : Date.now();
        return dateB - dateA;
      });
      callback(sortedContacts);
    });

    // Polling a cada 5 segundos
    const interval = setInterval(async () => {
      const contacts = await this.getAllContacts();
      const sortedContacts = contacts.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : Date.now();
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : Date.now();
        return dateB - dateA;
      });
      callback(sortedContacts);
    }, 5000);

    // Retorna função para cancelar
    return () => {
      clearInterval(interval);
    };
  }
};
