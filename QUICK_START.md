# 🚀 Guia Rápido de Implementação - Integração WhatsApp

Este guia irá ajudá-lo a integrar a API oficial do WhatsApp no NexTalk Desk em poucos passos.

## 📋 Checklist de Configuração

### 1️⃣ Configurar Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env com suas credenciais
nano .env  # ou use seu editor preferido
```

No arquivo `.env`, preencha:
- `VITE_WHATSAPP_PHONE_NUMBER_ID` - ID do número do WhatsApp
- `VITE_WHATSAPP_WABA_ID` - ID da conta WhatsApp Business
- `VITE_WHATSAPP_ACCESS_TOKEN` - Token de acesso da API
- `VITE_WEBHOOK_VERIFY_TOKEN` - Token secreto para webhook

**📖 Não sabe como obter essas credenciais?**
Leia o guia completo: [WHATSAPP_SETUP_GUIDE.md](./WHATSAPP_SETUP_GUIDE.md)

---

### 2️⃣ Instalar Dependências

```bash
npm install
```

Isso irá instalar:
- Frontend: React, Vite, Tailwind, etc
- Backend: Express, Firebase Admin, CORS, etc

---

### 3️⃣ Configurar Firebase Admin (para webhook)

1. Baixe o arquivo de credenciais do Firebase:
   - Console Firebase → Configurações → Contas de Serviço
   - Gerar nova chave privada

2. Salve como `firebase-service-account.json` na raiz do projeto

**📖 Precisa de ajuda?**
Leia o guia: [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

---

### 4️⃣ Testar o Sistema Localmente

#### Iniciar o Frontend

```bash
npm run dev
```

Acesse: http://localhost:5173

#### Iniciar o Servidor Webhook

Em outro terminal:

```bash
npm run webhook
```

O webhook estará rodando em: http://localhost:3000

---

### 5️⃣ Expor o Webhook para Internet (Desenvolvimento)

Para que a Meta possa enviar mensagens para seu servidor local, use ngrok:

```bash
# Instale o ngrok: https://ngrok.com/download

# Execute:
ngrok http 3000
```

Você receberá uma URL pública como:
```
https://abc123.ngrok.io
```

---

### 6️⃣ Configurar Webhook na Meta

1. Acesse: [developers.facebook.com](https://developers.facebook.com)
2. Selecione seu App
3. Vá em **WhatsApp → Configuração**
4. Clique em **Configurar webhook**
5. Preencha:
   - **URL de retorno:** `https://sua-url-ngrok.ngrok.io/webhook`
   - **Verificar token:** O mesmo que você configurou em `VITE_WEBHOOK_VERIFY_TOKEN`
6. Inscreva-se nos eventos:
   - ✅ `messages`
   - ✅ `message_status`
7. Clique em **Verificar e salvar**

Se tudo estiver certo, você verá: ✅ **Webhook verificado**

---

## 🧪 Testando a Integração

### Teste 1: Verificar Conexão

1. Acesse o painel admin no frontend
2. Clique em "Validar Conexão" na seção WhatsApp
3. Deve mostrar: **ATIVO** ✅

### Teste 2: Enviar Mensagem Manual

No console do navegador:

```javascript
import { WhatsAppService } from './src/models/services/WhatsAppService';

// Substitua pelo número de teste
await WhatsAppService.sendMessage('5511999999999', 'Olá! Teste de envio.');
```

### Teste 3: Receber Mensagem

1. Certifique-se que o webhook está rodando
2. No WhatsApp do celular, envie uma mensagem para seu número Business
3. Verifique os logs do terminal do webhook
4. Um novo ticket deve aparecer no sistema

---

## 📊 Verificar Status

### Health Check do Webhook

```bash
curl http://localhost:3000/health
```

Resposta esperada:
```json
{
  "status": "healthy",
  "firebase": true,
  "environment": {
    "hasWebhookToken": true,
    "hasWhatsAppToken": true,
    "hasPhoneNumberId": true
  }
}
```

---

## 🚢 Deploy em Produção

### Opções de Hospedagem

#### 1. VPS (Digital Ocean, Linode, AWS EC2)

```bash
# Instale Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone o repositório
git clone seu-repositorio.git
cd nextalk-desk

# Instale dependências
npm install

# Configure variáveis de ambiente
nano .env

# Inicie com PM2
npm install -g pm2
pm2 start webhook-server.js --name nextalk-webhook
pm2 save
pm2 startup
```

#### 2. Heroku

```bash
# Crie Procfile
echo "web: node webhook-server.js" > Procfile

# Deploy
heroku create nextalk-webhook
heroku config:set VITE_WHATSAPP_ACCESS_TOKEN=seu_token
# ... configure outras variáveis
git push heroku main
```

#### 3. Railway / Render

1. Conecte seu repositório GitHub
2. Configure as variáveis de ambiente
3. Deploy automático!

---

## 🔧 Recursos Implementados

### ✅ Pronto para Usar

- [x] Envio de mensagens de texto
- [x] Envio de imagens
- [x] Envio de documentos
- [x] Envio de templates
- [x] Recebimento de mensagens
- [x] Criação automática de tickets
- [x] Marcar mensagens como lidas
- [x] Validação de conexão

### 🚧 Para Implementar (Opcional)

- [ ] Download de mídias recebidas
- [ ] Botões interativos
- [ ] Listas de opções
- [ ] Respostas rápidas com botões
- [ ] Integração com IA (já tem base com Gemini)
- [ ] Métricas e analytics

---

## 📖 Documentação Completa

- [WHATSAPP_SETUP_GUIDE.md](./WHATSAPP_SETUP_GUIDE.md) - Guia completo de configuração na Meta
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Como configurar Firebase Admin SDK
- [src/models/services/WhatsAppService.js](./src/models/services/WhatsAppService.js) - API do serviço
- [webhook-server.js](./webhook-server.js) - Código do servidor webhook

---

## 🆘 Problemas Comuns

### "DISCONNECTED" no painel admin
- Verifique se o token de acesso está correto
- Confirme se o Phone Number ID está correto
- Token pode ter expirado (use token de longa duração)

### Webhook não recebe mensagens
- Verifique se está rodando: `npm run webhook`
- Confirme que ngrok está ativo
- Verifique configuração na Meta
- Veja logs do webhook para erros

### "Firebase not initialized"
- Arquivo `firebase-service-account.json` está presente?
- Está na raiz do projeto?
- Formato JSON válido?

### Mensagens não aparecem no sistema
- Firebase configurado corretamente?
- Firestore tem as permissões corretas?
- Verifique logs do webhook

---

## 🎯 Próximos Passos

Depois de configurar tudo:

1. **Teste extensivamente** com números reais
2. **Configure templates** aprovados pela Meta
3. **Implemente automações** com IA
4. **Configure métricas** de atendimento
5. **Treine sua equipe** no sistema
6. **Faça deploy em produção**

---

## 💡 Dicas Profissionais

### Performance
- Use cache para dados frequentes
- Implemente rate limiting
- Configure CDN para assets

### Segurança
- SEMPRE use HTTPS em produção
- Rotacione tokens periodicamente
- Monitore logs de segurança
- Configure firewall

### Monitoramento
- Use PM2 para gerenciar processos
- Configure alertas (Sentry, LogRocket)
- Monitore uptime (UptimeRobot)
- Analytics de mensagens

---

**Dúvidas?** Consulte a documentação oficial da Meta ou revise os guias deste projeto.

**Última atualização:** Dezembro 2025
**Versão:** 1.0.0
