
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../App';
import { dbOps } from '../dbService';
import { ChatMessage } from '../types';

const GlobalChatPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = dbOps.listen('chat', (data) => {
      if (data) {
        setMessages(Object.keys(data).map(k => ({ id: k, ...data[k] })).sort((a,b) => a.timestamp - b.timestamp));
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;
    
    await dbOps.push('chat', {
      uid: user.uid,
      userName: user.name,
      message: newMessage,
      role: user.role,
      timestamp: Date.now()
    });
    setNewMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col bg-white rounded-[3rem] shadow-2xl border overflow-hidden animate-slide-up">
      <div className="bg-indigo-600 p-6 text-white flex items-center justify-between">
         <h2 className="text-xl font-black">Global Chat Room 💬</h2>
         <span className="text-[10px] font-black uppercase bg-white/20 px-3 py-1 rounded-full">Real-time Connection</span>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50 scrollbar-hide">
        {messages.map((m) => {
          const isMe = m.uid === user?.uid;
          return (
            <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 mb-1 px-2">
                 <span className={`text-[9px] font-black uppercase ${m.role === 'admin' ? 'text-red-500' : 'text-gray-400'}`}>
                   {m.role === 'admin' ? '🛡️ Admin' : m.userName}
                 </span>
              </div>
              <div className={`max-w-[80%] p-4 rounded-3xl font-bold text-sm shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border'}`}>
                {m.message}
              </div>
              <span className="text-[8px] text-gray-300 mt-1 px-2">{new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 bg-white border-t flex gap-2">
        <input 
          className="flex-1 p-4 bg-gray-50 border-2 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 font-bold"
          placeholder="Type your message..."
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
        />
        <button className="bg-indigo-600 text-white px-8 rounded-2xl font-black uppercase shadow-lg">Send</button>
      </form>
    </div>
  );
};

export default GlobalChatPage;
