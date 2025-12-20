import React, { useState, useEffect } from 'react';
import {
  X,
  Edit2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  MessageSquare,
  Activity,
  StickyNote,
  ChevronDown,
  ChevronUp,
  Shield,
  Trash2,
  User
} from 'lucide-react';

export const ContactDrawer = ({
  contact,
  tags = [],
  onClose,
  onEdit,
  onUpdate,
  onBlock,
  onDelete,
  getConversations,
  getActivityLogs
}) => {
  const [notes, setNotes] = useState(contact?.notes || '');
  const [expandedSections, setExpandedSections] = useState({
    notes: false,
    activity: false,
    conversations: false
  });
  const [conversations, setConversations] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(false);

  useEffect(() => {
    setNotes(contact?.notes || '');
  }, [contact]);

  // Debounce para salvar notas
  useEffect(() => {
    if (notes !== (contact?.notes || '')) {
      const timer = setTimeout(() => {
        onUpdate(contact.id, { notes });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [notes, contact, onUpdate]);

  const toggleSection = async (section) => {
    const newState = !expandedSections[section];
    setExpandedSections(prev => ({ ...prev, [section]: newState }));

    // Carrega dados quando expandir
    if (newState) {
      if (section === 'conversations' && conversations.length === 0) {
        setLoadingConversations(true);
        const data = await getConversations(contact.id);
        setConversations(data);
        setLoadingConversations(false);
      } else if (section === 'activity' && activityLogs.length === 0) {
        setLoadingActivity(true);
        const data = await getActivityLogs(contact.id);
        setActivityLogs(data);
        setLoadingActivity(false);
      }
    }
  };

  const handleToggleTag = async (tagId) => {
    const currentTags = contact.tags || [];
    const tagExists = currentTags.some(t => t === tagId || t.id === tagId);

    const newTags = tagExists
      ? currentTags.filter(t => (t.id || t) !== tagId)
      : [...currentTags, tagId];

    await onUpdate(contact.id, { tags: newTags });
  };

  const isTagSelected = (tagId) => {
    const currentTags = contact.tags || [];
    return currentTags.some(t => t === tagId || t.id === tagId);
  };

  const handleBlockToggle = async () => {
    const newBlockedState = !contact.blocked;
    await onBlock(contact.id, newBlockedState);
  };

  const handleDelete = () => {
    if (window.confirm(`Tem certeza que deseja excluir o contato "${contact.name}"? Esta ação não pode ser desfeita.`)) {
      onDelete(contact.id);
    }
  };

  const formatPhone = (phone) => {
    if (!phone) return '-';
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
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { text: 'Em andamento', color: 'bg-emerald-100 text-emerald-700' },
      open: { text: 'Aguardando', color: 'bg-amber-100 text-amber-700' },
      closed: { text: 'Finalizada', color: 'bg-gray-100 text-gray-700' }
    };
    return badges[status] || badges.closed;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-full shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white shrink-0">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold">Detalhes do Contato</h3>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(contact)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Avatar e Info */}
          <div className="flex items-center gap-4">
            {contact.avatar ? (
              <img
                src={contact.avatar}
                alt={contact.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-white/30"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30">
                <User size={32} className="text-white" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-xl font-bold">{contact.name || 'Sem nome'}</h2>
              <p className="text-white/80 text-sm">{formatPhone(contact.phone)}</p>
              {contact.blocked && (
                <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-red-500 text-white rounded-full">
                  Bloqueado
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Etiquetas */}
          {tags.length > 0 && (
            <div className="p-4 border-b border-gray-100">
              <h4 className="text-xs font-bold text-gray-600 uppercase mb-3">Etiquetas do contato</h4>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => handleToggleTag(tag.id)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                      isTagSelected(tag.id)
                        ? 'ring-2 ring-offset-1'
                        : 'opacity-50 hover:opacity-100'
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

          {/* Seção Observações */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('notes')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <StickyNote size={18} className="text-gray-600" />
                <span className="font-medium text-gray-800">Observações do contato</span>
              </div>
              {expandedSections.notes ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {expandedSections.notes && (
              <div className="p-4 pt-0">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Adicione observações sobre este contato..."
                  rows="4"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">Salvo automaticamente</p>
              </div>
            )}
          </div>

          {/* Seção Logs de Atividade */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('activity')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Activity size={18} className="text-gray-600" />
                <span className="font-medium text-gray-800">Logs de atividade</span>
              </div>
              {expandedSections.activity ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {expandedSections.activity && (
              <div className="p-4 pt-0 max-h-64 overflow-y-auto">
                {loadingActivity ? (
                  <p className="text-sm text-gray-400 text-center py-4">Carregando...</p>
                ) : activityLogs.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Nenhuma atividade registrada</p>
                ) : (
                  <div className="space-y-3">
                    {activityLogs.map(log => (
                      <div key={log.id} className="flex gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-gray-800">{log.description}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {formatDate(log.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Seção Conversas */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('conversations')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <MessageSquare size={18} className="text-gray-600" />
                <span className="font-medium text-gray-800">Todas as conversas deste contato</span>
              </div>
              {expandedSections.conversations ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {expandedSections.conversations && (
              <div className="p-4 pt-0 max-h-96 overflow-y-auto">
                {loadingConversations ? (
                  <p className="text-sm text-gray-400 text-center py-4">Carregando...</p>
                ) : conversations.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Nenhuma conversa encontrada</p>
                ) : (
                  <div className="space-y-3">
                    {conversations.map(conv => {
                      const badge = getStatusBadge(conv.status);
                      const lastMessage = conv.messages?.[conv.messages.length - 1];
                      return (
                        <div
                          key={conv.id}
                          className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <MessageSquare size={14} className="text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {formatDate(conv.createdAt)}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${badge.color}`}>
                              {badge.text}
                            </span>
                          </div>
                          {lastMessage && (
                            <p className="text-sm text-gray-600 truncate">
                              {lastMessage.text}
                            </p>
                          )}
                          {conv.agentId && (
                            <p className="text-xs text-gray-400 mt-1">
                              Atendente: {conv.agentId}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Campos Adicionais */}
          <div className="p-4 space-y-3">
            <h4 className="text-xs font-bold text-gray-600 uppercase mb-3">Informações adicionais</h4>

            {/* Telefone Fixo */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone size={16} className="text-gray-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Telefone fixo</p>
                <p className="text-sm text-gray-800">
                  {contact.landline ? formatPhone(contact.landline) : '-'}
                </p>
              </div>
            </div>

            {/* E-mail */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail size={16} className="text-gray-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">E-mail</p>
                <p className="text-sm text-gray-800">{contact.email || '-'}</p>
              </div>
            </div>

            {/* Gênero */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <User size={16} className="text-gray-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Gênero</p>
                <p className="text-sm text-gray-800">{contact.gender || '-'}</p>
              </div>
            </div>

            {/* Endereço */}
            {(contact.address || contact.complement) && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin size={16} className="text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Endereço</p>
                  <p className="text-sm text-gray-800">{contact.address || '-'}</p>
                  {contact.complement && (
                    <p className="text-xs text-gray-500 mt-1">{contact.complement}</p>
                  )}
                </div>
              </div>
            )}

            {/* Data de Criação */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar size={16} className="text-gray-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Data de criação da conta</p>
                <p className="text-sm text-gray-800">{formatDate(contact.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 shrink-0 space-y-2">
          <button
            onClick={handleBlockToggle}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <Shield size={16} />
            {contact.blocked ? 'Desbloquear contato' : 'Bloquear contato'}
          </button>
          <button
            onClick={handleDelete}
            className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <Trash2 size={16} />
            Excluir contato
          </button>
        </div>
      </div>
    </div>
  );
};
