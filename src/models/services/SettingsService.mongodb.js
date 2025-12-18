/**
 * Settings Service - MongoDB Version
 *
 * Este serviço gerencia todas as configurações usando MongoDB
 * Mantém a mesma interface do Firebase para compatibilidade
 */

import { DatabaseService, COLLECTIONS } from '../../config/database.js';

export const SettingsService = {
  // ==========================================
  // GENERAL SETTINGS
  // ==========================================

  async getGeneralSettings() {
    try {
      const settings = await DatabaseService.getOne(COLLECTIONS.SETTINGS, { type: 'general' });

      if (settings) {
        return settings;
      }

      // Retorna configurações padrão se não existir
      return {
        identifyUser: false,
        hidePhoneNumbers: false,
        hideDispatchedConversations: false,
        inactivityTimeout: 0
      };
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
      // Verifica se existe um documento de settings
      const existing = await DatabaseService.getOne(COLLECTIONS.SETTINGS, { type: 'general' });

      if (existing) {
        return await DatabaseService.update(COLLECTIONS.SETTINGS, existing.id, settings);
      } else {
        // Cria novo documento
        await DatabaseService.create(COLLECTIONS.SETTINGS, {
          type: 'general',
          ...settings
        });
        return true;
      }
    } catch (error) {
      console.error('Error updating general settings:', error);
      return false;
    }
  },

  listenToGeneralSettings(callback) {
    // Busca inicial
    this.getGeneralSettings().then(callback);

    // Listener para mudanças
    return DatabaseService.listenToCollection(
      COLLECTIONS.SETTINGS,
      async (docs) => {
        const generalSettings = docs.find(d => d.type === 'general');
        if (generalSettings) {
          callback(generalSettings);
        } else {
          callback(await this.getGeneralSettings());
        }
      },
      { type: 'general' }
    );
  },

  // ==========================================
  // QUICK RESPONSES
  // ==========================================

  async getQuickResponses() {
    try {
      return await DatabaseService.getAll(COLLECTIONS.QUICK_RESPONSES);
    } catch (error) {
      console.error('Error fetching quick responses:', error);
      return [];
    }
  },

  async createQuickResponse(data) {
    try {
      const result = await DatabaseService.create(COLLECTIONS.QUICK_RESPONSES, data);
      return result.id;
    } catch (error) {
      console.error('Error creating quick response:', error);
      return null;
    }
  },

  async updateQuickResponse(id, data) {
    try {
      return await DatabaseService.update(COLLECTIONS.QUICK_RESPONSES, id, data);
    } catch (error) {
      console.error('Error updating quick response:', error);
      return false;
    }
  },

  async deleteQuickResponse(id) {
    try {
      return await DatabaseService.delete(COLLECTIONS.QUICK_RESPONSES, id);
    } catch (error) {
      console.error('Error deleting quick response:', error);
      return false;
    }
  },

  listenToQuickResponses(callback) {
    return DatabaseService.listenToCollection(COLLECTIONS.QUICK_RESPONSES, callback);
  },

  // ==========================================
  // DEPARTMENTS
  // ==========================================

  async getDepartments() {
    try {
      return await DatabaseService.getAll(COLLECTIONS.DEPARTMENTS);
    } catch (error) {
      console.error('Error fetching departments:', error);
      return [];
    }
  },

  async createDepartment(data) {
    try {
      const result = await DatabaseService.create(COLLECTIONS.DEPARTMENTS, data);
      return result.id;
    } catch (error) {
      console.error('Error creating department:', error);
      return null;
    }
  },

  async updateDepartment(id, data) {
    try {
      return await DatabaseService.update(COLLECTIONS.DEPARTMENTS, id, data);
    } catch (error) {
      console.error('Error updating department:', error);
      return false;
    }
  },

  async deleteDepartment(id) {
    try {
      return await DatabaseService.delete(COLLECTIONS.DEPARTMENTS, id);
    } catch (error) {
      console.error('Error deleting department:', error);
      return false;
    }
  },

  listenToDepartments(callback) {
    return DatabaseService.listenToCollection(COLLECTIONS.DEPARTMENTS, callback);
  },

  // ==========================================
  // USERS
  // ==========================================

  async getUsers() {
    try {
      return await DatabaseService.getAll(COLLECTIONS.USERS);
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  async createUser(data) {
    try {
      const result = await DatabaseService.create(COLLECTIONS.USERS, data);
      return result.id;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  },

  async updateUser(id, data) {
    try {
      return await DatabaseService.update(COLLECTIONS.USERS, id, data);
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  },

  async deleteUser(id) {
    try {
      return await DatabaseService.delete(COLLECTIONS.USERS, id);
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  },

  listenToUsers(callback) {
    return DatabaseService.listenToCollection(COLLECTIONS.USERS, callback);
  },

  // ==========================================
  // CONTACTS
  // ==========================================

  async getContacts() {
    try {
      return await DatabaseService.getAll(COLLECTIONS.CONTACTS);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      return [];
    }
  },

  async createContact(data) {
    try {
      const result = await DatabaseService.create(COLLECTIONS.CONTACTS, data);
      return result.id;
    } catch (error) {
      console.error('Error creating contact:', error);
      return null;
    }
  },

  async updateContact(id, data) {
    try {
      return await DatabaseService.update(COLLECTIONS.CONTACTS, id, data);
    } catch (error) {
      console.error('Error updating contact:', error);
      return false;
    }
  },

  async deleteContact(id) {
    try {
      return await DatabaseService.delete(COLLECTIONS.CONTACTS, id);
    } catch (error) {
      console.error('Error deleting contact:', error);
      return false;
    }
  },

  listenToContacts(callback) {
    return DatabaseService.listenToCollection(COLLECTIONS.CONTACTS, callback);
  },

  // ==========================================
  // TAGS
  // ==========================================

  async getTags() {
    try {
      return await DatabaseService.getAll(COLLECTIONS.TAGS);
    } catch (error) {
      console.error('Error fetching tags:', error);
      return [];
    }
  },

  async createTag(data) {
    try {
      const result = await DatabaseService.create(COLLECTIONS.TAGS, data);
      return result.id;
    } catch (error) {
      console.error('Error creating tag:', error);
      return null;
    }
  },

  async updateTag(id, data) {
    try {
      return await DatabaseService.update(COLLECTIONS.TAGS, id, data);
    } catch (error) {
      console.error('Error updating tag:', error);
      return false;
    }
  },

  async deleteTag(id) {
    try {
      return await DatabaseService.delete(COLLECTIONS.TAGS, id);
    } catch (error) {
      console.error('Error deleting tag:', error);
      return false;
    }
  },

  listenToTags(callback) {
    return DatabaseService.listenToCollection(COLLECTIONS.TAGS, callback);
  },

  // ==========================================
  // CLOSING REASONS
  // ==========================================

  async getReasons() {
    try {
      return await DatabaseService.getAll(COLLECTIONS.REASONS);
    } catch (error) {
      console.error('Error fetching reasons:', error);
      return [];
    }
  },

  async createReason(data) {
    try {
      const result = await DatabaseService.create(COLLECTIONS.REASONS, data);
      return result.id;
    } catch (error) {
      console.error('Error creating reason:', error);
      return null;
    }
  },

  async updateReason(id, data) {
    try {
      return await DatabaseService.update(COLLECTIONS.REASONS, id, data);
    } catch (error) {
      console.error('Error updating reason:', error);
      return false;
    }
  },

  async deleteReason(id) {
    try {
      return await DatabaseService.delete(COLLECTIONS.REASONS, id);
    } catch (error) {
      console.error('Error deleting reason:', error);
      return false;
    }
  },

  listenToReasons(callback) {
    return DatabaseService.listenToCollection(COLLECTIONS.REASONS, callback);
  }
};
