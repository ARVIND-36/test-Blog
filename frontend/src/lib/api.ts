import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth
export const signup = (username: string, email: string, password: string) =>
  api.post('/signup', { username, email, password });

export const login = (email: string, password: string) =>
  api.post('/login', { email, password });

export const logout = () => api.get('/logout');

// New Auth endpoints
export const sendOTP = (email: string) =>
  api.post('/auth/send-otp', { email });

export const verifyOTPAndSignup = (email: string, otp: string, username: string, password: string) =>
  api.post('/auth/verify-otp', { email, otp, username, password });

export const getCurrentUser = () => api.get('/auth/me');

export const getGitHubAuthUrl = () => `${API_BASE_URL}/auth/github`;
export const getGoogleAuthUrl = () => `${API_BASE_URL}/auth/google`;

// Blogs
export const getBlogs = () => api.get('/blogs');
export const getBlog = (id: number) => api.get(`/blogs/${id}`);
export const createBlog = (title: string, content: string, tags: string[] = []) =>
  api.post('/blogs', { title, content, tags });
export const updateBlog = (id: number, title: string, content: string) =>
  api.put(`/blogs/${id}`, { title, content });
export const deleteBlog = (id: number) => api.delete(`/blogs/${id}`);
export const getBlogTags = (id: number) => api.get(`/blogs/${id}/tags`);

// Questions
export const getQuestions = () => api.get('/questions');
export const getQuestion = (id: number) => api.get(`/questions/${id}`);
export const createQuestion = (title: string, description: string, tags: string[] = []) =>
  api.post('/questions', { title, description, tags });
export const updateQuestion = (id: number, title: string, description: string) =>
  api.put(`/questions/${id}`, { title, description });
export const deleteQuestion = (id: number) => api.delete(`/questions/${id}`);

// Comments
export const getComments = (questionId: number) =>
  api.get(`/questions/${questionId}/comments`);
export const addComment = (questionId: number, content: string, parentId?: number) =>
  api.post(`/questions/${questionId}/comments`, { content, parent_id: parentId });
export const updateComment = (id: number, content: string) =>
  api.put(`/comments/${id}`, { content });
export const deleteComment = (id: number) => api.delete(`/comments/${id}`);

// Votes
export const voteQuestion = (id: number, value: number) =>
  api.post(`/questions/${id}/vote`, { value });
export const getQuestionVotes = (id: number) => api.get(`/questions/${id}/votes`);
export const voteComment = (id: number, value: number) =>
  api.post(`/comments/${id}/vote`, { value });
export const getCommentVotes = (id: number) => api.get(`/comments/${id}/votes`);

// Tags
export const getTags = () => api.get('/tags');
export const suggestTags = (query: string) => api.get(`/tags/suggest?q=${encodeURIComponent(query)}`);
export const addTagToQuestion = (questionId: number, tag: string) =>
  api.post(`/questions/${questionId}/tags`, { tag });
export const getQuestionTags = (questionId: number) =>
  api.get(`/questions/${questionId}/tags`);
export const getQuestionsByTag = (tagName: string) =>
  api.get(`/tags/${tagName}/questions`);

// Search
export const search = (query: string) => api.get(`/search?q=${encodeURIComponent(query)}`);

export default api;
