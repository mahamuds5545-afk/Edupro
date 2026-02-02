
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { dbOps } from '../dbService';
import { Exam, Question, ExamAttempt } from '../types';
import RichContent from '../components/RichContent';

const ExamPage: React.FC = () => {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [alreadyAttended, setAlreadyAttended] = useState(false);
  
  // Reg Form
  const [isRegistered, setIsRegistered] = useState(false);
  const [regForm, setRegForm] = useState({ name: user?.name || '', roll: '', studentClass: '' });
  
  // Live Exam
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    if (id && user) {
      dbOps.get(`exams/${id}`).then(data => {
        setExam(data);
        setLoading(false);
      });
      // Check if already attended
      dbOps.get(`exam_attempts/${id}/${user.uid}`).then(data => {
        if (data) setAlreadyAttended(true);
      });
    }
  }, [id, user]);

  useEffect(() => {
    let timer: any;
    if (isRegistered && !submitted && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isRegistered && !submitted) {
      handleFinalSubmit();
    }
    return () => clearInterval(timer);
  }, [isRegistered, submitted, timeLeft]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !exam) return;
    
    // Check balance
    if (user.balance < exam.examFee) {
      return alert('Insufficient balance! Please add funds to your wallet.');
    }

    if (alreadyAttended) {
      return alert('You have already attended this exam.');
    }

    const now = Date.now();
    if (now < exam.startTime) return alert("Exam hasn't started yet!");
    if (now > exam.endTime) return alert('Exam has ended!');

    if (confirm(`৳${exam.examFee} will be deducted from your balance. Start now?`)) {
      setLoading(true);
      try {
        await dbOps.update(`users/${user.uid}`, { balance: user.balance - exam.examFee });
        await refreshUser();
        setIsRegistered(true);
        setTimeLeft(exam.duration * 60);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFinalSubmit = async () => {
    if (!exam || !user) return;
    setSubmitted(true);
    let score = 0;
    exam.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) score++;
    });
    setFinalScore(score);

    // Save Attempt
    const attempt: ExamAttempt = {
      uid: user.uid,
      name: regForm.name,
      roll: regForm.roll,
      studentClass: regForm.studentClass,
      score,
      timestamp: Date.now()
    };
    await dbOps.set(`exam_attempts/${exam.id}/${user.uid}`, attempt);
    alert('Exam Submitted Successfully!');
  };

  if (loading) return <div className="text-center py-20 font-black animate-pulse">Checking Portal...</div>;
  if (!exam) return <div className="text-center py-20 font-bold">Exam not found.</div>;

  // RESULTS VIEW (If exam ended)
  const isExamEnded = Date.now() > exam.endTime;

  if (alreadyAttended && !isRegistered) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-10 rounded-[3rem] shadow-xl border text-center space-y-6">
        <div className="text-6xl">📝</div>
        <h2 className="text-3xl font-black">Attendance Confirmed</h2>
        <p className="text-gray-500 font-medium">You have already submitted your answers for this exam. Results will be visible after the exam ends.</p>
        <button onClick={() => navigate('/exams')} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black uppercase">Back to Hall</button>
      </div>
    );
  }

  if (!isRegistered && !isExamEnded) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-10 rounded-[3rem] shadow-xl border space-y-8 animate-slide-up">
        <div className="text-center">
          <h2 className="text-3xl font-black text-indigo-700">{exam.title}</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Entrance Registration</p>
        </div>
        <div className="bg-indigo-50 p-6 rounded-3xl grid grid-cols-2 gap-4">
           <div><p className="text-[10px] font-black text-indigo-400 uppercase">Fee</p><p className="text-xl font-black">৳{exam.examFee}</p></div>
           <div><p className="text-[10px] font-black text-indigo-400 uppercase">Duration</p><p className="text-xl font-black">{exam.duration} Min</p></div>
           <div className="col-span-2"><p className="text-[10px] font-black text-orange-400 uppercase">Prize</p><p className="font-bold text-orange-600">{exam.prizeInfo || "Participate to Win!"}</p></div>
        </div>
        <form onSubmit={handleRegister} className="space-y-4">
           <input className="w-full p-4 border-2 rounded-2xl font-bold" placeholder="Full Name" value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} required />
           <input className="w-full p-4 border-2 rounded-2xl font-bold" placeholder="Roll Number" value={regForm.roll} onChange={e => setRegForm({...regForm, roll: e.target.value})} required />
           <input className="w-full p-4 border-2 rounded-2xl font-bold" placeholder="Class" value={regForm.studentClass} onChange={e => setRegForm({...regForm, studentClass: e.target.value})} required />
           <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black uppercase text-xl shadow-xl">Pay & Start Exam</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl sticky top-4 z-20 flex justify-between items-center border">
        <div>
          <h3 className="font-black text-xl">{exam.title}</h3>
          <p className="text-xs text-gray-400">{submitted ? 'Reviewing Results' : `${exam.questions.length} Questions`}</p>
        </div>
        {!submitted ? (
          <div className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-mono text-xl font-black">
            {Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2, '0')}
          </div>
        ) : (
          <div className="text-right">
            <span className="text-[10px] font-black text-green-600 uppercase">Your Result</span>
            <p className="text-3xl font-black text-indigo-700">{finalScore} / {exam.questions.length}</p>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {exam.questions.map((q, idx) => (
          <div key={q.id} className={`bg-white p-8 rounded-[2.5rem] border transition-all ${submitted ? (answers[q.id] === q.correctAnswer ? 'border-green-300 bg-green-50/20 shadow-green-100' : 'border-red-300 bg-red-50/20 shadow-red-100') : 'shadow-sm border-gray-100'}`}>
            <div className="flex gap-4 mb-6">
              <span className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black flex-shrink-0">{idx+1}</span>
              <div className="flex-1 space-y-4">
                 <RichContent content={q.question} type={q.contentType} className="text-xl font-black text-gray-800" />
                 {q.questionImage && <img src={q.questionImage} alt="Question" className="max-w-full h-auto rounded-3xl border shadow-sm mx-auto" />}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {q.options.map((opt, oIdx) => (
                <button 
                  key={oIdx} 
                  disabled={submitted}
                  onClick={() => setAnswers({...answers, [q.id]: oIdx})}
                  className={`p-5 rounded-2xl text-left font-bold border-2 transition-all flex flex-col gap-3 group/opt ${
                    answers[q.id] === oIdx ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 
                    submitted && oIdx === q.correctAnswer ? 'bg-green-600 border-green-600 text-white shadow-lg' : 
                    'bg-gray-50 border-transparent hover:border-indigo-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                     <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black ${answers[q.id] === oIdx || (submitted && oIdx === q.correctAnswer) ? 'bg-white/20' : 'bg-gray-200 group-hover/opt:bg-indigo-100'}`}>
                        {String.fromCharCode(65+oIdx)}
                     </span>
                     <RichContent content={opt} type={q.contentType} className="flex-1" />
                  </div>
                  {q.optionImages?.[oIdx] && <img src={q.optionImages[oIdx]} className="w-full h-40 object-contain rounded-xl bg-white/20" alt="Option" />}
                </button>
              ))}
            </div>
            {submitted && isExamEnded && (
              <div className="mt-8 p-8 bg-white rounded-3xl border-2 border-dashed border-indigo-100 animate-in fade-in slide-in-from-top-4 duration-500">
                <p className="text-[10px] font-black uppercase text-indigo-600 mb-3 tracking-[0.2em]">Detailed Solution & Explanation</p>
                <RichContent content={q.explanation || "No extended explanation provided for this question."} type={q.contentType} className="text-gray-600 font-medium italic leading-relaxed" />
              </div>
            )}
          </div>
        ))}
      </div>

      {!submitted && (
        <button onClick={handleFinalSubmit} className="w-full bg-indigo-700 text-white py-6 rounded-[3rem] font-black uppercase text-2xl shadow-2xl hover:bg-indigo-800 transition-all transform hover:scale-[1.01]">Final Submission</button>
      )}
    </div>
  );
};

export default ExamPage;
