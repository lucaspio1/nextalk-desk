import React, { useState } from 'react';
import { MessageSquare, Mail, Lock, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

export const LoginView = ({ onLogin, isLoading, error }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = (e) => { e.preventDefault(); onLogin(email, password); };
  return (
    <div className="h-screen w-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 z-10 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl mb-4"><MessageSquare size={32} strokeWidth={2.5} /></div>
          <h1 className="text-2xl font-bold text-gray-900">NexTalk Desk</h1>
          <p className="text-gray-500">Central inteligente de atendimento</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div><label className="block text-xs font-bold text-gray-600 uppercase mb-1">E-mail</label><div className="relative"><Mail className="absolute left-3 top-3 text-gray-400" size={18} /><input type="email" required className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="admin@nextalk.com" value={email} onChange={e => setEmail(e.target.value)} /></div></div>
          <div><label className="block text-xs font-bold text-gray-600 uppercase mb-1">Senha</label><div className="relative"><Lock className="absolute left-3 top-3 text-gray-400" size={18} /><input type="password" required className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} /></div></div>
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2"><AlertCircle size={16} /> {error}</div>}
          <button type="submit" disabled={isLoading} className="w-full bg-slate-900 text-white p-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors flex justify-center items-center gap-2">{isLoading ? <Loader2 className="animate-spin" /> : <>Acessar Plataforma <ArrowRight size={18} /></>}</button>
        </form>
        <div className="mt-6 text-center text-xs text-gray-400"><span onClick={() => {setEmail('admin@nextalk.com'); setPassword('123')}} className="cursor-pointer hover:text-emerald-600 transition-colors">Demo Admin</span></div>
      </div>
    </div>
  );
};