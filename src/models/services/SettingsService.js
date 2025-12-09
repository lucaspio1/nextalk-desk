import { LocalStorageService } from './LocalStorageService';

const SETTINGS_COLLECTION = 'settings';
const QUICK_RESPONSES_COLLECTION = 'quickResponses';
const DEPARTMENTS_COLLECTION = 'departments';
const USERS_COLLECTION = 'users';

export const SettingsService = {
  // Ajustes Gerais
  async getGeneralSettings() {
    try {
      const settings = LocalStorageService.getDoc(SETTINGS_COLLECTION, 'general');
      if (settings) {
        return settings;
      }
      // Retorna configurações padrão
      return {
        identifyUser: false,
        hidePhoneNumbers: false,
        hideDispatchedConversations: false,
        inactivityTimeout: 0
      };
    } catch (error) {
      console.error('Erro ao buscar configurações gerais:', error);
      return null;
    }
  },

  async updateGeneralSettings(settings) {
    try {
      LocalStorageService.setDoc(SETTINGS_COLLECTION, 'general', settings);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar configurações gerais:', error);
      return false;
    }
  },

  // Respostas Rápidas
  async getQuickResponses() {
    try {
      return LocalStorageService.getCollection(QUICK_RESPONSES_COLLECTION);
    } catch (error) {
      console.error('Erro ao buscar respostas rápidas:', error);
      return [];
    }
  },

  async createQuickResponse(data) {
    try {
      const docRef = LocalStorageService.addDoc(QUICK_RESPONSES_COLLECTION, {
        ...data,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar resposta rápida:', error);
      return null;
    }
  },

  async updateQuickResponse(id, data) {
    try {
      LocalStorageService.updateDoc(QUICK_RESPONSES_COLLECTION, id, data);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar resposta rápida:', error);
      return false;
    }
  },

  async deleteQuickResponse(id) {
    try {
      LocalStorageService.deleteDoc(QUICK_RESPONSES_COLLECTION, id);
      return true;
    } catch (error) {
      console.error('Erro ao deletar resposta rápida:', error);
      return false;
    }
  },

  // Departamentos
  async getDepartments() {
    try {
      return LocalStorageService.getCollection(DEPARTMENTS_COLLECTION);
    } catch (error) {
      console.error('Erro ao buscar departamentos:', error);
      return [];
    }
  },

  async createDepartment(data) {
    try {
      const docRef = LocalStorageService.addDoc(DEPARTMENTS_COLLECTION, {
        ...data,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar departamento:', error);
      return null;
    }
  },

  async updateDepartment(id, data) {
    try {
      LocalStorageService.updateDoc(DEPARTMENTS_COLLECTION, id, data);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar departamento:', error);
      return false;
    }
  },

  async deleteDepartment(id) {
    try {
      LocalStorageService.deleteDoc(DEPARTMENTS_COLLECTION, id);
      return true;
    } catch (error) {
      console.error('Erro ao deletar departamento:', error);
      return false;
    }
  },

  // Usuários
  async getUsers() {
    try {
      return LocalStorageService.getCollection(USERS_COLLECTION);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }
  },

  async createUser(data) {
    try {
      const docRef = LocalStorageService.addDoc(USERS_COLLECTION, {
        ...data,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return null;
    }
  },

  async updateUser(id, data) {
    try {
      LocalStorageService.updateDoc(USERS_COLLECTION, id, data);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return false;
    }
  },

  async deleteUser(id) {
    try {
      LocalStorageService.deleteDoc(USERS_COLLECTION, id);
      return true;
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      return false;
    }
  }
};
