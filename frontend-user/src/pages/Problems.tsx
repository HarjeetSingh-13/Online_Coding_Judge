import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Database, CheckCircle } from 'lucide-react';
import { Problem } from '../types';
import { api } from '../utils/api';

const Problems: React.FC = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const data = await api.getProblems();
      setProblems(data);
      console.log(data);
    } catch (err) {
      setError('Failed to fetch problems');
    } finally {
      setLoading(false);
    }
  };

  // Map status to color classes
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'solved':
        return 'border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20';
      case 'attempted':
        return 'border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return 'border-l-4 border-gray-200 dark:border-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="bg-gray-200 dark:bg-gray-700 h-8 w-48 mb-6"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 h-16"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Problems</h1>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Problem
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Time Limit
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Memory Limit
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Test Cases
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {problems.map((problem) => (
              <tr
                key={problem.id}
                className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${getStatusColor(problem.status)}`}
              >
                <td className="px-6 py-4">
                  <Link
                    to={`/problems/${problem.id}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    {problem.title}
                  </Link>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{problem.timeLimit}s</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Database className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{problem.memoryLimit}MB</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <CheckCircle className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{problem.testCaseCount}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {problems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No problems available</p>
        </div>
      )}
    </div>
  );
};

export default Problems;