'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get('email') || '');
    const password = String(formData.get('password') || '');

    try {
      const res = await supabase.auth.signInWithPassword({ email, password });
      if (res.error) {
        setErrorMessage(res.error.message || 'Login failed');
      } else {
        // Redirect to home or previous page
        router.push('/');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300">
          Email
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="appearance-none block w-full px-3 py-2 border border-neutral-700 rounded-md shadow-sm placeholder-gray-500 bg-neutral-900 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300">
          პაროლი
        </label>
        <div className="mt-1">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="appearance-none block w-full px-3 py-2 border border-neutral-700 rounded-md shadow-sm placeholder-gray-500 bg-neutral-900 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <a href="#" className="font-medium text-yellow-500 hover:text-yellow-400">
            დაგავიწყდა პაროლი?
          </a>
        </div>
      </div>

      <div>
        <button 
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
        >
          {isLoading ? 'შესვლა...' : 'შესვლა'}
        </button>
      </div>
      
      {errorMessage && (
        <div className="text-red-500 text-sm text-center">
            {errorMessage}
        </div>
      )}
      
      <div className="text-center text-sm text-gray-400">
        არ გაქვს ანგარიში?{' '}
        <Link href="/register" className="font-medium text-yellow-500 hover:text-yellow-400">
            რეგისტრაცია
        </Link>
      </div>
    </form>
  );
}
