
import React, { useState, useEffect } from 'react';
import { dbOps, uploadImage, db } from '../dbService';
import { ref, remove } from 'firebase/database';
import { Post, Question, Exam, Resource, Transaction, UserProfile, AppConfig, Grade, ContentType, SubjectiveQuestion, Notice, ExamAttempt } from '../types';

type AdminTab = 'funds_notices' | 'posts' | 'exam_builder' | 'participants' | 'subjective_qs' | 'library' | 'users';

const grades: Grade[] = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'SSC', 'HSC', 'General'];

const AdminPanelPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('funds_notices');
  const [loading, setLoading] = useState(false);

  // Data States
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjectiveQs, setSubjectiveQs] = useState<SubjectiveQuestion[]>([]);
  const [config, setConfig] = useState<AppConfig>({ marqueeNotice: '', bkashNumber: '', nagadNumber: '' });

  // Participant View States
  const [selectedExamId, setSelectedExamId] = useState('');
  const [participants, setParticipants] = useState<ExamAttempt[]>([]);

  // Form States
  const [newNotice, setNewNotice] = useState('');
  const [postForm, setPostForm] = useState({ title: '', content: '', youtubeUrl: '', category: 'Announcement', grade: 'General' as Grade });
  const [postImg, setPostImg] = useState<File | null>(null);
  const [resForm, setResForm] = useState({ title: '', type: 'pdf' as 'pdf' | 'video', url: '', grade: 'General' as Grade });
  const [subQForm, setSubQForm] = useState({ title: '', content: '', contentType: 'text' as ContentType, grade: 'General' as Grade });
  const [subQImg, setSubQImg] = useState<File | null>(null);

  // MCQ Advanced Builder States
  const [setForm, setSetForm] = useState({ 
    title: '', duration: 30, grade: 'General' as Grade, examFee: 0, prizeInfo: '', startTime: '', endTime: '', type: 'exam' as 'exam' | 'practice'
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qForm, setQForm] = useState<Question>({ 
    id: '', question: '', contentType: 'text', options: ['', '', '', ''], correctAnswer: 0, hint: '', explanation: '' 
  });
  
  // MCQ File inputs
  const [qImgFile, setQImgFile] = useState<File | null>(null);
  const [optFiles, setOptFiles] = useState<(File | null)[]>([null, null, null, null]);

  useEffect(() => {
    dbOps.listen('users', (d) => d && setUsers(Object.keys(d).map(k => ({ uid: k, ...d[k] }))));
    dbOps.listen('transactions', (d) => d && setTxs(Object.keys(d).map(k => ({ id: k, ...d[k] })).sort((a,b) => b.timestamp - a.timestamp)));
    dbOps.listen('resources', (d) => d && setResources(Object.keys(d).map(k => ({ id: k, ...d[k] }))));
    dbOps.listen('posts', (d) => d && setPosts(Object.keys(d).map(k => ({ id: k, ...d[k] })).sort((a,b) => b.timestamp - a.timestamp)));
    dbOps.listen('notices', (d) => d && setNotices(Object.keys(d).map(k => ({ id: k, ...d[k] }))));
    dbOps.listen('exams', (d) => d && setExams(Object.keys(d).map(k => ({ id: k, ...d[k] }))));
    dbOps.listen('subjective_questions', (d) => d && setSubjectiveQs(Object.keys(d).map(k => ({ id: k, ...d[k] }))));
    dbOps.listen('config', (d) => d && setConfig(d));
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      dbOps.listen(`exam_attempts/${selectedExamId}`, (d) => {
        if (d) setParticipants(Object.keys(d).map(k => ({ uid: k, ...d[k] })).sort((a,b) => b.score - a.score));
        else setParticipants([]);
      });
    }
  }, [selectedExamId]);

  const handleDelete = async (path: string, id: string) => {
    if (confirm('Delete permanently?')) {
      await remove(ref(db, `${path}/${id}`));
      alert('Deleted!');
    }
  };

  const handleTxAction = async (tx: Transaction, status: 'approved' | 'rejected') => {
    setLoading(true);
    if (status === 'approved' && tx.type === 'deposit') {
      const user = users.find(u => u.uid === tx.uid);
      if (user) await dbOps.update(`users/${tx.uid}`, { balance: (user.balance || 0) + tx.amount });
    }
    await dbOps.update(`transactions/${tx.id}`, { status });
    setLoading(false);
    alert(`Transaction ${status}!`);
  };

  const addMcqToList = async () => {
    if (!qForm.question && !qImgFile) return alert('Enter question text or add an image');
    
    setLoading(true);
    try {
      let questionImage = '';
      if (qImgFile) questionImage = await uploadImage(qImgFile);
      
      const optionImages: string[] = [];
      for (const file of optFiles) {
        if (file) {
          const url = await uploadImage(file);
          optionImages.push(url);
        } else {
          optionImages.push('');
        }
      }

      setQuestions([...questions, { 
        ...qForm, 
        id: Date.now().toString(), 
        questionImage, 
        optionImages 
      }]);
      
      // Reset current question form
      setQForm({ id: '', question: '', contentType: 'text', options: ['', '', '', ''], correctAnswer: 0, hint: '', explanation: '' });
      setQImgFile(null);
      setOptFiles([null, null, null, null]);
    } catch (err) {
      alert('Failed to upload images. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishExam = async () => {
    if (!setForm.title || questions.length === 0) return alert('Fill details and add questions');
    setLoading(true);
    const data = {
      ...setForm,
      questions,
      startTime: setForm.startTime ? new Date(setForm.startTime).getTime() : Date.now(),
      endTime: setForm.endTime ? new Date(setForm.endTime).getTime() : Date.now() + 86400000,
      timestamp: Date.now()
    };
    await dbOps.push('exams', data);
    setQuestions([]);
    setSetForm({ title: '', duration: 30, grade: 'General', examFee: 0, prizeInfo: '', startTime: '', endTime: '', type: 'exam' });
    setLoading(false);
    alert('Exam Published!');
  };

  const handleAwardPrize = async (p: ExamAttempt) => {
    const amount = prompt(`Enter Prize Money for ${p.name}:`, "500");
    if (!amount) return;
    const prize = parseInt(amount);
    const user = users.find(u => u.uid === p.uid);
    if (user) {
      await dbOps.update(`users/${p.uid}`, { balance: (user.balance || 0) + prize });
      await dbOps.update(`exam_attempts/${selectedExamId}/${p.uid}`, { prizeAwarded: prize });
      alert('Prize Money Added to Student Balance!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 pb-32">
      {/* Sidebar Nav */}
      <aside className="w-full lg:w-80 space-y-3 sticky top-24 h-fit">
        <h1 className="bg-indigo-600 text-white p-6 rounded-3xl font-black text-center text-xl mb-4 shadow-xl">ADMIN CONTROLS</h1>
        {(Object.keys(tabLabels) as AdminTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`w-full text-left px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
              activeTab === tab ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'bg-white border text-gray-400 hover:bg-indigo-50'
            }`}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </aside>

      {/* Main Panel Content */}
      <div className="flex-1 min-w-0 space-y-8 animate-slide-up">
        
        {/* T1: FUNDS & NOTICES */}
        {activeTab === 'funds_notices' && (
          <div className="space-y-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border space-y-8">
              <h2 className="text-3xl font-black border-l-8 border-orange-500 pl-6">Marquee & Payment Info</h2>
              <div className="flex gap-4">
                <input className="flex-1 p-5 rounded-2xl border-2 font-bold" placeholder="New Scrolling Notice..." value={newNotice} onChange={e => setNewNotice(e.target.value)} />
                <button onClick={() => { dbOps.push('notices', {text: newNotice, timestamp: Date.now()}); setNewNotice(''); }} className="bg-indigo-600 text-white px-8 rounded-2xl font-black">ADD</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <input className="p-4 border-2 rounded-2xl font-bold" placeholder="bKash Number" value={config.bkashNumber} onChange={e => setConfig({...config, bkashNumber: e.target.value})} />
                 <input className="p-4 border-2 rounded-2xl font-bold" placeholder="Nagad Number" value={config.nagadNumber} onChange={e => setConfig({...config, nagadNumber: e.target.value})} />
              </div>
              <button onClick={() => dbOps.set('config', config)} className="w-full bg-green-600 text-white py-5 rounded-2xl font-black uppercase">SAVE SETTINGS</button>
              <div className="space-y-2">
                 {notices.map(n => (
                   <div key={n.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border">
                     <span className="font-bold text-sm">📢 {n.text}</span>
                     <button onClick={() => handleDelete('notices', n.id)} className="text-red-500">✕</button>
                   </div>
                 ))}
              </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-xl border space-y-6">
               <h2 className="text-3xl font-black text-indigo-600">Pending Deposit Requests</h2>
               <div className="space-y-4">
                 {txs.filter(t => t.status === 'pending').map(tx => (
                   <div key={tx.id} className="p-6 bg-gray-50 rounded-3xl flex items-center justify-between border">
                     <div><p className="text-2xl font-black">৳{tx.amount}</p><p className="text-xs font-bold text-gray-500">{tx.userName} • {tx.method}</p></div>
                     <div className="flex gap-2">
                       <button onClick={() => handleTxAction(tx, 'approved')} className="bg-green-600 text-white px-6 py-2 rounded-xl font-black text-xs">APPROVE</button>
                       <button onClick={() => handleTxAction(tx, 'rejected')} className="bg-red-50 text-red-600 px-6 py-2 rounded-xl font-black text-xs">REJECT</button>
                     </div>
                   </div>
                 ))}
                 {txs.filter(t => t.status === 'pending').length === 0 && <p className="text-center text-gray-400 font-bold py-10">No pending transactions.</p>}
               </div>
            </div>
          </div>
        )}

        {/* T2: FEED / POSTS */}
        {activeTab === 'posts' && (
          <div className="space-y-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border space-y-6">
              <h2 className="text-3xl font-black border-l-8 border-pink-500 pl-6">Create Post</h2>
              <input className="w-full p-5 rounded-2xl border-2 font-bold" placeholder="Post Title" value={postForm.title} onChange={e => setPostForm({...postForm, title: e.target.value})} />
              <textarea className="w-full p-5 rounded-2xl border-2 h-32 font-bold" placeholder="Post Content..." value={postForm.content} onChange={e => setPostForm({...postForm, content: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input className="p-4 border-2 rounded-2xl font-bold" placeholder="Youtube Link" value={postForm.youtubeUrl} onChange={e => setPostForm({...postForm, youtubeUrl: e.target.value})} />
                <input type="file" className="p-3 bg-gray-50 rounded-2xl border-2 border-dashed" onChange={e => setPostImg(e.target.files?.[0] || null)} />
              </div>
              <button onClick={async () => {
                setLoading(true);
                let imageUrl = postImg ? await uploadImage(postImg) : '';
                await dbOps.push('posts', {...postForm, imageUrl, timestamp: Date.now()});
                setLoading(false); alert('Published!');
              }} className="w-full bg-pink-600 text-white py-5 rounded-2xl font-black uppercase shadow-xl">PUBLISH UPDATE</button>
            </div>
            <div className="grid gap-4">
              {posts.map(p => (
                <div key={p.id} className="p-6 bg-white border rounded-3xl flex justify-between items-center shadow-sm">
                  <span className="font-black text-gray-700">{p.title}</span>
                  <button onClick={() => handleDelete('posts', p.id)} className="text-red-500 font-bold">DELETE</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* T3: EXAM BUILDER (ADVANCED) */}
        {activeTab === 'exam_builder' && (
          <div className="space-y-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border space-y-6">
              <h2 className="text-3xl font-black border-l-8 border-indigo-600 pl-6">New Advanced MCQ Set</h2>
              <div className="grid grid-cols-2 gap-4">
                <input className="col-span-2 p-5 border-2 rounded-2xl font-bold" placeholder="Exam Title" value={setForm.title} onChange={e => setSetForm({...setForm, title: e.target.value})} />
                <input type="number" className="p-5 border-2 rounded-2xl font-bold" placeholder="Fee (৳)" value={setForm.examFee} onChange={e => setSetForm({...setForm, examFee: parseInt(e.target.value)})} />
                <input type="number" className="p-5 border-2 rounded-2xl font-bold" placeholder="Duration (Min)" value={setForm.duration} onChange={e => setSetForm({...setForm, duration: parseInt(e.target.value)})} />
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-gray-400 uppercase">Start Time</label>
                   <input type="datetime-local" className="w-full p-4 border-2 rounded-xl font-bold" value={setForm.startTime} onChange={e => setSetForm({...setForm, startTime: e.target.value})} />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-gray-400 uppercase">End Time</label>
                   <input type="datetime-local" className="w-full p-4 border-2 rounded-xl font-bold" value={setForm.endTime} onChange={e => setSetForm({...setForm, endTime: e.target.value})} />
                </div>
                <select className="p-5 border-2 rounded-2xl font-black" value={setForm.type} onChange={e => setSetForm({...setForm, type: e.target.value as any})}><option value="exam">Exam Mode</option><option value="practice">Practice Mode</option></select>
                <select className="p-5 border-2 rounded-2xl font-black" value={setForm.grade} onChange={e => setSetForm({...setForm, grade: e.target.value as Grade})}>{grades.map(g => <option key={g} value={g}>{g}</option>)}</select>
                <input className="col-span-2 p-5 border-2 rounded-2xl font-bold" placeholder="Prize Details (e.g. ৳500 for Top Score)" value={setForm.prizeInfo} onChange={e => setSetForm({...setForm, prizeInfo: e.target.value})} />
              </div>

              <div className="p-8 bg-gray-50 rounded-[2rem] border border-dashed border-indigo-200 space-y-6">
                <div className="flex justify-between items-center">
                   <h4 className="font-black text-indigo-600 text-xs">ADD MCQ QUESTION</h4>
                   <select className="px-3 py-1 bg-white border rounded-lg text-xs font-black" value={qForm.contentType} onChange={e => setQForm({...qForm, contentType: e.target.value as ContentType})}>
                      <option value="text">TEXT</option>
                      <option value="html">HTML</option>
                      <option value="math">MATH/PHYSICS</option>
                   </select>
                </div>
                
                <textarea className="w-full p-4 border-2 rounded-xl font-bold" placeholder="Question Text/Code..." value={qForm.question} onChange={e => setQForm({...qForm, question: e.target.value})} />
                <div className="flex flex-col gap-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase">Question Image (Optional)</label>
                   <input type="file" className="text-xs p-2 bg-white border rounded-lg" onChange={e => setQImgFile(e.target.files?.[0] || null)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {qForm.options.map((opt, i) => (
                    <div key={i} className="space-y-2">
                       <input className={`w-full p-4 border-2 rounded-xl font-bold ${qForm.correctAnswer === i ? 'border-green-500 bg-green-50' : ''}`} placeholder={`Option ${String.fromCharCode(65+i)}`} value={opt} onChange={e => { const n = [...qForm.options]; n[i] = e.target.value; setQForm({...qForm, options: n}); }} />
                       <input type="file" className="text-[9px] w-full" onChange={e => { const n = [...optFiles]; n[i] = e.target.files?.[0] || null; setOptFiles(n); }} />
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase">Correct Answer</label>
                      <select className="w-full p-4 border-2 rounded-xl font-bold" value={qForm.correctAnswer} onChange={e => setQForm({...qForm, correctAnswer: parseInt(e.target.value)})}>
                        {qForm.options.map((_, i) => <option key={i} value={i}>Option {String.fromCharCode(65+i)}</option>)}
                      </select>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase">Hint (Optional)</label>
                      <input className="w-full p-4 border-2 rounded-xl font-bold" placeholder="Enter hint..." value={qForm.hint} onChange={e => setQForm({...qForm, hint: e.target.value})} />
                   </div>
                </div>
                
                <button onClick={addMcqToList} disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black uppercase shadow-lg disabled:opacity-50">
                   {loading ? 'UPLOADING IMAGES...' : `+ ADD QUESTION TO SET (${questions.length})`}
                </button>
              </div>
              
              <button onClick={handlePublishExam} disabled={loading} className="w-full bg-green-600 text-white py-6 rounded-[2rem] font-black text-xl shadow-xl hover:bg-green-700 transition-all disabled:opacity-50">
                 {loading ? 'PROCESSING...' : 'PUBLISH FULL EXAM SET'}
              </button>
            </div>
            
            <div className="grid gap-4">
               {exams.map(ex => (
                 <div key={ex.id} className="p-6 bg-white border rounded-3xl flex justify-between items-center shadow-sm">
                   <div><span className="font-black text-gray-700">{ex.title}</span><p className="text-[10px] font-bold text-gray-400 uppercase">{ex.type} • {ex.questions.length} Qs • {ex.grade}</p></div>
                   <button onClick={() => handleDelete('exams', ex.id)} className="text-red-500 font-bold hover:underline">REMOVE</button>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* T4: PARTICIPANTS & PRIZES */}
        {activeTab === 'participants' && (
          <div className="bg-white p-10 rounded-[3rem] shadow-xl border space-y-8">
            <h2 className="text-3xl font-black border-l-8 border-green-600 pl-6">Participant Results & Prize</h2>
            <select className="w-full p-5 border-2 rounded-2xl font-black" onChange={e => setSelectedExamId(e.target.value)}>
               <option value="">-- Select Exam to view Results --</option>
               {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.title}</option>)}
            </select>
            <div className="space-y-4">
               {participants.map((p, idx) => (
                 <div key={p.uid} className="p-6 bg-gray-50 border rounded-3xl flex items-center justify-between">
                   <div className="flex items-center gap-4">
                     <span className="text-2xl font-black text-indigo-600">#{idx+1}</span>
                     <div>
                       <p className="font-black text-lg">{p.name} (Roll: {p.roll})</p>
                       <p className="text-xs text-gray-400 font-bold">Class: {p.studentClass} • Score: {p.score}</p>
                     </div>
                   </div>
                   <div className="flex gap-3">
                     {p.prizeAwarded ? (
                       <span className="bg-green-100 text-green-600 px-5 py-2 rounded-xl font-black text-xs uppercase">Awarded: ৳{p.prizeAwarded}</span>
                     ) : (
                       <button onClick={() => handleAwardPrize(p)} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-black text-xs uppercase shadow-md">AWARD PRIZE</button>
                     )}
                   </div>
                 </div>
               ))}
               {participants.length === 0 && selectedExamId && <p className="text-center py-10 text-gray-400 font-bold">No students have attended this exam yet.</p>}
            </div>
          </div>
        )}

        {/* T5: SUBJECTIVE QUESTIONS */}
        {activeTab === 'subjective_qs' && (
          <div className="space-y-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border space-y-6">
              <h2 className="text-3xl font-black border-l-8 border-purple-500 pl-6">Add to Question Bank</h2>
              <input className="w-full p-5 rounded-2xl border-2 font-bold" placeholder="Question Title/ID" value={subQForm.title} onChange={e => setSubQForm({...subQForm, title: e.target.value})} />
              <textarea className="w-full p-5 rounded-2xl border-2 h-40 font-bold" placeholder="Content (HTML or Text)..." value={subQForm.content} onChange={e => setSubQForm({...subQForm, content: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                 <select className="p-4 border-2 rounded-xl font-black" value={subQForm.grade} onChange={e => setSubQForm({...subQForm, grade: e.target.value as Grade})}>{grades.map(g => <option key={g} value={g}>{g}</option>)}</select>
                 <input type="file" className="p-3 bg-gray-50 rounded-xl border" onChange={e => setSubQImg(e.target.files?.[0] || null)} />
              </div>
              <button onClick={async () => {
                setLoading(true);
                let imageUrl = subQImg ? await uploadImage(subQImg) : '';
                await dbOps.push('subjective_questions', {...subQForm, imageUrl, timestamp: Date.now()});
                setLoading(false); alert('Added!');
              }} className="w-full bg-purple-600 text-white py-5 rounded-2xl font-black uppercase">SAVE QUESTION</button>
            </div>
            <div className="grid gap-4">
               {subjectiveQs.map(q => (
                 <div key={q.id} className="p-6 bg-white border rounded-3xl flex justify-between items-center shadow-sm">
                   <span className="font-black text-gray-700">{q.title}</span>
                   <button onClick={() => handleDelete('subjective_questions', q.id)} className="text-red-500 font-bold">DELETE</button>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* T6: LIBRARY MANAGER */}
        {activeTab === 'library' && (
          <div className="space-y-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border space-y-6">
              <h2 className="text-3xl font-black border-l-8 border-orange-500 pl-6">New Resource</h2>
              <input className="w-full p-5 rounded-2xl border-2 font-bold" placeholder="Resource Title" value={resForm.title} onChange={e => setResForm({...resForm, title: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                 <select className="p-4 rounded-xl border-2 font-black" value={resForm.type} onChange={e => setResForm({...resForm, type: e.target.value as any})}><option value="pdf">📄 PDF Doc</option><option value="video">🎬 Video Link</option></select>
                 <select className="p-4 rounded-xl border-2 font-black" value={resForm.grade} onChange={e => setResForm({...resForm, grade: e.target.value as Grade})}>{grades.map(g => <option key={g} value={g}>{g}</option>)}</select>
              </div>
              <input className="w-full p-5 rounded-2xl border-2 font-bold" placeholder="Download Link / URL" value={resForm.url} onChange={e => setResForm({...resForm, url: e.target.value})} />
              <button onClick={() => { dbOps.push('resources', {...resForm, timestamp: Date.now()}); alert('Saved!'); }} className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black uppercase">SAVE RESOURCE</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
               {resources.map(r => (
                 <div key={r.id} className="p-6 bg-white border rounded-3xl flex justify-between items-center shadow-sm">
                   <div><p className="font-black text-sm">{r.title}</p><p className="text-[10px] font-bold text-gray-400 uppercase">{r.type} • {r.grade}</p></div>
                   <button onClick={() => handleDelete('resources', r.id)} className="text-red-500 font-bold">✕</button>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* T7: USER MANAGER */}
        {activeTab === 'users' && (
          <div className="bg-white p-10 rounded-[3rem] shadow-xl border space-y-6">
            <h2 className="text-3xl font-black border-l-8 border-gray-400 pl-6">Student Management</h2>
            <div className="grid gap-4">
               {users.map(u => (
                 <div key={u.uid} className="p-6 bg-white border-2 rounded-3xl flex items-center justify-between hover:border-indigo-200 transition-colors">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-black">{u.name.charAt(0)}</div>
                     <div><h4 className="font-black text-xl">{u.name}</h4><p className="text-xs font-bold text-gray-400">{u.email} • Balance: ৳{u.balance || 0}</p></div>
                   </div>
                   <button onClick={() => {
                     const b = prompt(`New Balance for ${u.name}:`, u.balance?.toString());
                     if(b) dbOps.update(`users/${u.uid}`, { balance: parseInt(b) });
                   }} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-black text-xs uppercase shadow-md">EDIT FUND</button>
                 </div>
               ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

const tabLabels: Record<AdminTab, string> = {
  funds_notices: 'Funds & Notices',
  posts: 'Feed Manager',
  exam_builder: 'Advanced MCQ Builder',
  participants: 'Results & Prizes',
  subjective_qs: 'Question Bank',
  library: 'PDF & Video Library',
  users: 'Student Manager'
};

export default AdminPanelPage;
