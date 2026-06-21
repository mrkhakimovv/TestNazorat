export type Role = 'ustoz' | 'oquvchi';

export interface User {
  name: string;
  username: string;
  role: Role;
}

export type QuestionType = 'single' | 'multiple';

export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: Option[];
  correctOptions: string[]; // array of option IDs
}

export type TestType = 'Asosiy' | 'Majburiy' | 'Mavzulashtirilgan';

export interface Test {
  id: string;
  code: string;
  title: string;
  testType: TestType;
  questions: Question[];
  createdAt: string;
}

export interface TestResult {
  id: string;
  testId: string;
  testCode: string;
  testTitle: string;
  studentName: string;
  studentUsername: string;
  score: number;
  total: number;
  percentage: number;
  timeSpent: number; // in seconds
  date: string;
  progress: number | null; // null if first attempt, else diff in percentage (e.g. +5, -2)
  answers?: Record<string, string[]>;
}
