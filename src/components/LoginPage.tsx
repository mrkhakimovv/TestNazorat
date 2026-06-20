import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen } from 'lucide-react';
import { Role } from '../types';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);
  
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isLoginView) {
      if (!username.trim() || !password.trim()) {
        setError("Username va parolni kiriting.");
        return;
      }
    } else {
      if (!name.trim() || !username.trim() || !password.trim()) {
        setError("Barcha maydonlarni to'ldiring.");
        return;
      }
    }

    try {
      setLoading(true);
      if (isLoginView) {
        await login(username.trim(), password);
      } else {
        await register(name.trim(), username.trim(), password, 'oquvchi');
      }
    } catch (err: any) {
      setError(err.message || "Xatolik yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 border border-slate-200 shadow-sm rounded-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-[#1E293B] text-white flex items-center justify-center rounded-sm mb-4">
            <BookOpen size={24} />
          </div>
          <h1 className="text-2xl font-bold text-[#1E293B]">TestNazorat</h1>
          <p className="text-slate-500 text-sm mt-1">Onlayn test tekshirish platformasi</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-sm mb-6">
          <button
            onClick={() => setIsLoginView(true)}
            className={`flex-1 py-2 text-sm font-medium rounded-sm transition-colors ${
              isLoginView ? 'bg-white shadow-sm text-[#1E293B]' : 'text-slate-500 hover:text-[#1E293B]'
            }`}
          >
            Kirish
          </button>
          <button
            onClick={() => setIsLoginView(false)}
            className={`flex-1 py-2 text-sm font-medium rounded-sm transition-colors ${
              !isLoginView ? 'bg-white shadow-sm text-[#1E293B]' : 'text-slate-500 hover:text-[#1E293B]'
            }`}
          >
            Ro'yxatdan o'tish
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm border border-red-200 rounded-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginView && (
            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1">
                Ism va familiya
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-sm focus:outline-none focus:border-[#1E293B] outline-none transition-colors"
                placeholder="Masalan: Ali Valiyev"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-sm focus:outline-none focus:border-[#1E293B] outline-none transition-colors"
              placeholder="Foydalanuvchi nomi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-1">
              Parol
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-sm focus:outline-none focus:border-[#1E293B] outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>



          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1E293B] hover:bg-slate-800 disabled:bg-slate-400 text-white font-medium py-2.5 px-4 rounded-sm transition-colors mt-2"
          >
            {loading ? 'Kuting...' : (isLoginView ? 'Tizimga kirish' : "Ro'yxatdan o'tish")}
          </button>
        </form>
      </div>
    </div>
  );
}
