
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { dbOps } from '../dbService';
import { Exam, Question } from '../types';
import RichContent from '../components/RichContent';

const PracticePage: React.FC = () => {
  const { id } = useParams();
  const [exam, setExam] = useState<Exam | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (id) {
      dbOps.get(`exams/${id}`).then(data => data && setExam(data));
    }
  }, [id]);

  if (!exam) return <div className="text-center p-20 font-bold animate-pulse">Preparing Practice Hall...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-800">Practice Mode: {exam.title}</h2>
          <p className="text-sm text-gray-400 mt-1">Instant feedback enabled. No pressure.</p>
        </div>
        <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl text-2xl">🎯</div>
      </div>

      <div className="space-y-6">
        {exam.questions.map((q, idx) => {
          const selected = userAnswers[q.id];
          const hasAnswered = selected !== undefined;
          const isCorrect = hasAnswered && selected === q.correctAnswer;

          return (
            <div key={q.id} className={`bg-white p-8 rounded-3xl border transition-all ${hasAnswered ? (isCorrect ? 'border-green-200 ring-4 ring-green-50' : 'border-red-200 ring-4 ring-red-50') : 'border-gray-100 shadow-sm'}`}>
              <div className="flex gap-4 mb-6">
                <span className="w-10 h-10 flex-shrink-0 bg-gray-100 rounded-xl flex items-center justify-center font-black text-gray-500">
                  {idx + 1}
                </span>
                <div className="flex-1 space-y-4">
                  <RichContent content={q.question} type={q.contentType} className="text-xl font-bold text-gray-800" />
                  {q.questionImage && <img src={q.questionImage} alt="Question" className="max-w-full h-auto rounded-2xl border border-gray-100" />}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-14">
                {q.options.map((opt, oIdx) => {
                  const isCurrentSelection = selected === oIdx;
                  const isRealCorrect = hasAnswered && oIdx === q.correctAnswer;
                  const optImg = q.optionImages?.[oIdx];

                  return (
                    <button
                      key={oIdx}
                      onClick={() => !hasAnswered && setUserAnswers({ ...userAnswers, [q.id]: oIdx })}
                      className={`p-5 rounded-2xl text-left font-medium transition-all flex flex-col gap-3 border-2 ${
                        isRealCorrect ? 'bg-green-500 border-green-500 text-white shadow-lg' :
                        isCurrentSelection && !isCorrect ? 'bg-red-500 border-red-500 text-white shadow-lg' :
                        'bg-gray-50 border-transparent hover:border-gray-200 text-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black ${isRealCorrect || (isCurrentSelection && !isCorrect) ? 'bg-white/20' : 'bg-gray-200'}`}>
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className="flex-1 font-bold">{opt}</span>
                      </div>
                      {optImg && <img src={optImg} className="w-full h-32 object-contain rounded-lg bg-white/10" alt="Option" />}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 pl-14 flex flex-wrap gap-4">
                <button 
                  onClick={() => setShowHints({...showHints, [q.id]: !showHints[q.id]})}
                  className="px-4 py-2 bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest rounded-lg hover:bg-indigo-100 transition-all"
                >
                  {showHints[q.id] ? 'Hide Insight' : '💡 Need a Hint?'}
                </button>
                {hasAnswered && (
                  <div className="w-full space-y-4 animate-in fade-in duration-300">
                    <div className={`p-5 rounded-2xl border flex items-center gap-3 ${isCorrect ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                      <span className="text-xl">{isCorrect ? '✨' : '❌'}</span>
                      <p className="font-bold">
                        {isCorrect ? 'Brilliant! That is correct.' : `Oops! The correct answer is: ${q.options[q.correctAnswer]}`}
                      </p>
                    </div>
                    <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Detailed Explanation</p>
                      <p className="text-gray-700 italic leading-relaxed font-medium">{q.explanation || "No explanation provided for this question."}</p>
                    </div>
                  </div>
                )}
                {showHints[q.id] && !hasAnswered && (
                  <div className="w-full p-6 bg-orange-50 border border-orange-100 rounded-2xl text-orange-700 text-sm animate-in slide-in-from-top-2 font-medium">
                    <span className="font-black uppercase text-[10px] tracking-widest block mb-1">Teacher's Hint:</span>
                    {q.hint || "Analyze the variables given in the question!"}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PracticePage;
