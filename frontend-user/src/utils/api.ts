import { Problem, Submission, User } from '../types';
import Cookies from 'js-cookie';

const API_BASE = 'http://localhost:8080';

// Authenticated fetch helper
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = Cookies.get('token');
  return fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
};

export const api = {
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/user/login`, {
      method: 'POST',
      credentials: 'include', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error('Invalid credentials');
    return res.json();
  },

  register: async (name: string, email: string, password: string) => {
    const res = await fetch(`${API_BASE}/user/register`, {
      method: 'POST',
      credentials: 'include', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    return res.json();
  },

  logout: async () => {
    await fetchWithAuth(`${API_BASE}/user/logout`, {
      method: 'POST',
      credentials: 'include', 
    });
  },

  getUser: async (userId: string): Promise<User> => {
    const res = await fetchWithAuth(`${API_BASE}/user/${userId}`);
    if (!res.ok) throw new Error('User not found');
    return res.json();
  },

  getProblems: async (): Promise<Problem[]> => {
    const res = await fetchWithAuth(`${API_BASE}/problems`, {
      method: 'GET'
    });
    if (!res.ok) throw new Error('Failed to fetch problems');
    return res.json();
  },

  getProblem: async (id: number): Promise<Problem> => {
    const res = await fetchWithAuth(`${API_BASE}/problems/${id}`);
    if (!res.ok) throw new Error('Problem not found');
    return res.json();
  },

  getSubmissions: async (): Promise<Submission[]> => {
    const res = await fetch(`${API_BASE}/submission`);
    if (!res.ok) throw new Error('Failed to fetch submissions');
    return res.json();
  },

  submitSolution: async (problemId: number, code: string, language: string): Promise<Submission> => {
    const res = await fetchWithAuth(`${API_BASE}/submission`, {
      method: 'POST',
      body: JSON.stringify({ problemId, code, language })
    });
    if (!res.ok) throw new Error('Submission failed');
    return res.json();
  },

  getMe: async (): Promise<User> => {
    const res = await fetchWithAuth(`${API_BASE}/user/me`, {
      method: 'GET',
    });
    if (!res.ok) throw new Error('Not authenticated');
    return res.json();
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<boolean> => {
    const res = await fetchWithAuth(`${API_BASE}/user/change-password`, {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!res.ok) throw new Error('Failed to change password');
    return res.status === 200;
  },

  getSubmission: async (id: string): Promise<Submission> => {
    const res = await fetch(`${API_BASE}/submission/${id}`, {
      method: 'GET',
    });
    if (!res.ok) throw new Error('Submission not found');
    return res.json();
  },

  getSubmissionByUserId: async (userId: string): Promise<Submission[]> => {
    const res = await fetch(`${API_BASE}/submission/user/${userId}`, {
      method: 'GET',
    });
    if (!res.ok) throw new Error('Failed to fetch submissions for user');
    return res.json();
  },

  getSubmissionByProblemId: async (problemId: string): Promise<Submission[]> => {
    const res = await fetch(`${API_BASE}/submission/problem/${problemId}`, {
      method: 'GET',
    });
    if (!res.ok) throw new Error('Failed to fetch submissions for problem');
    return res.json();
  },

  getSubmissionByUserIdAndProblemId: async (userId: string, problemId: string): Promise<Submission[]> => {
    const res = await fetch(`${API_BASE}/submission/user/${userId}/problem/${problemId}`, {
      method: 'GET',
    });
    if (!res.ok) throw new Error('Failed to fetch submissions for user and problem');
    return res.json();
  }
};
