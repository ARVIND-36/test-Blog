'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { search } from '@/lib/api';

interface SearchResult {
  questions: { id: number; title: string; author: string }[];
  blogs: { id: number; title: string; author: string }[];
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setLoading(false);
        return;
      }
      try {
        const response = await search(query);
        setResults(response.data);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-xl font-semibold text-gray-700">Enter a search query</h2>
      </div>
    );
  }

  const totalResults = (results?.questions.length || 0) + (results?.blogs.length || 0);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Search results for &quot;{query}&quot;
      </h1>
      <p className="text-gray-600 mb-8">{totalResults} results found</p>

      {totalResults === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No results found</h2>
          <p className="text-gray-500">Try different keywords</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Questions */}
          {results?.questions && results.questions.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">❓ Questions</h2>
              <div className="space-y-3">
                {results.questions.map((q) => (
                  <Link
                    key={q.id}
                    href={`/questions/${q.id}`}
                    className="bg-white rounded-xl shadow hover:shadow-lg transition p-5 block"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 hover:text-indigo-600">
                      {q.title}
                    </h3>
                    <span className="text-sm text-gray-500">by {q.author}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Blogs */}
          {results?.blogs && results.blogs.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">📝 Blogs</h2>
              <div className="space-y-3">
                {results.blogs.map((b) => (
                  <Link
                    key={b.id}
                    href={`/blogs/${b.id}`}
                    className="bg-white rounded-xl shadow hover:shadow-lg transition p-5 block"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 hover:text-indigo-600">
                      {b.title}
                    </h3>
                    <span className="text-sm text-gray-500">by {b.author}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
