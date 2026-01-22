'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getQuestion,
  deleteQuestion,
  getComments,
  addComment,
  voteQuestion,
  getQuestionVotes,
  getQuestionTags,
  addTagToQuestion,
} from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Question {
  id: number;
  title: string;
  description: string;
  author: string;
}

interface Comment {
  id: number;
  content: string;
  author: string;
  replies: Comment[];
}

interface Tag {
  id: number;
  name: string;
}

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [votes, setVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [newTag, setNewTag] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const { user, isLoggedIn } = useAuth();

  const questionId = Number(params.id);

  const fetchData = useCallback(async () => {
    try {
      const [qRes, cRes, vRes, tRes] = await Promise.all([
        getQuestion(questionId),
        getComments(questionId),
        getQuestionVotes(questionId),
        getQuestionTags(questionId),
      ]);
      setQuestion(qRes.data);
      setComments(cRes.data);
      setVotes(vRes.data.score);
      setTags(tRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, [questionId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleVote = async (value: number) => {
    if (!isLoggedIn) return;
    try {
      await voteQuestion(questionId, value);
      const vRes = await getQuestionVotes(questionId);
      setVotes(vRes.data.score);
    } catch (error) {
      console.error('Vote failed:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await addComment(questionId, newComment);
      setNewComment('');
      const cRes = await getComments(questionId);
      setComments(cRes.data);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleReply = async (parentId: number) => {
    if (!replyContent.trim()) return;
    try {
      await addComment(questionId, replyContent, parentId);
      setReplyTo(null);
      setReplyContent('');
      const cRes = await getComments(questionId);
      setComments(cRes.data);
    } catch (error) {
      console.error('Failed to add reply:', error);
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    try {
      await addTagToQuestion(questionId, newTag);
      setNewTag('');
      const tRes = await getQuestionTags(questionId);
      setTags(tRes.data);
    } catch (error) {
      console.error('Failed to add tag:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      await deleteQuestion(questionId);
      router.push('/questions');
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const CommentItem = ({ comment, depth = 0 }: { comment: Comment; depth?: number }) => (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-indigo-100 pl-4' : ''}`}>
      <div className="bg-gray-50 rounded-lg p-4 mb-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {comment.author.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-gray-800">{comment.author}</span>
        </div>
        <p className="text-gray-700">{comment.content}</p>
        {isLoggedIn && (
          <button
            onClick={() => setReplyTo(comment.id)}
            className="text-sm text-indigo-600 hover:underline mt-2"
          >
            Reply
          </button>
        )}
        {replyTo === comment.id && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              onClick={() => handleReply(comment.id)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Reply
            </button>
            <button
              onClick={() => setReplyTo(null)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      {comment.replies?.map((reply) => (
        <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-gray-800">Question not found</h1>
      </div>
    );
  }

  const isOwner = user?.username === question.author;

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/questions" className="text-indigo-600 hover:underline mb-6 inline-block">
        ← Back to Questions
      </Link>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex gap-6">
          {/* Vote buttons */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => handleVote(1)}
              disabled={!isLoggedIn}
              className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-green-100 text-gray-600 hover:text-green-600 transition disabled:opacity-50"
            >
              ▲
            </button>
            <span className={`text-xl font-bold ${votes > 0 ? 'text-green-600' : votes < 0 ? 'text-red-600' : 'text-gray-400'}`}>
              {votes}
            </span>
            <button
              onClick={() => handleVote(-1)}
              disabled={!isLoggedIn}
              className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 transition disabled:opacity-50"
            >
              ▼
            </button>
          </div>

          {/* Question content */}
          <div className="flex-1">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-gray-800">{question.title}</h1>
              {isOwner && (
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 mb-6">
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
                by {question.author}
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.name}`}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition"
                >
                  #{tag.name}
                </Link>
              ))}
              {isLoggedIn && (
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag"
                    className="px-3 py-1 text-sm rounded-full border border-gray-300 w-24"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm hover:bg-purple-700"
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {question.description}
            </p>
          </div>
        </div>
      </div>

      {/* Comments section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          💬 Answers ({comments.length})
        </h2>

        {isLoggedIn && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your answer..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none mb-4"
            />
            <button
              onClick={handleAddComment}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition"
            >
              Post Answer
            </button>
          </div>
        )}

        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>

        {comments.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl shadow">
            <div className="text-4xl mb-3">💭</div>
            <p className="text-gray-500">No answers yet. Be the first to help!</p>
          </div>
        )}
      </div>
    </div>
  );
}
