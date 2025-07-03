export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface Problem {
  id: number;
  title: string;
  description: string;
  inputMethod: string;
  outputMethod: string;
  testCaseCount: number;
  status: string;
  memoryLimit: number;
  timeLimit: number;
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: number;
  userId: string;
  problemId: number;
  code: string;
  language: string;
  verdict: string;
  runtime: number;
  debugInfo: string;
  createdAt: string;
  updatedAt: string;
  Problem?: Problem;
  User?: User;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}