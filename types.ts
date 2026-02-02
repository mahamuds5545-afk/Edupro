
export type Role = 'user' | 'admin';
export type Grade = 'Class 6' | 'Class 7' | 'Class 8' | 'Class 9' | 'Class 10' | 'SSC' | 'HSC' | 'General';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: Role;
  balance: number;
  profilePic?: string;
  phone?: string;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  uid: string;
  userName: string;
  message: string;
  timestamp: number;
  role: Role;
}

export interface ExamAttempt {
  uid: string;
  name: string;
  roll: string;
  studentClass: string;
  score: number;
  timestamp: number;
  prizeAwarded?: number;
}

export interface Exam {
  id: string;
  title: string;
  questions: Question[];
  duration: number; // in minutes
  startTime: number; // timestamp
  endTime: number; // timestamp
  examFee: number;
  prizeInfo: string;
  timestamp: number;
  grade: Grade;
  type: 'exam' | 'practice';
}

export interface Notice {
  id: string;
  text: string;
  timestamp: number;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  grade: Grade;
  imageUrl?: string;
  youtubeUrl?: string;
  timestamp: number;
}

export type ContentType = 'text' | 'html' | 'math';

export interface Question {
  id: string;
  question: string;
  contentType: ContentType;
  options: string[];
  correctAnswer: number;
  hint: string;
  explanation: string;
  // Added optional fields for image-based questions
  questionImage?: string;
  optionImages?: string[];
}

// Added SubjectiveQuestion interface
export interface SubjectiveQuestion {
  id: string;
  title: string;
  content: string;
  contentType: ContentType;
  grade: Grade;
  imageUrl?: string;
  timestamp: number;
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'video';
  grade: Grade;
  url: string;
  timestamp: number;
}

export interface Transaction {
  id: string;
  uid: string;
  userName: string;
  amount: number;
  method: 'bKash' | 'Nagad';
  type: 'deposit' | 'withdrawal';
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
}

export interface AppConfig {
  marqueeNotice: string;
  bkashNumber: string;
  nagadNumber: string;
}
