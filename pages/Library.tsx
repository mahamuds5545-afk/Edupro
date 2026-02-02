
import React, { useState, useEffect } from 'react';
import { dbOps } from '../dbService';
import { Resource, Grade } from '../types';

const grades: (Grade | 'All')[] = ['All', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'SSC', 'HSC'];

const LibraryPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<Grade | 'All'>('All');
  const [filterType, setFilterType] = useState<'all' | 'pdf' | 'video'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dbOps.listen('resources', (data) => {
      if (data) {
        setResources(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      }
      setLoading(false);
    });
  }, []);

  const filteredResources = resources.filter(r => 
    (selectedGrade === 'All' || r.grade === selectedGrade) &&
    (filterType === 'all' || r.type === filterType) &&
    (r.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) return <div className="p-20 text-center font-bold text-purple-600 animate-pulse">Browsing Library...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="bg-white p-10 rounded-[3rem] border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">Resource Library 📚</h1>
          <p className="text-gray-500 font-medium">Select your class to find books and videos.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <input 
            className="bg-gray-50 px-6 py-4 rounded-2xl outline-none border focus:bg-white w-full md:w-64 font-bold" 
            placeholder="Search items..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <select className="p-4 rounded-2xl border font-black bg-white" value={filterType} onChange={e => setFilterType(e.target.value as any)}>
            <option value="all">All Types</option>
            <option value="pdf">📄 PDF Documents</option>
            <option value="video">🎬 Video Lessons</option>
          </select>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-4 gap-3 scrollbar-hide">
        {grades.map(grade => (
          <button
            key={grade}
            onClick={() => setSelectedGrade(grade)}
            className={`whitespace-nowrap px-8 py-3.5 rounded-2xl font-black text-xs uppercase transition-all ${
              selectedGrade === grade ? 'bg-purple-600 text-white shadow-xl' : 'bg-white text-gray-500 border hover:border-purple-200'
            }`}
          >
            {grade}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map(res => (
          <div key={res.id} className="bg-white p-8 rounded-[2.5rem] border hover:shadow-2xl transition-all group">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 ${res.type === 'pdf' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>
              {res.type === 'pdf' ? '📄' : '🎬'}
            </div>
            <div className="mb-4">
              <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full font-black text-[10px] uppercase">{res.grade}</span>
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-10 min-h-[3.5rem] line-clamp-2">{res.title}</h3>
            <a href={res.url} target="_blank" className={`block text-center py-4 rounded-2xl font-black text-white ${res.type === 'pdf' ? 'bg-orange-600' : 'bg-red-600 shadow-lg shadow-red-100'}`}>
              {res.type === 'pdf' ? 'Download PDF' : 'Watch Video'}
            </a>
          </div>
        ))}
        {filteredResources.length === 0 && <div className="col-span-full text-center py-20 text-gray-400 font-black">No resources found.</div>}
      </div>
    </div>
  );
};

export default LibraryPage;
