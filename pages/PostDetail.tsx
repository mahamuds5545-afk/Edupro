
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { dbOps } from '../dbService';
import { Post } from '../types';

const PostDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      dbOps.get(`posts/${id}`).then(data => {
        if (data) setPost(data);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) return <div className="text-center p-20 font-bold text-indigo-600 animate-pulse">Loading Post...</div>;
  if (!post) return (
    <div className="text-center p-20">
      <h2 className="text-2xl font-bold text-gray-400">Post not found!</h2>
      <Link to="/" className="mt-4 inline-block text-indigo-600 font-bold">Back to Home</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <button 
        onClick={() => navigate(-1)} 
        className="mb-6 flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-bold"
      >
        <span>←</span> Back
      </button>

      <article className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
        {post.imageUrl && (
          <img src={post.imageUrl} alt={post.title} className="w-full h-[400px] object-cover" />
        )}
        
        <div className="p-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Announcement</span>
            <span className="text-gray-400 text-sm">{new Date(post.timestamp).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 leading-tight">{post.title}</h1>
          
          <div className="prose prose-indigo max-w-none">
            <p className="text-xl text-gray-600 leading-relaxed whitespace-pre-wrap">{post.content}</p>
          </div>

          {post.youtubeUrl && (
            <div className="mt-12 space-y-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-red-600">🎬</span> Attached Video Content
              </h3>
              <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-50">
                <iframe
                  className="w-full h-full"
                  src={post.youtubeUrl.replace('watch?v=', 'embed/')}
                  title="YouTube video"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">E</div>
              <div>
                <p className="font-bold text-gray-900 text-sm">EduPro Team</p>
                <p className="text-xs text-gray-400">Official Publisher</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-xl">🔗</button>
              <button className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-xl">✉️</button>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default PostDetailPage;
