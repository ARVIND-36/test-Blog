'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getQuestions, getQuestionVotes } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Question {
  id: number;
  title: string;
  description: string;
  author: string;
  votes?: number;
}

function QuestionsContent() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await getQuestions();
        const questionsWithVotes = await Promise.all(
          response.data.map(async (q: Question) => {
            try {
              const votesRes = await getQuestionVotes(q.id);
              return { ...q, votes: votesRes.data.score };
            } catch {
              return { ...q, votes: 0 };
            }
          })
        );
        setQuestions(questionsWithVotes);
      } catch (error) {
        console.error('Failed to fetch questions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">❓ Questions</h1>
        {isLoggedIn && (
          <Link
            href="/questions/new"
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition"
          >
            + Ask Question
          </Link>
        )}
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow">
          <div className="text-6xl mb-4">❓</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No questions yet</h2>
          <p className="text-gray-500">Be the first to ask a question!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <Link
              key={question.id}
              href={`/questions/${question.id}`}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition p-6 flex gap-6 block"
            >
              {/* Vote count */}
              <div className="flex flex-col items-center justify-center min-w-[60px]">
                <div className={`text-2xl font-bold ${(question.votes ?? 0) > 0 ? 'text-green-600' : (question.votes ?? 0) < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                  {question.votes ?? 0}
                </div>
                <div className="text-xs text-gray-500">votes</div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800 mb-2 hover:text-indigo-600 transition">
                  {question.title}
                </h2>
                <p className="text-gray-600 line-clamp-2 mb-3">
                  {question.description}
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                    by {question.author}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function QuestionsPage() {
  return (
    <ProtectedRoute>
      <QuestionsContent />
    </ProtectedRoute>
  );
}
