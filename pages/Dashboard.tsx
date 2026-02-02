
import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { dbOps } from '../dbService';
import { Post, Grade } from '../types';
import { Link } from 'react-router-dom';

const grades: (Grade | 'All')[] = ['All', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'SSC', 'HSC', 'General'];

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<Grade | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dbOps.listen('posts', (data) => {
      if (data) {
        const postList = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setPosts(postList.sort((a, b) => b.timestamp - a.timestamp));
      }
    });
  }, []);

  const filteredPosts = posts.filter(p => 
    (selectedGrade === 'All' || p.grade === selectedGrade) &&
    (p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 overflow-hidden border-2 border-white shadow-lg">
             <img src={user?.profilePic || `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`} className="w-full h-full object-cover" alt="User" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Hello, {user?.name.split(' ')[0]}!</h1>
            <p className="text-gray-500 font-medium">Class-wise updates are now live.</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-white p-4 rounded-[2rem] shadow-sm border">
          <input 
            className="bg-gray-50 px-6 py-3 rounded-2xl outline-none font-bold text-sm w-64 focus:bg-white border focus:border-indigo-500 transition-all" 
            placeholder="Search feed..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex overflow-x-auto pb-4 gap-3 scrollbar-hide">
        {grades.map(grade => (
          <button
            key={grade}
            onClick={() => setSelectedGrade(grade)}
            className={`whitespace-nowrap px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
              selectedGrade === grade ? 'bg-indigo-600 text-white shadow-xl scale-105' : 'bg-white text-gray-500 border hover:border-indigo-200'
            }`}
          >
            {grade}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {filteredPosts.map(post => (
            <div key={post.id} className="bg-white rounded-[3rem] shadow-sm border overflow-hidden hover:shadow-2xl transition-all group">
              {post.imageUrl && (
                <Link to={`/post/${post.id}`}>
                  <div className="h-72 overflow-hidden">
                    <img src={post.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                </Link>
              )}
              <div className="p-10">
                <div className="flex gap-3 mb-6">
                  <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full font-black text-[10px] uppercase">{post.grade}</span>
                  <span className="bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full font-black text-[10px] uppercase">{post.category}</span>
                </div>
                <Link to={`/post/${post.id}`}>
                  <h4 className="text-3xl font-black text-gray-900 mb-6 hover:text-indigo-600 transition-colors">{post.title}</h4>
                </Link>
                <p className="text-gray-500 text-lg leading-relaxed line-clamp-3 mb-10">{post.content}</p>
                <Link to={`/post/${post.id}`} className="font-black text-indigo-600 uppercase tracking-widest text-xs flex items-center gap-2 group/btn">
                  Read More <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>
          ))}
          {filteredPosts.length === 0 && <div className="p-20 text-center bg-white rounded-[3rem] border-2 border-dashed text-gray-400 font-black">No posts found for this selection.</div>}
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-4">Class-wise Mode</h3>
              <p className="opacity-80 text-sm leading-relaxed mb-6">Use the tags above to quickly filter updates specifically for your class or exam year.</p>
              <div className="text-4xl">🎓</div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
