import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, Database, CheckCircle, Upload, Send, AlertCircle } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { Problem, Submission } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../utils/api';
import { Link } from 'react-router-dom';

const ProblemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('problem');
  const [problem, setProblem] = useState<Problem | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [mysubmissions, setMySubmissions] = useState<Submission[]>([]);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const languages = [
    { value: 'cpp', label: 'C++' },
    // { value: 'c', label: 'C' },
    // { value: 'java', label: 'Java' },
    { value: 'python', label: 'Python' },
    // { value: 'javascript', label: 'JavaScript' },
  ];

  useEffect(() => {
    if (id) {
      fetchProblem();
      fetchSubmissions();
      fetchMySubmissions();
    }
  }, [id]);

  const fetchProblem = async () => {
    try {
      const data = await api.getProblem(parseInt(id!));
      if (data) {
        setProblem(data);
      } else {
        setError('Problem not found');
      }
    } catch (err) {
      setError('Failed to fetch problem');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {

    try {
      const data = await api.getSubmissionByProblemId(id!);
      setSubmissions(data);
    } catch (err) {
      console.error('Failed to fetch submissions');
    }
  };

  const fetchMySubmissions = async () => {
    if (!user) return;

    try {
      const data = await api.getSubmissionByUserIdAndProblemId(user.id, id!);
      setMySubmissions(data);
    } catch (err) {
      console.error('Failed to fetch my submissions');
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setSubmitting(true);
    try {
      await api.submitSolution(parseInt(id!), code, language);
      setCode('');
      fetchSubmissions();
      setActiveTab('results');
    } catch (err) {
      setError('Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCode(e.target?.result as string);
      };
      reader.readAsText(file);
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
      default:
        return 'bg-gray-600 text-white';
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="bg-gray-200 dark:bg-gray-700 h-8 w-1/2 mb-6"></div>
          <div className="bg-gray-200 dark:bg-gray-700 h-96"></div>
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-red-700 dark:text-red-300">
          {error || 'Problem not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">{problem.title}</h1>
        <div className="flex space-x-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>Time: {problem.timeLimit}s</span>
          </div>
          <div className="flex items-center space-x-1">
            <Database className="h-4 w-4" />
            <span>Memory: {problem.memoryLimit}MB</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle className="h-4 w-4" />
            <span>Tests: {problem.testCaseCount}</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-0">
            {[
              { id: 'problem', label: 'Problem' },
              { id: 'submit', label: 'Submit' },
              { id: 'results', label: 'Results' },
              { id: 'submissions', label: 'Submissions' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-6 border-b-2 font-medium text-sm ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'problem' && (
            <div className="relative">
              {/* Status badge */}
              {(problem.status === 'solved' || problem.status === 'attempted') && (
                <span
                  className={`
                    absolute right-0 top-0 px-3 py-1 rounded-full text-xs font-semibold
                    ${problem.status === 'solved'
                      ? 'bg-green-100 text-green-700 border border-green-400'
                      : 'bg-yellow-100 text-yellow-800 border border-yellow-400'}
                  `}
                  style={{ marginTop: '-0.5rem', marginRight: '-0.5rem' }}
                >
                  {problem.status === 'solved' ? 'Solved' : 'Attempted'}
                </span>
              )}
              <div className="prose dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap">{problem.description}</div>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Input</h3>
                  <p className="text-gray-600 dark:text-gray-400">{problem.inputMethod}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Output</h3>
                  <p className="text-gray-600 dark:text-gray-400">{problem.outputMethod}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'submit' && (
            <div>
              {!user && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 mb-6 flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Login Required</h3>
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                      Please login to submit your solution.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:border-blue-500"
                      disabled={!user}
                    >
                      {languages.map((lang) => (
                        <option key={lang.value} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <label className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".cpp,.c,.java,.py,.js"
                        disabled={!user}
                      />
                    </label>

                    <button
                      onClick={handleSubmit}
                      disabled={!user || !code || submitting}
                      className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {submitting ? 'Submitting...' : 'Submit'}
                    </button>
                  </div>
                </div>

                <div className="border border-gray-300 dark:border-gray-600">
                  <Editor
                    height="400px"
                    language={language === 'cpp' ? 'cpp' : language}
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    theme={theme === 'dark' ? 'vs-dark' : 'light'}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      readOnly: !user,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div>
              {!user ? (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 text-center">
                  <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                  <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Login Required</h3>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                    Please login to view your submission results.
                  </p>
                </div>
              ) : mysubmissions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No submissions yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Verdict</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Language</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Runtime</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Submitted</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Debug Info</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {mysubmissions.map((submission) => (
                        <tr key={submission.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-2">
                            <Link
                              to={`/submission/${submission.id}`}
                              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                            >
                              {submission.id}
                            </Link>
                          </td>
                          <td className="px-4 py-2">{submission.userId}</td>
                          <td className="px-4 py-2">
                            <span className={`px-3 py-1 text-sm font-medium ${getVerdictStyle(submission.verdict)}`}>
                              {submission.verdict}
                            </span>
                          </td>
                          <td className="px-4 py-2">{submission.language.toUpperCase()}</td>
                          <td className="px-4 py-2">{submission.runtime}s</td>
                          <td className="px-4 py-2">{new Date(submission.createdAt).toLocaleString()}</td>
                          <td className="px-4 py-2">
                            {submission.debugInfo ? (
                              <div className="overflow-x-auto">
                                <table className="min-w-max text-xs border border-gray-200 dark:border-gray-600">
                                  <tbody>
                                    {Object.entries(
                                      (() => {
                                        try {
                                          return typeof submission.debugInfo === 'string'
                                            ? JSON.parse(submission.debugInfo)
                                            : submission.debugInfo;
                                        } catch {
                                          return { Info: submission.debugInfo };
                                        }
                                      })()
                                    ).map(([key, value]) => (
                                      <tr key={key}>
                                        <td className="px-2 py-1 font-medium text-gray-700 dark:text-gray-200 border-r border-gray-200 dark:border-gray-600">{key}</td>
                                        <td className="px-2 py-1 text-gray-600 dark:text-gray-300">{String(value)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'submissions' && (
            <div>
              {submissions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No submissions yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Verdict</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Language</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Runtime</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Submitted</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Debug Info</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {submissions.map((submission) => (
                        <tr key={submission.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-2">
                            <Link
                              to={`/submission/${submission.id}`}
                              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                            >
                              {submission.id}
                            </Link>
                          </td>
                          <td className="px-4 py-2">{submission.userId}</td>
                          <td className="px-4 py-2">
                            <span className={`px-3 py-1 text-sm font-medium ${getVerdictStyle(submission.verdict)}`}>
                              {submission.verdict}
                            </span>
                          </td>
                          <td className="px-4 py-2">{submission.language.toUpperCase()}</td>
                          <td className="px-4 py-2">{submission.runtime}s</td>
                          <td className="px-4 py-2">{new Date(submission.createdAt).toLocaleString()}</td>
                          <td className="px-4 py-2">
                            {submission.debugInfo ? (
                              <div className="overflow-x-auto">
                                <table className="min-w-max text-xs border border-gray-200 dark:border-gray-600">
                                  <tbody>
                                    {Object.entries(
                                      (() => {
                                        try {
                                          return typeof submission.debugInfo === 'string'
                                            ? JSON.parse(submission.debugInfo)
                                            : submission.debugInfo;
                                        } catch {
                                          return { Info: submission.debugInfo };
                                        }
                                      })()
                                    ).map(([key, value]) => (
                                      <tr key={key}>
                                        <td className="px-2 py-1 font-medium text-gray-700 dark:text-gray-200 border-r border-gray-200 dark:border-gray-600">{key}</td>
                                        <td className="px-2 py-1 text-gray-600 dark:text-gray-300">{String(value)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;