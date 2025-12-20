import React, { useState } from 'react';
import { MessageSquare, BarChart2, LogOut, Settings, Users } from 'lucide-react';

import { useAuthModel } from '../models/hooks/useAuthModel';
import { useTicketsModel } from '../models/hooks/useTicketsModel';
import { useSettingsModel } from '../models/hooks/useSettingsModel';
import { AIService } from '../models/services/AIService';
import { TicketService } from '../models/services/TicketService.api';
import { ContactService } from '../models/services/ContactService.api';

import { LoginView } from '../views/pages/LoginView';
import { DashboardView } from '../views/pages/DashboardView';
import { AdminView } from '../views/pages/AdminView';
import { ContactsView } from '../views/pages/ContactsView';
import { ChatSidebar } from '../views/partials/ChatSidebar';
import { ChatWindow } from '../views/partials/ChatWindow';

export default function AppController() {
  const authModel = useAuthModel();
  const ticketModel = useTicketsModel(authModel.profile);
  const settingsModel = useSettingsModel();

  const [view, setView] = useState('chat');
  const [adminTab, setAdminTab] = useState('connection');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [aiState, setAiState] = useState({ replyLoading: false, summaryLoading: false, summaryData: null });

  // Optimistic updates - Estado local que sobrescreve temporariamente os tickets do polling
  const [optimisticTickets, setOptimisticTickets] = useState({});

  // Mescla tickets do polling com updates otimistas locais
  const mergedTickets = ticketModel.tickets.map(ticket => {
    if (optimisticTickets[ticket.id]) {
      return { ...ticket, ...optimisticTickets[ticket.id] };
    }
    return ticket;
  });

  const selectedTicket = mergedTickets.find(t => t.id === selectedTicketId);

  const handleLogin = async (email, pass) => {
    setIsLoggingIn(true);
    try {
      await authModel.login(email, pass);
      setLoginError("");
    } catch (msg) {
      setLoginError(msg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleCreateTicket = async ({ name, phone, message }) => {
    // Busca ou cria contato automaticamente
    try {
      await ContactService.findOrCreateByPhone(phone, { name });
    } catch (error) {
      console.error('Erro ao criar/atualizar contato:', error);
      // Continua criando o ticket mesmo se falhar a criação do contato
    }

    const docRef = await TicketService.createTicket({
      customerName: name,
      customerPhone: phone,
      status: 'active',
      agentId: authModel.profile.name,
      messages: message.trim() ? [{ text: message, sender: 'agent', agentName: authModel.profile.name }] : [],
      aiCategory: 'Outros',
      aiPriority: 'Normal',
      notes: '' // Campo inicial de notas
    });
    setSelectedTicketId(docRef.id);
  };

  const handleSmartReply = async (ticket, setInputFn) => {
    setAiState(p => ({...p, replyLoading: true}));
    const history = ticket.messages.map(m => `${m.sender}: ${m.text}`).join('\n');
    const reply = await AIService.generateResponse(`Sugira resposta curta e cordial:\n${history}`);
    if (reply) setInputFn(reply.trim());
    setAiState(p => ({...p, replyLoading: false}));
  };

  const handleSummarize = async () => {
    const t = ticketModel.tickets.find(t => t.id === selectedTicketId);
    if (!t) return;
    setAiState(p => ({...p, summaryLoading: true, summaryData: null}));
    const history = t.messages.map(m => `${m.sender}: ${m.text}`).join('\n');
    const text = await AIService.generateResponse(`Resuma em 3 bullets:\n${history}`);
    setAiState(p => ({...p, summaryLoading: false, summaryData: { id: t.id, text }}));
  };

  const handleTransfer = async (ticket, target) => {
    if (!ticket) return;

    // Optimistic update - Remove da visualização imediatamente
    if (target !== authModel.profile.name) {
      setSelectedTicketId(null);
    }

    // Verifica se o target é um departamento (comparando com a lista de departamentos do banco)
    const isDept = settingsModel.departments.some(d => d.name === target);

    // Executa as operações em paralelo para melhor performance
    await Promise.all([
      TicketService.sendMessage(ticket.id, ticket.messages, {
        text: `Ticket transferido para ${target}`,
        sender: 'system',
        agentName: 'System'
      }, ticket.customerPhone),
      TicketService.updateTicket(ticket.id, {
        agentId: isDept ? null : target,
        status: isDept ? 'open' : 'active',
        aiCategory: isDept ? target : ticket.aiCategory
      })
    ]);
  };

  const handleReopen = async (ticket) => {
    if (!ticket) return;
    await TicketService.updateTicket(ticket.id, { status: 'active', agentId: authModel.profile.name });
    await TicketService.sendMessage(ticket.id, ticket.messages, {
      text: `Ticket reaberto por ${authModel.profile.name}`,
      sender: 'system',
      agentName: 'System'
    }, ticket.customerPhone);
  };

  // Nova função para atualizar dados gerais do ticket (como notas)
  const handleUpdateTicket = async (ticketId, data) => {
    await TicketService.updateTicket(ticketId, data);
  };

  // Função otimizada para enviar mensagem com optimistic update
  const handleSendMessage = async (txt) => {
    if (!selectedTicket) return;

    const newMessage = {
      text: txt,
      sender: 'agent',
      agentName: authModel.profile.name,
      timestamp: new Date().toISOString()
    };

    // Optimistic update - Adiciona mensagem imediatamente na UI
    setOptimisticTickets(prev => ({
      ...prev,
      [selectedTicket.id]: {
        ...prev[selectedTicket.id],
        messages: [...selectedTicket.messages, newMessage]
      }
    }));

    // Envia para o servidor em background
    await TicketService.sendMessage(
      selectedTicket.id,
      selectedTicket.messages,
      newMessage,
      selectedTicket.customerPhone
    );

    // Remove o optimistic update após 3 segundos (tempo para o polling sincronizar)
    setTimeout(() => {
      setOptimisticTickets(prev => {
        const updated = { ...prev };
        if (updated[selectedTicket.id]?.messages) {
          delete updated[selectedTicket.id];
        }
        return updated;
      });
    }, 3000);
  };

  // Função otimizada para iniciar atendimento com optimistic update
  const handlePickTicket = async () => {
    if (!selectedTicket) return;

    // Optimistic update - Muda status imediatamente na UI
    setOptimisticTickets(prev => ({
      ...prev,
      [selectedTicket.id]: {
        status: 'active',
        agentId: authModel.profile.name,
        startedAt: new Date()
      }
    }));

    // Atualiza no servidor em background
    await TicketService.updateTicket(selectedTicket.id, {
      status: 'active',
      agentId: authModel.profile.name,
      startedAt: new Date()
    });

    // Remove o optimistic update após 3 segundos (tempo para o polling sincronizar)
    setTimeout(() => {
      setOptimisticTickets(prev => {
        const updated = { ...prev };
        delete updated[selectedTicket.id];
        return updated;
      });
    }, 3000);
  };

  if (!authModel.profile) return <LoginView onLogin={handleLogin} isLoading={isLoggingIn} error={loginError} />;

  return (
    <div className="h-screen w-full bg-white flex flex-col overflow-hidden font-sans text-gray-900">
      <header className="bg-white border-b border-gray-200 p-3 px-6 flex justify-between items-center shadow-sm z-20 shrink-0 h-16">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-2 rounded-lg text-white"><MessageSquare size={20} /></div>
          <div><h1 className="font-bold text-lg text-slate-900 leading-tight">NexTalk Desk</h1><p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Central Inteligente</p></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
             <div className="flex flex-col items-end leading-none"><span className="text-xs font-bold text-gray-700">{authModel.profile.name}</span><span className="text-[10px] text-gray-400 uppercase">{authModel.profile.role === 'manager' ? 'Gerente' : 'Agente'}</span></div>
             <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-xs border-2 border-white shadow-sm">{authModel.profile.name.charAt(0)}</div>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button onClick={() => setView('chat')} className={`p-2 rounded-md transition-all ${view === 'chat' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}><MessageSquare size={20}/></button>
            <button onClick={() => setView('contacts')} className={`p-2 rounded-md transition-all ${view === 'contacts' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}><Users size={20}/></button>
            <button onClick={() => setView('dashboard')} className={`p-2 rounded-md transition-all ${view === 'dashboard' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}><BarChart2 size={20}/></button>
            <button onClick={() => setView('settings')} className={`p-2 rounded-md transition-all ${view === 'settings' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}><Settings size={20}/></button>
          </div>
          <button onClick={authModel.logout} className="text-gray-400 hover:text-red-500 transition-colors"><LogOut size={20}/></button>
        </div>
      </header>
      <main className="flex-1 flex overflow-hidden relative">
        {view === 'dashboard' && <DashboardView stats={ticketModel.stats} />}
        {view === 'contacts' && <ContactsView tags={settingsModel.tags} />}
        {view === 'chat' && (
          <>
            <ChatSidebar
              tickets={mergedTickets}
              currentUser={authModel.profile}
              selectedId={selectedTicketId}
              tags={settingsModel.tags}
              onSelect={(t) => { if (t.status !== 'analyzing') { setSelectedTicketId(t.id); setAiState(p => ({...p, summaryData: null})); }}}
              onCreateTicket={handleCreateTicket}
            />
            <ChatWindow
              ticket={selectedTicket}
              currentUser={authModel.profile}
              departments={settingsModel.departments}
              users={settingsModel.users}
              tags={settingsModel.tags}
              reasons={settingsModel.reasons}
              quickResponses={settingsModel.quickResponses}
              onSend={handleSendMessage}
              onTransfer={handleTransfer}
              onReopen={handleReopen}
              onUpdate={handleUpdateTicket}
              onClose={() => { TicketService.updateTicket(selectedTicket.id, { status: 'closed', closedAt: new Date() }); setSelectedTicketId(null); }}
              onPick={handlePickTicket}
              aiActions={{
                onSmartReply: handleSmartReply,
                onSummarize: handleSummarize,
                onClearSummary: () => setAiState(p => ({...p, summaryData: null})),
                loadingReply: aiState.replyLoading,
                loadingSummary: aiState.summaryLoading,
                summary: aiState.summaryData
              }}
            />
          </>
        )}
        {view === 'settings' && <AdminView activeTab={adminTab} onTabChange={setAdminTab} />}
      </main>
    </div>
  );
}