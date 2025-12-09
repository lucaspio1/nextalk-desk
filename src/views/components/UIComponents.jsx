import React from 'react';
import { HelpCircle } from 'lucide-react';

export const Button = ({ children, onClick, variant = "primary", className = "", disabled = false }) => {
  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    ghost: "text-gray-500 hover:bg-gray-100",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
    warning: "bg-amber-500 text-white hover:bg-amber-600"
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`px-4 py-2 rounded-md font-medium flex items-center justify-center gap-2 transition-colors ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

export const Badge = ({ text }) => {
  const colors = {
    'Financeiro': 'bg-yellow-100 text-yellow-800',
    'Suporte': 'bg-blue-100 text-blue-800',
    'Vendas': 'bg-emerald-100 text-emerald-800',
    'Alta': 'bg-red-100 text-red-800'
  };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${colors[text] || 'bg-gray-100 text-gray-600'}`}>{text}</span>;
};

export const DashboardCard = ({ title, value, subtext, colorType = "white" }) => {
  const styles = {
    white: "bg-white text-gray-800 border border-gray-100",
    red: "bg-red-600 text-white",
    blue: "bg-indigo-600 text-white",
    green: "bg-[#7dbb4f] text-white"
  };
  const subtextStyle = colorType === 'white' ? 'text-gray-400' : 'text-white/80';
  return (
    <div className={`rounded-xl p-5 shadow-sm relative flex flex-col items-center justify-center text-center h-40 ${styles[colorType]}`}>
      <div className="absolute top-3 right-3 opacity-50"><HelpCircle size={14} /></div>
      <h3 className={`text-sm font-semibold mb-2 ${colorType === 'white' ? 'text-gray-600' : 'text-white'}`}>{title}</h3>
      <div className="text-5xl font-bold mb-2">{value}</div>
      {subtext && <p className={`text-xs ${subtextStyle}`}>{subtext}</p>}
    </div>
  );
};

export const ToggleSwitch = ({ label, checked }) => (
  <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg">
    <div className="flex flex-col">
      <span className="text-sm font-medium text-gray-800">{label}</span>
      <span className="text-xs text-gray-400 mt-1">Configuração de sistema</span>
    </div>
    <div className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${checked ? 'bg-emerald-50' : 'bg-gray-300'}`}>
      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${checked ? 'translate-x-5' : ''}`}></div>
    </div>
  </div>
);

export const SectionHeader = ({ title, description, action }) => (
  <div className="mb-6">
    <div className="flex justify-between items-start">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <p className="text-gray-500 mt-1">{description}</p>
      </div>
      {action}
    </div>
  </div>
);

export const AdminTable = ({ headers, rows }) => (
  <div className="overflow-x-auto bg-white rounded-lg border border-gray-100">
    <table className="w-full text-sm text-left">
      <thead className="text-gray-500 bg-gray-50 border-b border-gray-100">
        <tr>{headers.map((h, i) => <th key={i} className="px-6 py-3 font-medium">{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
            {row.map((cell, j) => <td key={j} className="px-6 py-4">{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);