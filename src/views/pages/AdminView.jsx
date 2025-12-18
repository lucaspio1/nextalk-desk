import React, { useState, useEffect } from 'react';
// Importação UNIFICADA e CORRIGIDA dos ícones
import { 
  MessageSquare, Sliders, Zap, Users, User, CheckSquare, Tag, CheckCircle, 
  Clock, Bot, Brain, LayoutGrid, Code, CreditCard, UserCog, PlusCircle, 
  Settings, QrCode, Smartphone, Wifi, Facebook, Trash2, Edit2, X, Save, 
  AlertTriangle 
} from 'lucide-react';

import { Button, ToggleSwitch, SectionHeader, AdminTable } from '../components/UIComponents';
import { WhatsAppService } from '../../models/services/WhatsAppService';
import { SettingsService } from '../../models/services/SettingsService.api';
import { PaymentService } from '../../models/services/PaymentService.api';

// --- SUB-COMPONENTE: SIDEBAR ---
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
    { id: 'chatbot', icon: Bot, label: 'Chatbot' },
    { id: 'ai', icon: Brain, label: 'Inteligência Artificial' },
    { id: 'payment', icon: CreditCard, label: 'Pagamento' },
    { id: 'profile', icon: UserCog, label: 'Meus dados' },
  ];

  return (
    <div className="w-64 bg-[#f8f9fa] border-r border-gray-200 flex flex-col h-full overflow-y-auto shrink-0">
      <div className="p-4"></div>
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

// --- SUB-COMPONENTE: PAINEL DE ASSINATURA SAAS (CORRIGIDO) ---
const PaymentPanel = () => {
  // Adicionados campos de email e telefone
  const [payerForm, setPayerForm] = useState({
    name: '', 
    cpfCnpj: '', 
    email: '',
    mobilePhone: '',
    billingType: 'PIX'
  });
  
  const [paymentResult, setPaymentResult] = useState(null);
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setPayLoading(true);
    setPayError('');
    setPaymentResult(null);

    try {
      // Validação dos novos campos
      if (!payerForm.cpfCnpj || !payerForm.name || !payerForm.email || !payerForm.mobilePhone) {
        throw new Error('Por favor, preencha todos os campos (Nome, CPF/CNPJ, Email e Telefone).');
      }

      // Limpeza do telefone (apenas números)
      const cleanPhone = payerForm.mobilePhone.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        throw new Error('Telefone inválido. Digite DDD + Número.');
      }

      const SUBSCRIPTION_VALUE = 5.00;
      const SUBSCRIPTION_DESC = 'Assinatura Mensal - Nextalk Desk (SaaS)';

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dueDate = tomorrow.toISOString().split('T')[0];

      const payload = {
        customer: {
          name: payerForm.name,
          cpfCnpj: payerForm.cpfCnpj.replace(/\D/g, ''),
          mobilePhone: cleanPhone, // Agora usa o telefone digitado
          email: payerForm.email   // Agora usa o email digitado
        },
        payment: {
          billingType: payerForm.billingType,
          value: SUBSCRIPTION_VALUE,
          description: SUBSCRIPTION_DESC,
          dueDate: dueDate
        }
      };

      const result = await PaymentService.createPayment(payload);
      setPaymentResult(result);
      
    } catch (error) {
      console.error('Erro ao processar assinatura:', error);
      setPayError(error.message || 'Erro ao comunicar com o servidor de pagamento.');
    } finally {
      setPayLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
          <div>
             <h2 className="text-2xl font-bold tracking-tight text-gray-800">Minha Assinatura</h2>
             <p className="text-muted-foreground">Gerencie o pagamento da sua licença de uso.</p>
          </div>
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold text-sm border border-blue-100">
             Plano Atual: PRO (Teste)
          </div>
      </div>
      
      {payError && (
        <div className="bg-red-50 text-red-600 p-4 rounded border border-red-200 flex items-center gap-2">
           <AlertTriangle size={20} />
           <span>{payError}</span>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Card do Formulário */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
           <div className="bg-gray-50 p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Dados de Faturamento</h3>
           </div>
           <div className="p-6">
              {!paymentResult ? (
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase">Informações Pessoais</label>
                    <input 
                      required 
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all" 
                      value={payerForm.name} 
                      onChange={e => setPayerForm({...payerForm, name: e.target.value})} 
                      placeholder="Nome Completo ou Razão Social" 
                    />
                    <input 
                      required 
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all" 
                      value={payerForm.cpfCnpj} 
                      onChange={e => setPayerForm({...payerForm, cpfCnpj: e.target.value})} 
                      placeholder="CPF ou CNPJ" 
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase">Contato</label>
                    <input 
                      required 
                      type="email"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all" 
                      value={payerForm.email} 
                      onChange={e => setPayerForm({...payerForm, email: e.target.value})} 
                      placeholder="seu@email.com" 
                    />
                    <input 
                      required 
                      type="tel"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all" 
                      value={payerForm.mobilePhone} 
                      onChange={e => setPayerForm({...payerForm, mobilePhone: e.target.value})} 
                      placeholder="WhatsApp (ex: 11999998888)" 
                    />
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Forma de Pagamento</label>
                    <div className="grid grid-cols-2 gap-2">
                       <button
                         type="button"
                         onClick={() => setPayerForm({...payerForm, billingType: 'PIX'})}
                         className={`p-3 rounded border text-sm font-medium flex items-center justify-center gap-2 ${payerForm.billingType === 'PIX' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 hover:bg-gray-50'}`}
                       >
                         <QrCode size={16}/> Pix
                       </button>
                       <button
                         type="button"
                         onClick={() => setPayerForm({...payerForm, billingType: 'BOLETO'})}
                         className={`p-3 rounded border text-sm font-medium flex items-center justify-center gap-2 ${payerForm.billingType === 'BOLETO' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 hover:bg-gray-50'}`}
                       >
                         <CreditCard size={16}/> Boleto
                       </button>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-gray-200 pt-4 mt-4 flex justify-between items-center">
                     <span className="font-bold text-gray-800">Total</span>
                     <span className="font-bold text-xl text-emerald-600">R$ 5,00</span>
                  </div>

                  <button 
                    type="submit" 
                    disabled={payLoading} 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  >
                    {payLoading ? 'Processando...' : 'Confirmar Assinatura'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-10 text-gray-500 text-sm">
                   <div className="text-emerald-600 font-bold mb-2">Pedido Recebido!</div>
                   Veja os detalhes do pagamento ao lado.
                   <button onClick={() => setPaymentResult(null)} className="block mx-auto mt-4 text-blue-600 hover:underline border border-blue-200 px-4 py-2 rounded">Nova Cobrança</button>
                </div>
              )}
           </div>
        </div>

        {/* Área de Resultado / Feedback */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 flex flex-col justify-center items-center min-h-[400px]">
           {!paymentResult ? (
             <div className="text-center max-w-xs">
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm mx-auto">
                 <CreditCard size={32} className="text-gray-300" />
               </div>
               <h4 className="font-bold text-gray-700 mb-1">Resumo do Pedido</h4>
               <p className="text-sm text-gray-400">Preencha seus dados ao lado para gerar o pagamento da licença.</p>
             </div>
           ) : (
             <div className="w-full space-y-6 animate-in zoom-in duration-300">
               <div className="text-center">
                 <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 shadow-sm mx-auto text-emerald-600">
                   <CheckCircle size={32} />
                 </div>
                 <h4 className="font-bold text-emerald-800 text-lg">Cobrança Gerada!</h4>
                 <p className="text-sm text-emerald-600">Realize o pagamento para confirmar.</p>
               </div>
               
               {/* QR Code Pix */}
               {paymentResult?.pix?.encodedImage && (
                 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
                   <p className="text-xs font-bold text-gray-500 uppercase mb-3">Escaneie o QR Code</p>
                   <img 
                      src={`data:image/jpeg;base64,${paymentResult.pix.encodedImage}`} 
                      alt="QR Code Pix" 
                      className="mx-auto w-48 h-48 mb-4 object-contain"
                   />
                   <div className="text-left bg-gray-50 p-3 rounded border border-gray-100">
                     <p className="text-[10px] text-gray-400 uppercase mb-1 font-bold">Pix Copia e Cola</p>
                     <div className="text-[10px] break-all font-mono text-gray-600 select-all cursor-text">
                       {paymentResult.pix.payload}
                     </div>
                   </div>
                 </div>
               )}

               {/* Botão Boleto */}
               {paymentResult?.payment?.invoiceUrl && (
                 <a 
                    href={paymentResult.payment.invoiceUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center justify-center w-full bg-blue-600 text-white py-4 rounded-xl shadow hover:bg-blue-700 transition-colors font-bold gap-2"
                 >
                    <CreditCard size={20}/>
                    Abrir Boleto / Fatura
                 </a>
               )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};


// --- COMPONENTE PRINCIPAL DE CONTEÚDO ---
const AdminContent = ({ activeTab }) => {
    // Hooks globais do AdminContent (Mantidos no topo, como exige o React)
    const [status, setStatus] = useState('DISCONNECTED');
    const [isLoading, setIsLoading] = useState(false);

    // Ajustes Gerais
    const [generalSettings, setGeneralSettings] = useState({
      identifyUser: false,
      hidePhoneNumbers: false,
      hideDispatchedConversations: false,
      inactivityTimeout: 0
    });

    // Respostas Rápidas
    const [quickResponses, setQuickResponses] = useState([]);
    const [showQuickModal, setShowQuickModal] = useState(false);
    const [editingQuick, setEditingQuick] = useState(null);
    const [quickForm, setQuickForm] = useState({ title: '', description: '', type: 'Texto', visibility: 'Todos' });
    const [quickSearch, setQuickSearch] = useState('');

    // Departamentos
    const [departments, setDepartments] = useState([]);
    const [showDeptModal, setShowDeptModal] = useState(false);
    const [editingDept, setEditingDept] = useState(null);
    const [deptForm, setDeptForm] = useState({ name: '', description: '' });
    const [deptSearch, setDeptSearch] = useState('');

    // Usuários
    const [users, setUsers] = useState([]);
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [userForm, setUserForm] = useState({ name: '', email: '', role: 'agent' });
    const [userSearch, setUserSearch] = useState('');

    // Contatos
    const [contacts, setContacts] = useState([]);
    const [showContactModal, setShowContactModal] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [contactForm, setContactForm] = useState({ name: '', phone: '', email: '', notes: '' });
    const [contactSearch, setContactSearch] = useState('');

    // Etiquetas
    const [tags, setTags] = useState([]);
    const [showTagModal, setShowTagModal] = useState(false);
    const [editingTag, setEditingTag] = useState(null);
    const [tagForm, setTagForm] = useState({ name: '', color: '#10b981' });
    const [tagSearch, setTagSearch] = useState('');

    // Motivos de Finalização
    const [reasons, setReasons] = useState([]);
    const [showReasonModal, setShowReasonModal] = useState(false);
    const [editingReason, setEditingReason] = useState(null);
    const [reasonForm, setReasonForm] = useState({ name: '', description: '' });
    const [reasonSearch, setReasonSearch] = useState('');

    // Efeitos (Carregamento de dados)
    useEffect(() => {
        if (activeTab === 'connection') {
            WhatsAppService.getStatus().then(s => setStatus(s.state));
        } else if (activeTab === 'general') {
            loadGeneralSettings();
        } else if (activeTab === 'quick') {
            loadQuickResponses();
        } else if (activeTab === 'depts') {
            loadDepartments();
        } else if (activeTab === 'users') {
            loadUsers();
        } else if (activeTab === 'contacts') {
            loadContacts();
        } else if (activeTab === 'tags') {
            loadTags();
        } else if (activeTab === 'reasons') {
            loadReasons();
        }
    }, [activeTab]);

    // --- Funções de Manipulação (Ajustes Gerais) ---
    const loadGeneralSettings = async () => {
        const settings = await SettingsService.getGeneralSettings();
        if (settings) setGeneralSettings(settings);
    };

    const updateGeneralSetting = async (key, value) => {
        const newSettings = { ...generalSettings, [key]: value };
        setGeneralSettings(newSettings);
        await SettingsService.updateGeneralSettings(newSettings);
    };

    // --- Funções de Manipulação (Respostas Rápidas) ---
    const loadQuickResponses = async () => {
        const responses = await SettingsService.getQuickResponses();
        setQuickResponses(responses);
    };

    const saveQuickResponse = async () => {
        if (editingQuick) {
            await SettingsService.updateQuickResponse(editingQuick.id, quickForm);
        } else {
            await SettingsService.createQuickResponse(quickForm);
        }
        setShowQuickModal(false);
        setQuickForm({ title: '', description: '', type: 'Texto', visibility: 'Todos' });
        setEditingQuick(null);
        loadQuickResponses();
    };

    const deleteQuickResponse = async (id) => {
        if (confirm('Tem certeza que deseja excluir esta resposta rápida?')) {
            await SettingsService.deleteQuickResponse(id);
            loadQuickResponses();
        }
    };

    const editQuickResponse = (response) => {
        setEditingQuick(response);
        setQuickForm({ title: response.title, description: response.description, type: response.type, visibility: response.visibility });
        setShowQuickModal(true);
    };

    // --- Funções de Manipulação (Departamentos) ---
    const loadDepartments = async () => {
        const depts = await SettingsService.getDepartments();
        setDepartments(depts);
    };

    const saveDepartment = async () => {
        if (editingDept) {
            await SettingsService.updateDepartment(editingDept.id, deptForm);
        } else {
            await SettingsService.createDepartment(deptForm);
        }
        setShowDeptModal(false);
        setDeptForm({ name: '', description: '' });
        setEditingDept(null);
        loadDepartments();
    };

    const deleteDepartment = async (id) => {
        if (confirm('Tem certeza que deseja excluir este departamento?')) {
            await SettingsService.deleteDepartment(id);
            loadDepartments();
        }
    };

    const editDepartment = (dept) => {
        setEditingDept(dept);
        setDeptForm({ name: dept.name, description: dept.description });
        setShowDeptModal(true);
    };

    // --- Funções de Manipulação (Usuários) ---
    const loadUsers = async () => {
        const usersList = await SettingsService.getUsers();
        setUsers(usersList);
    };

    const saveUser = async () => {
        if (editingUser) {
            await SettingsService.updateUser(editingUser.id, userForm);
        } else {
            await SettingsService.createUser(userForm);
        }
        setShowUserModal(false);
        setUserForm({ name: '', email: '', role: 'agent' });
        setEditingUser(null);
        loadUsers();
    };

    const deleteUser = async (id) => {
        if (confirm('Tem certeza que deseja excluir este usuário?')) {
            await SettingsService.deleteUser(id);
            loadUsers();
        }
    };

    const editUser = (user) => {
        setEditingUser(user);
        setUserForm({ name: user.name, email: user.email, role: user.role });
        setShowUserModal(true);
    };

    // --- Funções de Manipulação (Contatos) ---
    const loadContacts = async () => {
        const contactsList = await SettingsService.getContacts();
        setContacts(contactsList);
    };

    const saveContact = async () => {
        if (editingContact) {
            await SettingsService.updateContact(editingContact.id, contactForm);
        } else {
            await SettingsService.createContact(contactForm);
        }
        setShowContactModal(false);
        setContactForm({ name: '', phone: '', email: '', notes: '' });
        setEditingContact(null);
        loadContacts();
    };

    const deleteContact = async (id) => {
        if (confirm('Tem certeza que deseja excluir este contato?')) {
            await SettingsService.deleteContact(id);
            loadContacts();
        }
    };

    const editContact = (contact) => {
        setEditingContact(contact);
        setContactForm({ name: contact.name, phone: contact.phone, email: contact.email, notes: contact.notes });
        setShowContactModal(true);
    };

    // --- Funções de Manipulação (Etiquetas) ---
    const loadTags = async () => {
        const tagsList = await SettingsService.getTags();
        setTags(tagsList);
    };

    const saveTag = async () => {
        if (editingTag) {
            await SettingsService.updateTag(editingTag.id, tagForm);
        } else {
            await SettingsService.createTag(tagForm);
        }
        setShowTagModal(false);
        setTagForm({ name: '', color: '#10b981' });
        setEditingTag(null);
        loadTags();
    };

    const deleteTag = async (id) => {
        if (confirm('Tem certeza que deseja excluir esta etiqueta?')) {
            await SettingsService.deleteTag(id);
            loadTags();
        }
    };

    const editTag = (tag) => {
        setEditingTag(tag);
        setTagForm({ name: tag.name, color: tag.color });
        setShowTagModal(true);
    };

    // --- Funções de Manipulação (Motivos) ---
    const loadReasons = async () => {
        const reasonsList = await SettingsService.getReasons();
        setReasons(reasonsList);
    };

    const saveReason = async () => {
        if (editingReason) {
            await SettingsService.updateReason(editingReason.id, reasonForm);
        } else {
            await SettingsService.createReason(reasonForm);
        }
        setShowReasonModal(false);
        setReasonForm({ name: '', description: '' });
        setEditingReason(null);
        loadReasons();
    };

    const deleteReason = async (id) => {
        if (confirm('Tem certeza que deseja excluir este motivo de finalização?')) {
            await SettingsService.deleteReason(id);
            loadReasons();
        }
    };

    const editReason = (reason) => {
        setEditingReason(reason);
        setReasonForm({ name: reason.name, description: reason.description });
        setShowReasonModal(true);
    };

    const handleConnect = async () => {
        setIsLoading(true);
        try {
            const res = await WhatsAppService.getStatus();
            setStatus(res.state);
        } catch (error) {
            console.error('Erro ao verificar conexão WhatsApp:', error);
            setStatus('DISCONNECTED');
        } finally {
            setIsLoading(false);
        }
    };

    // Filtros
    const filteredQuickResponses = quickResponses.filter(r =>
        r.title?.toLowerCase().includes(quickSearch.toLowerCase()) ||
        r.description?.toLowerCase().includes(quickSearch.toLowerCase())
    );

    const filteredDepartments = departments.filter(d =>
        d.name?.toLowerCase().includes(deptSearch.toLowerCase())
    );

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase())
    );

    const filteredContacts = contacts.filter(c =>
        c.name?.toLowerCase().includes(contactSearch.toLowerCase()) ||
        c.phone?.toLowerCase().includes(contactSearch.toLowerCase()) ||
        c.email?.toLowerCase().includes(contactSearch.toLowerCase())
    );

    const filteredTags = tags.filter(t =>
        t.name?.toLowerCase().includes(tagSearch.toLowerCase())
    );

    const filteredReasons = reasons.filter(r =>
        r.name?.toLowerCase().includes(reasonSearch.toLowerCase())
    );

    // --- RENDERIZAÇÃO DO CONTEÚDO ---
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
               <ToggleSwitch
                 label="Identificar nome do usuário"
                 checked={generalSettings.identifyUser}
                 onChange={(checked) => updateGeneralSetting('identifyUser', checked)}
               />
               <ToggleSwitch
                 label="Ocultar números de telefone"
                 checked={generalSettings.hidePhoneNumbers}
                 onChange={(checked) => updateGeneralSetting('hidePhoneNumbers', checked)}
               />
               <ToggleSwitch
                 label="Ocultar conversas iniciadas via disparos"
                 checked={generalSettings.hideDispatchedConversations}
                 onChange={(checked) => updateGeneralSetting('hideDispatchedConversations', checked)}
               />
               <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg">
                 <div>
                   <span className="text-sm font-medium text-gray-800">Finalizar atendimento por inatividade</span>
                   <p className="text-xs text-gray-400 mt-1">Finaliza sessões ociosas automaticamente</p>
                 </div>
                 <div className="flex items-center gap-2">
                   <input
                     type="number"
                     value={generalSettings.inactivityTimeout}
                     onChange={(e) => updateGeneralSetting('inactivityTimeout', parseInt(e.target.value))}
                     className="w-20 px-2 py-1 border border-gray-200 rounded text-sm"
                     placeholder="0"
                   />
                   <span className="text-xs text-gray-500">minutos</span>
                 </div>
               </div>
             </div>
          </div>
        );

      case 'quick':
        return (
          <div className="max-w-5xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
             <SectionHeader
               title="Respostas Rápidas"
               description="Agilize interações e torne seu atendimento mais eficiente."
               action={<Button variant="primary" className="bg-emerald-500" onClick={() => { setEditingQuick(null); setQuickForm({ title: '', description: '', type: 'Texto', visibility: 'Todos' }); setShowQuickModal(true); }}><PlusCircle size={16}/> Adicionar</Button>}
             />
             <div className="bg-white p-4 rounded-lg border border-gray-100 flex gap-2 mb-4">
               <input
                 type="text"
                 placeholder="Pesquisar..."
                 value={quickSearch}
                 onChange={(e) => setQuickSearch(e.target.value)}
                 className="flex-1 bg-transparent outline-none text-sm"
               />
             </div>
             <AdminTable
               headers={['Título', 'Descrição', 'Tipo', 'Visibilidade', 'Ação']}
               rows={filteredQuickResponses.map(r => [
                 r.title,
                 r.description,
                 r.type,
                 r.visibility,
                 <div className="flex gap-2">
                   <button onClick={() => editQuickResponse(r)} className="text-emerald-600 hover:text-emerald-700"><Edit2 size={14}/></button>
                   <button onClick={() => deleteQuickResponse(r.id)} className="text-red-600 hover:text-red-700"><Trash2 size={14}/></button>
                 </div>
               ])}
             />

             {showQuickModal && (
               <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                 <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                   <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                     <h3 className="font-bold text-gray-700">{editingQuick ? 'Editar' : 'Novo'} Resposta Rápida</h3>
                     <button onClick={() => setShowQuickModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                   </div>
                   <div className="p-4 space-y-3">
                     <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título</label>
                       <input
                         className="w-full p-2 border border-gray-200 rounded text-sm"
                         value={quickForm.title}
                         onChange={(e) => setQuickForm({...quickForm, title: e.target.value})}
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descrição</label>
                       <textarea
                         className="w-full p-2 border border-gray-200 rounded text-sm resize-none"
                         rows="3"
                         value={quickForm.description}
                         onChange={(e) => setQuickForm({...quickForm, description: e.target.value})}
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo</label>
                       <select
                         className="w-full p-2 border border-gray-200 rounded text-sm"
                         value={quickForm.type}
                         onChange={(e) => setQuickForm({...quickForm, type: e.target.value})}
                       >
                         <option>Texto</option>
                         <option>Imagem</option>
                         <option>Arquivo</option>
                       </select>
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Visibilidade</label>
                       <select
                         className="w-full p-2 border border-gray-200 rounded text-sm"
                         value={quickForm.visibility}
                         onChange={(e) => setQuickForm({...quickForm, visibility: e.target.value})}
                       >
                         <option>Todos</option>
                         <option>Apenas Eu</option>
                         <option>Gerentes</option>
                       </select>
                     </div>
                     <div className="pt-2">
                       <Button onClick={saveQuickResponse} className="w-full bg-emerald-600 text-white">
                         <Save size={16} className="mr-2" /> Salvar
                       </Button>
                     </div>
                   </div>
                 </div>
               </div>
             )}
          </div>
        );

      case 'depts':
        return (
          <div className="max-w-5xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
             <SectionHeader
               title="Departamentos"
               description="Organize usuários e direcione o chatbot."
               action={<Button variant="primary" className="bg-emerald-500" onClick={() => { setEditingDept(null); setDeptForm({ name: '', description: '' }); setShowDeptModal(true); }}><PlusCircle size={16}/> Adicionar</Button>}
             />
             <div className="bg-white p-4 rounded-lg border border-gray-100 flex gap-2 mb-4">
               <input
                 type="text"
                 placeholder="Pesquisar..."
                 value={deptSearch}
                 onChange={(e) => setDeptSearch(e.target.value)}
                 className="flex-1 bg-transparent outline-none text-sm"
               />
             </div>
             <AdminTable
               headers={['Título', 'Descrição', 'Ação']}
               rows={filteredDepartments.map(d => [
                 d.name,
                 d.description || '-',
                 <div className="flex gap-2">
                   <button onClick={() => editDepartment(d)} className="text-emerald-600 hover:text-emerald-700"><Edit2 size={14}/></button>
                   <button onClick={() => deleteDepartment(d.id)} className="text-red-600 hover:text-red-700"><Trash2 size={14}/></button>
                 </div>
               ])}
             />

             {showDeptModal && (
               <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                 <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                   <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                     <h3 className="font-bold text-gray-700">{editingDept ? 'Editar' : 'Novo'} Departamento</h3>
                     <button onClick={() => setShowDeptModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                   </div>
                   <div className="p-4 space-y-3">
                     <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome</label>
                       <input
                         className="w-full p-2 border border-gray-200 rounded text-sm"
                         value={deptForm.name}
                         onChange={(e) => setDeptForm({...deptForm, name: e.target.value})}
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descrição</label>
                       <textarea
                         className="w-full p-2 border border-gray-200 rounded text-sm resize-none"
                         rows="3"
                         value={deptForm.description}
                         onChange={(e) => setDeptForm({...deptForm, description: e.target.value})}
                       />
                     </div>
                     <div className="pt-2">
                       <Button onClick={saveDepartment} className="w-full bg-emerald-600 text-white">
                         <Save size={16} className="mr-2" /> Salvar
                       </Button>
                     </div>
                   </div>
                 </div>
               </div>
             )}
          </div>
        );

      case 'users':
        return (
          <div className="max-w-5xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
             <SectionHeader
               title="Usuários"
               description="Gerencie os usuários do sistema."
               action={<Button variant="primary" className="bg-emerald-500" onClick={() => { setEditingUser(null); setUserForm({ name: '', email: '', role: 'agent' }); setShowUserModal(true); }}><PlusCircle size={16}/> Adicionar</Button>}
             />
             <div className="bg-white p-4 rounded-lg border border-gray-100 flex gap-2 mb-4">
               <input
                 type="text"
                 placeholder="Pesquisar..."
                 value={userSearch}
                 onChange={(e) => setUserSearch(e.target.value)}
                 className="flex-1 bg-transparent outline-none text-sm"
               />
             </div>
             <AdminTable
               headers={['Nome', 'Email', 'Função', 'Ação']}
               rows={filteredUsers.map(u => [
                 u.name,
                 u.email,
                 u.role === 'manager' ? 'Gerente' : 'Agente',
                 <div className="flex gap-2">
                   <button onClick={() => editUser(u)} className="text-emerald-600 hover:text-emerald-700"><Edit2 size={14}/></button>
                   <button onClick={() => deleteUser(u.id)} className="text-red-600 hover:text-red-700"><Trash2 size={14}/></button>
                 </div>
               ])}
             />

             {showUserModal && (
               <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                 <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                   <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                     <h3 className="font-bold text-gray-700">{editingUser ? 'Editar' : 'Novo'} Usuário</h3>
                     <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                   </div>
                   <div className="p-4 space-y-3">
                     <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome</label>
                       <input
                         className="w-full p-2 border border-gray-200 rounded text-sm"
                         value={userForm.name}
                         onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                       <input
                         type="email"
                         className="w-full p-2 border border-gray-200 rounded text-sm"
                         value={userForm.email}
                         onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Função</label>
                       <select
                         className="w-full p-2 border border-gray-200 rounded text-sm"
                         value={userForm.role}
                         onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                       >
                         <option value="agent">Agente</option>
                         <option value="manager">Gerente</option>
                       </select>
                     </div>
                     <div className="pt-2">
                       <Button onClick={saveUser} className="w-full bg-emerald-600 text-white">
                         <Save size={16} className="mr-2" /> Salvar
                       </Button>
                     </div>
                   </div>
                 </div>
               </div>
             )}
          </div>
        );

      case 'contacts':
        return (
          <div className="max-w-5xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
             <SectionHeader
               title="Contatos"
               description="Gerencie os contatos do sistema."
               action={<Button variant="primary" className="bg-emerald-500" onClick={() => { setEditingContact(null); setContactForm({ name: '', phone: '', email: '', notes: '' }); setShowContactModal(true); }}><PlusCircle size={16}/> Adicionar</Button>}
             />
             <div className="bg-white p-4 rounded-lg border border-gray-100 flex gap-2 mb-4">
               <input
                 type="text"
                 placeholder="Pesquisar..."
                 value={contactSearch}
                 onChange={(e) => setContactSearch(e.target.value)}
                 className="flex-1 bg-transparent outline-none text-sm"
               />
             </div>
             <AdminTable
               headers={['Nome', 'Telefone', 'Email', 'Ação']}
               rows={filteredContacts.map(c => [
                 c.name,
                 c.phone,
                 c.email || '-',
                 <div className="flex gap-2">
                   <button onClick={() => editContact(c)} className="text-emerald-600 hover:text-emerald-700"><Edit2 size={14}/></button>
                   <button onClick={() => deleteContact(c.id)} className="text-red-600 hover:text-red-700"><Trash2 size={14}/></button>
                 </div>
               ])}
             />

             {showContactModal && (
               <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                 <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                   <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                     <h3 className="font-bold text-gray-700">{editingContact ? 'Editar' : 'Novo'} Contato</h3>
                     <button onClick={() => setShowContactModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                   </div>
                   <div className="p-4 space-y-3">
                     <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome</label>
                       <input
                         className="w-full p-2 border border-gray-200 rounded text-sm"
                         value={contactForm.name}
                         onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefone</label>
                       <input
                         className="w-full p-2 border border-gray-200 rounded text-sm"
                         value={contactForm.phone}
                         onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                         placeholder="5511999999999"
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                       <input
                         type="email"
                         className="w-full p-2 border border-gray-200 rounded text-sm"
                         value={contactForm.email}
                         onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notas</label>
                       <textarea
                         className="w-full p-2 border border-gray-200 rounded text-sm resize-none"
                         rows="3"
                         value={contactForm.notes}
                         onChange={(e) => setContactForm({...contactForm, notes: e.target.value})}
                       />
                     </div>
                     <div className="pt-2">
                       <Button onClick={saveContact} className="w-full bg-emerald-600 text-white">
                         <Save size={16} className="mr-2" /> Salvar
                       </Button>
                     </div>
                   </div>
                 </div>
               </div>
             )}
          </div>
        );

      case 'tags':
        return (
          <div className="max-w-5xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
             <SectionHeader
               title="Etiquetas"
               description="Organize e categorize tickets com etiquetas personalizadas."
               action={<Button variant="primary" className="bg-emerald-500" onClick={() => { setEditingTag(null); setTagForm({ name: '', color: '#10b981' }); setShowTagModal(true); }}><PlusCircle size={16}/> Adicionar</Button>}
             />
             <div className="bg-white p-4 rounded-lg border border-gray-100 flex gap-2 mb-4">
               <input
                 type="text"
                 placeholder="Pesquisar..."
                 value={tagSearch}
                 onChange={(e) => setTagSearch(e.target.value)}
                 className="flex-1 bg-transparent outline-none text-sm"
               />
             </div>
             <AdminTable
               headers={['Nome', 'Cor', 'Ação']}
               rows={filteredTags.map(t => [
                 <div className="flex items-center gap-2">
                   <div className="w-4 h-4 rounded" style={{ backgroundColor: t.color }}></div>
                   {t.name}
                 </div>,
                 t.color,
                 <div className="flex gap-2">
                   <button onClick={() => editTag(t)} className="text-emerald-600 hover:text-emerald-700"><Edit2 size={14}/></button>
                   <button onClick={() => deleteTag(t.id)} className="text-red-600 hover:text-red-700"><Trash2 size={14}/></button>
                 </div>
               ])}
             />

             {showTagModal && (
               <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                 <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                   <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                     <h3 className="font-bold text-gray-700">{editingTag ? 'Editar' : 'Novo'} Etiqueta</h3>
                     <button onClick={() => setShowTagModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                   </div>
                   <div className="p-4 space-y-3">
                     <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome</label>
                       <input
                         className="w-full p-2 border border-gray-200 rounded text-sm"
                         value={tagForm.name}
                         onChange={(e) => setTagForm({...tagForm, name: e.target.value})}
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cor</label>
                       <div className="flex gap-2 items-center">
                         <input
                           type="color"
                           className="w-12 h-10 border border-gray-200 rounded cursor-pointer"
                           value={tagForm.color}
                           onChange={(e) => setTagForm({...tagForm, color: e.target.value})}
                         />
                         <input
                           type="text"
                           className="flex-1 p-2 border border-gray-200 rounded text-sm"
                           value={tagForm.color}
                           onChange={(e) => setTagForm({...tagForm, color: e.target.value})}
                           placeholder="#10b981"
                         />
                       </div>
                     </div>
                     <div className="pt-2">
                       <Button onClick={saveTag} className="w-full bg-emerald-600 text-white">
                         <Save size={16} className="mr-2" /> Salvar
                       </Button>
                     </div>
                   </div>
                 </div>
               </div>
             )}
          </div>
        );

      case 'reasons':
        return (
          <div className="max-w-5xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
             <SectionHeader
               title="Motivos de Finalização"
               description="Defina motivos para o encerramento de tickets."
               action={<Button variant="primary" className="bg-emerald-500" onClick={() => { setEditingReason(null); setReasonForm({ name: '', description: '' }); setShowReasonModal(true); }}><PlusCircle size={16}/> Adicionar</Button>}
             />
             <div className="bg-white p-4 rounded-lg border border-gray-100 flex gap-2 mb-4">
               <input
                 type="text"
                 placeholder="Pesquisar..."
                 value={reasonSearch}
                 onChange={(e) => setReasonSearch(e.target.value)}
                 className="flex-1 bg-transparent outline-none text-sm"
               />
             </div>
             <AdminTable
               headers={['Título', 'Descrição', 'Ação']}
               rows={filteredReasons.map(r => [
                 r.name,
                 r.description || '-',
                 <div className="flex gap-2">
                   <button onClick={() => editReason(r)} className="text-emerald-600 hover:text-emerald-700"><Edit2 size={14}/></button>
                   <button onClick={() => deleteReason(r.id)} className="text-red-600 hover:text-red-700"><Trash2 size={14}/></button>
                 </div>
               ])}
             />

             {showReasonModal && (
               <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                 <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                   <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                     <h3 className="font-bold text-gray-700">{editingReason ? 'Editar' : 'Novo'} Motivo de Finalização</h3>
                     <button onClick={() => setShowReasonModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                   </div>
                   <div className="p-4 space-y-3">
                     <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome</label>
                       <input
                         className="w-full p-2 border border-gray-200 rounded text-sm"
                         value={reasonForm.name}
                         onChange={(e) => setReasonForm({...reasonForm, name: e.target.value})}
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descrição</label>
                       <textarea
                         className="w-full p-2 border border-gray-200 rounded text-sm resize-none"
                         rows="3"
                         value={reasonForm.description}
                         onChange={(e) => setReasonForm({...reasonForm, description: e.target.value})}
                       />
                     </div>
                     <div className="pt-2">
                       <Button onClick={saveReason} className="w-full bg-emerald-600 text-white">
                         <Save size={16} className="mr-2" /> Salvar
                       </Button>
                     </div>
                   </div>
                 </div>
               </div>
             )}
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
      
      // CASO DE PAGAMENTO CORRIGIDO: Usa o componente PaymentPanel
      case 'payment':
        return <PaymentPanel />;

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