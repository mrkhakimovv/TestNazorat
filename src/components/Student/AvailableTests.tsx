import React, { useEffect, useState } from 'react';
import { getTests, getResultsForStudent } from '../../lib/store';
import { Test, TestResult } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { PlayCircle, CheckCircle2, Clock } from 'lucide-react';

interface AvailableTestsProps {
  onStartTest: (test: Test) => void;
}

export default function AvailableTests({ onStartTest }: AvailableTestsProps) {
  const { user } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterType, setFilterType] = useState<string>('Barchasi');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [testsData, resultsData] = await Promise.all([
          getTests(),
          user ? getResultsForStudent(user.username) : Promise.resolve([])
        ]);
        setTests(testsData);
        setResults(resultsData);
      } catch (error) {
        console.error("Failed to load tests and results", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E293B]"></div>
      </div>
    );
  }

  // To display highest score if multiple attempts
  const getBestResultForTest = (testId: string) => {
    const testResults = results.filter(r => r.testId === testId);
    if (testResults.length === 0) return null;
    return testResults.reduce((best, current) => 
      current.percentage > best.percentage ? current : best
    );
  };

  const filteredTests = tests.filter(test => {
    if (filterType === 'Barchasi') return true;
    return test.testType === filterType;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#1E293B]">Mavjud testlar</h2>
        <p className="text-sm text-slate-500 mt-1 mb-4">Barcha aktiv testlar ro'yxati</p>
        
        <div className="flex overflow-x-auto gap-2 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {['Barchasi', 'Asosiy', 'Majburiy', 'Mavzulashtirilgan'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`whitespace-nowrap shrink-0 px-4 py-2 border rounded-sm text-sm font-medium transition-colors cursor-pointer ${
                filterType === type 
                  ? 'bg-[#1E293B] text-white border-[#1E293B]' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {filteredTests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTests.map(test => {
            const bestResult = getBestResultForTest(test.id);
            const isTaken = !!bestResult;

            return (
              <div 
                key={test.id}
                onClick={() => !isTaken && onStartTest(test)}
                className={`border rounded-sm p-5 transition-all flex flex-col ${
                  isTaken 
                    ? 'bg-slate-50 border-slate-200 cursor-default' 
                    : 'bg-white border-slate-200 hover:border-amber-500 hover:shadow-sm cursor-pointer'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-[#1E293B] line-clamp-2">{test.title}</h3>
                  {isTaken ? (
                    <div className="shrink-0 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ml-2 flex items-center gap-1.5">
                      <CheckCircle2 size={14} /> Bajarilgan • {bestResult.percentage.toFixed(0)}%
                    </div>
                  ) : (
                    <div className="shrink-0 bg-blue-50 text-blue-600 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ml-2">Yangi</div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono bg-slate-100 self-start px-2 py-1 rounded-sm">
                    KOD: {test.code}
                  </div>
                  {test.testType && (
                    <span className="bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0.5 rounded border border-blue-100 font-medium">
                      {test.testType}
                    </span>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-sm text-slate-500 flex items-center gap-1.5">
                    <span className="font-medium text-[#1E293B]">{test.questions.length}</span> savol
                  </div>
                  
                  {isTaken ? (
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Eng yuqori natija</div>
                      <div className="font-bold text-emerald-600 text-lg">{bestResult.percentage.toFixed(0)}%</div>
                    </div>
                  ) : (
                    <button className="flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-700">
                      <PlayCircle size={16} /> Ishlash
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-50 rounded-sm border border-slate-200">
          <p className="text-slate-500">Hozircha testlar mavjud emas.</p>
        </div>
      )}
    </div>
  );
}
