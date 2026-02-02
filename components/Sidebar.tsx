
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../dbService';
import { Role } from '../types';

interface SidebarProps {
  role: Role;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: '🏠' },
    { name: 'Global Chat', path: '/chat', icon: '💬' },
    { name: 'Exam Hall', path: '/exams', icon: '📝' },
    { name: 'Practice Hub', path: '/practice', icon: '🎯' },
    { name: 'Question Bank', path: '/questions', icon: '📋' },
    { name: 'PDF Library', path: '/library', icon: '📚' },
    { name: 'My Wallet', path: '/wallet', icon: '💳' },
    { name: 'My Profile', path: '/profile', icon: '👤' },
  ];

  const activeClass = "bg-indigo-600 text-white shadow-xl scale-[1.05]";
  const inactiveClass = "text-gray-500 hover:bg-indigo-50 hover:text-indigo-600";

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-[60] md:hidden" onClick={onClose} />}
      <aside className={`fixed md:sticky top-0 left-0 h-screen z-[70] w-72 bg-white border-r transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 border-b">
           <h2 className="text-3xl font-black text-indigo-700">Edu<span className="text-orange-500">Pro</span></h2>
        </div>
        <nav className="p-4 space-y-2 overflow-y-auto">
           {menuItems.map(item => (
             <Link key={item.path} to={item.path} onClick={onClose} className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm transition-all ${location.pathname === item.path ? activeClass : inactiveClass}`}>
               <span className="text-xl">{item.icon}</span> {item.name}
             </Link>
           ))}
           {role === 'admin' && (
             <Link to="/admin" onClick={onClose} className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm text-red-600 bg-red-50 hover:bg-red-100 transition-all ${location.pathname.startsWith('/admin') ? 'ring-2 ring-red-600' : ''}`}>
               <span className="text-xl">🛠️</span> Admin Panel
             </Link>
           )}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t">
           <button onClick={() => { if(confirm('Logout?')) signOut(auth); }} className="w-full py-4 bg-gray-100 text-gray-600 font-black rounded-2xl text-xs uppercase">Sign Out</button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
