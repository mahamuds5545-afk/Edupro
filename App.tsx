
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, dbOps } from './dbService';
import { UserProfile, AppConfig } from './types';

// Pages
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import DashboardPage from './pages/Dashboard';
import AdminPanelPage from './pages/AdminPanel';
import WalletPage from './pages/Wallet';
import ProfilePage from './pages/Profile';
import ExamPage from './pages/Exam';
import PracticePage from './pages/Practice';
import PostDetailPage from './pages/PostDetail';
import ExamListPage from './pages/ExamList';
import PracticeListPage from './pages/PracticeList';
import LibraryPage from './pages/Library';
import QuestionBankPage from './pages/QuestionBank';
import GlobalChatPage from './pages/GlobalChat';

// Components
import Sidebar from './components/Sidebar';
import Marquee from './components/Marquee';

// Auth Context
interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, refreshUser: async () => {} });
export const useAuth = () => useContext(AuthContext);

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const refreshUser = async () => {
    if (auth.currentUser) {
      const profile = await dbOps.get(`users/${auth.currentUser.uid}`);
      setUser(profile);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const profile = await dbOps.get(`users/${fbUser.uid}`);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    dbOps.listen('config', setConfig);
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center bg-indigo-50 font-black text-indigo-600">EduPro Portal Syncing...</div>;

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      <HashRouter>
        <div className="flex flex-col min-h-screen bg-gray-50">
          {user && <Marquee text={config?.marqueeNotice} />}
          <div className="flex flex-1">
            {user && <Sidebar role={user.role} isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
              {user && <button onClick={() => setIsMenuOpen(true)} className="md:hidden mb-4 p-3 bg-white border rounded-xl">≡ Menu</button>}
              <Routes>
                <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
                <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/" />} />
                <Route path="/" element={user ? <DashboardPage /> : <Navigate to="/login" />} />
                <Route path="/wallet" element={user ? <WalletPage /> : <Navigate to="/login" />} />
                <Route path="/chat" element={user ? <GlobalChatPage /> : <Navigate to="/login" />} />
                <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
                <Route path="/exams" element={user ? <ExamListPage /> : <Navigate to="/login" />} />
                <Route path="/practice" element={user ? <PracticeListPage /> : <Navigate to="/login" />} />
                <Route path="/questions" element={user ? <QuestionBankPage /> : <Navigate to="/login" />} />
                <Route path="/library" element={user ? <LibraryPage /> : <Navigate to="/login" />} />
                <Route path="/exam/:id" element={user ? <ExamPage /> : <Navigate to="/login" />} />
                <Route path="/practice/:id" element={user ? <PracticePage /> : <Navigate to="/login" />} />
                <Route path="/post/:id" element={user ? <PostDetailPage /> : <Navigate to="/login" />} />
                <Route path="/admin/*" element={user?.role === 'admin' ? <AdminPanelPage /> : <Navigate to="/" />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </div>
      </HashRouter>
    </AuthContext.Provider>
  );
};

export default App;
