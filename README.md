# NexTalk Desk 💬

Sistema completo de atendimento ao cliente com integração oficial da API do WhatsApp Business (Meta).

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-18%2B-brightgreen)
![React](https://img.shields.io/badge/react-18.2-61dafb)

## 📋 Sobre o Projeto

NexTalk Desk é uma plataforma moderna de gestão de atendimento ao cliente que integra diretamente com a API oficial do WhatsApp Business da Meta. O sistema permite que empresas gerenciem conversas, organizem tickets, e forneçam suporte eficiente através do WhatsApp.

### ✨ Principais Recursos

- 🚀 **Integração Oficial WhatsApp Business API**
- 💬 **Gestão Completa de Tickets**
- 👥 **Múltiplos Atendentes**
- 🤖 **IA Integrada** (Google Gemini)
- 📊 **Dashboard de Métricas**
- 📱 **Interface Responsiva**
- 🔔 **Notificações em Tempo Real**
- 📎 **Envio de Mídias** (imagens, documentos, etc)
- ⚡ **Respostas Rápidas**
- 🏷️ **Tags e Categorização**

## 🏗️ Arquitetura

### Frontend
- **React 18.2** - UI Framework
- **Vite 5.0** - Build Tool
- **Tailwind CSS 3.4** - Estilização
- **Firebase** - Banco de Dados em Tempo Real
- **Lucide React** - Ícones

### Backend
- **Node.js 18+** - Servidor Webhook
- **Express.js** - Framework HTTP
- **Firebase Admin SDK** - Persistência de Dados
- **WhatsApp Cloud API** - Integração WhatsApp

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18 ou superior
- Conta Meta for Developers
- WhatsApp Business Account (WABA)
- Firebase Project

### Instalação

```bash
# Clone o repositório
git clone https://github.com/lucaspio1/nextalk-desk.git
cd nextalk-desk

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais
```

### Configuração

**Siga os guias detalhados:**

1. 📖 [**QUICK_START.md**](./QUICK_START.md) - Guia rápido para começar
2. 📖 [**WHATSAPP_SETUP_GUIDE.md**](./WHATSAPP_SETUP_GUIDE.md) - Configuração na Meta
3. 📖 [**FIREBASE_SETUP.md**](./FIREBASE_SETUP.md) - Configuração do Firebase

### Executando o Projeto

```bash
# Inicie o frontend (desenvolvimento)
npm run dev

# Em outro terminal, inicie o webhook
npm run webhook
```

Acesse:
- Frontend: http://localhost:5173
- Webhook: http://localhost:3000

## 📚 Documentação

### Estrutura do Projeto

```
nextalk-desk/
├── src/
│   ├── config/              # Configurações
│   │   ├── whatsapp.js      # Credenciais WhatsApp API
│   │   ├── firebase.js      # Firebase config
│   │   └── gemini.js        # Google AI config
│   ├── models/
│   │   ├── services/        # Serviços
│   │   │   ├── WhatsAppService.js    # API WhatsApp
│   │   │   ├── TicketService.js      # Gestão de tickets
│   │   │   ├── SettingsService.js    # Configurações
│   │   │   └── AIService.js          # IA Gemini
│   │   └── hooks/           # React Hooks
│   ├── views/
│   │   ├── pages/           # Páginas principais
│   │   ├── partials/        # Componentes parciais
│   │   └── components/      # UI Components
│   └── controllers/         # Controllers
├── webhook-server.js        # Servidor webhook WhatsApp
├── .env.example            # Template de variáveis
└── docs/                   # Documentação adicional
```

### Funcionalidades Implementadas

#### WhatsAppService (src/models/services/WhatsAppService.js)

```javascript
// Enviar mensagem de texto
await WhatsAppService.sendMessage(phone, text);

// Enviar imagem
await WhatsAppService.sendImage(phone, imageUrl, caption);

// Enviar documento
await WhatsAppService.sendDocument(phone, documentUrl, filename);

// Enviar template aprovado
await WhatsAppService.sendTemplate(phone, templateName, languageCode);

// Marcar como lida
await WhatsAppService.markAsRead(messageId);

// Validar número
WhatsAppService.isValidPhoneNumber(phone);

// Formatar número
WhatsAppService.formatPhoneNumber(phone, countryCode);
```

#### Webhook Server (webhook-server.js)

- ✅ Recebe mensagens de texto, imagens, documentos, áudio, vídeo
- ✅ Cria tickets automaticamente
- ✅ Atualiza tickets existentes
- ✅ Marca mensagens como lidas
- ✅ Processa status de entrega
- ✅ Health check endpoint

## 🔧 Configuração Avançada

### Variáveis de Ambiente

```env
# WhatsApp Business API
VITE_WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
VITE_WHATSAPP_WABA_ID=your_waba_id
VITE_WHATSAPP_ACCESS_TOKEN=your_access_token
VITE_WHATSAPP_API_VERSION=v19.0

# Webhook
VITE_WEBHOOK_VERIFY_TOKEN=your_secret_token
VITE_WEBHOOK_PORT=3000

# Meta App (opcional)
VITE_META_APP_ID=your_app_id
VITE_META_APP_SECRET=your_app_secret

# Google Gemini AI (opcional)
VITE_GEMINI_API_KEY=your_gemini_key
```

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia frontend (Vite)
npm run webhook          # Inicia servidor webhook
npm run webhook:dev      # Webhook com hot reload

# Produção
npm run build           # Build do frontend
npm run preview         # Preview da build
```

## 🚢 Deploy em Produção

### Opções Recomendadas

1. **VPS (Digital Ocean, Linode, AWS EC2)**
   - Controle total
   - Custo previsível
   - Ideal para produção

2. **Heroku**
   - Deploy simples
   - Escalável
   - Bom para começar

3. **Railway / Render**
   - Deploy automático via Git
   - SSL gratuito
   - Ótimo para MVPs

### Checklist de Produção

- [ ] Configurar domínio com SSL (HTTPS obrigatório)
- [ ] Atualizar webhook URL na Meta
- [ ] Usar token de longa duração (60+ dias)
- [ ] Configurar Firebase para produção
- [ ] Implementar monitoramento (Sentry, LogRocket)
- [ ] Configurar backups automáticos
- [ ] Testar rate limiting
- [ ] Configurar PM2 ou similar
- [ ] Documentar processos

## 🧪 Testes

### Testar Conexão

```bash
# Via frontend
# Painel Admin > WhatsApp > Validar Conexão

# Via API
curl http://localhost:3000/health
```

### Testar Webhook

```bash
# Envie uma mensagem para seu número WhatsApp Business
# Verifique os logs do webhook server
# Um ticket deve ser criado automaticamente
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

### Documentação
- [Guia Rápido](./QUICK_START.md)
- [Configuração WhatsApp](./WHATSAPP_SETUP_GUIDE.md)
- [Configuração Firebase](./FIREBASE_SETUP.md)

### Links Úteis
- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)
- [Firebase Docs](https://firebase.google.com/docs)
- [Meta for Developers](https://developers.facebook.com)

### Problemas Conhecidos

Consulte as [Issues](https://github.com/lucaspio1/nextalk-desk/issues) do projeto.

## 👨‍💻 Autor

**Lucas Pio**
- GitHub: [@lucaspio1](https://github.com/lucaspio1)

## 🙏 Agradecimentos

- Meta/Facebook - WhatsApp Business API
- Firebase Team
- Google Gemini AI
- Comunidade Open Source

---

**Desenvolvido com ❤️ usando React + WhatsApp Business API**

**Última atualização:** Dezembro 2025
