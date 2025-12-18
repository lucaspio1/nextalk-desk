import { useState, useEffect, useMemo } from 'react';
import { TicketService } from '../services/TicketService.api';

export const useTicketsModel = (user) => {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    if (!user) return;
    
    // Usa o listener unificado (suporta tanto Firebase Real quanto Mock Local)
    const unsubscribe = TicketService.listenToTickets((docs) => {
      // Ordenação corrigida: datas nulas (pendentes) são tratadas como 'agora' 
      // para garantir que novos tickets fiquem no topo da lista
      docs.sort((a, b) => {
        const dateA = a.createdAt?.toMillis?.() || Date.now();
        const dateB = b.createdAt?.toMillis?.() || Date.now();
        return dateB - dateA;
      });
      setTickets(docs);
    });

    return () => unsubscribe();
  }, [user]);

  const stats = useMemo(() => {
    const closed = tickets.filter(t => t.status === 'closed');
    const open = tickets.filter(t => t.status === 'open' || t.status === 'analyzing');
    const active = tickets.filter(t => t.status === 'active');

    let totalWait = 0, totalHandle = 0;
    closed.forEach(t => {
      // Verifica existência das propriedades antes de calcular
      const startSeconds = t.startedAt?.seconds || 0;
      const createdSeconds = t.createdAt?.seconds || 0;
      const closedSeconds = t.closedAt?.seconds || 0;

      if(startSeconds && createdSeconds) totalWait += (startSeconds - createdSeconds);
      if(closedSeconds && startSeconds) totalHandle += (closedSeconds - startSeconds);
    });

    const byAgent = {};
    const agentActive = {};
    byAgent['Lucas Pio'] = 0; // Inicializa padrão para garantir presença no gráfico

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
      chartDataAgent: Object.keys(byAgent).map(k => ({ 
        name: k, 
        finalizados: byAgent[k], 
        emAtendimento: agentActive[k] || 0 
      })),
      chartDataDept: departments,
      chartReasons: reasons
    };
  }, [tickets]);

  return { tickets, stats };
};