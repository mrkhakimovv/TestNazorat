import React from 'react';
import { TestResult } from '../../types';
import { TrendingUp, TrendingDown, Minus, Home, Award } from 'lucide-react';

export default function TestResultView({ result, onHome }: { result: TestResult, onHome: () => void }) {
  const isGoodScore = result.percentage >= 70;
  const isAverageScore = result.percentage >= 40 && result.percentage < 70;

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-50 min-h-[500px]">
      <div className="max-w-xl w-full bg-white p-8 border border-slate-200 rounded-sm shadow-sm text-center">
        <div className="mb-6 flex justify-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center
            ${isGoodScore ? 'bg-emerald-100 text-emerald-600' : 
              isAverageScore ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
            <Award size={40} />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-[#1E293B] mb-2">Test yakunlandi!</h2>
        <p className="text-slate-500 mb-8">{result.testTitle}</p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-sm">
            <p className="text-sm font-medium text-slate-500 mb-1">To'g'ri javoblar</p>
            <p className="text-2xl font-bold text-[#1E293B]">{result.score} / {result.total}</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-sm">
            <p className="text-sm font-medium text-slate-500 mb-1">Umumiy foiz</p>
            <p className={`text-2xl font-bold
              ${isGoodScore ? 'text-emerald-600' : 
              isAverageScore ? 'text-amber-600' : 'text-red-600'}`}>
              {result.percentage.toFixed(0)}%
            </p>
          </div>
        </div>

        <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-sm">
          <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider mb-3">Rivojlanish ko'rsatkichi</h3>
          
          <div className="flex items-center justify-center gap-3">
            {result.progress === null ? (
              <div className="text-slate-500 text-sm italic font-medium">
                Bu — sizning ushbu testdagi birinchi urinishingiz.
              </div>
            ) : result.progress > 0 ? (
              <div className="text-emerald-600 font-bold flex items-center gap-2">
                <TrendingUp size={24} /> 
                <span>Sizning natijangiz oldingi testdan +{result.progress.toFixed(0)}% yuqori</span>
              </div>
            ) : result.progress < 0 ? (
              <div className="text-red-600 font-bold flex items-center gap-2">
                <TrendingDown size={24} /> 
                <span>Sizning natijangiz oldingidan {Math.abs(result.progress).toFixed(0)}% ga pasaygan</span>
              </div>
            ) : (
              <div className="text-slate-600 font-bold flex items-center gap-2">
                <Minus size={24} /> 
                <span>Sizning natijangiz oldingi test bilan bir xil</span>
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={onHome}
          className="w-full bg-[#1E293B] hover:bg-slate-800 text-white font-medium py-3 rounded-sm flex items-center justify-center gap-2 transition-colors"
        >
          <Home size={18} /> Asosiy sahifaga qaytish
        </button>
      </div>
    </div>
  );
}
