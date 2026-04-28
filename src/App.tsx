import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, BookOpen, BrainCircuit, LineChart, Mail, Plus, Minus } from "lucide-react";
import { ReactNode, useState, useEffect, useCallback } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import Auth from "./components/Auth";
import Home from "./components/Home";
import Chat from "./components/Chat";
import Features from "./components/Features";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider, useAuth } from "./AuthContext";
import { ToastProvider } from "./ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatsPage from "./components/ChatsPage";
import TrashPage from "./components/TrashPage";
import SettingsPage from "./components/SettingsPage";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfService from "./components/TermsOfService";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      <ToastProvider>
        <ScrollToTop />
        <AnimatePresence mode="wait">
        <motion.div 
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Routes location={location}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/chat/:chatId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/chats" element={<ProtectedRoute><ChatsPage /></ProtectedRoute>} />
            <Route path="/trash" element={<ProtectedRoute><TrashPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/features" element={<Features />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
          </Routes>
        </motion.div>
        </AnimatePresence>
      </ToastProvider>
    </AuthProvider>
  );
}

const TYPEWRITER_WORDS = ["Dream Path", "Dream Career", "Right Direction", "Perfect Future", "Best Journey"];

function TypewriterWord() {
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    const currentWord = TYPEWRITER_WORDS[wordIndex];

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(currentWord.slice(0, charIndex + 1));
        setCharIndex(prev => prev + 1);

        if (charIndex + 1 === currentWord.length) {
          setTimeout(() => setIsDeleting(true), 1500);
        }
      } else {
        setDisplayText(currentWord.slice(0, charIndex - 1));
        setCharIndex(prev => prev - 1);

        if (charIndex - 1 === 0) {
          setIsDeleting(false);
          setWordIndex(prev => (prev + 1) % TYPEWRITER_WORDS.length);
        }
      }
    }, isDeleting ? 30 : 60);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, wordIndex]);

  return (
    <>
      {displayText}
      <span className="animate-pulse">|</span>
    </>
  );
}

function LandingPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  if (user && !loading) {
    return <Navigate to="/home" replace />;
  }
  const fadeIn = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  } as const;

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen selection:bg-blue-100 selection:text-blue-900 font-sans scroll-smooth bg-[#F8F8F6]"
    >
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-24 md:pt-24 md:pb-32 text-center">
        <motion.div {...fadeIn}>
          <h1 className="text-5xl md:text-7xl font-medium tracking-tight mb-8 font-serif">
            <span>Find Your </span>
            <span className="text-[#d97757] inline-block min-w-[280px] md:min-w-[420px] text-left">
              <TypewriterWord />
            </span>
            <br />
            <span>with </span>
            <span>Rehbar AI.</span>
          </h1>
          <p className="text-xl md:text-2xl text-black/70 max-w-2xl mx-auto mb-12 leading-relaxed">
            The intelligent career counselor for students worldwide. 
            Discover the right degrees, skills, and future-proof your career in 2026.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate("/auth", { state: { mode: "signup" } })}
              className="px-8 py-3 bg-[#111111] text-white rounded-xl font-medium text-lg hover:bg-black/90 transition-all w-full sm:w-auto"
            >
              I am in 10th/12th Grade
            </button>
            <button 
              onClick={() => navigate("/auth", { state: { mode: "signup" } })}
              className="px-8 py-3 bg-white border border-black/20 rounded-xl font-medium text-lg hover:bg-black/5 hover:border-black/40 transition-all w-full sm:w-auto font-sans"
            >
              I am in College/University
            </button>
          </div>
        </motion.div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-24 space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-medium font-serif">How It Works</h2>
          <div className="h-px w-12 bg-black mx-auto opacity-20"></div>
        </div>
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-12"
        >
          <Step 
            number="01" 
            title="Tell us your skills and marks" 
            desc="Our system contextually understands your academic background and natural talent."
          />
          <Step 
            number="02" 
            title="AI analyzes global job markets" 
            desc="We cross-reference your profile with emerging industries and international industry shifts."
          />
          <Step 
            number="03" 
            title="Get a personalized roadmap" 
            desc="Receive a step-by-step guide to the right universities, certifications, and skills."
          />
        </motion.div>
      </section>

      {/* Why Now? Statistics Section */}
      <section id="statistics" className="max-w-6xl mx-auto px-6 py-24 border-t border-black/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
          <div className="space-y-4">
            <div className="text-6xl font-medium font-serif">65%</div>
            <p className="text-black/50 font-sans max-w-[200px] mx-auto">of students regret their degree choice. Don't be one of them.</p>
          </div>
          <div className="space-y-4">
            <div className="text-6xl font-medium font-serif">2026</div>
            <p className="text-black/50 font-sans max-w-[200px] mx-auto">The year AI shifts the job market. Are your skills ready?</p>
          </div>
          <div className="space-y-4">
            <div className="text-6xl font-medium font-serif">10,000+</div>
            <p className="text-black/50 font-sans max-w-[200px] mx-auto">Career paths analyzed by our AI.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="bg-white py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6 space-y-16">
          <h2 className="text-4xl font-medium tracking-tight font-serif text-center">Hear from Students Like You</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="I was totally confused about my major. Rehbar AI suggested a pivot to Data Analytics based on global trends, and it completely changed my perspective."
              author="Alex"
              location="London"
            />
            <TestimonialCard 
              quote="The university roadmap it generated for my CS degree showed me exactly which AI skills I need to learn this year to stay competitive internationally."
              author="Sarah"
              location="New York"
            />
            <TestimonialCard 
              quote="A true mentor. It explained complex market trends in simple words and gave me a step-by-step plan for a remote career."
              author="Wei"
              location="Singapore"
            />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="max-w-4xl mx-auto px-6 py-24 md:py-32 text-center space-y-8">
        <h2 className="text-5xl md:text-6xl font-medium tracking-tight font-serif">Ready to take control of your future?</h2>
        <p className="text-xl text-black/50 font-sans max-w-2xl mx-auto">
          Join Rehbar AI today and get your personalized career roadmap for free.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button 
            onClick={() => navigate("/auth", { state: { mode: "signup" } })}
            className="px-8 py-3 bg-[#111111] text-white rounded-xl font-medium text-lg hover:bg-black/90 transition-all w-full sm:w-auto font-sans"
          >
            Start my Roadmap
          </button>
          <button 
            onClick={() => navigate("/features")}
            className="px-8 py-3 bg-white border border-black/10 rounded-xl font-medium text-lg hover:bg-black/5 transition-all w-full sm:w-auto font-sans"
          >
            Explore Features
          </button>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-24 md:py-32 space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-medium tracking-tight font-serif">Frequently Asked Questions</h2>
          <p className="text-black/50 text-lg font-sans">Everything you need to know about Rehbar AI</p>
        </div>
        <div className="divide-y divide-black/5 border-t border-b border-black/5 font-sans">
          <FAQItem 
            question="Is Rehbar AI free to use?"
            answer="Yes, Rehbar AI is completely free right now! We offer our full personalized roadmap and career guidance features at no cost to help students globally. We plan to introduce optional premium features (like daily tracking and AI resume generation) in the future."
          />
          <FAQItem 
            question="Does the AI understand my local job market?"
            answer="Absolutely. Rehbar AI analyzes global economic trends and can tailor advice based on international markets, whether you are looking at opportunities in North America, Europe, Asia, or remotely."
          />
          <FAQItem 
            question="Which AI model powers Rehbar AI?"
            answer="We use state-of-the-art Generative AI models tailored specifically for educational and career counseling, ensuring high-quality and context-aware advice."
          />
          <FAQItem 
            question="Do I need to create an account to get my roadmap?"
            answer="Currently, you can generate your initial basic roadmap without an account. However, creating a free account allows you to save your progress and revisit your roadmap anytime."
          />
          <FAQItem 
            question="Can Rehbar AI help me if I want to switch my field of study?"
            answer="Definitely. If you are unhappy with your current degree or subjects, tell our AI about your new interests and skills, and it will provide a transition plan to pivot safely into a new career path."
          />
        </div>
      </section>

      {/* Flat Dark Footer Section */}
      <Footer />
    </motion.div>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  
  if (user && !loading) {
    return <Navigate to="/home" replace />;
  }
  
  const mode = (location.state as any)?.mode || "login";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Auth onBack={() => navigate("/")} initialMode={mode} />
    </motion.div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="py-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full justify-between items-center text-left hover:text-black/60 transition-colors group"
      >
        <span className="text-xl font-medium tracking-tight font-serif">{question}</span>
        {isOpen ? <Minus size={20} className="text-black/20" /> : <Plus size={20} className="text-black/20" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pt-4 text-black/60 leading-relaxed max-w-2xl">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Step({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <motion.div 
      variants={{
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 }
      }}
      className="space-y-4 p-8 border border-black/20 rounded-2xl bg-white shadow-sm"
    >
      <div className="text-xs font-bold tracking-widest text-black/30 uppercase font-sans">{number}</div>
      <h3 className="text-xl font-medium font-serif">{title}</h3>
      <p className="text-black/60 leading-relaxed text-sm md:text-base font-sans">{desc}</p>
    </motion.div>
  );
}

function TestimonialCard({ quote, author, location }: { quote: string; author: string; location: string }) {
  return (
    <div className="border border-gray-200 rounded-2xl p-8 space-y-6 bg-[#F8F8F6]/30">
      <p className="text-black/80 leading-relaxed font-sans italic">"{quote}"</p>
      <div className="pt-4 border-t border-black/5 flex items-center justify-between">
        <div className="font-serif font-medium">{author}</div>
        <div className="text-xs text-black/40 font-sans uppercase tracking-widest">{location}</div>
      </div>
    </div>
  );
}
