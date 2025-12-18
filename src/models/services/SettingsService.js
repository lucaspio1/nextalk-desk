import { db, appId } from '../../config/firebase';
import { collection, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, getDocs, serverTimestamp, onSnapshot } from 'firebase/firestore';

const getCollectionRef = (collectionName) =>
  collection(db, 'artifacts', appId, 'public', 'data', collectionName);

export const SettingsService = {
  // General Settings
  async getGeneralSettings() {
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'general');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        // Return default settings
        return {
          identifyUser: false,
          hidePhoneNumbers: false,
          hideDispatchedConversations: false,
          inactivityTimeout: 0
        };
      }
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
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'general');
      await setDoc(docRef, {
        ...settings,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating general settings:', error);
      return false;
    }
  },

  // Quick Responses
  async getQuickResponses() {
    try {
      const colRef = getCollectionRef('quickResponses');
      const snapshot = await getDocs(colRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching quick responses:', error);
      return [];
    }
  },

  async createQuickResponse(data) {
    try {
      const colRef = getCollectionRef('quickResponses');
      const docRef = await addDoc(colRef, {
        ...data,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating quick response:', error);
      return null;
    }
  },

  async updateQuickResponse(id, data) {
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'quickResponses', id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating quick response:', error);
      return false;
    }
  },

  async deleteQuickResponse(id) {
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'quickResponses', id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting quick response:', error);
      return false;
    }
  },

  // Departments
  async getDepartments() {
    try {
      const colRef = getCollectionRef('departments');
      const snapshot = await getDocs(colRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching departments:', error);
      return [];
    }
  },

  async createDepartment(data) {
    try {
      const colRef = getCollectionRef('departments');
      const docRef = await addDoc(colRef, {
        ...data,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating department:', error);
      return null;
    }
  },

  async updateDepartment(id, data) {
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'departments', id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating department:', error);
      return false;
    }
  },

  async deleteDepartment(id) {
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'departments', id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting department:', error);
      return false;
    }
  },

  // Users
  async getUsers() {
    try {
      const colRef = getCollectionRef('users');
      const snapshot = await getDocs(colRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  async createUser(data) {
    try {
      const colRef = getCollectionRef('users');
      const docRef = await addDoc(colRef, {
        ...data,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  },

  async updateUser(id, data) {
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  },

  async deleteUser(id) {
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  },

  // Contacts
  async getContacts() {
    try {
      const colRef = getCollectionRef('contacts');
      const snapshot = await getDocs(colRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching contacts:', error);
      return [];
    }
  },

  async createContact(data) {
    try {
      const colRef = getCollectionRef('contacts');
      const docRef = await addDoc(colRef, {
        ...data,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating contact:', error);
      return null;
    }
  },

  async updateContact(id, data) {
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'contacts', id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating contact:', error);
      return false;
    }
  },

  async deleteContact(id) {
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'contacts', id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting contact:', error);
      return false;
    }
  },

  // Tags
  async getTags() {
    try {
      const colRef = getCollectionRef('tags');
      const snapshot = await getDocs(colRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching tags:', error);
      return [];
    }
  },

  async createTag(data) {
    try {
      const colRef = getCollectionRef('tags');
      const docRef = await addDoc(colRef, {
        ...data,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating tag:', error);
      return null;
    }
  },

  async updateTag(id, data) {
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'tags', id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating tag:', error);
      return false;
    }
  },

  async deleteTag(id) {
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'tags', id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting tag:', error);
      return false;
    }
  },

  // Closing Reasons
  async getReasons() {
    try {
      const colRef = getCollectionRef('reasons');
      const snapshot = await getDocs(colRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching reasons:', error);
      return [];
    }
  },

  async createReason(data) {
    try {
      const colRef = getCollectionRef('reasons');
      const docRef = await addDoc(colRef, {
        ...data,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating reason:', error);
      return null;
    }
  },

  async updateReason(id, data) {
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'reasons', id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating reason:', error);
      return false;
    }
  },

  async deleteReason(id) {
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'reasons', id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting reason:', error);
      return false;
    }
  },

  // ==========================================
  // LISTENERS EM TEMPO REAL
  // ==========================================

  /**
   * Listener para Quick Responses em tempo real
   * @param {Function} callback - Função chamada quando dados mudam
   * @returns {Function} Função para cancelar o listener
   */
  listenToQuickResponses(callback) {
    const colRef = getCollectionRef('quickResponses');
    return onSnapshot(colRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    }, (error) => {
      console.error('Error listening to quick responses:', error);
      callback([]);
    });
  },

  /**
   * Listener para Departments em tempo real
   */
  listenToDepartments(callback) {
    const colRef = getCollectionRef('departments');
    return onSnapshot(colRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    }, (error) => {
      console.error('Error listening to departments:', error);
      callback([]);
    });
  },

  /**
   * Listener para Users em tempo real
   */
  listenToUsers(callback) {
    const colRef = getCollectionRef('users');
    return onSnapshot(colRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    }, (error) => {
      console.error('Error listening to users:', error);
      callback([]);
    });
  },

  /**
   * Listener para Contacts em tempo real
   */
  listenToContacts(callback) {
    const colRef = getCollectionRef('contacts');
    return onSnapshot(colRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    }, (error) => {
      console.error('Error listening to contacts:', error);
      callback([]);
    });
  },

  /**
   * Listener para Tags em tempo real
   */
  listenToTags(callback) {
    const colRef = getCollectionRef('tags');
    return onSnapshot(colRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    }, (error) => {
      console.error('Error listening to tags:', error);
      callback([]);
    });
  },

  /**
   * Listener para Reasons em tempo real
   */
  listenToReasons(callback) {
    const colRef = getCollectionRef('reasons');
    return onSnapshot(colRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    }, (error) => {
      console.error('Error listening to reasons:', error);
      callback([]);
    });
  },

  /**
   * Listener para General Settings em tempo real
   */
  listenToGeneralSettings(callback) {
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'general');
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data());
      } else {
        // Return default settings
        callback({
          identifyUser: false,
          hidePhoneNumbers: false,
          hideDispatchedConversations: false,
          inactivityTimeout: 0
        });
      }
    }, (error) => {
      console.error('Error listening to general settings:', error);
      callback({
        identifyUser: false,
        hidePhoneNumbers: false,
        hideDispatchedConversations: false,
        inactivityTimeout: 0
      });
    });
  }
};
