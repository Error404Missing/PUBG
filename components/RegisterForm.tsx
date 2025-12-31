'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const formSchema = z.object({
  username: z.string().min(3, { message: "მომხმარებლის სახელი უნდა იყოს მინიმუმ 3 სიმბოლო" }),
  email: z.string().email({ message: "არასწორი მეილი" }),
  password: z.string().min(6, { message: "პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "პაროლები არ ემთხვევა",
  path: ["confirmPassword"],
});

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: values.username,
          email: values.email,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'რეგისტრაცია ვერ მოხერხდა');
      }

      // After creating server-side user, try signing in via Supabase for smoother flow
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        if (error) {
          router.push('/login');
        } else {
          router.push('/');
        }
      } catch (e) {
        router.push('/login');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
       {/* Username */}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-300">
          Username
        </label>
        <div className="mt-1">
          <input
            id="username"
            type="text"
            {...register("username")}
            className="appearance-none block w-full px-3 py-2 border border-neutral-700 rounded-md shadow-sm placeholder-gray-500 bg-neutral-900 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
          />
          {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300">
          Email
        </label>
        <div className="mt-1">
          <input
            id="email"
            type="email"
            {...register("email")}
            className="appearance-none block w-full px-3 py-2 border border-neutral-700 rounded-md shadow-sm placeholder-gray-500 bg-neutral-900 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300">
          პაროლი
        </label>
        <div className="mt-1">
          <input
            id="password"
            type="password"
            {...register("password")}
            className="appearance-none block w-full px-3 py-2 border border-neutral-700 rounded-md shadow-sm placeholder-gray-500 bg-neutral-900 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>
      </div>
      
      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
          გაიმეორეთ პაროლი
        </label>
        <div className="mt-1">
          <input
            id="confirmPassword"
            type="password"
            {...register("confirmPassword")}
            className="appearance-none block w-full px-3 py-2 border border-neutral-700 rounded-md shadow-sm placeholder-gray-500 bg-neutral-900 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
          />
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
        </div>
      </div>

      <div>
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
        >
          {isLoading ? 'რეგისტრაცია...' : 'რეგისტრაცია'}
        </button>
      </div>
      
      {error && (
        <div className="text-red-500 text-sm text-center">
            {error}
        </div>
      )}
      
      <div className="text-center text-sm text-gray-400">
        უკვე გაქვს ანგარიში?{' '}
        <Link href="/login" className="font-medium text-yellow-500 hover:text-yellow-400">
            შესვლა
        </Link>
      </div>
    </form>
  );
}
