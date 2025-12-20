import React, { useState, useMemo } from 'react';
import { Search, PlusCircle, Eye, ChevronDown, UserCircle } from 'lucide-react';
import { useContactsModel } from '../../models/hooks/useContactsModel';
import { ContactModal } from '../partials/ContactModal';
import { ContactDrawer } from '../partials/ContactDrawer';

export const ContactsView = ({ tags = [] }) => {
  const contactsModel = useContactsModel();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Filtragem e ordenação de contatos
  const filteredContacts = useMemo(() => {
    let filtered = [...contactsModel.contacts];

    // Filtro de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.name?.toLowerCase().includes(term) ||
        c.phone?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term)
      );
    }

    // Filtro de status
    if (statusFilter === 'blocked') {
      filtered = filtered.filter(c => c.blocked === true);
    } else if (statusFilter === 'active') {
      filtered = filtered.filter(c => !c.blocked);
    }

    // Filtro de tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(c => {
        if (!c.tags || c.tags.length === 0) return false;
        return selectedTags.some(tagId =>
          c.tags.some(t => t.id === tagId || t === tagId)
        );
      });
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'createdAt':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'lastContact':
          return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [contactsModel.contacts, searchTerm, statusFilter, selectedTags, sortBy]);

  const handleToggleTag = (tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleToggleContact = (contactId) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleToggleAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map(c => c.id));
    }
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setShowModal(true);
  };

  const handleViewContact = (contact) => {
    setSelectedContact(contact);
  };

  const handleSaveContact = async (contactData) => {
    try {
      if (editingContact) {
        await contactsModel.updateContact(editingContact.id, contactData);
      } else {
        await contactsModel.createContact(contactData);
      }
      setShowModal(false);
      setEditingContact(null);
    } catch (error) {
      console.error('Erro ao salvar contato:', error);
    }
  };

  const formatPhone = (phone) => {
    if (!phone) return '-';
    // Formata: 5511999999999 -> +55 11 99999-9999
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 13 && cleaned.startsWith('55')) {
      const ddd = cleaned.substring(2, 4);
      const part1 = cleaned.substring(4, 9);
      const part2 = cleaned.substring(9);
      return `+55 ${ddd} ${part1}-${part2}`;
    }
    return phone;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <div className="w-full h-full bg-gray-50 overflow-auto">
      {/* Modal de Novo/Editar Contato */}
      {showModal && (
        <ContactModal
          contact={editingContact}
          tags={tags}
          onSave={handleSaveContact}
          onClose={() => {
            setShowModal(false);
            setEditingContact(null);
          }}
        />
      )}

      {/* Drawer de Detalhes do Contato */}
      {selectedContact && (
        <ContactDrawer
          contact={selectedContact}
          tags={tags}
          onClose={() => setSelectedContact(null)}
          onEdit={handleEditContact}
          onUpdate={(id, data) => contactsModel.updateContact(id, data)}
          onBlock={(id, blocked) => contactsModel.blockContact(id, blocked)}
          onDelete={(id) => {
            contactsModel.deleteContact(id);
            setSelectedContact(null);
          }}
          getConversations={(id) => contactsModel.getContactConversations(id)}
          getActivityLogs={(id) => contactsModel.getContactActivityLogs(id)}
        />
      )}

      <div className="max-w-7xl mx-auto p-6">
        {/* Cabeçalho */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                Contatos
                <span className="text-xl font-normal text-gray-400">{filteredContacts.length}</span>
              </h1>
              <p className="text-gray-500 mt-1">
                Aqui você pode gerenciar as informações dos seus contatos e acessar os históricos de mensagens
              </p>
            </div>
            <button
              onClick={() => {
                setEditingContact(null);
                setShowModal(true);
              }}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <PlusCircle size={18} />
              Adicionar contato
            </button>
          </div>
        </div>

        {/* Barra de Filtros */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            {/* Campo de Pesquisa */}
            <div className="flex-1 min-w-[250px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por nome ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              />
            </div>

            {/* Filtro de Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white"
            >
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="blocked">Bloqueados</option>
            </select>

            {/* Dropdown de Etiquetas */}
            <div className="relative">
              <button
                onClick={() => setShowTagsDropdown(!showTagsDropdown)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center gap-2"
              >
                Etiquetas
                {selectedTags.length > 0 && (
                  <span className="bg-emerald-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {selectedTags.length}
                  </span>
                )}
                <ChevronDown size={14} />
              </button>

              {showTagsDropdown && (
                <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[200px] max-h-[300px] overflow-auto">
                  {tags.length === 0 ? (
                    <div className="p-4 text-sm text-gray-400 text-center">
                      Nenhuma etiqueta disponível
                    </div>
                  ) : (
                    tags.map(tag => (
                      <label
                        key={tag.id}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag.id)}
                          onChange={() => handleToggleTag(tag.id)}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                        />
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: tag.color + '20',
                            color: tag.color,
                            border: `1px solid ${tag.color}40`
                          }}
                        >
                          {tag.name}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Dropdown de Ordenação */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center gap-2"
              >
                Ordenar por: {sortBy === 'name' ? 'Nome' : sortBy === 'createdAt' ? 'Data criação' : 'Última conversa'}
                <ChevronDown size={14} />
              </button>

              {showSortDropdown && (
                <div className="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[180px]">
                  <button
                    onClick={() => { setSortBy('name'); setShowSortDropdown(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                  >
                    Nome
                  </button>
                  <button
                    onClick={() => { setSortBy('createdAt'); setShowSortDropdown(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                  >
                    Data de criação
                  </button>
                  <button
                    onClick={() => { setSortBy('lastContact'); setShowSortDropdown(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                  >
                    Última conversa
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabela de Contatos */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {contactsModel.loading ? (
            <div className="p-8 text-center text-gray-400">
              Carregando contatos...
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <UserCircle className="mx-auto mb-2 opacity-20" size={48} />
              <p>Nenhum contato encontrado</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left w-12">
                    <input
                      type="checkbox"
                      checked={selectedContacts.length === filteredContacts.length}
                      onChange={handleToggleAll}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Contato</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Etiquetas</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">E-mail</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Criado em</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600 w-20">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map(contact => (
                  <tr
                    key={contact.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      contact.blocked ? 'bg-red-50/30' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => handleToggleContact(contact.id)}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {contact.avatar ? (
                          <img
                            src={contact.avatar}
                            alt={contact.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                            {contact.name?.charAt(0) || '?'}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-800 flex items-center gap-2">
                            {contact.name || 'Sem nome'}
                            {contact.blocked && (
                              <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full">
                                Bloqueado
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{formatPhone(contact.phone)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {contact.tags && contact.tags.length > 0 ? (
                          contact.tags.slice(0, 3).map((tag, idx) => {
                            const tagData = tags.find(t => t.id === tag.id || t.id === tag || t.name === tag);
                            if (!tagData) return null;
                            return (
                              <span
                                key={idx}
                                className="text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{
                                  backgroundColor: tagData.color + '20',
                                  color: tagData.color,
                                  border: `1px solid ${tagData.color}40`
                                }}
                              >
                                {tagData.name}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                        {contact.tags && contact.tags.length > 3 && (
                          <span className="text-xs text-gray-400">+{contact.tags.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {contact.email || <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(contact.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleViewContact(contact)}
                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 p-2 rounded-lg transition-colors inline-flex"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
