import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Role } from '../types';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (name: string, username: string, password: string, role: Role) => Promise<void>;
  loginAsGuest: (name: string) => void;
  logout: () => void;
  isFirebaseReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isFirebaseReady, setIsFirebaseReady] = useState(true);
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('testnazorat_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (username: string, password: string) => {
    // Preserve the original fallback for testing
    if (username === 'ustoz' && password === '7788') {
      const ustozUser: User = { name: "O'qituvchi", username: "ustoz", role: "ustoz" };
      setUser(ustozUser);
      localStorage.setItem('testnazorat_user', JSON.stringify(ustozUser));
      return;
    }

    // Try finding user in Firestore
    const userRef = doc(db, 'users', username.toLowerCase());
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("Bunday username mavjud emas.");
    }

    const userData = userSnap.data();
    if (userData.isBlocked) {
      throw new Error("Sizning hisobingiz bloklangan. Ustozi bilan bog'laning.");
    }
    if (userData.password !== password) {
      throw new Error("Parol xato kiritildi.");
    }

    const authUser: User = { 
      name: userData.name, 
      username: userData.username, 
      role: userData.role as Role 
    };
    
    setUser(authUser);
    localStorage.setItem('testnazorat_user', JSON.stringify(authUser));
  };

  const register = async (name: string, username: string, password: string, role: Role) => {
    const usernameKey = username.toLowerCase();
    
    if (usernameKey === 'ustoz') {
      throw new Error("Bu username band qilingan.");
    }

    const userRef = doc(db, 'users', usernameKey);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      throw new Error("Bu username allaqachon band. Boshqa username tanlang.");
    }

    // Save to Firestore (In a real app, passwords must be hashed securely)
    await setDoc(userRef, {
      name,
      username,
      password, // Storing plaintext for prototype as requested
      role,
      createdAt: new Date().toISOString()
    });

    const authUser: User = { name, username, role };
    setUser(authUser);
    localStorage.setItem('testnazorat_user', JSON.stringify(authUser));
  };

  const loginAsGuest = (name: string) => {
    const randomNumbers = Math.floor(1000 + Math.random() * 9000);
    const guestUser: User = {
      name,
      username: `guest_${randomNumbers}`,
      role: 'oquvchi'
    };
    setUser(guestUser);
    localStorage.setItem('testnazorat_user', JSON.stringify(guestUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('testnazorat_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, loginAsGuest, logout, isFirebaseReady }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


