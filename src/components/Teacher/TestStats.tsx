import React, { useEffect, useState } from 'react';
import { getTests, getResultsForTest, updateTest } from '../../lib/store';
import { Test, TestResult, TestType } from '../../types';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Edit2, Check, X } from 'lucide-react';

export default function TestStats({ testId, onBack }: { testId: string, onBack: () => void }) {
  const [test, setTest] = useState<Test | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);
  const [isEditingType, setIsEditingType] = useState(false);
  const [selectedType, setSelectedType] = useState<TestType | ''>('');

  useEffect(() => {
    const fetchData = async () => {
      const allTests = await getTests();
      const t = allTests.find(x => x.id === testId);
      if (t) setTest(t);
      
      const res = await getResultsForTest(testId);
      setResults(res);
    };
    fetchData();
  }, [testId]);

  if (!test) return null;

  const averageScore = results.length > 0 
    ? (results.reduce((acc, r) => acc + r.percentage, 0) / results.length).toFixed(1) 
    : 0;
  
  const bestScore = results.length > 0 
    ? Math.max(...results.map(r => r.percentage)) 
    : 0;

  const handleSaveType = async () => {
    if (test && selectedType && selectedType !== test.testType) {
      await updateTest(test.id, { testType: selectedType as TestType });
      setTest({ ...test, testType: selectedType as TestType });
    }
    setIsEditingType(false);
  };

  return (
    <div className="p-6">
      <button 
        onClick={onBack}
        className="text-slate-500 hover:text-[#1E293B] flex items-center gap-2 text-sm font-medium mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Orqaga
      </button>

      <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1E293B] mb-1">{test.title}</h2>
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-slate-500 text-sm">Test kodi: <span className="font-mono text-[#1E293B] font-medium">{test.code}</span></p>
            {isEditingType ? (
              <div className="flex items-center gap-2">
                <select 
                  value={selectedType} 
                  onChange={(e) => setSelectedType(e.target.value as TestType)}
                  className="text-sm border border-slate-300 rounded-sm px-2 py-1 outline-none focus:border-[#1E293B]"
                >
                  <option value="Asosiy">Asosiy</option>
                  <option value="Majburiy">Majburiy</option>
                  <option value="Mavzulashtirilgan">Mavzulashtirilgan</option>
                </select>
                <button onClick={handleSaveType} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded-sm"><Check size={16} /></button>
                <button onClick={() => setIsEditingType(false)} className="text-red-500 hover:bg-red-50 p-1 rounded-sm"><X size={16} /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {test.testType ? (
                  <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded border border-blue-100 font-medium">
                    {test.testType}
                  </span>
                ) : (
                  <span className="text-sm text-slate-400 italic">Turi belgilanmagan</span>
                )}
                <button 
                  onClick={() => {
                    setSelectedType(test.testType || 'Asosiy');
                    setIsEditingType(true);
                  }} 
                  className="text-slate-400 hover:text-[#1E293B] transition-colors p-1"
                  title="Turini o'zgartirish"
                >
                  <Edit2 size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-slate-50 p-3 border border-slate-200 rounded-sm w-full md:w-auto">
          <p className="text-xs text-slate-500 mb-1 font-medium">Refferal havola:</p>
          <div className="flex items-center gap-2">
            <input 
              readOnly 
              value={`${window.location.origin}/?ref=${test.code}`}
              className="text-sm bg-white border border-slate-300 px-2 py-1.5 rounded-sm outline-none w-full md:w-64 text-slate-600"
            />
            <button 
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/?ref=${test.code}`);
                alert("Nusxa olindi!");
              }}
              className="px-3 py-1.5 bg-[#1E293B] text-white text-sm font-medium rounded-sm hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              Nusxa olish
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">O'rtacha natija</p>
          <p className="text-3xl font-bold text-[#1E293B]">{averageScore}%</p>
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

      <h3 className="text-lg font-bold text-[#1E293B] mb-4">O'quvchilar natijalari</h3>
      
      {results.length === 0 ? (
        <div className="py-8 text-center text-slate-500 border border-slate-200 rounded-sm bg-slate-50">
          Ushbu testni hali hech kim ishlamagan
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-[#1E293B]">
              <tr>
                <th className="px-4 py-3 font-semibold">O'quvchi</th>
                <th className="px-4 py-3 font-semibold">Username</th>
                <th className="px-4 py-3 font-semibold">Sana</th>
                <th className="px-4 py-3 font-semibold">Xato qilingan savollar</th>
                <th className="px-4 py-3 font-semibold text-right">Natija</th>
                <th className="px-4 py-3 font-semibold text-right">O'sish</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {results.map((r) => {
                let incorrectText = '-';
                if (r.answers) {
                  const incorrectNums: number[] = [];
                  test.questions.forEach((q, index) => {
                    const userAnswers = r.answers?.[q.id] || [];
                    const correctAnswers = q.correctOptions;
                    const isCorrect = userAnswers.length === correctAnswers.length && 
                      userAnswers.every(id => correctAnswers.includes(id));
                    if (!isCorrect) {
                      incorrectNums.push(index + 1);
                    }
                  });
                  incorrectText = incorrectNums.length > 0 ? incorrectNums.join(', ') : 'Barchasi to\'g\'ri';
                }

                return (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-[#1E293B]">{r.studentName}</td>
                    <td className="px-4 py-3 text-slate-500">@{r.studentUsername}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(r.date).toLocaleString('uz-UZ')}</td>
                    <td className="px-4 py-3 text-red-500 max-w-xs whitespace-normal break-words">
                      {incorrectText}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-[#1E293B]">{r.percentage.toFixed(0)}%</span>
                      <span className="text-xs text-slate-400 ml-1">({r.score}/{r.total})</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.progress === null ? (
                        <span className="text-slate-400 text-xs italic">1chi urinish</span>
                      ) : r.progress > 0 ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-xs">
                          <TrendingUp size={14} /> +{r.progress.toFixed(0)}%
                        </span>
                      ) : r.progress < 0 ? (
                        <span className="inline-flex items-center gap-1 text-red-600 font-medium text-xs">
                          <TrendingDown size={14} /> {r.progress.toFixed(0)}%
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 font-medium text-xs">
                          <Minus size={14} /> O'zgarishsiz
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
