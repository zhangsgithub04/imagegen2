'use client';

import { useState } from 'react';
import SignInForm from '@/components/auth/SignInForm';
import SignUpForm from '@/components/auth/SignUpForm';

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {isSignIn ? (
          <SignInForm onToggleForm={() => setIsSignIn(false)} />
        ) : (
          <SignUpForm onToggleForm={() => setIsSignIn(true)} />
        )}
      </div>
    </div>
  );
}
