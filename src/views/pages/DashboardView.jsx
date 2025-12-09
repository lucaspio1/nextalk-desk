import React from 'react';
import { Calendar, Filter, Star, HelpCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { DashboardCard } from '../components/UIComponents';

const DashboardSidebar = () => (
  <div className="w-64 bg-[#f5f5f5] p-4 flex flex-col gap-4 border-r border-gray-200 shrink-0 h-full overflow-y-auto">
    <div className="flex items-center gap-2 text-gray-500 mb-2"><Filter size={18} /> <span className="font-semibold text-sm">Filtros</span></div>
    <div className="space-y-1"><label className="text-xs text-gray-500">Início</label><div className="relative"><input type="text" placeholder="dd / mm / aaaa" className="w-full p-2 pl-3 text-sm border border-gray-300 rounded bg-white" /><Calendar className="absolute right-2 top-2 text-gray-400" size={16} /></div></div>
    <div className="space-y-1"><label className="text-xs text-gray-500">Fim</label><div className="relative"><input type="text" placeholder="dd / mm / aaaa" className="w-full p-2 pl-3 text-sm border border-gray-300 rounded bg-white" /><Calendar className="absolute right-2 top-2 text-gray-400" size={16} /></div></div>
    <div className="space-y-1"><label className="text-xs text-gray-500">Departamento</label><select className="w-full p-2 text-sm border border-gray-300 rounded bg-white"><option>Todos</option></select></div>
    <div className="space-y-1"><label className="text-xs text-gray-500">Origem</label><select className="w-full p-2 text-sm border border-gray-300 rounded bg-white"><option>Todos</option></select></div>
  </div>
);

const DashboardContent = ({ stats }) => (
  <div className="flex-1 p-6 overflow-y-auto bg-white">
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <DashboardCard title="Total de Atendimentos" value={stats.total} />
        <DashboardCard title="Iniciados no período" value={stats.startedPeriod} subtext={`${stats.inAttendance} ativos • ${stats.finalized} receptivos`} />
        <DashboardCard title="Aguardando atendimento" value={stats.waiting} colorType="red" />
        <DashboardCard title="Em atendimento" value={stats.inAttendance} subtext={`${stats.inAttendance} individual • 0 grupo`} colorType="blue" />
        <DashboardCard title="Finalizados" value={stats.finalized} subtext="0 inatividade • 2 manual" colorType="green" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DashboardCard title="Agentes online" value={stats.agentsOnline} />
        <DashboardCard title="Tempo médio de espera" value={`${Math.floor(stats.avgWait/60).toString().padStart(2,'0')}:${(stats.avgWait%60).toFixed(0).padStart(2,'0')}`} />
        <DashboardCard title="Tempo médio de atendimento" value={`${Math.floor(stats.avgHandle/60).toString().padStart(2,'0')}:${(stats.avgHandle%60).toFixed(0).padStart(2,'0')}`} />
        <div className="rounded-xl p-5 shadow-sm border border-gray-100 bg-white flex flex-col items-center justify-center text-center h-40">
           <div className="absolute top-3 right-3 opacity-50"><HelpCircle size={14} /></div>
           <h3 className="text-sm font-semibold text-gray-600 mb-2">Avaliação do Atendimento</h3>
           <div className="text-5xl font-bold text-gray-800 flex items-center gap-1">-<Star className="text-yellow-400 fill-yellow-400" size={32} /></div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border border-gray-100 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Atendimentos por Agente</h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={stats.chartDataAgent} margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="emAtendimento" name="Em Atendimento" stackId="a" fill="#8884d8" barSize={20} radius={[0, 4, 4, 0]} />
                  <Bar dataKey="finalizados" name="Finalizados" stackId="a" fill="#82ca9d" barSize={20} radius={[0, 4, 4, 0]} />
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
        <div className="border border-gray-100 rounded-xl p-6 shadow-sm flex flex-col items-center">
          <h3 className="text-lg font-bold text-gray-800 mb-4 w-full text-left">Atendimentos por Departamento</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.chartDataDept} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {stats.chartDataDept.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-400 mt-2">Sem departamento (dados mock)</p>
        </div>
      </div>
    </div>
  </div>
);

export const DashboardView = ({ stats }) => (
  <div className="flex w-full h-full">
    <DashboardSidebar />
    <DashboardContent stats={stats} />
  </div>
);