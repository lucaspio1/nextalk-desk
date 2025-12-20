import React, { useState, useMemo } from 'react';
import { X, Search, Filter, ChevronRight, Plus, MessageSquare, User } from 'lucide-react';
import { ContactModal } from './ContactModal';

export const NewConversationModal = ({
  contacts = [],
  tags = [],
  onClose,
  onCreateTicket,
  onCreateContact
}) => {
  const [step, setStep] = useState(1); // 1 = Escolher contato, 2 = Escolher canal
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showNewContactModal, setShowNewContactModal] = useState(false);

  // Filtrar contatos
  const filteredContacts = useMemo(() => {
    let filtered = [...contacts];

    // Filtro de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.name?.toLowerCase().includes(term) ||
        c.phone?.toLowerCase().includes(term)
      );
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

    return filtered;
  }, [contacts, searchTerm, selectedTags]);

  const handleToggleTag = (tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
    setStep(2);
  };

  const handleSelectChannel = (channel) => {
    if (channel === 'whatsapp' && selectedContact) {
      onCreateTicket({
        name: selectedContact.name,
        phone: selectedContact.phone,
        message: '' // Mensagem inicial vazia
      });
      onClose();
    }
  };

  const handleNewContact = async (contactData) => {
    const newContact = await onCreateContact(contactData);
    setShowNewContactModal(false);
    // Seleciona o contato recém-criado
    if (newContact) {
      setSelectedContact(newContact);
      setStep(2);
    }
  };

  const formatPhone = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 13 && cleaned.startsWith('55')) {
      const ddd = cleaned.substring(2, 4);
      const part1 = cleaned.substring(4, 9);
      const part2 = cleaned.substring(9);
      return `+55 ${ddd} ${part1}-${part2}`;
    }
    return phone;
  };

  return (
    <>
      {/* Modal Principal */}
      <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="text-xl font-bold text-gray-800">Nova Conversa</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Stepper */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between max-w-md mx-auto">
              {/* Etapa 1 */}
              <div className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  step === 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-600 text-white'
                }`}>
                  1
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step === 1 ? 'text-gray-800' : 'text-gray-500'
                }`}>
                  Escolha o contato
                </span>
              </div>

              {/* Linha conectora */}
              <div className={`flex-1 h-0.5 mx-4 ${
                step === 2 ? 'bg-blue-600' : 'bg-gray-300'
              }`}></div>

              {/* Etapa 2 */}
              <div className="flex items-center flex-1 justify-end">
                <span className={`mr-2 text-sm font-medium ${
                  step === 2 ? 'text-gray-800' : 'text-gray-400'
                }`}>
                  Escolha o canal
                </span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  step === 2
                    ? 'bg-blue-600 text-white'
                    : 'border-2 border-gray-300 text-gray-400'
                }`}>
                  2
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {step === 1 ? (
              /* ETAPA 1 - Escolher Contato */
              <div className="space-y-4">
                {/* Barra de Busca e Filtros */}
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Pesquisar por nome ou telefone"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      autoFocus
                    />
                  </div>

                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors ${
                      selectedTags.length > 0 ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}
                  >
                    <Filter size={18} className={selectedTags.length > 0 ? 'text-blue-600' : 'text-gray-600'} />
                  </button>

                  <button
                    onClick={() => setShowNewContactModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Novo contato
                  </button>
                </div>

                {/* Filtros de Tags */}
                {showFilters && tags.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">Filtrar por etiquetas</h4>
                    <div className="flex flex-wrap gap-2">
                      {tags.map(tag => (
                        <button
                          key={tag.id}
                          onClick={() => handleToggleTag(tag.id)}
                          className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                            selectedTags.includes(tag.id)
                              ? 'ring-2 ring-offset-1'
                              : 'opacity-60 hover:opacity-100'
                          }`}
                          style={{
                            backgroundColor: tag.color + '20',
                            color: tag.color,
                            border: `1px solid ${tag.color}40`,
                            ringColor: tag.color
                          }}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lista de Contatos */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {filteredContacts.length === 0 ? (
                    <div className="p-8 text-center">
                      <User className="mx-auto mb-3 text-gray-300" size={40} />
                      <p className="text-gray-500 mb-3">Nenhum contato encontrado</p>
                      <button
                        onClick={() => setShowNewContactModal(true)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Criar novo contato
                      </button>
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      {filteredContacts.map(contact => (
                        <button
                          key={contact.id}
                          onClick={() => handleSelectContact(contact)}
                          className="w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors flex items-center gap-3 text-left"
                        >
                          {/* Avatar */}
                          {contact.avatar ? (
                            <img
                              src={contact.avatar}
                              alt={contact.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                              {contact.name?.charAt(0) || '?'}
                            </div>
                          )}

                          {/* Info */}
                          <div className="flex-1">
                            <div className="font-medium text-gray-800">{contact.name || 'Sem nome'}</div>
                            <div className="text-sm text-gray-500">{formatPhone(contact.phone)}</div>

                            {/* Tags */}
                            {contact.tags && contact.tags.length > 0 && (
                              <div className="flex gap-1 mt-1 flex-wrap">
                                {contact.tags.slice(0, 3).map((tag, idx) => {
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
                                })}
                              </div>
                            )}
                          </div>

                          {/* Seta */}
                          <ChevronRight size={20} className="text-gray-400" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ETAPA 2 - Escolher Canal */
              <div className="space-y-4">
                {/* Info do Contato Selecionado */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-3">
                  {selectedContact?.avatar ? (
                    <img
                      src={selectedContact.avatar}
                      alt={selectedContact.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                      {selectedContact?.name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-gray-800">{selectedContact?.name}</div>
                    <div className="text-sm text-gray-500">{formatPhone(selectedContact?.phone)}</div>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="ml-auto text-sm text-blue-600 hover:text-blue-700"
                  >
                    Alterar
                  </button>
                </div>

                {/* Lista de Canais */}
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-3">Selecione o canal para conversar</h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* WhatsApp */}
                    <button
                      onClick={() => handleSelectChannel('whatsapp')}
                      className="w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors flex items-center gap-4 text-left"
                    >
                      {/* Ícone WhatsApp */}
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <MessageSquare size={24} className="text-green-600" />
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">WhatsApp</div>
                        <div className="text-sm text-gray-500">{formatPhone(selectedContact?.phone)}</div>
                      </div>

                      {/* Seta */}
                      <ChevronRight size={20} className="text-gray-400" />
                    </button>

                    {/* Futuros canais (Instagram, Telegram, etc.) */}
                    <div className="p-4 bg-gray-50 text-center text-sm text-gray-400">
                      Outros canais estarão disponíveis em breve
                    </div>
                  </div>
                </div>

                {/* Botão Voltar */}
                <div className="flex justify-start">
                  <button
                    onClick={() => setStep(1)}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    ← Voltar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Novo Contato */}
      {showNewContactModal && (
        <ContactModal
          contact={null}
          tags={tags}
          onSave={handleNewContact}
          onClose={() => setShowNewContactModal(false)}
        />
      )}
    </>
  );
};
