/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import ReferralEntry from './components/ReferralEntry';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';

function AppContent() {
  const { user } = useAuth();
  
  const searchParams = new URLSearchParams(window.location.search);
  const refCode = searchParams.get('ref');

  if (!user) {
    if (refCode) {
      return <ReferralEntry testCode={refCode} />;
    }
    return <LoginPage />;
  }

  // If user is already logged in but visits a generic referral URL, save it to session so StudentDashboard picks it up
  if (user && refCode && user.role === 'oquvchi') {
    sessionStorage.setItem('pending_test_code', refCode);
    // clear ?ref= from the URL so it doesn't loop
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  if (user.role === 'ustoz') {
    return <TeacherDashboard />;
  }

  return <StudentDashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
