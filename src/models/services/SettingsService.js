import { db, appId } from '../../config/firebase';
import { collection, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, getDocs, serverTimestamp } from 'firebase/firestore';

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
  }
};
