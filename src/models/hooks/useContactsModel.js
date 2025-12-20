import { useState, useEffect } from 'react';
import { ContactService } from '../services/ContactService.api';

/**
 * Hook para consumir e gerenciar contatos em tempo real
 *
 * @returns {Object} Objeto contendo contatos e funções de gerenciamento
 */
export const useContactsModel = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configura listener em tempo real para contatos
  useEffect(() => {
    let unsubscribe = null;

    try {
      // Listener para Contatos
      unsubscribe = ContactService.listenToContacts((data) => {
        setContacts(data);
        setLoading(false);
      });

      console.log('✅ Listener de Contatos configurado - dados serão sincronizados em tempo real');
    } catch (err) {
      console.error('❌ Erro ao configurar listener de contatos:', err);
      setError(err.message);
      setLoading(false);
    }

    // Cleanup: cancela o listener quando o componente desmontar
    return () => {
      if (unsubscribe) {
        unsubscribe();
        console.log('🔌 Listener de Contatos desconectado');
      }
    };
  }, []);

  /**
   * Recarrega todos os contatos
   */
  const reloadContacts = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await ContactService.getAllContacts();
      setContacts(data);
      console.log('✅ Contatos recarregados:', data.length);
    } catch (err) {
      console.error('❌ Erro ao recarregar contatos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cria um novo contato
   */
  const createContact = async (data) => {
    try {
      const contact = await ContactService.createContact(data);
      // Não precisa recarregar - o listener vai atualizar automaticamente
      return contact;
    } catch (err) {
      console.error('❌ Erro ao criar contato:', err);
      setError(err.message);
      throw err;
    }
  };

  /**
   * Atualiza um contato existente
   */
  const updateContact = async (id, data) => {
    try {
      const success = await ContactService.updateContact(id, data);
      // Não precisa recarregar - o listener vai atualizar automaticamente
      return success;
    } catch (err) {
      console.error('❌ Erro ao atualizar contato:', err);
      setError(err.message);
      return false;
    }
  };

  /**
   * Deleta um contato
   */
  const deleteContact = async (id) => {
    try {
      const success = await ContactService.deleteContact(id);
      // Não precisa recarregar - o listener vai atualizar automaticamente
      return success;
    } catch (err) {
      console.error('❌ Erro ao deletar contato:', err);
      setError(err.message);
      return false;
    }
  };

  /**
   * Bloqueia ou desbloqueia um contato
   */
  const blockContact = async (id, blocked) => {
    try {
      const contact = await ContactService.blockContact(id, blocked);
      // Não precisa recarregar - o listener vai atualizar automaticamente
      return contact;
    } catch (err) {
      console.error('❌ Erro ao bloquear/desbloquear contato:', err);
      setError(err.message);
      throw err;
    }
  };

  /**
   * Busca conversas de um contato
   */
  const getContactConversations = async (id) => {
    try {
      return await ContactService.getContactConversations(id);
    } catch (err) {
      console.error('❌ Erro ao buscar conversas do contato:', err);
      setError(err.message);
      return [];
    }
  };

  /**
   * Busca logs de atividade de um contato
   */
  const getContactActivityLogs = async (id) => {
    try {
      return await ContactService.getContactActivityLogs(id);
    } catch (err) {
      console.error('❌ Erro ao buscar logs de atividade:', err);
      setError(err.message);
      return [];
    }
  };

  /**
   * Busca ou cria contato pelo telefone
   */
  const findOrCreateByPhone = async (phone, defaultData = {}) => {
    try {
      return await ContactService.findOrCreateByPhone(phone, defaultData);
    } catch (err) {
      console.error('❌ Erro ao buscar/criar contato:', err);
      setError(err.message);
      throw err;
    }
  };

  return {
    // Estados
    contacts,
    loading,
    error,

    // Funções de gerenciamento
    reload: reloadContacts,
    createContact,
    updateContact,
    deleteContact,
    blockContact,
    getContactConversations,
    getContactActivityLogs,
    findOrCreateByPhone
  };
};
