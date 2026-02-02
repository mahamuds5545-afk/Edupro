
import React, { useState, useEffect } from 'react';
import { dbOps } from '../dbService';
import { Exam, Grade } from '../types';
import { Link } from 'react-router-dom';

const grades: (Grade | 'All')[] = ['All', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'SSC', 'HSC'];

const ExamListPage: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<Grade | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dbOps.listen('exams', (data) => {
      if (data) {
        const examList = Object.keys(data)
          .map(key => ({ id: key, ...data[key] }))
          .filter(e => e.type === 'exam' || !e.type);
        setExams(examList);
      }
      setLoading(false);
    });
  }, []);

  const filteredExams = exams.filter(e => 
    (selectedGrade === 'All' || e.grade === selectedGrade) &&
    (e.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) return <div className="p-20 text-center font-bold text-indigo-600 animate-pulse">Loading Exams...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="bg-white p-10 rounded-[3rem] border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">Exam Hall 📝</h1>
          <p className="text-gray-500 font-medium">Select your class and test your potential.</p>
        </div>
        <input 
          className="bg-gray-50 px-6 py-4 rounded-2xl outline-none font-bold border focus:bg-white w-full md:w-80" 
          placeholder="Search exams..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex overflow-x-auto pb-4 gap-3 scrollbar-hide">
        {grades.map(grade => (
          <button
            key={grade}
            onClick={() => setSelectedGrade(grade)}
            className={`whitespace-nowrap px-8 py-3.5 rounded-2xl font-black text-xs uppercase transition-all ${
              selectedGrade === grade ? 'bg-indigo-600 text-white shadow-xl' : 'bg-white text-gray-500 border'
            }`}
          >
            {grade}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExams.map(exam => (
          <div key={exam.id} className="bg-white p-8 rounded-[2.5rem] border hover:shadow-2xl transition-all group">
            <div className="flex justify-between items-center mb-6">
              <span className="bg-indigo-50 text-indigo-600 px-4 py-1 rounded-full font-black text-[10px] uppercase">{exam.grade}</span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{exam.duration} MIN</span>
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-6 group-hover:text-indigo-600">{exam.title}</h3>
            <Link to={`/exam/${exam.id}`} className="block w-full text-center bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg">Enter Exam</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamListPage;
