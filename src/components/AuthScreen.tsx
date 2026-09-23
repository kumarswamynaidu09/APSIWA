import React, { useState } from 'react';
import { UserProfile, NavTab } from '../types';
import { Eye, EyeOff, Lock, Mail, User, Phone, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';
import {
  signInWithEmail,
  signUpWithEmail,
  sendPasswordResetEmail,
  isSupabaseConfigured
} from '../lib/supabase';

interface AuthScreenProps {
  initialMode?: 'login' | 'signup';
  onLoginSuccess: (user: UserProfile) => void;
  onNavigate?: (tab: NavTab) => void;
  isModal?: boolean;
  onClose?: () => void;
  onSkip?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  initialMode = 'login',
  onLoginSuccess,
  isModal = false,
  onClose,
  onSkip
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>(initialMode);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // Reset password state
  const [resetEmail, setResetEmail] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isConfigured = isSupabaseConfigured();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setLoading(true);

    try {
      const { user, error } = await signInWithEmail(loginEmail, loginPassword);

      if (error) {
        setErrorMsg(error);
        setLoading(false);
        return;
      }

      if (user) {
        setSuccessMsg('Signed in successfully!');
        setTimeout(() => {
          onLoginSuccess(user);
          if (onClose) onClose();
        }, 500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!signupName.trim() || !signupPhone.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setErrorMsg('Please provide name, phone number, email, and password.');
      return;
    }

    if (signupPassword.length < 6) {
      setErrorMsg('Password should be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const { user, error, needsEmailConfirmation } = await signUpWithEmail(
        signupEmail,
        signupPassword,
        {
          name: signupName,
          phoneNumber: signupPhone,
        }
      );

      if (error) {
        setErrorMsg(error);
        setLoading(false);
        return;
      }

      if (user) {
        setSuccessMsg('Account created and signed in successfully!');
        setTimeout(() => {
          onLoginSuccess(user);
          if (onClose) onClose();
        }, 500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!resetEmail.trim()) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await sendPasswordResetEmail(resetEmail);
      if (error) {
        setErrorMsg(error);
      } else {
        setSuccessMsg('Password reset instructions have been sent to your email.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setLoginEmail('raghava.solar@amaravati-epc.in');
    setLoginPassword('DemoSolarPass2026');
  };

  const handleAdminLogin = () => {
    setLoginEmail('apsiwa2018@gmail.com');
    setLoginPassword('association@123');
  };

  const containerContent = (
    <div className="w-full max-w-md bg-white rounded-3xl p-7 sm:p-8 border border-[#e0e3e6] shadow-xl space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="APSIWA"
            className="h-10 w-auto object-contain"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold tracking-widest text-[#003477] uppercase block">
                APSIWA Portal
              </span>
              {isConfigured && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#8bf69d]/20 text-[#006e2e] text-[9px] font-bold">
                  <ShieldCheck size={10} />
                  Supabase
                </span>
              )}
            </div>
            <span className="text-[13px] font-bold text-[#191c1e]">
              {mode === 'login'
                ? 'Authorized Member Sign In'
                : mode === 'signup'
                ? 'Create Member Account'
                : 'Reset Account Password'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f2f4f7] hover:bg-[#d8e2ff] text-[#003477] text-[12px] font-bold transition-all cursor-pointer border border-[#e0e3e6] shadow-2xs active:scale-95"
              title="Skip and continue to portal"
            >
              <span>Skip Now</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </button>
          )}

          {isModal && onClose && !onSkip && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#f2f4f7] hover:bg-[#e0e3e6] flex items-center justify-center text-[#434752] transition-colors cursor-pointer"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      {mode !== 'reset' && (
        <div className="flex rounded-xl bg-[#f2f4f7] p-1 border border-[#e0e3e6]">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-[#003477] shadow-xs'
                : 'text-[#434752] hover:text-[#191c1e]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-[#003477] shadow-xs'
                : 'text-[#434752] hover:text-[#191c1e]'
            }`}
          >
            Sign Up
          </button>
        </div>
      )}

      {/* Error & Success Messages */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-[#ffdad6] border border-[#ffb4ab] text-[#ba1a1a] text-[12px] flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-xl bg-[#8bf69d]/30 border border-[#006e2e]/30 text-[#006e2e] text-[12px] flex items-center gap-2 font-semibold">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* LOGIN FORM: EMAIL AND PASSWORD */}
      {mode === 'login' && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-[#191c1e] mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 text-[#737783]" size={18} />
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-[#191c1e] text-[13px] focus:bg-white focus:border-[#003477] focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[12px] font-semibold text-[#191c1e]">
                Password *
              </label>
              <button
                type="button"
                onClick={() => {
                  setResetEmail(loginEmail);
                  setMode('reset');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-[11px] text-[#003477] font-semibold hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 text-[#737783]" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-[#191c1e] text-[13px] focus:bg-white focus:border-[#003477] focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-[#737783] hover:text-[#191c1e] cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#024aa3] hover:bg-[#003477] text-white text-[14px] font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-75"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In to APSIWA</span>
            )}
          </button>

          {/* Quick Demo / Admin Helper */}
          <div className="pt-2 border-t border-[#e0e3e6] flex flex-col items-center gap-2">
            <div className="flex items-center gap-3 text-[11.5px]">
              <button
                type="button"
                onClick={handleAdminLogin}
                className="text-[#003477] font-bold hover:underline cursor-pointer flex items-center gap-1 bg-[#f2f4f7] px-2.5 py-1 rounded-lg border border-[#c4c6cf]/50"
              >
                <ShieldCheck size={13} className="text-[#003477]" />
                <span>Admin Login</span>
              </button>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="text-[#737783] hover:text-[#003477] font-medium hover:underline cursor-pointer px-2 py-1"
              >
                Member Demo
              </button>
            </div>
            <p className="text-[11px] text-[#737783] text-center">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg('');
                }}
                className="text-[#003477] font-bold hover:underline cursor-pointer"
              >
                Sign Up here
              </button>
            </p>
          </div>
        </form>
      )}

      {/* SIGNUP FORM: NAME, PHONE NUMBER, EMAIL, PASSWORD */}
      {mode === 'signup' && (
        <form onSubmit={handleSignup} className="space-y-3.5">
          <div>
            <label className="block text-[12px] font-semibold text-[#191c1e] mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 text-[#737783]" size={18} />
              <input
                type="text"
                required
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="e.g. Er. K. Ramesh Varma"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-[#191c1e] text-[13px] focus:bg-white focus:border-[#003477] focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#191c1e] mb-1">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 text-[#737783]" size={18} />
              <input
                type="tel"
                required
                value={signupPhone}
                onChange={(e) => setSignupPhone(e.target.value)}
                placeholder="+91 98480 32190"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-[#191c1e] text-[13px] focus:bg-white focus:border-[#003477] focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#191c1e] mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 text-[#737783]" size={18} />
              <input
                type="email"
                required
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="official@domain.com"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-[#191c1e] text-[13px] focus:bg-white focus:border-[#003477] focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#191c1e] mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 text-[#737783]" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-11 pr-11 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-[#191c1e] text-[13px] focus:bg-white focus:border-[#003477] focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-[#737783] hover:text-[#191c1e] cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#006e2e] hover:bg-[#005322] text-white text-[14px] font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-75"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create APSIWA Account</span>
            )}
          </button>

          <div className="pt-2 border-t border-[#e0e3e6] text-center">
            <p className="text-[11px] text-[#737783]">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                }}
                className="text-[#003477] font-bold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          </div>
        </form>
      )}

      {/* PASSWORD RESET FORM */}
      {mode === 'reset' && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="p-3 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-[12px] text-[#434752] leading-relaxed">
            Enter your email address to receive a secure password reset link directly from Supabase.
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#191c1e] mb-1.5">
              Registered Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 text-[#737783]" size={18} />
              <input
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-[#191c1e] text-[13px] focus:bg-white focus:border-[#003477] focus:outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#003477] hover:bg-[#024aa3] text-white text-[14px] font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-75"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                <span>Sending Link...</span>
              </>
            ) : (
              <>
                <KeyRound size={16} />
                <span>Send Reset Link</span>
              </>
            )}
          </button>

          <div className="pt-2 border-t border-[#e0e3e6] text-center">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="text-[12px] text-[#003477] font-bold hover:underline cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        </form>
      )}

      {/* Security & Terms */}
      <div className="pt-1 text-center">
        <p className="text-[10.5px] text-[#737783] leading-normal">
          By continuing, you agree to the APSIWA Code of Conduct and Institutional Portal Terms.
        </p>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
        {containerContent}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center p-4">
      {containerContent}
    </div>
  );
};
