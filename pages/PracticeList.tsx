
import React, { useState, useEffect } from 'react';
import { dbOps } from '../dbService';
import { Exam } from '../types';
import { Link } from 'react-router-dom';

const PracticeListPage: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dbOps.listen('exams', (data) => {
      if (data) {
        // Filter for practice sets
        const practiceList = Object.keys(data)
          .map(key => ({ id: key, ...data[key] }))
          .filter(e => e.type === 'practice');
        setExams(practiceList);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-20 text-center font-bold text-orange-600 animate-pulse">Loading Practice Sets...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">Practice Hub 🎯</h1>
          <p className="text-gray-500 font-medium">No timer, instant hints, and detailed explanations.</p>
        </div>
        <div className="flex items-center gap-3 bg-orange-50 px-6 py-4 rounded-2xl">
           <span className="text-3xl">💡</span>
           <div>
              <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest leading-none mb-1">Mode</p>
              <p className="font-bold text-orange-600 leading-none">Learning Mode ON</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.length === 0 ? (
          <div className="col-span-full py-32 text-center bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
             <span className="text-6xl">🏜️</span>
             <p className="text-gray-400 font-bold mt-4 text-xl">No practice sets available.</p>
          </div>
        ) : (
          exams.map(exam => (
            <div key={exam.id} className="bg-white p-8 rounded-[2rem] border border-gray-100 hover:shadow-2xl hover:shadow-orange-50 hover:-translate-y-2 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-6">
                <span className="p-3 bg-orange-50 text-orange-600 rounded-2xl text-xl group-hover:scale-110 transition-transform">🎯</span>
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-widest">Self-Study</span>
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-4 line-clamp-2 leading-tight">{exam.title}</h3>
              <div className="space-y-3 mb-8">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-gray-400 uppercase tracking-widest">MCQs</span>
                  <span className="text-gray-800">{exam.questions?.length || 0} Questions</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-gray-400 uppercase tracking-widest">Features</span>
                  <span className="text-gray-800">Hints & Explain</span>
                </div>
              </div>
              <Link to={`/practice/${exam.id}`} className="block w-full text-center bg-orange-600 text-white py-4 rounded-2xl font-black hover:bg-orange-700 shadow-xl shadow-orange-100 transition-all">
                Start Practicing
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PracticeListPage;
