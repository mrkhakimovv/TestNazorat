import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getTestByCode } from '../lib/store';
import { BookOpen } from 'lucide-react';

export default function ReferralEntry({ testCode }: { testCode: string }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [testValid, setTestValid] = useState(false);

  useEffect(() => {
    const checkTest = async () => {
      try {
        const test = await getTestByCode(testCode);
        if (test) {
          setTestValid(true);
        } else {
          setError("Test topilmadi. Havola noto'g'ri bo'lishi mumkin.");
        }
      } catch (err) {
        setError("Xatolik yuz berdi. Qaytadan urinib ko'ring.");
      } finally {
        setLoading(false);
      }
    };
    checkTest();
  }, [testCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Username va parolni kiriting.");
      return;
    }
    
    try {
      setError('');
      sessionStorage.setItem('pending_test_code', testCode);
      await login(username.trim(), password);
    } catch (err: any) {
      setError(err.message || "Tizimga kirishda xatolik yuz berdi.");
      sessionStorage.removeItem('pending_test_code');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-4">
        <p className="text-slate-500">Tekshirilmoqda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 border border-slate-200 shadow-sm rounded-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-[#1E293B] text-white flex items-center justify-center rounded-sm mb-4">
            <BookOpen size={24} />
          </div>
          <h1 className="text-2xl font-bold text-[#1E293B]">TestNazorat</h1>
          <p className="text-slate-500 text-sm mt-1 text-center">Test ishlash uchun akkauntingizga kiring</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm border border-red-200 rounded-sm">
            {error}
          </div>
        )}

        {testValid ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-sm focus:outline-none focus:border-[#1E293B] outline-none transition-colors"
                placeholder="Masalan: alivaliyev"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1">
                Parol (kod)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-sm focus:outline-none focus:border-[#1E293B] outline-none transition-colors"
                placeholder="Parolingizni kiriting"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-[#1E293B] hover:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-sm transition-colors mt-2"
            >
              Tizimga kirish va testni boshlash
            </button>
            
            <p className="text-xs text-center text-slate-500 mt-4">
              Testni ishlash uchun avval ro'yxatdan o'tgan bo'lishingiz kerak.
            </p>
          </form>
        ) : (
           <div className="text-center mt-4">
             <button 
               onClick={() => window.location.href = '/'}
               className="text-[#1E293B] hover:underline text-sm font-medium"
             >
               Bosh sahifaga qaytish
             </button>
           </div>
        )}
      </div>
    </div>
  );
}
