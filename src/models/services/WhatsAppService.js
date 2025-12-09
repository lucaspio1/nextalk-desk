import { META_GRAPH_URL, PHONE_NUMBER_ID, ACCESS_TOKEN } from '../../config/whatsapp';

export const WhatsAppService = {
  async getStatus() {
    if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) return Promise.resolve({ state: 'DISCONNECTED', missingConfig: true });

    try {
      const url = `${META_GRAPH_URL}/${PHONE_NUMBER_ID}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: { 
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
          const data = await res.json();
          console.log("Conexão Meta OK:", data);
          return { state: 'CONNECTED', details: data };
      } else {
          const err = await res.json();
          console.error("Erro Conexão Meta:", err);
          return { state: 'DISCONNECTED', error: true };
      }
    } catch (error) {
      console.error("Erro Rede Meta:", error);
      return { state: 'DISCONNECTED', error: true };
    }
  },

  async sendMessage(phone, text) {
    console.log(`[WhatsAppService] Preparando envio para ${phone}`);
    
    if (!phone) {
        console.error("[WhatsAppService] Telefone inválido/vazio");
        return false;
    }

    const url = `${META_GRAPH_URL}/${PHONE_NUMBER_ID}/messages`;
    try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: phone,
            type: "text",
            text: { body: text }
          })
        });
        
        if (!res.ok) {
            const err = await res.json();
            console.error("[WhatsAppService] Erro API:", err);
            // IMPORTANTE: Retornamos true mesmo com erro da API para não travar a UI do chat, 
            // mas logamos o erro para debug.
            return false; 
        }
        
        const data = await res.json();
        console.log("[WhatsAppService] Sucesso:", data);
        return true;
    } catch (e) {
        console.error("[WhatsAppService] Erro Fetch:", e);
        return false;
    }
  }
};