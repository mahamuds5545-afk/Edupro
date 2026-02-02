
import React, { useState, useEffect } from 'react';
import { dbOps } from '../dbService';
import { SubjectiveQuestion, Grade } from '../types';
import RichContent from '../components/RichContent';

const grades: (Grade | 'All')[] = ['All', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'SSC', 'HSC'];

const QuestionBankPage: React.FC = () => {
  const [questions, setQuestions] = useState<SubjectiveQuestion[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<Grade | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dbOps.listen('subjective_questions', (data) => {
      if (data) {
        setQuestions(Object.keys(data).map(key => ({ id: key, ...data[key] })).sort((a,b) => b.timestamp - a.timestamp));
      }
      setLoading(false);
    });
  }, []);

  const filtered = questions.filter(q => 
    (selectedGrade === 'All' || q.grade === selectedGrade) &&
    (q.title.toLowerCase().includes(searchQuery.toLowerCase()) || q.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="bg-white p-10 rounded-[3rem] border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">Question Bank 📋</h1>
          <p className="text-gray-500 font-medium">Browse text and HTML based questions without options.</p>
        </div>
        <input 
          className="bg-gray-50 px-6 py-4 rounded-2xl border outline-none font-bold w-full md:w-80" 
          placeholder="Search question..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex overflow-x-auto pb-4 gap-3 scrollbar-hide">
        {grades.map(grade => (
          <button key={grade} onClick={() => setSelectedGrade(grade)} className={`whitespace-nowrap px-8 py-3.5 rounded-2xl font-black text-xs uppercase transition-all ${selectedGrade === grade ? 'bg-purple-600 text-white shadow-xl' : 'bg-white text-gray-500 border'}`}>
            {grade}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {filtered.map(q => (
          <div key={q.id} className="bg-white p-10 rounded-[2.5rem] border hover:shadow-2xl transition-all group">
            <div className="flex items-center gap-3 mb-6">
               <span className="bg-purple-50 text-purple-600 px-4 py-1.5 rounded-full font-black text-[10px] uppercase">{q.grade}</span>
               <span className="text-xs text-gray-400 font-bold">{new Date(q.timestamp).toLocaleDateString()}</span>
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-8 border-b pb-6 group-hover:text-purple-600 transition-colors">{q.title}</h2>
            {q.imageUrl && <img src={q.imageUrl} alt="Q" className="max-w-full rounded-3xl mb-8 border" />}
            <div className="bg-gray-50 p-8 rounded-3xl border">
               <RichContent content={q.content} type={q.contentType} className="text-xl leading-relaxed text-gray-700" />
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center py-20 text-gray-400 font-black">No questions found in this category.</div>}
      </div>
    </div>
  );
};

export default QuestionBankPage;
