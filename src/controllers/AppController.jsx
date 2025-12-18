import React, { useState } from 'react';
import { MessageSquare, BarChart2, LogOut, Settings } from 'lucide-react';

import { useAuthModel } from '../models/hooks/useAuthModel';
import { useTicketsModel } from '../models/hooks/useTicketsModel';
import { useSettingsModel } from '../models/hooks/useSettingsModel';
import { AIService } from '../models/services/AIService';
import { TicketService } from '../models/services/TicketService.api';

import { LoginView } from '../views/pages/LoginView';
import { DashboardView } from '../views/pages/DashboardView';
import { AdminView } from '../views/pages/AdminView';
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
    // Verifica se o target é um departamento (comparando com a lista de departamentos do banco)
    const isDept = settingsModel.departments.some(d => d.name === target);
    await TicketService.sendMessage(ticket.id, ticket.messages, {
      text: `Ticket transferido para ${target}`,
      sender: 'system',
      agentName: 'System'
    }, ticket.customerPhone);
    await TicketService.updateTicket(ticket.id, {
      agentId: isDept ? null : target,
      status: isDept ? 'open' : 'active',
      aiCategory: isDept ? target : ticket.aiCategory
    });
    if (target !== authModel.profile.name) setSelectedTicketId(null);
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

  const selectedTicket = ticketModel.tickets.find(t => t.id === selectedTicketId);

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
            <button onClick={() => setView('dashboard')} className={`p-2 rounded-md transition-all ${view === 'dashboard' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}><BarChart2 size={20}/></button>
            <button onClick={() => setView('settings')} className={`p-2 rounded-md transition-all ${view === 'settings' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}><Settings size={20}/></button>
          </div>
          <button onClick={authModel.logout} className="text-gray-400 hover:text-red-500 transition-colors"><LogOut size={20}/></button>
        </div>
      </header>
      <main className="flex-1 flex overflow-hidden relative">
        {view === 'dashboard' && <DashboardView stats={ticketModel.stats} />}
        {view === 'chat' && (
          <>
            <ChatSidebar
              tickets={ticketModel.tickets}
              currentUser={authModel.profile}
              selectedId={selectedTicketId}
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
              onSend={(txt) => TicketService.sendMessage(selectedTicket.id, selectedTicket.messages, { text: txt, sender: 'agent', agentName: authModel.profile.name }, selectedTicket.customerPhone)}
              onTransfer={handleTransfer}
              onReopen={handleReopen}
              onUpdate={handleUpdateTicket} // Passando a função nova
              onClose={() => { TicketService.updateTicket(selectedTicket.id, { status: 'closed', closedAt: new Date() }); setSelectedTicketId(null); }}
              onPick={() => TicketService.updateTicket(selectedTicket.id, { status: 'active', agentId: authModel.profile.name, startedAt: new Date() })}
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