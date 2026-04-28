import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, ArrowLeft, Chrome, Eye, EyeOff } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { HomeTypewriter } from "./Home";
import { useAuth } from "../AuthContext";
import { useToast } from "../ToastContext";
import LoadingPage from "./LoadingPage";


interface AuthProps {
  onBack: () => void;
  initialMode?: "login" | "signup";
}

export default function Auth({ onBack, initialMode = "login" }: AuthProps) {
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loginWithGoogle, loginWithEmail, signUpWithEmail } = useAuth();

  useEffect(() => {
    if (user) {
      const from = (location.state as any)?.from?.pathname || "/home";
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      showToast("Welcome back to Rehbar AI");
    } catch (err: any) {
      showToast("Google sign-in failed", "error");
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await loginWithEmail(email, password);
        showToast("Welcome back to Rehbar AI");
      } else {
        await signUpWithEmail(email, password, firstName, lastName);
        showToast("Your account is ready");
      }
    } catch (err: any) {
      setLoading(false);
      console.error("Auth Error:", err.code, err.message);
      let msg = "Authentication failed";
      
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        msg = "Invalid email or password";
      } else if (err.code === "auth/email-already-in-use") {
        msg = "Email already in use";
      } else if (err.code === "auth/weak-password") {
        msg = "Password is too weak";
      } else if (err.code === "auth/too-many-requests") {
        msg = "Too many attempts. Wait.";
      } else if (err.code === "auth/network-request-failed") {
        msg = "Network connection failed";
      } else if (err.code === "auth/operation-not-allowed") {
        msg = "Email login not enabled";
      } else {
        msg = "An authentication error occurred";
      }
      
      showToast(msg, "error");
    }
  };

  return (
    <div className="min-h-screen flex font-sans selection:bg-blue-100 selection:text-blue-900 bg-[#F8F8F6]">
      {/* Left Column: Form Container */}
      <div className="w-full lg:w-1/2 flex flex-col relative min-h-screen">
        {/* Back Button */}
        <div className="absolute top-8 left-8">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-[#d97757] text-white rounded-xl text-sm font-medium hover:opacity-90 shadow-sm shadow-[#d97757]/20 transition-all"
          >
            <ArrowLeft size={16} /> Back to home
          </button>
        </div>

        <div className="m-auto w-full max-w-[400px] space-y-6 py-24 px-4">
          {/* Logo & Headings: Centered outside the container */}
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <img src="/app-icon.svg" alt="Rehbar AI Logo" className="w-8 h-8 object-contain" />
              <div className="text-xl font-medium tracking-tight font-serif">Rehbar AI</div>
            </div>
            <div className="space-y-2">
              <AnimatePresence mode="wait">
                <motion.h1 
                  key={isLogin ? 'login' : 'signup'}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="text-4xl font-medium tracking-tight font-serif"
                >
                  {isLogin ? "Welcome back" : "Create account"}
                </motion.h1>
              </AnimatePresence>
              <p className="text-black/50 text-sm font-sans italic">
                {isLogin 
                  ? "Continue your career journey." 
                  : "Join students building their future."}
              </p>
            </div>
          </div>

          {/* Form Container */}
          <div className="space-y-6">
            <div className="bg-brand-bg border border-black/20 shadow-[0_0_50px_-12px_rgba(0,0,0,0.1)] rounded-[2.5rem] p-8 md:p-10 space-y-6">
              <div className="space-y-4">
                {/* Social Button */}
                <button 
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-brand-bg border border-black/20 rounded-xl font-medium hover:bg-black/5 transition-all text-base"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-black/5"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-brand-bg px-3 text-black/40 font-sans tracking-widest">or</span>
                  </div>
                </div>

                {/* Form Fields Container */}
                <form 
                  onSubmit={handleEmailSubmit}
                  className="space-y-3"
                >
                  {!isLogin && (
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="w-1/2 px-5 py-2.5 rounded-xl border border-black/20 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black/20 transition-all bg-white text-base"
                      />
                      <input 
                        type="text" 
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className="w-1/2 px-5 py-2.5 rounded-xl border border-black/20 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black/20 transition-all bg-white text-base"
                      />
                    </div>
                  )}
                  <input 
                    type="email" 
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-5 py-2.5 rounded-xl border border-black/20 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black/20 transition-all bg-white text-base"
                  />
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-5 py-2.5 rounded-xl border border-black/20 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black/20 transition-all bg-white text-base pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/60 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  
                  {/* Submit Button */}
                  <button 
                    type="submit"
                    className="w-full bg-black text-white py-2.5 rounded-xl font-medium hover:bg-black/80 transition-standard shadow-lg shadow-black/5 flex items-center justify-center gap-2 text-base text-center mt-4"
                  >
                    <Mail size={18} />
                    {isLogin ? "Sign in" : "Sign up"}
                  </button>
                  <p className="text-[10px] text-center text-black/40 font-sans mt-4 px-4 leading-relaxed">
                    By continuing, you agree to our <button type="button" onClick={() => navigate("/terms")} className="underline hover:text-black transition-colors">Terms of Service</button> and <button type="button" onClick={() => navigate("/privacy")} className="underline hover:text-black transition-colors">Privacy Policy</button>.
                  </p>
                </form>
              </div>
            </div>

            {/* Toggle Link: Outside the container card */}
            <div className="text-center">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-xs font-medium text-black/60 transition-colors"
              >
                {isLogin ? (
                  <>Don't have an account? <span className="hover:underline text-black font-semibold">Sign up</span></>
                ) : (
                  <>Already have an account? <span className="hover:underline text-black font-semibold">Log in</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Content Container */}
      <div className="hidden lg:block lg:w-1/2 sticky top-4 h-[calc(100vh-2rem)] overflow-hidden m-4 rounded-[2.5rem] bg-black">
        <div className="absolute inset-0 flex flex-col justify-center items-center p-20 text-center space-y-6">
          <h2 className="text-4xl md:text-5xl text-white font-serif font-medium leading-tight tracking-tight">
            <HomeTypewriter words={["Unlock Your Potential", "Discover Your Path", "Build Your Career"]} />
          </h2>
        </div>
      </div>
      
      {loading && <LoadingPage />}
    </div>
  );
}
