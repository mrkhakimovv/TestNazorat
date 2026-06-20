import React, { useEffect, useState } from 'react';
import { TestResult, Test } from '../../types';
import { getTestByCode } from '../../lib/store';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';

export default function StudentDetailedResult({ result, onBack }: { result: TestResult; onBack: () => void }) {
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const fetchedTest = await getTestByCode(result.testCode);
        if (fetchedTest) {
          setTest(fetchedTest);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [result.testCode]);

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center text-slate-500 h-full">
        Yuklanmoqda...
      </div>
    );
  }

  if (!test) {
    return (
      <div className="p-6">
        <button onClick={onBack} className="text-slate-500 hover:text-[#1E293B] flex items-center gap-2 mb-6 font-medium transition-colors">
          <ArrowLeft size={16} /> Orqaga
        </button>
        <div className="bg-red-50 text-red-600 p-4 rounded-sm border border-red-200">
          Ushbu testning tafsilotlari topilmadi (test o'chirilgan bo'lishi mumkin).
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={onBack} className="text-slate-500 hover:text-[#1E293B] flex items-center gap-2 mb-6 font-medium transition-colors">
        <ArrowLeft size={16} /> Orqaga
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1E293B] mb-2">{result.testTitle} - Natija tafsilotlari</h2>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-slate-500">
          <span className="bg-slate-50 px-3 py-1.5 rounded-sm border border-slate-100">Umumiy natija: <strong>{result.percentage.toFixed(0)}%</strong> ({result.score}/{result.total})</span>
          <span className="bg-slate-50 px-3 py-1.5 rounded-sm border border-slate-100">Vaqt: <strong>{Math.floor(result.timeSpent / 60)} d {result.timeSpent % 60} s</strong></span>
        </div>
      </div>

      <div className="space-y-6">
        {test.questions.map((q, index) => {
          const userAnswers = result.answers?.[q.id] || [];
          const correctAnswers = q.correctOptions;
          const isCorrect = userAnswers.length === correctAnswers.length && 
            userAnswers.every(id => correctAnswers.includes(id));
            
          return (
            <div key={q.id} className={`bg-white p-5 border rounded-sm shadow-sm ${isCorrect ? 'border-emerald-200' : 'border-red-200'}`}>
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-bold text-[#1E293B]">
                  {index + 1}-savol
                </h3>
                {isCorrect ? (
                  <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-sm text-sm font-bold border border-emerald-200">
                    <CheckCircle2 size={16} /> To'g'ri
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-red-600 bg-red-50 px-2.5 py-1 rounded-sm text-sm font-bold border border-red-200">
                    <XCircle size={16} /> Xato
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mt-4">
                {q.options.map(o => {
                  const isUserSelected = userAnswers.includes(o.id);
                  const isActuallyCorrect = correctAnswers.includes(o.id);

                  let btnClass = 'bg-slate-50 border-slate-200 text-[#1E293B]';
                  
                  if (isUserSelected && isActuallyCorrect) {
                     btnClass = 'bg-emerald-500 border-emerald-500 text-white shadow-sm';
                  } else if (isUserSelected && !isActuallyCorrect) {
                     btnClass = 'bg-red-500 border-red-500 text-white shadow-sm';
                  } else if (!isUserSelected && isActuallyCorrect) {
                     btnClass = 'bg-emerald-100 border-emerald-300 text-emerald-800 border-dashed';
                  }

                  return (
                    <div
                      key={o.id}
                      className={`w-14 h-14 md:w-16 md:h-16 rounded-md font-bold text-lg flex items-center justify-center border ${btnClass}`}
                    >
                      {o.text}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
