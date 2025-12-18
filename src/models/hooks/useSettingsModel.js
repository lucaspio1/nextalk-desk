import { useState, useEffect } from 'react';
import { SettingsService } from '../services/SettingsService.api';

/**
 * Hook para consumir e gerenciar settings do Firebase em tempo real
 *
 * Este hook carrega automaticamente todos os dados de configuração
 * do Firebase e mantém o estado sincronizado.
 *
 * @returns {Object} Objeto contendo todos os settings e funções de atualização
 */
export const useSettingsModel = () => {
  const [generalSettings, setGeneralSettings] = useState({
    identifyUser: false,
    hidePhoneNumbers: false,
    hideDispatchedConversations: false,
    inactivityTimeout: 0
  });

  const [quickResponses, setQuickResponses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [tags, setTags] = useState([]);
  const [reasons, setReasons] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configura listeners em tempo real para todos os dados
  useEffect(() => {
    let unsubscribers = [];

    try {
      // Listener para General Settings
      const unsubGeneral = SettingsService.listenToGeneralSettings((data) => {
        setGeneralSettings(data);
      });
      unsubscribers.push(unsubGeneral);

      // Listener para Quick Responses
      const unsubQuick = SettingsService.listenToQuickResponses((data) => {
        setQuickResponses(data);
      });
      unsubscribers.push(unsubQuick);

      // Listener para Departments
      const unsubDepts = SettingsService.listenToDepartments((data) => {
        setDepartments(data);
      });
      unsubscribers.push(unsubDepts);

      // Listener para Users
      const unsubUsers = SettingsService.listenToUsers((data) => {
        setUsers(data);
      });
      unsubscribers.push(unsubUsers);

      // Listener para Contacts
      const unsubContacts = SettingsService.listenToContacts((data) => {
        setContacts(data);
      });
      unsubscribers.push(unsubContacts);

      // Listener para Tags
      const unsubTags = SettingsService.listenToTags((data) => {
        setTags(data);
      });
      unsubscribers.push(unsubTags);

      // Listener para Reasons
      const unsubReasons = SettingsService.listenToReasons((data) => {
        setReasons(data);
      });
      unsubscribers.push(unsubReasons);

      setLoading(false);
      console.log('✅ Listeners de Settings configurados - dados serão sincronizados em tempo real');
    } catch (err) {
      console.error('❌ Erro ao configurar listeners:', err);
      setError(err.message);
      setLoading(false);
    }

    // Cleanup: cancela todos os listeners quando o componente desmontar
    return () => {
      unsubscribers.forEach(unsub => unsub());
      console.log('🔌 Listeners de Settings desconectados');
    };
  }, []);

  const loadAllSettings = async () => {
    setLoading(true);
    setError(null);

    try {
      // Carrega todos os dados em paralelo para melhor performance
      const [
        general,
        quick,
        depts,
        usersList,
        contactsList,
        tagsList,
        reasonsList
      ] = await Promise.all([
        SettingsService.getGeneralSettings(),
        SettingsService.getQuickResponses(),
        SettingsService.getDepartments(),
        SettingsService.getUsers(),
        SettingsService.getContacts(),
        SettingsService.getTags(),
        SettingsService.getReasons()
      ]);

      setGeneralSettings(general);
      setQuickResponses(quick);
      setDepartments(depts);
      setUsers(usersList);
      setContacts(contactsList);
      setTags(tagsList);
      setReasons(reasonsList);

      console.log('✅ Settings carregados do Firebase:', {
        generalSettings: general,
        quickResponses: quick.length,
        departments: depts.length,
        users: usersList.length,
        contacts: contactsList.length,
        tags: tagsList.length,
        reasons: reasonsList.length
      });
    } catch (err) {
      console.error('❌ Erro ao carregar settings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Funções para atualizar General Settings
  const updateGeneralSetting = async (key, value) => {
    const newSettings = { ...generalSettings, [key]: value };
    setGeneralSettings(newSettings);
    const success = await SettingsService.updateGeneralSettings(newSettings);
    if (!success) {
      // Reverte em caso de erro
      loadAllSettings();
    }
    return success;
  };

  // Funções para Quick Responses
  const createQuickResponse = async (data) => {
    const id = await SettingsService.createQuickResponse(data);
    if (id) {
      await loadAllSettings();
    }
    return id;
  };

  const updateQuickResponse = async (id, data) => {
    const success = await SettingsService.updateQuickResponse(id, data);
    if (success) {
      await loadAllSettings();
    }
    return success;
  };

  const deleteQuickResponse = async (id) => {
    const success = await SettingsService.deleteQuickResponse(id);
    if (success) {
      await loadAllSettings();
    }
    return success;
  };

  // Funções para Departments
  const createDepartment = async (data) => {
    const id = await SettingsService.createDepartment(data);
    if (id) {
      await loadAllSettings();
    }
    return id;
  };

  const updateDepartment = async (id, data) => {
    const success = await SettingsService.updateDepartment(id, data);
    if (success) {
      await loadAllSettings();
    }
    return success;
  };

  const deleteDepartment = async (id) => {
    const success = await SettingsService.deleteDepartment(id);
    if (success) {
      await loadAllSettings();
    }
    return success;
  };

  // Funções para Users
  const createUser = async (data) => {
    const id = await SettingsService.createUser(data);
    if (id) {
      await loadAllSettings();
    }
    return id;
  };

  const updateUser = async (id, data) => {
    const success = await SettingsService.updateUser(id, data);
    if (success) {
      await loadAllSettings();
    }
    return success;
  };

  const deleteUser = async (id) => {
    const success = await SettingsService.deleteUser(id);
    if (success) {
      await loadAllSettings();
    }
    return success;
  };

  // Funções para Contacts
  const createContact = async (data) => {
    const id = await SettingsService.createContact(data);
    if (id) {
      await loadAllSettings();
    }
    return id;
  };

  const updateContact = async (id, data) => {
    const success = await SettingsService.updateContact(id, data);
    if (success) {
      await loadAllSettings();
    }
    return success;
  };

  const deleteContact = async (id) => {
    const success = await SettingsService.deleteContact(id);
    if (success) {
      await loadAllSettings();
    }
    return success;
  };

  // Funções para Tags
  const createTag = async (data) => {
    const id = await SettingsService.createTag(data);
    if (id) {
      await loadAllSettings();
    }
    return id;
  };

  const updateTag = async (id, data) => {
    const success = await SettingsService.updateTag(id, data);
    if (success) {
      await loadAllSettings();
    }
    return success;
  };

  const deleteTag = async (id) => {
    const success = await SettingsService.deleteTag(id);
    if (success) {
      await loadAllSettings();
    }
    return success;
  };

  // Funções para Reasons
  const createReason = async (data) => {
    const id = await SettingsService.createReason(data);
    if (id) {
      await loadAllSettings();
    }
    return id;
  };

  const updateReason = async (id, data) => {
    const success = await SettingsService.updateReason(id, data);
    if (success) {
      await loadAllSettings();
    }
    return success;
  };

  const deleteReason = async (id) => {
    const success = await SettingsService.deleteReason(id);
    if (success) {
      await loadAllSettings();
    }
    return success;
  };

  return {
    // Estados
    generalSettings,
    quickResponses,
    departments,
    users,
    contacts,
    tags,
    reasons,
    loading,
    error,

    // Funções de atualização
    reload: loadAllSettings,
    updateGeneralSetting,

    // Quick Responses
    createQuickResponse,
    updateQuickResponse,
    deleteQuickResponse,

    // Departments
    createDepartment,
    updateDepartment,
    deleteDepartment,

    // Users
    createUser,
    updateUser,
    deleteUser,

    // Contacts
    createContact,
    updateContact,
    deleteContact,

    // Tags
    createTag,
    updateTag,
    deleteTag,

    // Reasons
    createReason,
    updateReason,
    deleteReason
  };
};
