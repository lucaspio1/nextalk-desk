/**
 * Database Service - Camada de abstração para operações de banco de dados
 *
 * Este serviço abstrai as operações do MongoDB e fornece métodos
 * compatíveis com a interface anterior do Firebase
 */

import { getCollection, COLLECTIONS } from './mongodb.js';

/**
 * Converte ObjectId do MongoDB para string
 */
function normalizeDocument(doc) {
  if (!doc) return null;

  return {
    ...doc,
    id: doc._id.toString(),
    _id: undefined,
    createdAt: doc.createdAt || new Date(),
    updatedAt: doc.updatedAt || new Date()
  };
}

/**
 * Database Service
 */
export const DatabaseService = {
  /**
   * Busca todos os documentos de uma coleção
   */
  async getAll(collectionName, query = {}, options = {}) {
    try {
      const collection = getCollection(collectionName);
      const docs = await collection.find(query, options).toArray();
      return docs.map(normalizeDocument);
    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error);
      return [];
    }
  },

  /**
   * Busca um documento por ID
   */
  async getById(collectionName, id) {
    try {
      const collection = getCollection(collectionName);
      const doc = await collection.findOne({ _id: id });
      return normalizeDocument(doc);
    } catch (error) {
      console.error(`Error fetching document ${id}:`, error);
      return null;
    }
  },

  /**
   * Busca um documento por query customizada
   */
  async getOne(collectionName, query) {
    try {
      const collection = getCollection(collectionName);
      const doc = await collection.findOne(query);
      return normalizeDocument(doc);
    } catch (error) {
      console.error(`Error fetching document:`, error);
      return null;
    }
  },

  /**
   * Cria um novo documento
   */
  async create(collectionName, data) {
    try {
      const collection = getCollection(collectionName);
      const timestamp = new Date();

      const docToInsert = {
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      const result = await collection.insertOne(docToInsert);
      return {
        id: result.insertedId.toString(),
        ...docToInsert
      };
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error);
      throw error;
    }
  },

  /**
   * Atualiza um documento
   */
  async update(collectionName, id, data) {
    try {
      const collection = getCollection(collectionName);

      const updateData = {
        ...data,
        updatedAt: new Date()
      };

      // Remove campos undefined
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      const result = await collection.updateOne(
        { _id: id },
        { $set: updateData }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error(`Error updating document ${id}:`, error);
      return false;
    }
  },

  /**
   * Deleta um documento
   */
  async delete(collectionName, id) {
    try {
      const collection = getCollection(collectionName);
      const result = await collection.deleteOne({ _id: id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error(`Error deleting document ${id}:`, error);
      return false;
    }
  },

  /**
   * Busca com query customizada e ordenação
   */
  async find(collectionName, query = {}, options = {}) {
    try {
      const collection = getCollection(collectionName);
      let cursor = collection.find(query);

      if (options.sort) {
        cursor = cursor.sort(options.sort);
      }

      if (options.limit) {
        cursor = cursor.limit(options.limit);
      }

      if (options.skip) {
        cursor = cursor.skip(options.skip);
      }

      const docs = await cursor.toArray();
      return docs.map(normalizeDocument);
    } catch (error) {
      console.error(`Error finding documents in ${collectionName}:`, error);
      return [];
    }
  },

  /**
   * Conta documentos
   */
  async count(collectionName, query = {}) {
    try {
      const collection = getCollection(collectionName);
      return await collection.countDocuments(query);
    } catch (error) {
      console.error(`Error counting documents in ${collectionName}:`, error);
      return 0;
    }
  },

  /**
   * Adiciona item a um array (similar ao arrayUnion do Firebase)
   */
  async arrayPush(collectionName, id, field, item) {
    try {
      const collection = getCollection(collectionName);
      const result = await collection.updateOne(
        { _id: id },
        {
          $push: { [field]: item },
          $set: { updatedAt: new Date() }
        }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      console.error(`Error pushing to array in ${collectionName}:`, error);
      return false;
    }
  },

  /**
   * Atualiza múltiplos documentos
   */
  async updateMany(collectionName, query, update) {
    try {
      const collection = getCollection(collectionName);
      const result = await collection.updateMany(
        query,
        {
          $set: {
            ...update,
            updatedAt: new Date()
          }
        }
      );
      return result.modifiedCount;
    } catch (error) {
      console.error(`Error updating multiple documents in ${collectionName}:`, error);
      return 0;
    }
  },

  /**
   * Configura listener para mudanças em tempo real (Change Stream)
   * Retorna função para cancelar o listener
   */
  listenToCollection(collectionName, callback, query = {}) {
    try {
      const collection = getCollection(collectionName);

      // Busca inicial
      this.getAll(collectionName, query).then(docs => {
        callback(docs);
      });

      // Change Stream para atualizações em tempo real
      const changeStream = collection.watch([], {
        fullDocument: 'updateLookup'
      });

      changeStream.on('change', async () => {
        // Quando há mudanças, busca todos os documentos novamente
        const docs = await this.getAll(collectionName, query);
        callback(docs);
      });

      changeStream.on('error', (error) => {
        console.error(`Change stream error for ${collectionName}:`, error);
      });

      // Retorna função para cancelar o listener
      return () => {
        changeStream.close();
      };
    } catch (error) {
      console.error(`Error setting up listener for ${collectionName}:`, error);
      // Retorna função vazia em caso de erro
      return () => {};
    }
  },

  /**
   * Configura listener para um documento específico
   */
  listenToDocument(collectionName, docId, callback) {
    try {
      const collection = getCollection(collectionName);

      // Busca inicial
      this.getById(collectionName, docId).then(doc => {
        if (doc) callback(doc);
      });

      // Change Stream para atualizações em tempo real
      const changeStream = collection.watch([
        { $match: { 'documentKey._id': docId } }
      ], {
        fullDocument: 'updateLookup'
      });

      changeStream.on('change', async (change) => {
        if (change.fullDocument) {
          callback(normalizeDocument(change.fullDocument));
        }
      });

      changeStream.on('error', (error) => {
        console.error(`Change stream error for document ${docId}:`, error);
      });

      return () => {
        changeStream.close();
      };
    } catch (error) {
      console.error(`Error setting up listener for document ${docId}:`, error);
      return () => {};
    }
  }
};

export { COLLECTIONS };
