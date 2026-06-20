import React, { useState } from 'react';
import { getTestByCode } from '../../lib/store';
import { Test } from '../../types';
import { Search, Info } from 'lucide-react';

export default function TestEntry({ onStartTest }: { onStartTest: (test: Test) => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Test kodini kiriting.");
      return;
    }

    const test = await getTestByCode(code.trim());
    if (!test) {
      setError("Test kodi xato yoki bunday test mavjud emas.");
      return;
    }

    setError('');
    onStartTest(test);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full bg-white p-8 border border-slate-200 rounded-sm shadow-sm text-center">
        <h2 className="text-2xl font-bold text-[#1E293B] mb-2">Testga kirish</h2>
        <p className="text-slate-500 mb-8 text-sm">Ustozingiz bergan maxsus kodni kiriting.</p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm border border-red-200 rounded-sm text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Masalan: ABC-1234"
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-sm text-center font-mono text-lg tracking-widest focus:outline-none focus:border-[#1E293B] uppercase"
              />
              <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 rounded-sm transition-colors"
          >
            Boshlash
          </button>
        </form>

        <div className="mt-6 flex items-start gap-2 text-left text-xs text-slate-500 bg-slate-50 p-3 rounded-sm border border-slate-100">
          <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <p>
            Testni boshlaganingizdan so'ng, orqaga qayta olmaysiz. Agar vaqt chegarasi o'rnatilgan bo'lsa, u darhol ishga tushadi.
          </p>
        </div>
      </div>
    </div>
  );
}
