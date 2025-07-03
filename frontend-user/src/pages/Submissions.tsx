import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, AlertCircle } from 'lucide-react';
import { Submission } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';

const Submissions: React.FC = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchSubmissions();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSubmissions = async () => {
    try {
      if(!user || !user.id) {
        setError('User not found');
        return;
      }
      const data = await api.getSubmissionByUserId( user.id );
      setSubmissions(data);
    } catch (err) {
      setError('Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  const getVerdictStyle = (verdict: string) => {
    switch (verdict.toLowerCase()) {
      case 'accepted':
        return 'bg-green-600 text-white';
      case 'wrong answer':
        return 'bg-red-600 text-white';
      case 'time limit exceeded':
        return 'bg-yellow-600 text-white';
      case 'memory limit exceeded':
        return 'bg-orange-600 text-white';
      case 'runtime error':
        return 'bg-purple-600 text-white';
      case 'compilation error':
        return 'bg-pink-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-6 text-center">
          <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Login Required
          </h2>
          <p className="text-yellow-700 dark:text-yellow-300">
            Please login to view your submissions.
          </p>
        </div>
      </div>
    );
  }

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Submissions</h1>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No submissions yet</p>
          <Link
            to="/problems"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Start solving problems
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Submission Id
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User Id
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Problem
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Language
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Verdict
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Runtime
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Submitted
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {submissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <Link
                      to={`/submission/${submission.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      {submission.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-medium">
                      {submission.userId}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/problems/${submission.problemId}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      {submission.Problem ? submission.Problem.title : `Problem #${submission.problemId}`}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-medium">
                      {submission.language.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 text-sm font-medium ${getVerdictStyle(submission.verdict)}`}>
                      {submission.verdict}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{submission.runtime}s</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    {new Date(submission.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Submissions;