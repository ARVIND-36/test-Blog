'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBlogs } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Blog {
  id: number;
  title: string;
  content: string;
  author: string;
}

function BlogsContent() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await getBlogs();
        setBlogs(response.data);
      } catch (error) {
        console.error('Failed to fetch blogs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
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
        <h1 className="text-3xl font-bold text-gray-800">📝 Blogs</h1>
        {isLoggedIn && (
          <Link
            href="/blogs/new"
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition"
          >
            + New Blog
          </Link>
        )}
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No blogs yet</h2>
          <p className="text-gray-500">Be the first to write a blog!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {blogs.map((blog) => (
            <Link
              key={blog.id}
              href={`/blogs/${blog.id}`}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition p-6 block w-full"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                {blog.title}
              </h2>
              <p className="text-gray-600 mb-4 line-clamp-4">
                {blog.content}
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                  by {blog.author}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BlogsPage() {
  return (
    <ProtectedRoute>
      <BlogsContent />
    </ProtectedRoute>
  );
}
