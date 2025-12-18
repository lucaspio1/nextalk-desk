import { GEMINI_API_KEY, GEMINI_URL } from '../../config/gemini';

export const AIService = {
  async generateResponse(prompt) {
    if (!GEMINI_API_KEY) return null;
    
    const url = `${GEMINI_URL}?key=${GEMINI_API_KEY}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      if (!response.ok) throw new Error(`Gemini API Error: ${response.status}`);
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (error) {
      console.error("AI Service Error:", error);
      return null;
    }
  },

  async triageTicket(messageText) {
    const prompt = `
      Atue como triagem (n8n). Analise: "${messageText}"
      JSON: { "category": "Financeiro"|"Vendas"|"Suporte"|"Outros", "priority": "Alta"|"Normal"|"Baixa", "summary": "Resumo 5 palavras" }
    `;
    const text = await this.generateResponse(prompt);
    try {
      if (!text) throw new Error("Sem resposta");
      return JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
    } catch {
      return { category: 'Geral', priority: 'Normal', summary: 'Nova mensagem' };
    }
  }
};