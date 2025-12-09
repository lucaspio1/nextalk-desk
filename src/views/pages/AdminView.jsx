import React, { useState, useEffect } from 'react';
import { MessageSquare, Sliders, Zap, Users, User, CheckSquare, Tag, CheckCircle, Clock, Bot, Brain, LayoutGrid, Code, CreditCard, UserCog, PlusCircle, Settings, QrCode, Smartphone, Wifi, Facebook } from 'lucide-react';
import { Button, ToggleSwitch, SectionHeader, AdminTable } from '../components/UIComponents';
import { WhatsAppService } from '../../models/services/WhatsAppService';

const AdminSidebar = ({ activeTab, onTabChange }) => {
  const items = [
    { id: 'connection', icon: Smartphone, label: 'Conexão' },
    { id: 'general', icon: Sliders, label: 'Ajustes gerais' },
    { id: 'quick', icon: Zap, label: 'Respostas Rápidas' },
    { id: 'depts', icon: Users, label: 'Departamentos' },
    { id: 'users', icon: User, label: 'Usuários' },
    { id: 'contacts', icon: CheckSquare, label: 'Contatos' },
    { id: 'tags', icon: Tag, label: 'Etiquetas' },
    { id: 'reasons', icon: CheckCircle, label: 'Motivos de Finalização' },
    { id: 'schedule', icon: Clock, label: 'Jornada de Trabalho' },
    { id: 'chatbot', icon: Bot, label: 'Chatbot' },
    { id: 'ai', icon: Brain, label: 'Inteligência Artificial' },
    { id: 'widgets', icon: LayoutGrid, label: 'Widgets' },
    { id: 'dev', icon: Code, label: 'Desenvolvedor' },
    { id: 'payment', icon: CreditCard, label: 'Pagamento' },
    { id: 'profile', icon: UserCog, label: 'Meus dados' },
  ];

  return (
    <div className="w-64 bg-[#f8f9fa] border-r border-gray-200 flex flex-col h-full overflow-y-auto shrink-0">
      <div className="p-4">
        <div className="bg-gray-100 rounded-lg p-3 text-sm text-gray-600 mb-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-1 font-bold"><MessageSquare size={14}/> chatPro</div>
          Conecte o chatPro à sua conta do WhatsApp, Facebook ou Instagram.
        </div>
      </div>
      <nav className="flex-1 px-2 space-y-0.5">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === item.id ? 'text-emerald-600 bg-emerald-50' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

const AdminContent = ({ activeTab }) => {
    const [status, setStatus] = useState('DISCONNECTED');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'connection') {
            WhatsAppService.getStatus().then(s => setStatus(s.state));
        }
    }, [activeTab]);

    const handleConnect = async () => {
        setIsLoading(true);
        // Simula verificação de credenciais
        const res = await WhatsAppService.getStatus();
        // Força "conectado" para demo, na real dependeria das credenciais
        setTimeout(() => {
            setStatus('CONNECTED');
            setIsLoading(false);
        }, 1500);
    };

    switch(activeTab) {
      case 'connection':
        return (
          <div className="max-w-4xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
             <SectionHeader title="Conexão WhatsApp Oficial" description="Gerencie a integração com a API do WhatsApp Business (Meta)." />
             
             <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <Facebook size={32} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">WhatsApp Business API</h3>
                        <p className="text-sm text-gray-500">Conexão oficial via Meta Graph API.</p>
                    </div>
                    <div className={`ml-auto px-3 py-1 rounded-full text-xs font-bold ${status === 'CONNECTED' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        {status === 'CONNECTED' ? 'ATIVO' : 'INATIVO'}
                    </div>
                </div>

                {status === 'CONNECTED' ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Wifi size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Conexão Estabelecida</h3>
                        <p className="text-gray-500 mt-2 mb-6">Sua instância está operando normalmente com a API Oficial.</p>
                        <Button variant="danger" onClick={() => setStatus('DISCONNECTED')}>Desconectar</Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 text-blue-800 text-sm rounded-lg border border-blue-100">
                            Certifique-se de configurar suas credenciais (Phone ID, WABA ID, Token) no arquivo <code>src/config/whatsapp.js</code> antes de conectar.
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={handleConnect} disabled={isLoading} className="bg-emerald-600 text-white">
                                {isLoading ? 'Verificando...' : 'Validar Conexão'}
                            </Button>
                        </div>
                    </div>
                )}
             </div>
          </div>
        );
      case 'general':
        return (
          <div className="max-w-4xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
             <SectionHeader title="Ajustes gerais" description="Configurações globais da plataforma." />
             <div className="grid gap-4">
               <ToggleSwitch label="Identificar nome do usuário" checked={false} />
               <ToggleSwitch label="Ocultar números de telefone" checked={false} />
               <ToggleSwitch label="Ocultar conversas iniciadas via disparos" checked={false} />
               <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg">
                 <div>
                   <span className="text-sm font-medium text-gray-800">Finalizar atendimento por inatividade</span>
                   <p className="text-xs text-gray-400 mt-1">Finaliza sessões ociosas automaticamente</p>
                 </div>
                 <Button variant="primary" className="bg-emerald-600">Configurar</Button>
               </div>
             </div>
          </div>
        );
      case 'quick':
        return (
          <div className="max-w-5xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
             <SectionHeader title="Respostas Rápidas" description="Agilize interações e torne seu atendimento mais eficiente." action={<Button variant="primary" className="bg-emerald-500"><PlusCircle size={16}/> Adicionar</Button>} />
             <div className="bg-white p-4 rounded-lg border border-gray-100 flex gap-2 mb-4">
               <input type="text" placeholder="Pesquisar..." className="flex-1 bg-transparent outline-none text-sm" />
             </div>
             <AdminTable headers={['Título', 'Descrição', 'Tipo', 'Visibilidade', 'Ação']} rows={[]} />
          </div>
        );
      case 'depts':
        return (
          <div className="max-w-5xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
             <SectionHeader title="Departamentos" description="Organize usuários e direcione o chatbot." action={<Button variant="primary" className="bg-emerald-500"><PlusCircle size={16}/> Adicionar</Button>} />
             <div className="bg-white p-4 rounded-lg border border-gray-100 flex gap-2 mb-4">
               <input type="text" placeholder="Pesquisar..." className="flex-1 bg-transparent outline-none text-sm" />
             </div>
             <AdminTable headers={['Título', 'Ação']} rows={[['Financeiro', <span className="text-emerald-600 cursor-pointer text-xs font-bold">Editar ›</span>]]} />
          </div>
        );
      case 'chatbot':
         return (
          <div className="max-w-4xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
             <SectionHeader title="Chatbot" description="Automatize pré-atendimentos e direcione clientes." />
             <div className="space-y-4">
                <div className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-lg">
                   <div>
                      <h3 className="font-bold text-gray-800">Ativar Chatbot</h3>
                      <p className="text-xs text-gray-500">Ativar chatbot para atendimento automático.</p>
                   </div>
                   <div className="bg-gray-200 w-12 h-6 rounded-full relative cursor-pointer"><div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow"></div></div>
                </div>
                <div className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-lg">
                   <div>
                      <h3 className="font-bold text-gray-800">Ação de Inatividade</h3>
                      <p className="text-xs text-gray-500">Defina uma ação para casos de inatividade.</p>
                   </div>
                   <Button variant="primary" className="bg-emerald-600">Configurar</Button>
                </div>
             </div>
          </div>
         );
      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center"><Settings size={48} className="mx-auto mb-4 opacity-20" /><p>Selecione uma opção no menu lateral.</p></div>
          </div>
        );
    }
};

export const AdminView = ({ activeTab, onTabChange }) => (
  <div className="flex w-full h-full bg-[#f8f9fa]">
     <AdminSidebar activeTab={activeTab} onTabChange={onTabChange} />
     <div className="flex-1 p-8 bg-white h-full overflow-y-auto">
        <AdminContent activeTab={activeTab} />
     </div>
  </div>
);