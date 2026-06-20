import React, { useEffect, useState } from 'react';
import { getTests, getResults } from '../../lib/store';
import { Test } from '../../types';
import { FileText, Users, Clock, ArrowRight } from 'lucide-react';

export default function TestList({ onViewStats }: { onViewStats: (id: string) => void }) {
  const [tests, setTests] = useState<Test[]>([]);
  const [resultCounts, setResultCounts] = useState<Record<string, number>>({});

  useEffect(() => {
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
    fetchData();
  }, []);

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
          <div key={test.id} className="border border-slate-200 p-5 rounded-sm flex flex-col justify-between hover:border-amber-600 transition-colors group">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-[#1E293B] text-lg leading-tight line-clamp-2" title={test.title}>{test.title}</h3>
                <span className="bg-slate-100 text-[#1E293B] font-mono text-xs px-2 py-1 rounded-sm tracking-wider border border-slate-200">
                  {test.code}
                </span>
              </div>
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
    </div>
  );
}
