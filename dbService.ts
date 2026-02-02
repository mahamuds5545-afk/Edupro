
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, set, get, child, update, push, onValue } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBSYIMvjNwrPLXG2KyLgiXeS8nDJkg6WQM",
  authDomain: "educationpro-45a1e.firebaseapp.com",
  projectId: "educationpro-45a1e",
  storageBucket: "educationpro-45a1e.firebasestorage.app",
  messagingSenderId: "654294558575",
  appId: "1:654294558575:web:58c29615f9d27c1f1c6a9a",
  databaseURL: "https://educationpro-45a1e-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// CRITICAL: Explicitly pass the databaseURL here
export const db = getDatabase(app, firebaseConfig.databaseURL);

// Database Operations
export const dbOps = {
  get: async (path: string) => {
    try {
      const dbRef = ref(db);
      const snapshot = await get(child(dbRef, path));
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error(`Error getting data from ${path}:`, error);
      throw error;
    }
  },
  
  set: async (path: string, data: any) => {
    await set(ref(db, path), data);
  },

  update: async (path: string, data: any) => {
    await update(ref(db, path), data);
  },

  push: async (path: string, data: any) => {
    const newRef = push(ref(db, path));
    await set(newRef, data);
    return newRef.key;
  },

  listen: (path: string, callback: (data: any) => void) => {
    const dbRef = ref(db, path);
    return onValue(dbRef, (snapshot) => {
      callback(snapshot.val());
    });
  }
};

// ImgBB Upload Service
export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);
  const IMGBB_API_KEY = '8fbd35ad178ff1c9c55051c7979035f4'; 
  
  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData
    });
    const result = await response.json();
    if (result.success) return result.data.url;
    throw new Error('Upload failed');
  } catch (err) {
    console.error('Image upload error:', err);
    throw err;
  }
};
