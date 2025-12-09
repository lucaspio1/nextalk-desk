import { useState, useEffect, useMemo, useCallback } from 'react';
import { TicketService } from '../services/TicketService';

export const useTicketsModel = (user) => {
  const [tickets, setTickets] = useState([]);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // Função para carregar tickets (usando useCallback para evitar problemas de closure)
  const loadTickets = useCallback(() => {
    console.log('[useTicketsModel] Carregando tickets do localStorage...');
    const docs = TicketService.getTickets();
    console.log('[useTicketsModel] Tickets carregados:', docs.length);

    // Ordena por data de criação (mais recentes primeiro)
    docs.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
    setTickets(docs);
  }, []);

  useEffect(() => {
    if (!user) return;

    // Carrega tickets inicialmente
    loadTickets();

    // Escuta mudanças nos tickets
    const handleTicketsUpdate = () => {
      console.log('[useTicketsModel] Evento ticketsUpdated recebido!');
      loadTickets();
    };

    window.addEventListener('ticketsUpdated', handleTicketsUpdate);

    // Também monitora mudanças no localStorage diretamente
    const handleStorageChange = (e) => {
      console.log('[useTicketsModel] localStorage mudou, recarregando tickets...', e);
      loadTickets();
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener('ticketsUpdated', handleTicketsUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user, loadTickets]);

  // UseEffect separado para reagir a mudanças no trigger
  useEffect(() => {
    if (updateTrigger > 0 && user) {
      console.log('[useTicketsModel] UpdateTrigger mudou, recarregando...', updateTrigger);
      loadTickets();
    }
  }, [updateTrigger, user, loadTickets]);

  // Força atualização manual (útil para debug)
  useEffect(() => {
    const interval = setInterval(() => {
      const docs = TicketService.getTickets();
      if (docs.length !== tickets.length) {
        console.log('[useTicketsModel] Detectada mudança no número de tickets, atualizando...');
        setUpdateTrigger(prev => prev + 1);
      }
    }, 1000); // Verifica a cada 1 segundo

    return () => clearInterval(interval);
  }, [tickets.length]);

  const stats = useMemo(() => {
    const closed = tickets.filter(t => t.status === 'closed');
    const open = tickets.filter(t => t.status === 'open');
    const active = tickets.filter(t => t.status === 'active');

    let totalWait = 0, totalHandle = 0;
    closed.forEach(t => {
      if (t.startedAt && t.createdAt) {
        const startedDate = new Date(t.startedAt).getTime();
        const createdDate = new Date(t.createdAt).getTime();
        totalWait += (startedDate - createdDate) / 1000; // em segundos
      }
      if (t.closedAt && t.startedAt) {
        const closedDate = new Date(t.closedAt).getTime();
        const startedDate = new Date(t.startedAt).getTime();
        totalHandle += (closedDate - startedDate) / 1000; // em segundos
      }
    });

    const byAgent = {};
    const agentActive = {};
    byAgent['Lucas Pio'] = 0;

    [...closed, ...active].forEach(t => {
      const agent = t.agentId || 'Desconhecido';
      byAgent[agent] = (byAgent[agent] || 0) + 1;
      if (t.status === 'active') agentActive[agent] = (agentActive[agent] || 0) + 1;
    });

    const departments = [
      { name: 'Suporte', value: 50, color: '#82ca9d' },
      { name: 'Vendas', value: 30, color: '#8884d8' },
      { name: 'Financeiro', value: 20, color: '#ffc658' }
    ];

    const reasons = [
      { name: 'Resolvido', qtd: Math.floor(closed.length * 0.8) },
      { name: 'Engano', qtd: Math.floor(closed.length * 0.2) }
    ];

    return {
      total: tickets.length,
      startedPeriod: active.length + closed.length,
      waiting: open.length,
      inAttendance: active.length,
      finalized: closed.length,
      avgWait: closed.length ? totalWait / closed.length : 0,
      avgHandle: closed.length ? totalHandle / closed.length : 0,
      agentsOnline: 1,
      chartDataAgent: Object.keys(byAgent).map(k => ({ name: k, finalizados: byAgent[k], emAtendimento: agentActive[k] || 0 })),
      chartDataDept: departments,
      chartReasons: reasons
    };
  }, [tickets]);

  return { tickets, stats };
};
