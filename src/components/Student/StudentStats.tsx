import React, { useEffect, useState } from 'react';
import { getResultsForStudent } from '../../lib/store';
import { TestResult } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { TrendingUp, TrendingDown, Minus, Clock, FileText, ChevronRight } from 'lucide-react';
import StudentDetailedResult from './StudentDetailedResult';

export default function StudentStats() {
  const { user } = useAuth();
  const [results, setResults] = useState<TestResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const res = await getResultsForStudent(user.username);
        setResults(res);
      }
    };
    fetchData();
  }, [user]);

  if (selectedResult) {
    return <StudentDetailedResult result={selectedResult} onBack={() => setSelectedResult(null)} />;
  }

  if (results.length === 0) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-slate-500 h-full">
        <FileText size={48} className="mb-4 text-slate-300" />
        <p className="text-lg">Hali testlar ishlaganingiz yo'q</p>
        <p className="text-sm mt-1">Birinchi testni ishlash uchun "Asosiy sahifa"ga o'ting</p>
      </div>
    );
  }

  const averagePercentage = (results.reduce((acc, r) => acc + r.percentage, 0) / results.length).toFixed(1);
  const bestScore = Math.max(...results.map(r => r.percentage)).toFixed(0);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-[#1E293B] mb-6">Mening natijalarim</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">O'rtacha natija</p>
          <p className="text-3xl font-bold text-[#1E293B]">{averagePercentage}%</p>
        </div>
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">Eng yuqori natija</p>
          <p className="text-3xl font-bold text-emerald-600">{bestScore}%</p>
        </div>
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">Jami urinishlar</p>
          <p className="text-3xl font-bold text-amber-600">{results.length}</p>
        </div>
      </div>

      <h3 className="text-lg font-bold text-[#1E293B] mb-4">Urinishlar tarixi</h3>
      
      <div className="grid gap-4">
        {results.map(r => {
          let resultStyle = "bg-white border-slate-200 hover:border-slate-400";
          
          if (r.percentage >= 80) {
            resultStyle = "bg-emerald-50 border-emerald-200 hover:border-emerald-400";
          } else if (r.percentage >= 60) {
            resultStyle = "bg-amber-50 border-amber-200 hover:border-amber-400";
          } else {
            resultStyle = "bg-red-50 border-red-200 hover:border-red-400";
          }

          return (
            <div 
              key={r.id} 
              onClick={() => setSelectedResult(r)}
              className={`${resultStyle} border p-4 sm:p-5 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:shadow-sm transition-all`}
            >
              <div className="flex-1">
                <h4 className="font-bold text-[#1E293B] text-lg mb-2">{r.testTitle}</h4>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  <span className={`flex items-center gap-1 font-mono px-2 py-0.5 rounded-sm border ${r.percentage >= 80 ? 'bg-emerald-100/50 border-emerald-200' : r.percentage >= 60 ? 'bg-amber-100/50 border-amber-200' : 'bg-red-100/50 border-red-200'}`}><FileText size={14} /> {r.testCode}</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {new Date(r.date).toLocaleDateString('uz-UZ')}</span>
                  <span>{Math.floor(r.timeSpent / 60)} d {r.timeSpent % 60} s</span>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 md:justify-end shrink-0 pt-3 border-t md:pt-0 md:border-t-0" style={{ borderColor: 'inherit' }}>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-500 mb-0.5">Natija</p>
                  <p className="text-xl font-bold text-[#1E293B]">{r.percentage.toFixed(0)}% <span className="text-sm text-slate-400 font-medium">({r.score}/{r.total})</span></p>
                </div>
                
                <div className="text-right w-24">
                  <p className="text-sm font-medium text-slate-500 mb-0.5">O'sish</p>
                  {r.progress === null ? (
                    <span className="text-slate-400 text-sm italic">Birinchi</span>
                  ) : r.progress > 0 ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                      <TrendingUp size={16} /> +{r.progress.toFixed(0)}%
                    </span>
                  ) : r.progress < 0 ? (
                    <span className="inline-flex items-center gap-1 text-red-600 font-bold">
                      <TrendingDown size={16} /> {r.progress.toFixed(0)}%
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-600 font-bold">
                      <Minus size={16} /> {r.progress.toFixed(0)}%
                    </span>
                  )}
                </div>
                
                <div className="pl-4 border-l flex items-center justify-center text-slate-400" style={{ borderColor: 'inherit' }}>
                  <ChevronRight size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
