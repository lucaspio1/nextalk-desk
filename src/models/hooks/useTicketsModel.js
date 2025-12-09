import { useState, useEffect, useMemo } from 'react';
import { TicketService } from '../services/TicketService';

export const useTicketsModel = (user) => {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    if (!user) return;

    // Função para carregar tickets do localStorage
    const loadTickets = () => {
      const docs = TicketService.getTickets();
      // Ordena por data de criação (mais recentes primeiro)
      docs.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
      setTickets(docs);
    };

    // Carrega tickets inicialmente
    loadTickets();

    // Escuta mudanças nos tickets
    const handleTicketsUpdate = () => {
      loadTickets();
    };

    window.addEventListener('ticketsUpdated', handleTicketsUpdate);

    // Cleanup
    return () => {
      window.removeEventListener('ticketsUpdated', handleTicketsUpdate);
    };
  }, [user]);

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
