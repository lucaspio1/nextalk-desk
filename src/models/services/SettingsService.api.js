/**
 * Settings Service - API Version
 *
 * Este serviço consome a API REST (HTTP) ao invés do MongoDB direto
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const SettingsService = {
  // ==========================================
  // GENERAL SETTINGS
  // ==========================================

  async getGeneralSettings() {
    try {
      const response = await fetch(`${API_URL}/settings/general`);
      if (!response.ok) throw new Error('Erro ao buscar configurações');
      return await response.json();
    } catch (error) {
      console.error('Error fetching general settings:', error);
      return {
        identifyUser: false,
        hidePhoneNumbers: false,
        hideDispatchedConversations: false,
        inactivityTimeout: 0
      };
    }
  },

  async updateGeneralSettings(settings) {
    try {
      const response = await fetch(`${API_URL}/settings/general`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      return response.ok;
    } catch (error) {
      console.error('Error updating general settings:', error);
      return false;
    }
  },

  listenToGeneralSettings(callback) {
    // Busca inicial
    this.getGeneralSettings().then(callback);

    // Pooling a cada 5 segundos (reduzido de 10s)
    const interval = setInterval(async () => {
      const settings = await this.getGeneralSettings();
      callback(settings);
    }, 5000);

    return () => clearInterval(interval);
  },

  // ==========================================
  // QUICK RESPONSES
  // ==========================================

  async getQuickResponses() {
    try {
      const response = await fetch(`${API_URL}/quickResponses`);
      return response.ok ? await response.json() : [];
    } catch (error) {
      console.error('Error fetching quick responses:', error);
      return [];
    }
  },

  async createQuickResponse(data) {
    try {
      const response = await fetch(`${API_URL}/quickResponses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      return result.id;
    } catch (error) {
      console.error('Error creating quick response:', error);
      return null;
    }
  },

  async updateQuickResponse(id, data) {
    try {
      const response = await fetch(`${API_URL}/quickResponses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.ok;
    } catch (error) {
      console.error('Error updating quick response:', error);
      return false;
    }
  },

  async deleteQuickResponse(id) {
    try {
      const response = await fetch(`${API_URL}/quickResponses/${id}`, {
        method: 'DELETE'
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting quick response:', error);
      return false;
    }
  },

  listenToQuickResponses(callback) {
    this.getQuickResponses().then(callback);
    const interval = setInterval(async () => {
      callback(await this.getQuickResponses());
    }, 5000);
    return () => clearInterval(interval);
  },

  // ==========================================
  // DEPARTMENTS, USERS, CONTACTS, TAGS, REASONS
  // (Mesma estrutura)
  // ==========================================

  // Helper genérico
  _createCRUD(collectionName) {
    return {
      getAll: async () => {
        try {
          const response = await fetch(`${API_URL}/${collectionName}`);
          return response.ok ? await response.json() : [];
        } catch (error) {
          console.error(`Error fetching ${collectionName}:`, error);
          return [];
        }
      },

      create: async (data) => {
        try {
          const response = await fetch(`${API_URL}/${collectionName}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          const result = await response.json();
          return result.id;
        } catch (error) {
          console.error(`Error creating ${collectionName}:`, error);
          return null;
        }
      },

      update: async (id, data) => {
        try {
          const response = await fetch(`${API_URL}/${collectionName}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          return response.ok;
        } catch (error) {
          console.error(`Error updating ${collectionName}:`, error);
          return false;
        }
      },

      delete: async (id) => {
        try {
          const response = await fetch(`${API_URL}/${collectionName}/${id}`, {
            method: 'DELETE'
          });
          return response.ok;
        } catch (error) {
          console.error(`Error deleting ${collectionName}:`, error);
          return false;
        }
      },

      listen: (callback) => {
        const crud = this._createCRUD(collectionName);
        crud.getAll().then(callback);
        const interval = setInterval(async () => {
          callback(await crud.getAll());
        }, 5000);
        return () => clearInterval(interval);
      }
    };
  },

  // DEPARTMENTS
  async getDepartments() { return this._createCRUD('departments').getAll(); },
  async createDepartment(data) { return this._createCRUD('departments').create(data); },
  async updateDepartment(id, data) { return this._createCRUD('departments').update(id, data); },
  async deleteDepartment(id) { return this._createCRUD('departments').delete(id); },
  listenToDepartments(callback) { return this._createCRUD('departments').listen(callback); },

  // USERS
  async getUsers() { return this._createCRUD('users').getAll(); },
  async createUser(data) { return this._createCRUD('users').create(data); },
  async updateUser(id, data) { return this._createCRUD('users').update(id, data); },
  async deleteUser(id) { return this._createCRUD('users').delete(id); },
  listenToUsers(callback) { return this._createCRUD('users').listen(callback); },

  // CONTACTS
  async getContacts() { return this._createCRUD('contacts').getAll(); },
  async createContact(data) { return this._createCRUD('contacts').create(data); },
  async updateContact(id, data) { return this._createCRUD('contacts').update(id, data); },
  async deleteContact(id) { return this._createCRUD('contacts').delete(id); },
  listenToContacts(callback) { return this._createCRUD('contacts').listen(callback); },

  // TAGS
  async getTags() { return this._createCRUD('tags').getAll(); },
  async createTag(data) { return this._createCRUD('tags').create(data); },
  async updateTag(id, data) { return this._createCRUD('tags').update(id, data); },
  async deleteTag(id) { return this._createCRUD('tags').delete(id); },
  listenToTags(callback) { return this._createCRUD('tags').listen(callback); },

  // REASONS
  async getReasons() { return this._createCRUD('reasons').getAll(); },
  async createReason(data) { return this._createCRUD('reasons').create(data); },
  async updateReason(id, data) { return this._createCRUD('reasons').update(id, data); },
  async deleteReason(id) { return this._createCRUD('reasons').delete(id); },
  listenToReasons(callback) { return this._createCRUD('reasons').listen(callback); }
};
