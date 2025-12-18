import React, { useState, useEffect, useRef } from 'react';
import { Monitor, User, ArrowRightLeft, Users, Tag, CheckCircle, X, Sparkles, Send, RotateCcw, StickyNote, FileText, Loader2, Check } from 'lucide-react';
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

export const ChatWindow = ({ ticket, currentUser, departments = [], users = [], tags = [], reasons = [], onSend, onClose, onPick, onTransfer, onReopen, onUpdate, aiActions }) => {
  const [input, setInput] = useState("");
  const [notes, setNotes] = useState("");
  const [saveStatus, setSaveStatus] = useState("saved"); // 'saved', 'saving', 'typing'
  const [activePopover, setActivePopover] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => { 
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [ticket?.messages]);

  // Carrega as notas apenas quando muda o ID do ticket (evita sobrescrever enquanto digita)
  useEffect(() => {
      if (ticket) {
          setNotes(ticket.notes || "");
          setSaveStatus("saved");
      }
  }, [ticket?.id]);

  // Lógica de Salvamento Automático (Debounce)
  useEffect(() => {
      if (!ticket) return;
      
      // Se a nota atual for igual a do banco, não faz nada
      if (notes === (ticket.notes || "")) {
          setSaveStatus("saved");
          return;
      }

      setSaveStatus("typing");

      const timer = setTimeout(() => {
          setSaveStatus("saving");
          if (onUpdate) {
              onUpdate(ticket.id, { notes }).then(() => {
                  setSaveStatus("saved");
              });
          }
      }, 1500); // Salva 1.5s após parar de digitar

      return () => clearTimeout(timer);
  }, [notes]);

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
                     {departments.length > 0 && (
                       <>
                         <div className="text-xs font-bold text-gray-400 mb-2 uppercase">Departamentos</div>
                         {departments.map(d => (
                           <button key={d.id} onClick={() => { onTransfer(ticket, d.name); setActivePopover(null); }} className="w-full text-left p-2 hover:bg-emerald-50 text-sm text-gray-700 rounded flex items-center gap-2">
                             <Users size={14} className="text-gray-400"/> {d.name}
                           </button>
                         ))}
                         <div className="h-px bg-gray-100 my-2"></div>
                       </>
                     )}
                     <div className="text-xs font-bold text-gray-400 mb-2 uppercase">Agentes</div>
                     {users.length > 0 ? users.filter(u => u.role === 'agent').map(a => (
                       <button key={a.id} onClick={() => { onTransfer(ticket, a.name); setActivePopover(null); }} className="w-full text-left p-2 hover:bg-emerald-50 text-sm text-gray-700 rounded flex items-center gap-2">
                         <User size={14} className="text-gray-400"/> {a.name}
                       </button>
                     )) : (
                       <div className="text-xs text-gray-400 p-2">Nenhum agente disponível</div>
                     )}
                   </div>
                 } 
               />
             )}
             <ChatHeaderAction icon={Tag} label="Etiquetas" active={activePopover === 'tags'} onClick={() => setActivePopover(activePopover === 'tags' ? null : 'tags')} dropdown={
              <div className="p-3">
                {tags.length > 0 ? (
                  <div className="space-y-1">
                    {tags.map(t => (
                      <button key={t.id} className="w-full text-left p-2 hover:bg-gray-50 text-sm text-gray-700 rounded flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }}></div>
                        {t.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400">Sem etiquetas disponíveis</div>
                )}
              </div>
            } />
             {ticket.status !== 'closed' && (
                <ChatHeaderAction icon={CheckCircle} label="Finalizar" active={activePopover === 'finish'} onClick={() => setActivePopover(activePopover === 'finish' ? null : 'finish')} dropdown={
                  <div className="p-1">
                    {reasons.length > 0 ? reasons.map(r => (
                      <button key={r.id} onClick={() => { onClose(); setActivePopover(null); }} className="w-full text-left p-2 hover:bg-gray-50 text-sm text-gray-700 rounded">
                        {r.name}
                      </button>
                    )) : (
                      <button onClick={() => { onClose(); setActivePopover(null); }} className="w-full text-left p-2 hover:bg-gray-50 text-sm text-gray-700 rounded">
                        Finalizar sem motivo
                      </button>
                    )}
                  </div>
                } />
             )}
          </div>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 z-10 relative bg-[#efe7dd] bg-opacity-50">
          {/* Resumo removido daqui para ir para a lateral */}
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
      
      {/* RIGHT SIDEBAR - RESUMO & ANOTAÇÕES */}
      <div className="w-80 bg-white border-l border-gray-200 hidden xl:flex flex-col h-full shrink-0">
         
         {/* SEÇÃO 1: RESUMO IA */}
         <div className="p-4 border-b border-gray-200 bg-emerald-50/30">
            <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-3 text-sm uppercase tracking-wide">
                <Sparkles size={16} className="text-emerald-500"/> Resumo Inteligente
            </h3>
            
            {aiActions.loadingSummary ? (
                <div className="text-center py-4 text-gray-400 text-xs flex flex-col items-center gap-2">
                    <Loader2 size={20} className="animate-spin text-emerald-500"/>
                    Gerando resumo...
                </div>
            ) : aiActions.summary?.id === ticket.id ? (
                <div className="text-sm text-gray-600 leading-relaxed bg-white p-3 rounded border border-emerald-100 shadow-sm animate-in fade-in">
                    {aiActions.summary.text}
                </div>
            ) : (
                <div className="text-center">
                    <p className="text-xs text-gray-400 mb-3">Gere um resumo rápido desta conversa para entender o contexto.</p>
                    <button onClick={aiActions.onSummarize} className="w-full bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-50 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm">
                        Gerar Resumo
                    </button>
                </div>
            )}
         </div>

         {/* SEÇÃO 2: ANOTAÇÕES */}
         <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/30">
             <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
                <h3 className="font-bold text-gray-700 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <StickyNote size={16} className="text-yellow-500"/> Anotações
                </h3>
                <div className="text-[10px] font-medium flex items-center gap-1">
                    {saveStatus === 'saving' && <span className="text-gray-400 flex items-center gap-1"><Loader2 size={10} className="animate-spin"/> Salvando...</span>}
                    {saveStatus === 'saved' && <span className="text-emerald-600 flex items-center gap-1"><Check size={12}/> Salvo</span>}
                    {saveStatus === 'typing' && <span className="text-gray-400">Digitando...</span>}
                </div>
             </div>
             
             <div className="p-4 flex-1 flex flex-col min-h-0">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-1 shadow-sm flex-1 flex flex-col relative focus-within:ring-2 focus-within:ring-yellow-400/50 transition-all">
                    <textarea 
                        className="w-full h-full p-3 bg-transparent outline-none resize-none text-sm text-gray-700 leading-relaxed" 
                        placeholder="Escreva aqui observações internas..."
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                    ></textarea>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 text-center">
                    Auto-save ativo. Visível apenas internamente.
                </p>
             </div>
         </div>

      </div>
    </div>
  );
};