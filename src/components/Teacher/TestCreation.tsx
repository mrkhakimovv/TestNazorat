import React, { useState } from 'react';
import { Test, Question, Option, TestType } from '../../types';
import { generateUniqueCode, saveTest, getTestByCode } from '../../lib/store';
import { Save, X, ArrowLeft, Book } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const DEFAULT_OPTIONS: Option[] = [
  { id: 'a', text: 'A' },
  { id: 'b', text: 'B' },
  { id: 'c', text: 'C' },
  { id: 'd', text: 'D' },
  { id: 'e', text: 'E' },
];

export default function TestCreation({ onSuccess }: { onSuccess: () => void }) {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState('');
  const [testType, setTestType] = useState<TestType | ''>('');
  const [questionCount, setQuestionCount] = useState<number | ''>('');
  const [testCodeInput, setTestCodeInput] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNextStep = () => {
    setError('');
    if (!title.trim()) return setError("Test nomini kiriting.");
    if (!testType) return setError("Test turini tanlang.");
    if (!questionCount || questionCount <= 0 || questionCount > 200) {
      return setError("Savollar sonini to'g'ri kiriting (1-200 oraliqda).");
    }

    const newQuestions: Question[] = [];
    for (let i = 0; i < questionCount; i++) {
      newQuestions.push({
        id: `q${i + 1}-${Math.random().toString(36).substring(2, 9)}`,
        text: `${i + 1}-savol`,
        type: 'single',
        options: [...DEFAULT_OPTIONS],
        correctOptions: []
      });
    }
    setQuestions(newQuestions);
    setStep(2);
  };

  const selectCorrectOption = (qId: string, oId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        return { ...q, correctOptions: [oId] };
      }
      return q;
    }));
  };

  const clearAnswer = (qId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        return { ...q, correctOptions: [] };
      }
      return q;
    }));
  };

  const handleSave = async () => {
    setError('');
    const unanswered = questions.findIndex(q => q.correctOptions.length === 0);
    if (unanswered !== -1) {
      return setError(`${unanswered + 1}-savol uchun to'g'ri javobni belgilang.`);
    }

    try {
      setLoading(true);
      
      let finalTestCode = testCodeInput.trim().toUpperCase();
      if (finalTestCode) {
        const existing = await getTestByCode(finalTestCode);
        if (existing) {
          throw new Error("Siz kiritgan test kodi allaqachon band. Iltimos, boshqa kod kiriting yoki bo'sh qoldiring.");
        }
      } else {
        finalTestCode = await generateUniqueCode();
      }

      const test: Test = {
        id: Math.random().toString(36).substring(2, 9),
        code: finalTestCode,
        title: title.trim(),
        testType: testType as TestType,
        questions,
        createdAt: new Date().toISOString()
      };

      await saveTest(test, user?.username || 'ustoz');
      alert(`Test yaratildi!\nTest kodi: ${test.code}`);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="text-slate-500 hover:text-[#1E293B] transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h2 className="text-xl font-bold text-[#1E293B]">Yangi test yaratish</h2>
        </div>
        
        {step === 2 && (
          <button 
            onClick={handleSave}
            disabled={loading}
            className="bg-[#1E293B] hover:bg-slate-800 disabled:bg-slate-400 text-white px-5 py-2.5 rounded-sm flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
          >
            <Save size={16} />
            {loading ? 'Saqlanmoqda...' : 'Saqlash va Kod olish'}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm border border-red-200 rounded-sm flex items-center gap-2">
          <X size={16}/> {error}
        </div>
      )}

      {step === 1 ? (
        <div className="max-w-xl mx-auto space-y-6 mt-8 p-8 border border-slate-200 rounded-sm bg-slate-50 shadow-sm">
          <div className="flex flex-col items-center mb-6 text-[#1E293B]">
            <Book size={40} className="mb-3" />
            <h3 className="text-lg font-semibold">Test sozlamalari</h3>
            <p className="text-slate-500 text-sm mt-1 text-center">Tezkor javoblar varaqasini yaratish uchun parametrleri kiriting.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-2">Test nomi</label>
            <input 
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Masalan: 1-chorak Majburiy Matematika"
              className="w-full border border-slate-300 px-4 py-2.5 rounded-sm outline-none focus:border-[#1E293B]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-2">Test turi</label>
            <div className="flex flex-wrap gap-3">
              {(['Asosiy', 'Majburiy', 'Mavzulashtirilgan'] as TestType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setTestType(type)}
                  className={`flex-1 min-w-[120px] py-2.5 border rounded-sm text-sm font-medium transition-colors ${
                    testType === type 
                      ? 'bg-[#1E293B] text-white border-[#1E293B]' 
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-2">Savollar soni</label>
            <input 
              type="number" 
              min="1"
              max="200"
              value={questionCount}
              onChange={e => setQuestionCount(e.target.value ? parseInt(e.target.value, 10) : '')}
              placeholder="Masalan: 30"
              className="w-full border border-slate-300 px-4 py-2.5 rounded-sm outline-none focus:border-[#1E293B]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-2">Test kodi <span className="text-slate-400 font-normal">- Ixtiyoriy, kiritilmasa avtomatik shakllanadi</span></label>
            <input 
              type="text" 
              value={testCodeInput}
              onChange={e => setTestCodeInput(e.target.value)}
              placeholder="Masalan: MATEM-123"
              className="w-full border border-slate-300 px-4 py-2.5 rounded-sm outline-none focus:border-[#1E293B] uppercase"
            />
          </div>

          <button 
            onClick={handleNextStep}
            className="w-full bg-[#1E293B] hover:bg-slate-800 text-white font-medium py-3 rounded-sm transition-colors mt-4"
          >
            Javoblarni kiritishga o'tish
          </button>
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl mx-auto">
          {questions.map((q, index) => (
            <div key={q.id} className="bg-white border border-slate-200 rounded-sm p-5 shadow-sm">
              <h3 className="text-lg font-bold text-[#1E293B] mb-4">{index + 1}-savol:</h3>
              
              <div className="flex flex-wrap gap-3 mb-4">
                {q.options.map(o => {
                  const isSelected = q.correctOptions.includes(o.id);
                  return (
                    <button
                      key={o.id}
                      onClick={() => selectCorrectOption(q.id, o.id)}
                      className={`w-12 h-12 rounded-md font-bold text-lg transition-colors flex items-center justify-center border
                        ${isSelected 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : 'bg-slate-100 border-slate-200 text-[#1E293B] hover:bg-slate-200 hover:border-slate-300'}`}
                    >
                      {o.text}
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={() => clearAnswer(q.id)}
                className="inline-flex flex-row items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-sm text-sm font-medium transition-colors"
              >
                <X size={16} /> Javobni o'chirish
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
