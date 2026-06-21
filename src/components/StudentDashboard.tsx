import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Home, BarChart2, List } from 'lucide-react';
import TestEntry from './Student/TestEntry';
import TestTaking from './Student/TestTaking';
import TestResultView from './Student/TestResultView';
import StudentStats from './Student/StudentStats';
import AvailableTests from './Student/AvailableTests';
import { Test, TestResult } from '../types';
import { getTestByCode } from '../lib/store';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState<'home' | 'taking' | 'result' | 'stats' | 'tests'>('home');
  const [currentTest, setCurrentTest] = useState<Test | null>(null);
  const [currentResult, setCurrentResult] = useState<TestResult | null>(null);

  useEffect(() => {
    const checkPendingTest = async () => {
      const pendingCode = sessionStorage.getItem('pending_test_code');
      if (pendingCode) {
        sessionStorage.removeItem('pending_test_code');
        try {
          const test = await getTestByCode(pendingCode);
          if (test) {
            handleStartTest(test);
          }
        } catch (e) {
          console.error("Failed to load pending test", e);
        }
      }
    };
    checkPendingTest();
  }, []);

  const handleStartTest = (test: Test) => {
    setCurrentTest(test);
    setActiveView('taking');
  };

  const handleFinishTest = (result: TestResult) => {
    setCurrentResult(result);
    setActiveView('result');
  };

  const goHome = () => {
    setCurrentTest(null);
    setCurrentResult(null);
    setActiveView('home');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-600 text-white flex items-center justify-center rounded-sm font-bold">
              O'
            </div>
            <span className="font-bold text-[#1E293B] text-lg hidden sm:block">TestNazorat</span>
            <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-sm">O'quvchi</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600 border-r border-slate-200 pr-4">{user?.name}</span>
            <button 
              onClick={logout}
              className="text-slate-500 hover:text-red-600 flex items-center gap-1 text-sm transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Chiqish</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 w-full flex flex-col md:flex-row gap-4 sm:gap-6 pb-20 md:pb-8">
        {/* Sidebar Nav (Desktop) */}
        <aside className="hidden md:block w-64 shrink-0">
          <nav className="flex flex-col gap-2">
            <button
              onClick={goHome}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-sm transition-colors ${
                (activeView === 'home' || activeView === 'taking' || activeView === 'result')
                  ? 'bg-[#1E293B] text-white' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Home size={18} />
              Asosiy sahifa
            </button>
            <button
              onClick={() => setActiveView('tests')}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-sm transition-colors ${
                activeView === 'tests' 
                  ? 'bg-[#1E293B] text-white' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <List size={18} />
              Testlar
            </button>
            <button
              onClick={() => setActiveView('stats')}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-sm transition-colors ${
                activeView === 'stats' 
                  ? 'bg-[#1E293B] text-white' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BarChart2 size={18} />
              Mening natijalarim
            </button>
          </nav>
        </aside>

        {/* Bottom Nav (Mobile) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 px-4 py-2 flex justify-around items-center">
          <button
            onClick={goHome}
            className={`flex flex-col items-center gap-1 p-2 text-xs font-medium transition-colors ${
              (activeView === 'home' || activeView === 'taking' || activeView === 'result')
                ? 'text-[#1E293B]' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Home size={20} />
            <span>Asosiy</span>
          </button>
          <button
            onClick={() => setActiveView('tests')}
            className={`flex flex-col items-center gap-1 p-2 text-xs font-medium transition-colors ${
              activeView === 'tests' 
                ? 'text-[#1E293B]' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <List size={20} />
            <span>Testlar</span>
          </button>
          <button
            onClick={() => setActiveView('stats')}
            className={`flex flex-col items-center gap-1 p-2 text-xs font-medium transition-colors ${
              activeView === 'stats' 
                ? 'text-[#1E293B]' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <BarChart2 size={20} />
            <span>Natijalar</span>
          </button>
        </div>

        {/* Main Content Area */}
        <section className="flex-1 bg-white border border-slate-200 rounded-sm shadow-sm min-h-[500px] overflow-hidden">
          {activeView === 'home' && <TestEntry onStartTest={handleStartTest} />}
          {activeView === 'tests' && <AvailableTests onStartTest={handleStartTest} />}
          {activeView === 'taking' && currentTest && <TestTaking test={currentTest} onFinish={handleFinishTest} />}
          {activeView === 'result' && currentResult && <TestResultView result={currentResult} onHome={goHome} />}
          {activeView === 'stats' && <StudentStats />}
        </section>
      </main>
    </div>
  );
}
