'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTags } from '@/lib/api';

interface Tag {
  id: number;
  name: string;
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await getTags();
        setTags(response.data);
      } catch (error) {
        console.error('Failed to fetch tags:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
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
      <h1 className="text-3xl font-bold text-gray-800 mb-8">🏷️ Tags</h1>

      {tags.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow">
          <div className="text-6xl mb-4">🏷️</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No tags yet</h2>
          <p className="text-gray-500">Tags will appear here when questions are tagged.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.name}`}
              className="px-6 py-3 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-xl text-lg font-medium hover:from-purple-200 hover:to-pink-200 transition shadow-md hover:shadow-lg"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
