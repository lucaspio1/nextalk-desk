import { db, appId } from '../../config/firebase';
import { collection, doc, getDoc, setDoc, updateDoc, addDoc, deleteDoc, getDocs } from 'firebase/firestore';

const settingsRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'general');
const quickResponsesRef = collection(db, 'artifacts', appId, 'public', 'data', 'quickResponses');
const departmentsRef = collection(db, 'artifacts', appId, 'public', 'data', 'departments');
const usersRef = collection(db, 'artifacts', appId, 'public', 'data', 'users');

export const SettingsService = {
  // Ajustes Gerais
  async getGeneralSettings() {
    try {
      const docSnap = await getDoc(settingsRef);
      if (docSnap.exists()) {
        return docSnap.data();
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
      await setDoc(settingsRef, settings, { merge: true });
      return true;
    } catch (error) {
      console.error('Erro ao atualizar configurações gerais:', error);
      return false;
    }
  },

  // Respostas Rápidas
  async getQuickResponses() {
    try {
      const snapshot = await getDocs(quickResponsesRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Erro ao buscar respostas rápidas:', error);
      return [];
    }
  },

  async createQuickResponse(data) {
    try {
      const docRef = await addDoc(quickResponsesRef, {
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
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'quickResponses', id), data);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar resposta rápida:', error);
      return false;
    }
  },

  async deleteQuickResponse(id) {
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'quickResponses', id));
      return true;
    } catch (error) {
      console.error('Erro ao deletar resposta rápida:', error);
      return false;
    }
  },

  // Departamentos
  async getDepartments() {
    try {
      const snapshot = await getDocs(departmentsRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Erro ao buscar departamentos:', error);
      return [];
    }
  },

  async createDepartment(data) {
    try {
      const docRef = await addDoc(departmentsRef, {
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
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'departments', id), data);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar departamento:', error);
      return false;
    }
  },

  async deleteDepartment(id) {
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'departments', id));
      return true;
    } catch (error) {
      console.error('Erro ao deletar departamento:', error);
      return false;
    }
  },

  // Usuários
  async getUsers() {
    try {
      const snapshot = await getDocs(usersRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }
  },

  async createUser(data) {
    try {
      const docRef = await addDoc(usersRef, {
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
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', id), data);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return false;
    }
  },

  async deleteUser(id) {
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', id));
      return true;
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      return false;
    }
  }
};
