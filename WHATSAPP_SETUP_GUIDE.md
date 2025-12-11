# Guia de Configuração da API Oficial do WhatsApp

## 📋 Visão Geral

Este guia irá ajudá-lo a configurar a integração com a API oficial do WhatsApp Business da Meta no sistema NexTalk Desk.

## 🎯 O Que Você Precisa

### Requisitos da Meta:
1. **Conta Business Manager** na Meta
2. **WhatsApp Business Account (WABA)**
3. **Número de telefone** verificado para WhatsApp Business
4. **Aplicativo** criado no Meta for Developers
5. **Token de acesso** permanente ou de longa duração

---

## 📝 Passo a Passo: Configuração na Meta

### Etapa 1: Criar Conta Business Manager

1. Acesse [business.facebook.com](https://business.facebook.com)
2. Clique em **"Criar Conta"**
3. Preencha os dados da sua empresa:
   - Nome da empresa
   - Seu nome
   - Email comercial
4. Confirme seu email e complete o cadastro

### Etapa 2: Criar App no Meta for Developers

1. Acesse [developers.facebook.com](https://developers.facebook.com)
2. Clique em **"Meus Apps" → "Criar App"**
3. Selecione o tipo: **"Comercial"** ou **"Outros"**
4. Preencha:
   - Nome do app (ex: "NexTalk Desk")
   - Email de contato
   - Business Manager (selecione o criado anteriormente)
5. Clique em **"Criar App"**

### Etapa 3: Adicionar Produto WhatsApp

1. No painel do app, encontre **"WhatsApp"** na lista de produtos
2. Clique em **"Configurar"**
3. Selecione ou crie um **WhatsApp Business Account (WABA)**
4. Aceite os termos de uso

### Etapa 4: Configurar Número de Telefone

#### Opção A: Usar Número de Teste (Desenvolvimento)
1. No painel WhatsApp, você verá um número de teste fornecido pela Meta
2. Este número permite enviar mensagens apenas para até 5 números cadastrados
3. Adicione números de teste clicando em **"Gerenciar números de telefone"**

#### Opção B: Adicionar Seu Número (Produção)
1. Vá em **"WhatsApp" → "Configurações" → "Números de telefone"**
2. Clique em **"Adicionar número de telefone"**
3. Escolha entre:
   - **Novo número:** Meta fornece um número
   - **Número existente:** Migrar número atual
4. Siga o processo de verificação:
   - SMS ou chamada de voz
   - Insira o código recebido
5. Configure o nome de exibição e categoria do negócio

### Etapa 5: Obter Credenciais de API

#### 5.1 Phone Number ID
1. Em **"WhatsApp" → "Primeiros Passos"**
2. Copie o **Phone Number ID** (algo como: `123456789012345`)

#### 5.2 WhatsApp Business Account ID (WABA ID)
1. Em **"WhatsApp" → "Configurações"**
2. Copie o **ID da conta do WhatsApp Business**

#### 5.3 Access Token (Token de Acesso)

**Token Temporário (24h - apenas para testes):**
1. Em **"WhatsApp" → "Primeiros Passos"**
2. Clique em **"Gerar Token"**
3. Copie o token exibido

**Token Permanente (Produção - Recomendado):**
1. Vá em **"Configurações" → "Básico"** do seu app
2. Anote o **App ID** e **App Secret**
3. Acesse **"Ferramentas" → "Graph API Explorer"**
4. Selecione seu app
5. Em "Permissões", adicione:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
6. Clique em **"Gerar Token de Acesso"**
7. Para torná-lo de longa duração:
   - Use a ferramenta: [developers.facebook.com/tools/accesstoken](https://developers.facebook.com/tools/accesstoken)
   - Clique em **"Estender Token de Acesso"**
   - Copie o novo token (válido por 60 dias ou mais)

### Etapa 6: Configurar Webhook (Receber Mensagens)

1. Em **"WhatsApp" → "Configuração"**
2. Clique em **"Configurar webhook"**
3. Configure:
   - **URL de retorno de chamada:** `https://seu-dominio.com/webhook/whatsapp`
   - **Verificar token:** Crie uma string secreta (ex: `meu_token_secreto_2024`)
4. Inscreva-se nos eventos:
   - ✅ `messages` (mensagens recebidas)
   - ✅ `message_status` (status de entrega)
5. Clique em **"Verificar e salvar"**

⚠️ **Importante:** Seu servidor precisa estar rodando e acessível pela internet para a verificação funcionar.

---

## 🔧 Configuração no NexTalk Desk

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# WhatsApp Business API - Meta
VITE_WHATSAPP_PHONE_NUMBER_ID=seu_phone_number_id_aqui
VITE_WHATSAPP_WABA_ID=seu_waba_id_aqui
VITE_WHATSAPP_ACCESS_TOKEN=seu_access_token_aqui
VITE_WHATSAPP_API_VERSION=v19.0

# Webhook
VITE_WEBHOOK_VERIFY_TOKEN=meu_token_secreto_2024
VITE_WEBHOOK_PORT=3000

# App Meta
VITE_META_APP_ID=seu_app_id_aqui
VITE_META_APP_SECRET=seu_app_secret_aqui
```

### 2. Atualizar Configuração do WhatsApp

O arquivo `/src/config/whatsapp.js` será atualizado para usar as variáveis de ambiente.

### 3. Estrutura Atual do Sistema

✅ **Já Implementado:**
- Envio de mensagens de texto
- Validação de conexão com API
- Interface de administração
- Gerenciamento de tickets

🔨 **Precisa Implementar:**
- Servidor webhook para receber mensagens
- Processamento de mensagens recebidas
- Suporte a mídia (imagens, documentos, áudio)
- Sincronização de status de mensagens
- Templates de mensagens aprovados pela Meta

---

## 🚀 Próximos Passos de Implementação

### 1. Servidor Webhook
- Criar servidor Express.js/Node.js
- Implementar verificação de webhook
- Processar mensagens recebidas
- Criar/atualizar tickets no Firestore

### 2. Recursos Avançados
- Envio de mídia (imagens, PDFs, etc)
- Templates de mensagem
- Botões interativos
- Listas de opções
- Mensagens de localização

### 3. Segurança
- Validação de assinatura do webhook
- Rotação de tokens
- Rate limiting
- Logs de auditoria

---

## 📚 Recursos Úteis

### Documentação Oficial Meta:
- [WhatsApp Business Platform](https://developers.facebook.com/docs/whatsapp)
- [Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Webhooks](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks)
- [Formatos de Mensagem](https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages)

### Ferramentas de Teste:
- [Graph API Explorer](https://developers.facebook.com/tools/explorer)
- [Webhook Tester](https://webhook.site) (testar webhooks localmente)
- [ngrok](https://ngrok.com) (expor localhost para testes)

---

## ❓ Perguntas Frequentes

### Quanto custa usar a API do WhatsApp?
- **Conversas iniciadas pelo cliente:** Gratuitas nas primeiras 1.000/mês
- **Conversas iniciadas pela empresa:** Variam por país
- **Templates aprovados:** Necessários para iniciar conversas
- Consulte: [Preços do WhatsApp Business](https://developers.facebook.com/docs/whatsapp/pricing)

### Posso usar um número que já está no WhatsApp normal?
Sim, mas o número será migrado para WhatsApp Business e não poderá mais ser usado no app normal.

### Preciso de um servidor próprio?
Sim, para receber mensagens via webhook você precisa de um servidor com:
- HTTPS (obrigatório)
- Endereço público acessível pela internet
- Node.js ou outra tecnologia backend

### Posso testar sem publicar o app?
Sim! Use o modo de desenvolvimento com números de teste. Não precisa submeter o app para revisão da Meta durante o desenvolvimento.

---

## 🆘 Suporte

Se precisar de ajuda:
1. Consulte a documentação oficial da Meta
2. Verifique o [Meta Business Help Center](https://www.facebook.com/business/help)
3. Entre em contato com o suporte da Meta através do Business Manager

---

**Última atualização:** Dezembro 2025
**Versão do sistema:** NexTalk Desk 1.0.0
