import React, { useState, useEffect } from 'react';
import { Test, TestResult } from '../../types';
import { saveResult } from '../../lib/store';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle2 } from 'lucide-react';

export default function TestTaking({ test, onFinish }: { test: Test, onFinish: (result: TestResult) => void }) {
  const { user } = useAuth();
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [startTime] = useState<number>(Date.now());

  const toggleAnswer = (questionId: string, optionId: string, type: 'single' | 'multiple') => {
    setAnswers(prev => {
      const current = prev[questionId] || [];
      if (type === 'single') {
        return { ...prev, [questionId]: [optionId] };
      } else {
        if (current.includes(optionId)) {
          return { ...prev, [questionId]: current.filter(id => id !== optionId) };
        } else {
          return { ...prev, [questionId]: [...current, optionId] };
        }
      }
    });
  };

  const calculateScore = () => {
    let score = 0;
    test.questions.forEach(q => {
      const userAnswers = answers[q.id] || [];
      const correctAnswers = q.correctOptions;
      
      // Strict equality for points: must have exactly the same answers
      if (userAnswers.length === correctAnswers.length && 
          userAnswers.every(id => correctAnswers.includes(id))) {
        score++;
      }
    });
    return score;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleFinish = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const score = calculateScore();
      const total = test.questions.length;
      const percentage = total > 0 ? (score / total) * 100 : 0;

      const resultData = {
        testId: test.id,
        testCode: test.code,
        testTitle: test.title,
        studentName: user.name,
        studentUsername: user.username,
        score,
        total,
        percentage,
        timeSpent,
        date: new Date().toISOString(),
        answers
      };

      const finalResult = await saveResult(resultData);
      onFinish(finalResult);
    } catch (error: any) {
      console.error("Testni saqlashda xatolik yuz berdi:", error);
      setSubmitError(error.message || "Test natijasini saqlashda xatolik yuz berdi. Internet aloqasini tekshiring va qaytadan urinib ko'ring.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 min-h-[600px]">
      <div className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-3xl mx-auto space-y-6 sm:space-y-8">
        <div className="bg-white p-4 sm:p-6 border border-slate-200 rounded-sm shadow-sm mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-[#1E293B]">{test.title}</h2>
        </div>

        {test.questions.map((q, index) => {
          const userAns = answers[q.id] || [];
          return (
            <div key={q.id} className="bg-white p-6 border border-slate-200 rounded-sm shadow-sm">
              <h3 className="text-lg font-bold text-[#1E293B] mb-2 flex items-start gap-3">
                <span className="shrink-0">{index + 1}-savol</span>
              </h3>

              <div className="flex flex-row justify-between sm:justify-start gap-2 sm:gap-3 mt-4 w-full">
                {q.options.map(o => {
                  const isSelected = userAns.includes(o.id);
                  return (
                    <button
                      key={o.id}
                      onClick={() => toggleAnswer(q.id, o.id, q.type)}
                      className={`flex-1 sm:flex-none sm:w-16 h-12 sm:h-16 rounded-md font-bold text-base md:text-lg transition-colors flex items-center justify-center border
                        ${isSelected 
                          ? 'bg-[#1E293B] border-[#1E293B] text-white shadow-sm' 
                          : 'bg-slate-50 border-slate-200 text-[#1E293B] hover:bg-slate-100 hover:border-slate-300'}`}
                    >
                      {o.text}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        
        <div className="pt-4 flex flex-col items-center justify-center pb-8">
          {submitError && (
             <div className="bg-red-50 text-red-600 p-4 rounded-sm text-sm border border-red-100 mb-4 text-center max-w-md w-full">
               {submitError}
             </div>
          )}
          <button 
            disabled={isSubmitting}
            onClick={() => {
              if (window.confirm("Testni yakunlashni tasdiqlaysizmi?")) {
                handleFinish();
              }
            }}
            className="bg-[#1E293B] hover:bg-slate-800 text-white px-8 py-3 rounded-sm font-medium transition-colors flex items-center gap-2 text-lg w-full max-w-md justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 size={20}/> {isSubmitting ? "Saqlanmoqda..." : "Testni yakunlash"}
          </button>
        </div>
      </div>
    </div>
  );
}
