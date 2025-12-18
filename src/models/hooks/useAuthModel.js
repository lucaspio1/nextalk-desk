import { useState } from 'react';

export const useAuthModel = () => {
  const [profile, setProfile] = useState(null);
  
  // ✅ ADICIONE ESTA LINHA: Define user como null já que o Firebase foi removido
  const user = null; 

  const login = (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const mockUsers = {
          'admin@nextalk.com': { name: 'Lucas Pio', role: 'manager' }, 
          'agente1@nextalk.com': { name: 'Atendente 1', role: 'agent' },
          'agente2@nextalk.com': { name: 'Atendente 2', role: 'agent' }
        };
        if (mockUsers[email] && password === '123') {
          setProfile(mockUsers[email]);
          resolve(mockUsers[email]);
        } else {
          reject("Credenciais inválidas.");
        }
      }, 800);
    });
  };

  const logout = () => setProfile(null);

  // Agora 'user' existe (é null) e não causará erro ao ser retornado
  return { user, profile, login, logout };
};