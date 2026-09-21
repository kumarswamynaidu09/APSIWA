import React, { useState } from 'react';
import { UserProfile, NavTab } from '../types';
import { Eye, EyeOff, Lock, Mail, User, Phone, ArrowLeft, CheckCircle2 } from 'lucide-react';

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
  onNavigate,
  isModal = false,
  onClose,
  onSkip
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  // Login form state (strictly email and password as requested)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state (strictly name, phone number, email and password as requested)
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Check existing accounts in localStorage or fallback
      const storedUsersRaw = localStorage.getItem('apsiwa_registered_users');
      let registeredUsers: any[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];

      const existingUser = registeredUsers.find(
        (u) => u.email.toLowerCase() === loginEmail.trim().toLowerCase()
      );

      const loggedInUser: UserProfile = existingUser
        ? {
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            phoneNumber: existingUser.phoneNumber,
            membershipId: existingUser.membershipId || 'APSIWA-MEM-2026',
            joinedDate: existingUser.joinedDate || '2026'
          }
        : {
            id: `usr_${Date.now()}`,
            name: loginEmail.split('@')[0].replace(/[._-]/g, ' '),
            email: loginEmail.trim(),
            membershipId: 'APSIWA-MEM-2026',
            joinedDate: new Date().toLocaleDateString('en-IN', {
              month: 'short',
              year: 'numeric'
            })
          };

      setLoading(false);
      setSuccessMsg('Signed in successfully!');
      setTimeout(() => {
        onLoginSuccess(loggedInUser);
        if (onClose) onClose();
      }, 500);
    }, 600);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!signupName.trim() || !signupPhone.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setErrorMsg('Please provide name, phone number, email, and password.');
      return;
    }

    if (signupPassword.length < 6) {
      setErrorMsg('Password should be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const newUser: UserProfile = {
        id: `usr_${Date.now()}`,
        name: signupName.trim(),
        phoneNumber: signupPhone.trim(),
        email: signupEmail.trim().toLowerCase(),
        membershipId: `APSIWA-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        joinedDate: new Date().toLocaleDateString('en-IN', {
          month: 'short',
          year: 'numeric'
        })
      };

      // Save to localStorage for future logins
      try {
        const storedUsersRaw = localStorage.getItem('apsiwa_registered_users');
        const registeredUsers: any[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
        registeredUsers.push({
          ...newUser,
          password: signupPassword
        });
        localStorage.setItem('apsiwa_registered_users', JSON.stringify(registeredUsers));
      } catch (err) {
        console.error('Failed to save user', err);
      }

      setLoading(false);
      setSuccessMsg('Account created successfully!');
      setTimeout(() => {
        onLoginSuccess(newUser);
        if (onClose) onClose();
      }, 500);
    }, 600);
  };

  const handleDemoLogin = () => {
    setLoginEmail('raghava.solar@amaravati-epc.in');
    setLoginPassword('DemoSolarPass2026');
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
            <span className="text-[10px] font-bold tracking-widest text-[#003477] uppercase block">
              APSIWA Member Portal
            </span>
            <span className="text-[13px] font-bold text-[#191c1e]">
              {mode === 'login' ? 'Authorized Member Sign In' : 'Create Member Account'}
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

      {/* LOGIN FORM: JUST EMAIL AND PASSWORD */}
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
                onClick={() =>
                  alert('For password assistance, please contact APSIWA Secretariat at support@apsiwa.org')
                }
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

          {/* Quick Demo Helper */}
          <div className="pt-2 border-t border-[#e0e3e6] flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="text-[12px] text-[#003477] hover:underline font-semibold cursor-pointer"
            >
              Fill Demo Credentials
            </button>
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
            className="w-full py-3 rounded-xl bg-[#006e2e] hover:bg-[#005423] text-white text-[14px] font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-75"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>

          <p className="text-[11px] text-[#737783] text-center pt-2">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className="text-[#003477] font-bold hover:underline cursor-pointer"
            >
              Sign In here
            </button>
          </p>
        </form>
      )}

      {/* Skip Now Button (Prominent & Clear) */}
      {onSkip && (
        <div className="pt-3 border-t border-[#eceef1] text-center">
          <button
            type="button"
            onClick={onSkip}
            className="w-full py-2.5 px-4 rounded-xl bg-[#f2f4f7] hover:bg-[#e0e3e6] text-[#003477] text-[13px] font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border border-[#e0e3e6]"
          >
            <span>Skip Now &amp; Explore Portal</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      )}
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
    <div className="w-full min-h-screen bg-radial from-[#ffffff] via-[#f7f9fc] to-[#edf1f7] py-10 px-4 flex flex-col items-center justify-center relative">
      {/* Top action bar when viewed full screen */}
      <div className="w-full max-w-md flex items-center justify-between mb-4">
        {onNavigate ? (
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#003477] hover:underline cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Portal Home</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#006e2e]"></span>
            <span className="text-[11px] font-bold text-[#003477] uppercase tracking-wider">
              APSIWA Andhra Pradesh
            </span>
          </div>
        )}

        {onSkip && (
          <button
            onClick={onSkip}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#eceef1] text-[#003477] text-[13px] font-bold border border-[#e0e3e6] shadow-2xs transition-all cursor-pointer active:scale-95"
          >
            <span>Skip Now</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        )}
      </div>

      {containerContent}
    </div>
  );
};
