import React, { useEffect, useState } from 'react';
import { getTests, getResults, deleteTest } from '../../lib/store';
import { Test } from '../../types';
import { FileText, Users, Clock, ArrowRight, Trash2 } from 'lucide-react';

export default function TestList({ onViewStats }: { onViewStats: (id: string) => void }) {
  const [tests, setTests] = useState<Test[]>([]);
  const [resultCounts, setResultCounts] = useState<Record<string, number>>({});

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = async () => {
    const allTests = await getTests();
    const sorted = allTests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setTests(sorted);

    const results = await getResults();
    const counts: Record<string, number> = {};
    results.forEach(r => {
      counts[r.testId] = (counts[r.testId] || 0) + 1;
    });
    setResultCounts(counts);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const confirmDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteTest(deletingId);
      await fetchData();
    } catch (error) {
      console.error("Testni o'chirishda xatolik yuz berdi", error);
      // alert no longer used to avoid iframe blocks
    } finally {
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  if (tests.length === 0) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-slate-500 h-full">
        <FileText size={48} className="mb-4 text-slate-300" />
        <p className="text-lg">Hali testlar yaratilmagan</p>
        <p className="text-sm mt-1">"Yangi test yaratish" orqali boshlang</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-[#1E293B] mb-6">Mening testlarim</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tests.map(test => (
          <div key={test.id} className="border border-slate-200 p-5 rounded-sm flex flex-col justify-between hover:border-amber-600 transition-colors group relative">
            <div>
              <div className="flex justify-between items-start mb-2 pr-8">
                <h3 className="font-bold text-[#1E293B] text-lg leading-tight line-clamp-2" title={test.title}>{test.title}</h3>
                <span className="bg-slate-100 text-[#1E293B] font-mono text-xs px-2 py-1 rounded-sm tracking-wider border border-slate-200">
                  {test.code}
                </span>
              </div>
              <button 
                onClick={(e) => confirmDelete(e, test.id)}
                className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors p-1"
                title="Testni o'chirish"
              >
                <Trash2 size={18} />
              </button>
              <div className="space-y-1 mb-4 text-sm text-slate-500">
                <p className="flex items-center gap-2"><FileText size={14}/> {test.questions.length} ta savol</p>
                <p className="flex items-center gap-2"><Users size={14}/> {resultCounts[test.id] || 0} ta natija</p>
              </div>
            </div>
            
            <button 
              onClick={() => onViewStats(test.id)}
              className="w-full flex items-center justify-center gap-2 py-2 border border-[#1E293B] text-[#1E293B] rounded-sm group-hover:bg-[#1E293B] group-hover:text-white transition-colors text-sm font-medium"
            >
              Statistikani ko'rish <ArrowRight size={16}/>
            </button>
          </div>
        ))}
      </div>

      {deletingId && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-sm shadow-lg max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-[#1E293B] mb-2">Testni o'chirish</h3>
            <p className="text-slate-600 mb-6 text-sm">
              Rostdan ham ushbu testni o'chirib yubormoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-sm transition-colors border border-transparent"
              >
                Bekor qilish
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-sm transition-colors"
              >
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
