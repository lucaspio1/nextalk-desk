# Como Obter as Credenciais do Firebase Admin SDK

Para que o servidor webhook possa salvar mensagens no Firestore, você precisa configurar o Firebase Admin SDK com um arquivo de credenciais.

## 📝 Passo a Passo

### 1. Acesse o Console do Firebase

1. Vá para [console.firebase.google.com](https://console.firebase.google.com)
2. Selecione seu projeto (ou crie um novo)

### 2. Acesse Configurações do Projeto

1. Clique no ícone de **engrenagem** ⚙️ no menu lateral
2. Selecione **Configurações do projeto**

### 3. Vá para Contas de Serviço

1. Clique na aba **Contas de serviço** (Service accounts)
2. Role até a seção **Firebase Admin SDK**

### 4. Gere uma Nova Chave Privada

1. Selecione a linguagem: **Node.js**
2. Clique no botão **Gerar nova chave privada**
3. Uma janela de confirmação aparecerá
4. Clique em **Gerar chave**

### 5. Salve o Arquivo

1. Um arquivo JSON será baixado automaticamente
2. O nome será algo como: `nome-do-projeto-firebase-adminsdk-xxxxx-xxxxxxxxxx.json`
3. **RENOMEIE** este arquivo para: `firebase-service-account.json`
4. **MOVA** o arquivo para a raiz do projeto NexTalk Desk
5. **IMPORTANTE:** NUNCA compartilhe este arquivo ou faça commit dele no Git!

### 6. Estrutura do Arquivo

O arquivo deve ter uma estrutura similar a esta:

```json
{
  "type": "service_account",
  "project_id": "seu-projeto-id",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@seu-projeto.iam.gserviceaccount.com",
  "client_id": "123456789...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

## 🔒 Segurança

### O arquivo `firebase-service-account.json` contém credenciais SENSÍVEIS!

**O que FAZER:**
- ✅ Mantenha o arquivo apenas no servidor
- ✅ Configure permissões restritivas (chmod 600)
- ✅ Use variáveis de ambiente em produção
- ✅ Adicione ao `.gitignore` (já configurado)

**O que NÃO fazer:**
- ❌ NUNCA faça commit deste arquivo no Git
- ❌ NUNCA compartilhe em repositórios públicos
- ❌ NUNCA envie por email ou mensagens
- ❌ NUNCA exponha em logs ou console

## 🔄 Alternativa: Usar Variáveis de Ambiente

Em vez de usar o arquivo JSON, você pode usar variáveis de ambiente:

```javascript
// webhook-server.js - método alternativo
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CERT_URL
};
```

## ✅ Verificação

Para verificar se configurou corretamente:

1. Execute o servidor webhook:
   ```bash
   npm run webhook
   ```

2. Verifique a mensagem de inicialização:
   ```
   ✅ Firebase Admin inicializado com sucesso
   ```

3. Se aparecer erro, verifique:
   - O arquivo está na raiz do projeto?
   - O nome está correto? (`firebase-service-account.json`)
   - O formato JSON está válido?
   - Você tem permissões para ler o arquivo?

## 🆘 Problemas Comuns

### Erro: "Cannot find module firebase-service-account.json"
- Verifique se o arquivo está na raiz do projeto
- Confirme o nome exato do arquivo

### Erro: "Unexpected token in JSON"
- O arquivo pode estar corrompido
- Baixe novamente do Firebase Console

### Erro: "Permission denied"
- Altere as permissões: `chmod 600 firebase-service-account.json`

### Erro: "Firebase Admin already initialized"
- Isso é normal se você reiniciar o servidor
- Ignore ou use `if (!admin.apps.length) { ... }`

---

**Última atualização:** Dezembro 2025
