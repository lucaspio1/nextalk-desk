import { META_GRAPH_URL, PHONE_NUMBER_ID, ACCESS_TOKEN } from '../../config/whatsapp';

/**
 * Serviço de integração com a API oficial do WhatsApp Business (Meta)
 * Documentação: https://developers.facebook.com/docs/whatsapp/cloud-api
 */
export const WhatsAppService = {
  /**
   * Verifica o status da conexão com a API do WhatsApp
   * @returns {Promise<{state: string, details?: object, error?: boolean, missingConfig?: boolean}>}
   */
  async getStatus() {
    if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
      return Promise.resolve({ state: 'DISCONNECTED', missingConfig: true });
    }

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
        console.log("✅ Conexão Meta OK:", data);
        return { state: 'CONNECTED', details: data };
      } else {
        const err = await res.json();
        console.error("❌ Erro Conexão Meta:", err);
        return { state: 'DISCONNECTED', error: true, details: err };
      }
    } catch (error) {
      console.error("❌ Erro Rede Meta:", error);
      return { state: 'DISCONNECTED', error: true };
    }
  },

  /**
   * Envia uma mensagem de texto simples
   * @param {string} phone - Número de telefone no formato internacional (ex: 5511999999999)
   * @param {string} text - Texto da mensagem
   * @returns {Promise<boolean>} true se enviado com sucesso
   */
  async sendMessage(phone, text) {
    console.log(`📤 [WhatsAppService] Preparando envio para ${phone}`);

    if (!phone || !text) {
      console.error("❌ [WhatsAppService] Telefone ou texto inválido");
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
        console.error("❌ [WhatsAppService] Erro API:", err);
        return false;
      }

      const data = await res.json();
      console.log("✅ [WhatsAppService] Mensagem enviada:", data);
      return true;
    } catch (e) {
      console.error("❌ [WhatsAppService] Erro Fetch:", e);
      return false;
    }
  },

  /**
   * Envia uma imagem via WhatsApp
   * @param {string} phone - Número de telefone
   * @param {string} imageUrl - URL pública da imagem
   * @param {string} caption - Legenda opcional
   * @returns {Promise<boolean>}
   */
  async sendImage(phone, imageUrl, caption = '') {
    console.log(`📷 [WhatsAppService] Enviando imagem para ${phone}`);

    if (!phone || !imageUrl) {
      console.error("❌ Telefone ou URL da imagem inválido");
      return false;
    }

    const url = `${META_GRAPH_URL}/${PHONE_NUMBER_ID}/messages`;
    try {
      const payload = {
        messaging_product: "whatsapp",
        to: phone,
        type: "image",
        image: {
          link: imageUrl
        }
      };

      if (caption) {
        payload.image.caption = caption;
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("❌ Erro ao enviar imagem:", err);
        return false;
      }

      console.log("✅ Imagem enviada com sucesso");
      return true;
    } catch (e) {
      console.error("❌ Erro ao enviar imagem:", e);
      return false;
    }
  },

  /**
   * Envia um documento/arquivo via WhatsApp
   * @param {string} phone - Número de telefone
   * @param {string} documentUrl - URL pública do documento
   * @param {string} filename - Nome do arquivo (opcional)
   * @param {string} caption - Legenda opcional
   * @returns {Promise<boolean>}
   */
  async sendDocument(phone, documentUrl, filename = '', caption = '') {
    console.log(`📄 [WhatsAppService] Enviando documento para ${phone}`);

    if (!phone || !documentUrl) {
      console.error("❌ Telefone ou URL do documento inválido");
      return false;
    }

    const url = `${META_GRAPH_URL}/${PHONE_NUMBER_ID}/messages`;
    try {
      const payload = {
        messaging_product: "whatsapp",
        to: phone,
        type: "document",
        document: {
          link: documentUrl
        }
      };

      if (filename) payload.document.filename = filename;
      if (caption) payload.document.caption = caption;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("❌ Erro ao enviar documento:", err);
        return false;
      }

      console.log("✅ Documento enviado com sucesso");
      return true;
    } catch (e) {
      console.error("❌ Erro ao enviar documento:", e);
      return false;
    }
  },

  /**
   * Envia um template pré-aprovado pela Meta
   * @param {string} phone - Número de telefone
   * @param {string} templateName - Nome do template aprovado
   * @param {string} languageCode - Código do idioma (ex: 'pt_BR', 'en_US')
   * @param {Array} components - Componentes do template (opcional)
   * @returns {Promise<boolean>}
   */
  async sendTemplate(phone, templateName, languageCode = 'pt_BR', components = []) {
    console.log(`📋 [WhatsAppService] Enviando template ${templateName} para ${phone}`);

    if (!phone || !templateName) {
      console.error("❌ Telefone ou nome do template inválido");
      return false;
    }

    const url = `${META_GRAPH_URL}/${PHONE_NUMBER_ID}/messages`;
    try {
      const payload = {
        messaging_product: "whatsapp",
        to: phone,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: languageCode
          }
        }
      };

      if (components.length > 0) {
        payload.template.components = components;
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("❌ Erro ao enviar template:", err);
        return false;
      }

      console.log("✅ Template enviado com sucesso");
      return true;
    } catch (e) {
      console.error("❌ Erro ao enviar template:", e);
      return false;
    }
  },

  /**
   * Marca uma mensagem como lida
   * @param {string} messageId - ID da mensagem recebida
   * @returns {Promise<boolean>}
   */
  async markAsRead(messageId) {
    if (!messageId) {
      console.error("❌ ID da mensagem inválido");
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
          status: "read",
          message_id: messageId
        })
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("❌ Erro ao marcar como lida:", err);
        return false;
      }

      console.log("✅ Mensagem marcada como lida");
      return true;
    } catch (e) {
      console.error("❌ Erro ao marcar mensagem:", e);
      return false;
    }
  },

  /**
   * Valida se um número de telefone está no formato correto
   * @param {string} phone - Número de telefone
   * @returns {boolean}
   */
  isValidPhoneNumber(phone) {
    // Remove espaços, traços e parênteses
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');

    // Verifica se contém apenas números e tem pelo menos 10 dígitos
    const phoneRegex = /^\d{10,15}$/;
    return phoneRegex.test(cleaned);
  },

  /**
   * Formata um número de telefone para o padrão internacional
   * @param {string} phone - Número de telefone
   * @param {string} countryCode - Código do país (padrão: 55 para Brasil)
   * @returns {string}
   */
  formatPhoneNumber(phone, countryCode = '55') {
    // Remove tudo exceto números
    let cleaned = phone.replace(/\D/g, '');

    // Se não começa com código do país, adiciona
    if (!cleaned.startsWith(countryCode)) {
      cleaned = countryCode + cleaned;
    }

    return cleaned;
  }
};