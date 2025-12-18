const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const PaymentService = {
  async createPayment(data) {
    try {
      const response = await fetch(`${API_URL}/asaas/create-payment`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Envia token se houver auth
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Falha ao comunicar com o servidor de pagamento.');
      }
      
      return result;
    } catch (error) {
      console.error('Erro no PaymentService:', error);
      throw error; // Repassa o erro para a interface tratar
    }
  }
};