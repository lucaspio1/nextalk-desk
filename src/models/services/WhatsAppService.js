// ⚠️ ATENÇÃO: ARQUIVO DEPRECIADO E LIMPO POR QUESTÕES DE SEGURANÇA
// Todas as funções que faziam chamadas diretas do Frontend para a Graph API da Meta
// foram removidas. O Frontend NUNCA deve acessar diretamente a API do WhatsApp 
// para não expor o ACCESS_TOKEN no navegador.
//
// O envio de mensagens e verificação de status agora passam exclusivamente
// pelo backend em `api-server.js` (Rotas: `/api/tickets/:id/messages` e `/api/whatsapp/status`).

export const WhatsAppService = {
  getStatus: async () => ({ state: 'DISCONNECTED', error: true, message: 'Use SettingsService.getWhatsAppStatus()' })
};