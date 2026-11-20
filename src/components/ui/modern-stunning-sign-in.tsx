"use client";

import * as React from "react";
import { useState } from "react";
import { ShieldCheck, Car, Lock, Mail, Loader2, ArrowRight } from "lucide-react";

export interface SignIn1Props {
  onSignIn?: (email: string, password: string) => Promise<void> | void;
  onGoogleSignIn?: () => Promise<void> | void;
  onSignUpClick?: () => void;
  title?: string;
  subtitle?: string;
  brandName?: string;
  isLoading?: boolean;
  errorMessage?: string;
  className?: string;
}

const GoogleIcon = () => (
  <svg
    width="18"
    height="18"
    className="w-[18px] h-[18px] flex-shrink-0"
    viewBox="0 0 24 24"
  >
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

const AVATAR_IMAGES = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80",
];

const SignIn1: React.FC<SignIn1Props> = ({
  onSignIn,
  onGoogleSignIn,
  onSignUpClick,
  title = "DriverBee",
  subtitle = "Professional On-Demand Drivers",
  brandName = "DriverBee",
  isLoading = false,
  errorMessage,
  className = "",
}) => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");

    if (onSignIn) {
      await onSignIn(email, password);
    } else {
      alert("Sign in successful! (Demo)");
    }
  };

  const displayedError = errorMessage || error;

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-[#121212] relative overflow-hidden w-full rounded-xl py-12 px-4 ${className}`}>
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Centered glass card */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-gradient-to-r from-[#ffffff10] to-[#121212] border border-white/10 backdrop-blur-md shadow-2xl p-8 flex flex-col items-center">
        {/* Logo with Lucide Car/Shield Icon */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-neutral-950 mb-5 shadow-lg shadow-amber-500/20">
          <Car className="w-6 h-6 stroke-[2.2]" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-1 text-center tracking-tight">
          {title}
        </h2>
        <p className="text-xs text-neutral-400 mb-6 text-center font-medium">
          {subtitle}
        </p>

        {/* Form */}
        <div className="flex flex-col w-full gap-4">
          <div className="w-full flex flex-col gap-3">
            <div className="relative">
              <input
                placeholder="Email"
                type="email"
                value={email}
                className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/60 border border-white/5 transition-all"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <input
                placeholder="Password"
                type="password"
                value={password}
                className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/60 border border-white/5 transition-all"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {displayedError && (
              <div className="text-xs text-red-400 text-left font-medium px-1">
                {displayedError}
              </div>
            )}
          </div>

          <hr className="opacity-10 my-1" />

          <div>
            <button
              type="button"
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full bg-amber-400 hover:bg-amber-500 text-neutral-950 font-bold px-5 py-3 rounded-full shadow-lg shadow-amber-400/20 active:scale-[0.99] transition mb-3 text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
              ) : (
                <span>Sign in</span>
              )}
            </button>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={onGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-b from-[#232526] to-[#2d2e30] border border-white/10 rounded-full px-5 py-3 font-semibold text-white shadow hover:brightness-110 active:scale-[0.99] transition mb-2 text-sm cursor-pointer disabled:opacity-50"
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>

            <div className="w-full text-center mt-3">
              <span className="text-xs text-gray-400">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={onSignUpClick}
                  className="underline text-white/90 hover:text-white font-medium cursor-pointer transition-colors"
                >
                  Sign up, it&apos;s free!
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User count and avatars using reliable Unsplash assets */}
      <div className="relative z-10 mt-10 flex flex-col items-center text-center px-4">
        <p className="text-gray-400 text-sm mb-2.5 font-medium">
          Join <span className="font-bold text-white">10,000+</span> verified car owners who trust {brandName}.
        </p>
        <div className="flex -space-x-2">
          {AVATAR_IMAGES.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`DriverBee customer ${index + 1}`}
              className="w-8 h-8 rounded-full border-2 border-[#181824] object-cover ring-1 ring-white/10"
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export { SignIn1 };
export default SignIn1;
