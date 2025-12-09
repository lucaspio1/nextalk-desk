import React, { useState, useEffect, useRef } from 'react';
import { Monitor, User, ArrowRightLeft, Users, Tag, CheckCircle, X, Sparkles, Send, RotateCcw } from 'lucide-react';
import { Button } from '../components/UIComponents';

const ChatHeaderAction = ({ icon: Icon, label, active, onClick, dropdown }) => (
  <div className="relative">
    <button onClick={onClick} className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${active ? 'bg-emerald-50 text-emerald-600' : 'text-gray-600 hover:bg-gray-50'}`}>
      <Icon size={16} />
      <span className="hidden sm:inline">{label}</span>
    </button>
    {active && (
      <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
        {dropdown}
      </div>
    )}
  </div>
);

export const ChatWindow = ({ ticket, currentUser, onSend, onClose, onPick, onTransfer, onReopen, aiActions }) => {
  const [input, setInput] = useState("");
  const [activePopover, setActivePopover] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [ticket?.messages]);
  const handleSend = () => { if(input.trim()) { onSend(input); setInput(""); } };
  
  if (!ticket) return (
    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-[#f0f2f5] h-full">
      <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-4"><Monitor size={40} className="text-slate-200" /></div>
      <h2 className="text-lg font-medium text-gray-500">NexTalk Desk</h2>
      <p className="text-sm text-gray-400">Selecione um ticket para começar</p>
    </div>
  );

  return (
    <div className="flex-1 flex bg-[#efe7dd] h-full relative min-w-0">
      <div className="flex-1 flex flex-col relative min-w-0">
        {/* HEADER */}
        <div className="bg-white px-4 py-2 border-b border-gray-200 shadow-sm z-20 flex justify-between items-center shrink-0 h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold relative"><User size={20} /><div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div></div>
            <div>
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">{ticket.customerName}</h3>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <span>{ticket.status === 'open' ? 'Aguardando' : ticket.status === 'closed' ? 'Finalizado' : 'Em atendimento'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
             {ticket.status !== 'closed' && (
               <ChatHeaderAction icon={ArrowRightLeft} label="Transferir" active={activePopover === 'transfer'} onClick={() => setActivePopover(activePopover === 'transfer' ? null : 'transfer')} 
                 dropdown={
                   <div className="w-64 p-3 bg-white">
                     <div className="text-xs font-bold text-gray-400 mb-2 uppercase">Departamentos</div>
                     {['Financeiro', 'Suporte', 'Vendas'].map(d => (
                       <button key={d} onClick={() => { onTransfer(ticket, d); setActivePopover(null); }} className="w-full text-left p-2 hover:bg-emerald-50 text-sm text-gray-700 rounded flex items-center gap-2">
                         <Users size={14} className="text-gray-400"/> {d}
                       </button>
                     ))}
                     <div className="h-px bg-gray-100 my-2"></div>
                     <div className="text-xs font-bold text-gray-400 mb-2 uppercase">Agentes</div>
                     {['Atendente 1', 'Atendente 2'].map(a => (
                       <button key={a} onClick={() => { onTransfer(ticket, a); setActivePopover(null); }} className="w-full text-left p-2 hover:bg-emerald-50 text-sm text-gray-700 rounded flex items-center gap-2">
                         <User size={14} className="text-gray-400"/> {a}
                       </button>
                     ))}
                   </div>
                 } 
               />
             )}
             <ChatHeaderAction icon={Tag} label="Etiquetas" active={activePopover === 'tags'} onClick={() => setActivePopover(activePopover === 'tags' ? null : 'tags')} dropdown={<div className="p-3 text-xs">Sem etiquetas disponíveis</div>} />
             {ticket.status !== 'closed' && (
                <ChatHeaderAction icon={CheckCircle} label="Finalizar" active={activePopover === 'finish'} onClick={() => setActivePopover(activePopover === 'finish' ? null : 'finish')} dropdown={
                  <div className="p-1">
                    {['Resolvido', 'Dúvida', 'Engano'].map(r => <button key={r} onClick={() => { onClose(); setActivePopover(null); }} className="w-full text-left p-2 hover:bg-gray-50 text-sm text-gray-700 rounded">{r}</button>)}
                  </div>
                } />
             )}
          </div>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 z-10 relative bg-[#efe7dd] bg-opacity-50">
          {aiActions.summary && (
            <div className="mx-auto max-w-lg bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-emerald-100 relative animate-in fade-in slide-in-from-top-4">
                <button onClick={aiActions.onClearSummary} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"><X size={14}/></button>
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs mb-2 uppercase tracking-wide"><Sparkles size={14}/> Resumo Inteligente</div>
                <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{aiActions.summary.text}</div>
            </div>
          )}
          {ticket.messages.map((msg, idx) => {
            const isMe = msg.sender === 'agent';
            const isSystem = msg.sender === 'system';
            if (isSystem) return <div key={idx} className="flex justify-center my-4"><div className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full shadow-sm">{msg.text}</div></div>;
            return (
              <div key={idx} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] lg:max-w-[70%] p-3 rounded-lg shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] text-sm relative group ${isMe ? 'bg-[#d9fdd3] text-gray-900 rounded-tr-none' : 'bg-white text-gray-900 rounded-tl-none'}`}>
                  {isMe && <p className="text-[10px] text-emerald-700 font-bold mb-1 push-right">{msg.agentName}</p>}
                  {!isMe && <p className="text-[10px] text-gray-500 font-bold mb-1">{ticket.customerName}</p>}
                  <div className="pr-16 leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                  <span className="text-[10px] text-gray-400 absolute bottom-1 right-2 flex items-center gap-1">{new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        {ticket.status === 'active' && ticket.agentId === currentUser.name ? (
          <div className="bg-[#f0f2f5] p-3 px-4 z-10 shrink-0 flex gap-2 items-end">
             <div className="flex-1 bg-white rounded-lg border border-white flex items-center px-4 py-2 focus-within:ring-1 focus-within:ring-white transition-all shadow-sm">
                <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Mensagem" className="flex-1 bg-transparent outline-none text-sm py-1" />
                <button onClick={() => aiActions.onSmartReply(ticket, setInput)} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded" title="Sugestão IA"><Sparkles size={16}/></button>
             </div>
             <button onClick={handleSend} className="p-3 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors shadow-sm"><Send size={20}/></button>
          </div>
        ) : (
          <div className="bg-[#f0f2f5] p-4 text-center border-t border-gray-200">
             {ticket.status === 'open' && <Button onClick={onPick} className="w-full bg-emerald-500 hover:bg-emerald-600">Iniciar Atendimento</Button>}
             {ticket.status === 'closed' && (
               <div className="flex flex-col items-center gap-2">
                 <p className="text-xs text-gray-500 mb-2">Este atendimento foi finalizado.</p>
                 <Button onClick={() => onReopen(ticket)} variant="warning" className="w-full flex items-center justify-center gap-2"><RotateCcw size={16}/> Reabrir Atendimento</Button>
               </div>
             )}
             {ticket.status === 'active' && ticket.agentId !== currentUser.name && <div className="text-sm text-gray-500">Em atendimento por outro agente.</div>}
          </div>
        )}
      </div>
      
      {/* RIGHT SIDEBAR - ATUALIZADO */}
      <div className="w-80 bg-white border-l border-gray-200 hidden xl:flex flex-col h-full shrink-0 overflow-y-auto">
         <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-lg">{currentUser.name.charAt(0)}</div>
            <div><h3 className="font-bold text-gray-800">{currentUser.name}</h3><span className="text-xs text-gray-500 uppercase font-medium">{currentUser.role === 'manager' ? 'Admin' : 'Agente'}</span></div>
         </div>
         {/* Seção removida aqui */}
      </div>
    </div>
  );
};