// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Lock, Mail, ArrowRight, CheckCircle, Scale, FileText, Shield, Languages, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: FileText, text: 'AI Contract Summarization' },
    { icon: Shield, text: 'Legal Risk Analysis' },
    { icon: Scale, text: 'Financial Term Extraction' },
    { icon: Sparkles, text: 'AI Legal Assistant' },
    { icon: Languages, text: 'Multi-language Translation' },
  ];

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50/50 p-12 flex-col justify-between">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="relative w-12 h-12">
              <Image
                src="/logo.png"
                alt="LexAI Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-900">LexAI</span>
              <p className="text-xs text-gray-500 font-medium">AI-Powered Legal Intelligence</p>
            </div>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Sign in to continue managing your legal documents with enterprise-grade AI assistance.
            </p>

            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-gray-700">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-gray-400">
          <p>© 2026 LexAI. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="relative w-10 h-10">
              <Image
                src="/logo.png"
                alt="LexAI Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">LexAI</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
            <p className="text-sm text-gray-500 mt-1">
              Access your legal intelligence dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2.5 rounded-lg border border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                Remember me
              </label>
              <Link href="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Create one now
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}