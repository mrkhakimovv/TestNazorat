import { Test, TestResult } from '../types';
import { db } from './firebase';
import { collection, doc, setDoc, getDocs, query, where, orderBy, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export const addStudent = async (data: any) => {
  const usernameKey = data.username.toLowerCase();
  if (usernameKey === 'ustoz') {
    throw new Error("Bu username band qilingan.");
  }
  const userRef = doc(db, 'users', usernameKey);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    throw new Error("Bu username allaqachon band. Boshqa username tanlang.");
  }
  await setDoc(userRef, {
    name: data.name,
    username: data.username,
    password: data.password,
    role: 'oquvchi',
    createdAt: new Date().toISOString(),
    isBlocked: false
  });
};

export const getStudents = async () => {
  const q = query(collection(db, 'users'), where('role', '==', 'oquvchi'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateStudent = async (id: string, data: any) => {
  const userRef = doc(db, 'users', id);
  await updateDoc(userRef, data);
};

export const deleteStudentDb = async (id: string) => {
  const userRef = doc(db, 'users', id);
  await deleteDoc(userRef);
};

export const getTests = async (): Promise<Test[]> => {
  const q = query(collection(db, 'tests'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Test));
};

export const saveTest = async (test: Test, creatorUsername: string = 'ustoz') => {
  const testRef = doc(db, 'tests', test.id);
  await setDoc(testRef, {
    code: test.code,
    title: test.title,
    questions: test.questions,
    createdAt: test.createdAt,
    creatorUsername: creatorUsername
  });
};

export const getTestByCode = async (code: string): Promise<Test | undefined> => {
  const q = query(collection(db, 'tests'), where('code', '==', code.toUpperCase()));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return undefined;
  const docData = snapshot.docs[0];
  return { id: docData.id, ...docData.data() } as Test;
};

export const deleteTest = async (id: string) => {
  const testRef = doc(db, 'tests', id);
  await deleteDoc(testRef);
};

export const getResults = async (): Promise<TestResult[]> => {
  const q = query(collection(db, 'results'), orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TestResult));
};

export const saveResult = async (result: Omit<TestResult, 'id' | 'progress'>): Promise<TestResult> => {
  // Find previous result
  const qTest = query(collection(db, 'results'), 
    where('studentUsername', '==', result.studentUsername)
  );
  const snapshot = await getDocs(qTest);
  const previousResults = snapshot.docs
    .map(doc => doc.data() as TestResult)
    .filter(docData => docData.testId === result.testId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  let progress: number | null = null;
  if (previousResults.length > 0) {
    const previousPercentage = previousResults[0].percentage;
    progress = result.percentage - previousPercentage;
  }

  const resultId = Math.random().toString(36).substring(2, 15);
  const finalResult: TestResult = {
    ...result,
    id: resultId,
    progress,
  };

  const resultRef = doc(db, 'results', resultId);
  await setDoc(resultRef, {
    testId: finalResult.testId,
    testCode: finalResult.testCode,
    testTitle: finalResult.testTitle,
    studentName: finalResult.studentName,
    studentUsername: finalResult.studentUsername,
    score: finalResult.score,
    total: finalResult.total,
    percentage: finalResult.percentage,
    timeSpent: finalResult.timeSpent,
    date: finalResult.date,
    progress: finalResult.progress,
    answers: finalResult.answers || {}
  });
  
  return finalResult;
};

export const getResultsForTest = async (testId: string): Promise<TestResult[]> => {
  const q = query(collection(db, 'results'), where('testId', '==', testId));
  const snapshot = await getDocs(q);
  const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TestResult));
  return results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getResultsForStudent = async (username: string): Promise<TestResult[]> => {
  const q = query(collection(db, 'results'), where('studentUsername', '==', username));
  const snapshot = await getDocs(q);
  const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TestResult));
  return results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const generateUniqueCode = async (): Promise<string> => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 3; i++) {
    code += chars.charAt(Math.floor(Math.random() * 26));
  }
  code += '-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * 10) + 26);
  }
  const existing = await getTestByCode(code);
  if (existing) return generateUniqueCode();
  return code;
};

