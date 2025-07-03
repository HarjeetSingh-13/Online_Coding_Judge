import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, AlertCircle, Code } from 'lucide-react';
import { Submission } from '../types';
import { api } from '../utils/api';

const SubmissionDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            fetchSubmission();
        }
        // eslint-disable-next-line
    }, [id]);

    const fetchSubmission = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await api.getSubmission(id!);
            console.log('Fetched submission:', data);
            setSubmission(data);
        } catch (err) {
            setError('Submission not found');
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

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="bg-gray-200 dark:bg-gray-700 h-8 w-1/2 mb-6"></div>
                    <div className="bg-gray-200 dark:bg-gray-700 h-64"></div>
                </div>
            </div>
        );
    }

    if (error || !submission) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-red-700 dark:text-red-300 flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5" />
                    <span>{error || 'Submission not found'}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-semibold mb-6">Submission #{submission.id}</h1>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-3 py-1 text-sm font-medium ${getVerdictStyle(submission.verdict)}`}>
                                {submission.verdict}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {submission.language.toUpperCase()}
                            </span>
                            <span className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <Clock className="h-4 w-4 mr-1" />
                                {submission.runtime}s
                            </span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Submitted: {new Date(submission.createdAt).toLocaleString()}
                        </div>
                    </div>
                    <div>
                        <Link
                            to={`/problems/${submission.problemId}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                            <Code className="h-4 w-4 inline mr-1" />
                            {submission.Problem ? submission.Problem.title : `Problem #${submission.problemId}`}
                        </Link>
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-medium mb-2">Submitted Code</h2>
                    <pre className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 overflow-x-auto text-sm">
                        {submission.code}
                    </pre>
                </div>

                {submission.debugInfo && (
                    <div>
                        <h2 className="text-lg font-medium mb-2">Debug Info</h2>
                        <pre className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-4 overflow-x-auto text-sm">
                            {submission.debugInfo}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubmissionDetail;