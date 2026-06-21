import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, PlusCircle, List, BarChart2, Users } from 'lucide-react';
import TestCreation from './Teacher/TestCreation';
import TestList from './Teacher/TestList';
import TestStats from './Teacher/TestStats';
import StudentsList from './Teacher/StudentsList';

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'create' | 'list' | 'stats' | 'students'>('list');
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);

  const viewStats = (testId: string) => {
    setSelectedTestId(testId);
    setActiveTab('stats');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1E293B] text-white flex items-center justify-center rounded-sm font-bold">
              T
            </div>
            <span className="font-bold text-[#1E293B] text-lg hidden sm:block">TestNazorat</span>
            <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-semibold rounded-sm">Ustoz</span>
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
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-sm transition-colors ${
                activeTab === 'list' 
                  ? 'bg-[#1E293B] text-white' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <List size={18} />
              Mening testlarim
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-sm transition-colors ${
                activeTab === 'create' 
                  ? 'bg-[#1E293B] text-white' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <PlusCircle size={18} />
              Yangi test yaratish
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-sm transition-colors ${
                activeTab === 'students' 
                  ? 'bg-[#1E293B] text-white' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users size={18} />
              O'quvchilar
            </button>
            {activeTab === 'stats' && (
              <button
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-sm transition-colors bg-[#1E293B] text-white`}
              >
                <BarChart2 size={18} />
                Test statistikasi
              </button>
            )}
          </nav>
        </aside>

        {/* Bottom Nav (Mobile) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 px-4 py-2 flex justify-around items-center">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex flex-col items-center gap-1 p-2 text-xs font-medium transition-colors ${
              (activeTab === 'list' || activeTab === 'stats')
                ? 'text-[#1E293B]' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <List size={20} />
            <span>Testlar</span>
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex flex-col items-center gap-1 p-2 text-xs font-medium transition-colors ${
              activeTab === 'create' 
                ? 'text-[#1E293B]' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <PlusCircle size={20} />
            <span>Yaratish</span>
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`flex flex-col items-center gap-1 p-2 text-xs font-medium transition-colors ${
              activeTab === 'students' 
                ? 'text-[#1E293B]' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users size={20} />
            <span>O'quvchilar</span>
          </button>
        </div>

        {/* Main Content Area */}
        <section className="flex-1 bg-white border border-slate-200 rounded-sm shadow-sm min-h-[500px] overflow-hidden">
          {activeTab === 'list' && <TestList onViewStats={viewStats} />}
          {activeTab === 'create' && <TestCreation onSuccess={() => setActiveTab('list')} />}
          {activeTab === 'stats' && selectedTestId && <TestStats testId={selectedTestId} onBack={() => setActiveTab('list')} />}
          {activeTab === 'students' && <StudentsList />}
        </section>
      </main>
    </div>
  );
}
