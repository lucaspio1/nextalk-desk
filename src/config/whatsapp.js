// Configuração da API Oficial do WhatsApp Business (Meta)
// As credenciais devem ser configuradas no arquivo .env na raiz do projeto
// Use .env.example como template

const API_VERSION = import.meta.env.VITE_WHATSAPP_API_VERSION || "v19.0";
export const META_GRAPH_URL = `https://graph.facebook.com/${API_VERSION}`;

// Credenciais (carregadas de variáveis de ambiente)
export const PHONE_NUMBER_ID = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID || "823581997515238";
export const WABA_ID = import.meta.env.VITE_WHATSAPP_WABA_ID || "875650458452357";
export const ACCESS_TOKEN = import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN || "EAATl3QGVFAkBQORBYSH2cZCSF1tURHCJLzrsHaD06ylZCkpE7bLVvlpAooLBHyd36mUFyJDObNBQRFhB1B6BYxJapxH5aZAOgtFiZAbxHfUJO5LXgM4ZAZCuXkjOLbil27X0jhqQSFztMniv7JHkBVm8peteS98zp6GLqoaVF94UDguFjAfkn9hEYFqJEkxGFv2yDH2ZCFRGW9oxI8ZCXv58UB8ZCi7mS0K5ZB18gjqrMfpGTcjjiqjQZDZD";

// Configuração do Webhook
export const WEBHOOK_VERIFY_TOKEN = import.meta.env.VITE_WEBHOOK_VERIFY_TOKEN || "nextalk_webhook_2024";