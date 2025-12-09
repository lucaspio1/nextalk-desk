// Serviço temporário de armazenamento local que simula Firebase
// Será substituído pelo banco do VPS posteriormente

const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const LocalStorageService = {
  // Simula collection
  getCollection(collectionName) {
    const data = localStorage.getItem(collectionName);
    return data ? JSON.parse(data) : [];
  },

  // Simula addDoc
  addDoc(collectionName, data) {
    const collection = this.getCollection(collectionName);
    const id = generateId();
    const newDoc = {
      ...data,
      id,
      createdAt: new Date().toISOString()
    };
    collection.push(newDoc);
    localStorage.setItem(collectionName, JSON.stringify(collection));

    // Dispara evento para atualização em tempo real
    console.log('[LocalStorageService] Disparando evento de atualização...');
    window.dispatchEvent(new StorageEvent('storage', {
      key: collectionName,
      newValue: JSON.stringify(collection),
      storageArea: localStorage
    }));

    return { id };
  },

  // Simula updateDoc
  updateDoc(collectionName, docId, data) {
    const collection = this.getCollection(collectionName);
    const index = collection.findIndex(doc => doc.id === docId);
    if (index !== -1) {
      collection[index] = { ...collection[index], ...data };
      localStorage.setItem(collectionName, JSON.stringify(collection));

      // Dispara evento para atualização em tempo real
      window.dispatchEvent(new StorageEvent('storage', {
        key: collectionName,
        newValue: JSON.stringify(collection),
        storageArea: localStorage
      }));
    }
  },

  // Simula deleteDoc
  deleteDoc(collectionName, docId) {
    let collection = this.getCollection(collectionName);
    collection = collection.filter(doc => doc.id !== docId);
    localStorage.setItem(collectionName, JSON.stringify(collection));
  },

  // Simula getDoc
  getDoc(collectionName, docId) {
    const collection = this.getCollection(collectionName);
    return collection.find(doc => doc.id === docId) || null;
  },

  // Simula setDoc
  setDoc(collectionName, docId, data) {
    const collection = this.getCollection(collectionName);
    const index = collection.findIndex(doc => doc.id === docId);
    if (index !== -1) {
      collection[index] = { ...data, id: docId };
    } else {
      collection.push({ ...data, id: docId });
    }
    localStorage.setItem(collectionName, JSON.stringify(collection));
  },

  // Subscribe para mudanças (simples polling)
  onSnapshot(collectionName, callback) {
    const checkUpdates = () => {
      const data = this.getCollection(collectionName);
      callback(data);
    };

    // Chama imediatamente
    checkUpdates();

    // Configura listener de storage para mudanças em outras abas
    const storageListener = (e) => {
      if (e.key === collectionName) {
        checkUpdates();
      }
    };
    window.addEventListener('storage', storageListener);

    // Retorna função de cleanup
    return () => {
      window.removeEventListener('storage', storageListener);
    };
  }
};
