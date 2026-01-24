'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { isLoggedIn, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl text-white">
        <h1 className="text-5xl font-bold mb-6">Welcome to StudentHub 🎓</h1>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          A platform for students to share knowledge, ask questions, and learn together.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/blogs"
            className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-100 transition shadow-lg"
          >
            View Blogs
          </Link>
          <Link
            href="/questions"
            className="px-8 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition border border-white/30"
          >
            Browse Questions
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Share Blogs</h3>
          <p className="text-gray-600">
            Write and share your learning journey. Help others by documenting what you learn.
          </p>
          <Link href="/blogs" className="text-indigo-600 font-medium mt-4 inline-block hover:underline">
            View Blogs →
          </Link>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
          <div className="text-4xl mb-4">❓</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Ask Questions</h3>
          <p className="text-gray-600">
            Stuck on a problem? Ask the community and get helpful answers with threaded discussions.
          </p>
          <Link href="/questions" className="text-indigo-600 font-medium mt-4 inline-block hover:underline">
            Ask a Question →
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Join Our Growing Community</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-indigo-600">100+</div>
            <div className="text-gray-600">Students</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-purple-600">50+</div>
            <div className="text-gray-600">Blogs</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-pink-600">200+</div>
            <div className="text-gray-600">Questions</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-orange-600">500+</div>
            <div className="text-gray-600">Answers</div>
          </div>
        </div>
      </section>
    </div>
  );
}
