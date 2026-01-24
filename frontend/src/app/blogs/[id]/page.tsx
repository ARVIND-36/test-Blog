'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBlog, deleteBlog } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Blog {
  id: number;
  title: string;
  content: string;
  author: string;
}

function BlogDetailContent() {
  const params = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await getBlog(Number(params.id));
        setBlog(response.data);
      } catch (error) {
        console.error('Failed to fetch blog:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this blog?')) return;
    try {
      await deleteBlog(Number(params.id));
      router.push('/blogs');
    } catch (error) {
      console.error('Failed to delete blog:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-gray-800">Blog not found</h1>
      </div>
    );
  }

  const isOwner = user?.username === blog.author;

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/blogs" className="text-indigo-600 hover:underline mb-6 inline-block">
        ← Back to Blogs
      </Link>

      <article className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-4xl font-bold text-gray-800">{blog.title}</h1>
          {isOwner && (
            <div className="flex gap-2">
              <Link
                href={`/blogs/${blog.id}/edit`}
                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 mb-8 pb-6 border-b">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {blog.author.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-gray-800">{blog.author}</div>
            <div className="text-sm text-gray-500">Author</div>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          {blog.content.split('\n').map((paragraph, index) => (
            <p key={index} className="text-gray-700 leading-relaxed mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </div>
  );
}

export default function BlogDetailPage() {
  return (
    <ProtectedRoute>
      <BlogDetailContent />
    </ProtectedRoute>
  );
}
