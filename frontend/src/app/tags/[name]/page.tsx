'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getQuestionsByTag } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Question {
  id: number;
  title: string;
  author: string;
}

function TagQuestionsContent() {
  const params = useParams();
  const tagName = params.name as string;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await getQuestionsByTag(tagName);
        setQuestions(response.data);
      } catch (error) {
        console.error('Failed to fetch questions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [tagName]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <Link href="/tags" className="text-indigo-600 hover:underline mb-6 inline-block">
        ← Back to Tags
      </Link>

      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Questions tagged <span className="text-purple-600">#{tagName}</span>
      </h1>

      {questions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No questions with this tag</h2>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <Link
              key={question.id}
              href={`/questions/${question.id}`}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition p-6 block"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-2 hover:text-indigo-600 transition">
                {question.title}
              </h2>
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
                by {question.author}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TagQuestionsPage() {
  return (
    <ProtectedRoute>
      <TagQuestionsContent />
    </ProtectedRoute>
  );
}
