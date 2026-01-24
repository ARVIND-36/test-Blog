'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { logout } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const { user, setUser, isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🎓</span>
            <span className="text-white font-bold text-xl">StudentHub</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/blogs" className="text-white hover:text-indigo-200 transition">
              Blogs
            </Link>
            <Link href="/questions" className="text-white hover:text-indigo-200 transition">
              Questions
            </Link>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 rounded-l-lg bg-white/10 text-white placeholder-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-white/20 text-white rounded-r-lg hover:bg-white/30 transition"
            >
              🔍
            </button>
          </form>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse"></div>
            ) : isLoggedIn ? (
              <>
                <div className="flex items-center space-x-2">
                  {user?.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt={user.username}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-white/80 hidden sm:block">
                    {user?.username}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-white hover:text-indigo-200 transition"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-100 transition font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
