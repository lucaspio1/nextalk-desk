import { useState, useEffect, useMemo } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { TicketService } from '../services/TicketService';

export const useTicketsModel = (user) => {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(TicketService.collectionRef, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      docs.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
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
      if(t.startedAt && t.createdAt) totalWait += (t.startedAt.seconds - t.createdAt.seconds);
      if(t.closedAt && t.startedAt) totalHandle += (t.closedAt.seconds - t.startedAt.seconds);
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
