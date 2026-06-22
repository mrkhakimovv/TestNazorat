import React, { useEffect, useState } from 'react';
import { getStudents, updateStudent, deleteStudentDb, addStudent, getResultsForStudent } from '../../lib/store';
import { Trash2, Edit2, Ban, CheckCircle, Search, X, UserPlus, Activity } from 'lucide-react';
import { TestResult } from '../../types';

export default function StudentsList() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [addingStudent, setAddingStudent] = useState<boolean>(false);
  const [newStudentData, setNewStudentData] = useState({ name: '', username: '', password: '' });
  const [addError, setAddError] = useState('');
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [studentToBlock, setStudentToBlock] = useState<{id: string, currentStatus: boolean} | null>(null);

  const [selectedStudentForStats, setSelectedStudentForStats] = useState<any | null>(null);
  const [studentStats, setStudentStats] = useState<TestResult[]>([]);
  const [studentStatsLoading, setStudentStatsLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentClick = async (student: any) => {
    setSelectedStudentForStats(student);
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

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleBlockToggle = (id: string, currentStatus: boolean) => {
    setStudentToBlock({ id, currentStatus });
  };

  const confirmBlockToggle = async () => {
    if (studentToBlock) {
      await updateStudent(studentToBlock.id, { isBlocked: !studentToBlock.currentStatus });
      setStudentToBlock(null);
      fetchStudents();
    }
  };

  const handleDelete = (id: string) => {
    setStudentToDelete(id);
  };

  const confirmDelete = async () => {
    if (studentToDelete) {
      await deleteStudentDb(studentToDelete);
      setStudentToDelete(null);
      fetchStudents();
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    
    await updateStudent(editingStudent.id, {
      name: editingStudent.name,
      username: editingStudent.username,
      password: editingStudent.password,
    });
    setEditingStudent(null);
    fetchStudents();
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    if (!newStudentData.name.trim() || !newStudentData.username.trim() || !newStudentData.password.trim()) {
      setAddError("Barcha maydonlarni to'ldiring.");
      return;
    }
    
    try {
      await addStudent({
        name: newStudentData.name.trim(),
        username: newStudentData.username.trim(),
        password: newStudentData.password.trim(),
      });
      setAddingStudent(false);
      setNewStudentData({ name: '', username: '', password: '' });
      fetchStudents();
    } catch (error: any) {
      setAddError(error.message || "Xatolik yuz berdi.");
    }
  };

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Yuklanmoqda...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-xl font-bold text-[#1E293B]">O'quvchilar ro'yxati</h2>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Qidirish..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-sm focus:outline-none focus:border-[#1E293B] text-sm w-full md:w-64"
            />
          </div>
          <button
            onClick={() => setAddingStudent(true)}
            className="flex items-center justify-center gap-2 bg-[#1E293B] hover:bg-slate-800 text-white px-4 py-2 rounded-sm text-sm font-medium transition-colors whitespace-nowrap w-full sm:w-auto"
          >
            <UserPlus size={16} />
            <span>O'quvchi qo'shish</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-sm">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-semibold">Ism va familiya</th>
              <th className="px-4 py-3 font-semibold">Username</th>
              <th className="px-4 py-3 font-semibold">Parol (kod)</th>
              <th className="px-4 py-3 font-semibold text-center">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.id} className={`hover:bg-slate-50 ${student.isBlocked ? 'opacity-70 bg-slate-50/50' : ''}`}>
                  <td 
                    className="px-4 py-3 font-medium text-[#1E293B] cursor-pointer hover:text-blue-600 hover:underline"
                    onClick={() => handleStudentClick(student)}
                  >
                    {student.name}
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs p-1 bg-slate-100 rounded inline-block mt-2">@{student.username}</td>
                  <td className="px-4 py-3 font-mono text-slate-600">{student.password}</td>
                  <td className="px-4 py-3 text-center">
                    {student.isBlocked ? (
                      <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded text-xs font-medium border border-red-100">
                        <Ban size={12} /> Bloklangan
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs font-medium border border-emerald-100">
                        <CheckCircle size={12} /> Faol
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleBlockToggle(student.id, !!student.isBlocked)}
                        title={student.isBlocked ? "Blokdan chiqarish" : "Bloklash"}
                        className={`p-1.5 rounded-sm transition-colors ${student.isBlocked ? 'text-emerald-600 hover:bg-emerald-50' : 'text-amber-500 hover:bg-amber-50'}`}
                      >
                        {student.isBlocked ? <CheckCircle size={16} /> : <Ban size={16} />}
                      </button>
                      <button 
                        onClick={() => setEditingStudent(student)}
                        title="Tahrirlash"
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-sm transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(student.id)}
                        title="O'chirish"
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  O'quvchilar topilmadi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {addingStudent && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-[#1E293B]">Yangi o'quvchi qo'shish</h3>
              <button 
                onClick={() => setAddingStudent(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-4 space-y-4">
              {addError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-sm text-sm border border-red-100">
                  {addError}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Ism va familiya
                </label>
                <input 
                  type="text" 
                  required
                  value={newStudentData.name}
                  onChange={e => setNewStudentData({...newStudentData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:outline-none focus:border-[#1E293B]"
                  placeholder="Masalan: Ali Valiyev"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Username
                </label>
                <input 
                  type="text" 
                  required
                  value={newStudentData.username}
                  onChange={e => setNewStudentData({...newStudentData, username: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:outline-none focus:border-[#1E293B]"
                  placeholder="Masalan: alivaliyev"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Parol
                </label>
                <input 
                  type="text" 
                  required
                  value={newStudentData.password}
                  onChange={e => setNewStudentData({...newStudentData, password: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:outline-none focus:border-[#1E293B]"
                  placeholder="Kamida 4 ta belgi"
                />
              </div>
              
              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setAddingStudent(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-sm transition-colors"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-[#1E293B] text-white rounded-sm hover:bg-slate-800 transition-colors"
                >
                  Qo'shish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingStudent && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-[#1E293B]">O'quvchini tahrirlash</h3>
              <button 
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Ism va familiya
                </label>
                <input 
                  type="text" 
                  required
                  value={editingStudent.name}
                  onChange={e => setEditingStudent({...editingStudent, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:outline-none focus:border-[#1E293B]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Username
                </label>
                <input 
                  type="text" 
                  required
                  value={editingStudent.username}
                  onChange={e => setEditingStudent({...editingStudent, username: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:outline-none focus:border-[#1E293B]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Parol
                </label>
                <input 
                  type="text" 
                  required
                  value={editingStudent.password}
                  onChange={e => setEditingStudent({...editingStudent, password: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:outline-none focus:border-[#1E293B]"
                />
              </div>
              
              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-sm transition-colors"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-[#1E293B] text-white rounded-sm hover:bg-slate-800 transition-colors"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {studentToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#1E293B] mb-2">O'quvchini o'chirish</h3>
            <p className="text-sm text-slate-500 mb-6">
              Rostdan ham bu o'quvchini o'chirib tashlamoqchimisiz?
            </p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-sm transition-colors w-full"
              >
                Bekor qilish
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 font-medium text-white bg-red-600 hover:bg-red-700 rounded-sm transition-colors w-full"
              >
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {studentToBlock && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-sm p-6 text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${studentToBlock.currentStatus ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
              {studentToBlock.currentStatus ? <CheckCircle size={24} /> : <Ban size={24} />}
            </div>
            <h3 className="text-lg font-bold text-[#1E293B] mb-2">
              O'quvchini {studentToBlock.currentStatus ? 'faollashtirish' : 'bloklash'}
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Rostdan ham bu o'quvchini {studentToBlock.currentStatus ? 'blokdan chiqarmoqchimisiz' : 'bloklamoqchimisiz'}?
            </p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setStudentToBlock(null)}
                className="px-4 py-2 font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-sm transition-colors w-full"
              >
                Bekor qilish
              </button>
              <button 
                onClick={confirmBlockToggle}
                className={`px-4 py-2 font-medium text-white rounded-sm transition-colors w-full ${studentToBlock.currentStatus ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-500 hover:bg-amber-600'}`}
              >
                Tasdiqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedStudentForStats && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-[#1E293B]">{selectedStudentForStats.name}</h3>
                <p className="text-sm text-slate-500 font-mono mt-1">@{selectedStudentForStats.username}</p>
              </div>
              <button 
                onClick={() => setSelectedStudentForStats(null)}
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
      )}
    </div>
  );
}
