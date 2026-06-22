import React, { useEffect, useState } from 'react';
import { getResultsForStudent } from '../../lib/store';
import { TestResult } from '../../types';
import { X } from 'lucide-react';

export default function StudentStatsModal({ 
  student, 
  onClose 
}: { 
  student: { name: string, username: string }, 
  onClose: () => void 
}) {
  const [studentStats, setStudentStats] = useState<TestResult[]>([]);
  const [studentStatsLoading, setStudentStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setStudentStatsLoading(true);
      try {
        const results = await getResultsForStudent(student.username);
        setStudentStats(results);
      } catch (error) {
        console.error(error);
      } finally {
        setStudentStatsLoading(false);
      }
    };
    if (student) {
      fetchStats();
    }
  }, [student]);

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-sm shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-[#1E293B]">{student.name}</h3>
            <p className="text-sm text-slate-500 font-mono mt-1">@{student.username}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 hover:bg-slate-100 p-2 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {studentStatsLoading ? (
            <div className="text-center py-8 text-slate-500">Natijalar yuklanmoqda...</div>
          ) : studentStats.length === 0 ? (
            <div className="text-center py-8 text-slate-500">Bu o'quvchi ko'rsatkichlarga ega emas (hali hech qanday test ishlagan emas).</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="p-4 border border-slate-200 rounded-sm bg-slate-50">
                  <p className="text-sm text-slate-500 mb-1">Jami urinishlar</p>
                  <p className="text-2xl font-bold text-[#1E293B]">{studentStats.length}</p>
                </div>
                <div className="p-4 border border-slate-200 rounded-sm bg-slate-50">
                  <p className="text-sm text-slate-500 mb-1">O'rtacha natija</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {(studentStats.reduce((acc, curr) => acc + curr.percentage, 0) / studentStats.length).toFixed(1)}%
                  </p>
                </div>
                <div className="p-4 border border-slate-200 rounded-sm bg-slate-50">
                  <p className="text-sm text-slate-500 mb-1">O'rtacha to'g'ri javoblar</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {(studentStats.reduce((acc, curr) => acc + curr.score, 0) / studentStats.length).toFixed(1)} / {(studentStats.reduce((acc, curr) => acc + curr.total, 0) / studentStats.length).toFixed(1)}
                  </p>
                </div>
              </div>

              <h4 className="font-bold text-[#1E293B] mb-4">Barcha natijalar</h4>
              <div className="space-y-3">
                {studentStats.map((stat, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-200 rounded-sm gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-[#1E293B] max-w-[100px] truncate">{stat.testCode}</span>
                        <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded font-medium truncate max-w-[200px]">{stat.testTitle}</span>
                      </div>
                      <p className="text-xs text-slate-500">{new Date(stat.date).toLocaleString('uz-UZ')}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium">
                      <span className="text-slate-600">
                        {stat.score} / {stat.total} ta
                      </span>
                      <span className={`px-2 py-1 border rounded-sm ${
                        stat.percentage >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        stat.percentage >= 60 ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        stat.percentage >= 40 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {stat.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
