import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // 2 second total duration: progress updates smoothly
    const intervalTime = 40; // 40ms * 50 ticks = 2000ms
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 2;
      });
    }, intervalTime);

    // Trigger fade-out shortly before 2s
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 1800);

    // Call onFinish at 2000ms
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 2000);

    return () => {
      clearInterval(timer);
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#001d4a] text-white select-none transition-opacity duration-300 ease-out ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Decorative Radial Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(2,74,163,0.35)_0%,rgba(0,29,74,0.95)_70%)] pointer-events-none" />

      {/* Main Logo & Emblem Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg space-y-6 animate-in fade-in zoom-in-95 duration-500">
        {/* Emblem Container with Solar Halo */}
        <div className="relative">
          <div className="absolute -inset-3 rounded-full bg-gradient-to-tr from-[#ffbe3b]/30 to-[#8ef9a0]/20 blur-lg animate-pulse" />
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white p-3 shadow-2xl flex items-center justify-center border-2 border-white/20">
            <img
              src="https://lh3.googleusercontent.com/aida/AEtjO1XtZkjiEfKiqomreBUaiGljqTkyNgi1FUkOKJ3HvrCFYW8jYu8s7SUfAaG_WWw1VyG9kMbiZYBFjTbThj1g23WGqAkfylwD0MzfiMx2scfOtl_9YCFQzWF49omfwDGWJLCRAcjX99Jhbi1k8hQC5aG4ZRZ9o2CYYASYm1smUcxiC_FvrnMSfYE1H3_ZOdLP6sTUBjgaUTVNLcNGHLUFkzc5aCOd771sc1SKjEmXcbNyjyFgIn_OkJJwzUs3"
              alt="APSIWA Official Emblem"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Association Branding */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#ffbe3b] text-[11px] font-bold uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-[#8ef9a0] animate-ping" />
            Government Recognized Association
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
            APSIWA
          </h1>
          <p className="text-[13px] sm:text-[14px] text-white/80 font-medium leading-relaxed max-w-md">
            Andhra Pradesh Solar Integrators Welfare Association
          </p>
          <p className="text-[11px] text-white/50 tracking-wider uppercase font-semibold">
            State Consortium of Certified Solar Integrators &amp; EPCs
          </p>
        </div>

        {/* Loading Progress Bar (2 Seconds Indicator) */}
        <div className="w-56 sm:w-64 space-y-2 pt-2">
          <div className="w-full h-1.5 bg-white/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#ffbe3b] via-[#8ef9a0] to-[#024aa3] rounded-full transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-white/60 font-mono">
            <span>Loading Portal...</span>
            <span>{Math.min(100, Math.round(progress))}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
