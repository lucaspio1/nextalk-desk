import { useState, useEffect } from 'react';
import { auth } from '../../config/firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

export const useAuthModel = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const init = async () => {
        try { await signInAnonymously(auth); } catch (e) { console.error(e); }
    };
    init();
    return onAuthStateChanged(auth, setUser);
  }, []);

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

  return { user, profile, login, logout };
};