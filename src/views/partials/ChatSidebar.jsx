import React, { useState, useMemo } from 'react';
import { PlusCircle, Search, CheckCircle, User, X, Loader2 } from 'lucide-react';
import { Badge } from '../components/UIComponents';

export const ChatSidebar = ({ tickets, currentUser, selectedId, onSelect, onCreateTicket }) => {
  const [activeFilter, setActiveFilter] = useState('mine');
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatData, setNewChatData] = useState({ name: '', phone: '', message: '' });

  // Contagem
  const counts = useMemo(() => {
    return tickets.reduce((acc, t) => {
      acc.all++;
      if (t.status === 'open' || t.status === 'analyzing') acc.waiting++;
      if (t.status === 'active') acc.active++;
      if (t.status === 'active' && t.agentId === currentUser?.name) acc.mine++;
      return acc;
    }, { all: 0, waiting: 0, active: 0, mine: 0 });
  }, [tickets, currentUser]);

  const filters = [
    { id: 'mine', label: 'Meus', count: counts.mine },
    { id: 'waiting', label: 'Aguardando', count: counts.waiting },
    { id: 'active', label: 'Em atendimento', count: counts.active },
    { id: 'all', label: 'Todos', count: counts.all },
  ];

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      switch(activeFilter) {
        case 'waiting': return t.status === 'open' || t.status === 'analyzing';
        case 'active': return t.status === 'active';
        case 'mine': return t.status === 'active' && t.agentId === currentUser?.name;
        case 'all': default: return true;
      }
    });
  }, [tickets, activeFilter, currentUser]);

  const handleCreate = (e) => {
    e.preventDefault();
    onCreateTicket(newChatData);
    setShowNewChat(false);
    setNewChatData({ name: '', phone: '', message: '' });
  };

  // Helper para formatar datas (compatível com MongoDB e Firebase)
  const formatTime = (dateValue) => {
    try {
      // Se for Timestamp do Firebase
      if (dateValue?.toMillis) {
        return new Date(dateValue.toMillis()).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
      }
      // Se for string ISO ou Date do MongoDB
      if (dateValue) {
        return new Date(dateValue).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
      }
      return '--:--';
    } catch (e) {
      return '--:--';
    }
  };

  const TicketItem = ({ t }) => (
    <div onClick={() => onSelect(t)} className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedId === t.id ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : ''} ${t.status === 'analyzing' ? 'opacity-70 pointer-events-none' : ''}`}>
      <div className="flex justify-between mb-1">
        <span className={`font-semibold truncate ${t.status === 'closed' ? 'text-gray-500' : 'text-gray-900'}`}>{t.customerName}</span>
        {t.status === 'analyzing' ? (
          <span className="text-xs text-indigo-600 flex items-center gap-1"><Loader2 size={10} className="animate-spin"/> IA...</span>
        ) : (
          <span className="text-xs text-gray-400">{formatTime(t.createdAt)}</span>
        )}
      </div>
      <div className="text-sm text-gray-500 truncate mb-2">{t.messages[t.messages.length-1]?.text}</div>
      <div className="flex gap-1 flex-wrap items-center">
        {t.status === 'open' && <span className="w-2 h-2 rounded-full bg-amber-400 mr-1" title="Aguardando"></span>}
        {t.status === 'active' && <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1" title="Em atendimento"></span>}
        {t.status === 'closed' && <span className="w-2 h-2 rounded-full bg-gray-400 mr-1" title="Finalizado"></span>}
        {t.aiCategory && <Badge text={t.aiCategory} />}
        {t.aiPriority && <Badge text={t.aiPriority} />}
        {t.agentId && t.agentId !== currentUser?.name && (
          <span className="text-[10px] text-gray-400 ml-auto flex items-center gap-1"><User size={10}/> {t.agentId.split(' ')[0]}</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col h-full shrink-0 z-10 relative">
      {/* Modal Overlay */}
      {showNewChat && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                 <h3 className="font-bold text-gray-700">Nova Conversa</h3>
                 <button onClick={() => setShowNewChat(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>
              <form onSubmit={handleCreate} className="p-4 space-y-3">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome do Contato</label>
                    <input required className="w-full p-2 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none" value={newChatData.name} onChange={e => setNewChatData({...newChatData, name: e.target.value})} placeholder="Ex: João Silva" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefone (WhatsApp)</label>
                    <input required className="w-full p-2 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none" value={newChatData.phone} onChange={e => setNewChatData({...newChatData, phone: e.target.value})} placeholder="5511999999999" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mensagem Inicial</label>
                    <textarea className="w-full p-2 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none" rows="3" value={newChatData.message} onChange={e => setNewChatData({...newChatData, message: e.target.value})} placeholder="Olá, como posso ajudar?"></textarea>
                 </div>
                 <div className="pt-2">
                    <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors">Iniciar Conversa</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      <div className="p-4 border-b border-gray-200 bg-gray-50/50">
        <div className="flex justify-between items-center mb-4">
           <h2 className="font-bold text-gray-700">Inbox</h2>
           <button onClick={() => setShowNewChat(true)} className="text-xs bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors shadow-sm">
             <PlusCircle size={14} /> Nova
           </button>
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Buscar ticket..." className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          {filters.map(f => (
            <button 
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`flex justify-between items-center px-3 py-2 rounded-lg text-xs font-medium transition-all ${activeFilter === f.id ? 'bg-emerald-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <span>{f.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeFilter === f.id ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>{f.count}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredTickets.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm flex flex-col items-center mt-10">
            <CheckCircle className="mb-2 opacity-20" size={32}/>
            <span>Nenhum atendimento<br/>neste filtro.</span>
          </div>
        ) : (
          filteredTickets.map(t => <TicketItem key={t.id} t={t} />)
        )}
      </div>
    </div>
  );
};