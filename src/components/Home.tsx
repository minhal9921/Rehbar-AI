import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { getGenerativeModel } from "firebase/ai";
import { db, vertexAI } from "../firebase";
import { useAuth } from "../AuthContext";
import { useToast } from "../ToastContext";
import {
  Plus,
  Search,
  MessageSquare,
  FolderClosed,
  LayoutGrid,
  Code2,
  Archive,
  Paperclip,
  ChevronDown,
  LogOut,
  LineChart,
  Pencil,
  GraduationCap,
  Briefcase,
  PanelLeft,
  ChevronRight,
  Settings,
  Globe,
  HelpCircle,
  ArrowUpCircle,
  Download,
  Gift,
  Info,
  Send,
  X,
  ArrowUp,
  Compass,
  Users,
  TrendingUp,
  Map,
  Star,
  Activity,
  Shield,
  Lightbulb,
  Presentation,
  Zap,
  Target,
  Brain,
  Monitor,
  Award,
  BookOpen
} from "lucide-react";
import Layout from "./Layout";
import LoadingPage from "./LoadingPage";

const GREETING_WORDS = ["Shape Your Future", "Discover Your Path", "Build Your Career", "Unlock Your Potential", "Plan Your Success"];

const ALL_QUICK_ACTIONS = [
  { icon: Compass, label: "Tech Career Pivot", prompt: "I'm currently working in a non-tech role but I'm highly motivated to transition into the tech industry within the next year. I have strong communication skills and basic knowledge of Python. What are the best strategies, specific entry-level roles I should target, and how should I position my past experience to appeal to tech recruiters?" },
  { icon: Pencil, label: "Resume Review", prompt: "Can you help me comprehensively review and optimize my current resume? I want it to strongly stand out for competitive tech positions, specifically in full-stack development. I need advice on action verbs, highlighting impact over responsibilities, and formatting tips that successfully bypass modern ATS screening systems." },
  { icon: Users, label: "Interview Prep", prompt: "I have a crucial behavioral and technical interview coming up next week for a mid-level engineering role. Can we do a comprehensive mock interview session? I'd like to practice common STAR method questions, discuss how to handle difficult technical roadblocks, and strategize on the best questions to ask the interviewers at the end." },
  { icon: LineChart, label: "Skill Gap Analysis", prompt: "Based on the current trends in the software engineering job market, what are the most in-demand technical and soft skills that I might be missing? I want to future-proof my career for the next 5 years, particularly concerning cloud architecture and AI integration. How can I efficiently bridge these gaps?" },
  { icon: Briefcase, label: "Freelancing Guide", prompt: "I want to transition from a full-time corporate role into full-time freelancing. How do I effectively build a compelling portfolio from scratch, price my services competitively without underselling myself, and consistently land high-paying clients on platforms like Upwork or through direct cold outreach?" },
  { icon: GraduationCap, label: "Master's vs Job", prompt: "I am currently at a crossroads: should I pursue a Master's degree in Computer Science immediately after graduation, or should I enter the workforce to gain practical industry experience first? Please help me weigh the long-term financial, educational, and career progression pros and cons of both options." },
  { icon: TrendingUp, label: "Salary Negotiation", prompt: "I just received a very promising job offer, but the base compensation is slightly below my expectations. How can I politely, professionally, and effectively negotiate a higher salary or better equity package? Please provide me with a strategic script and tell me what specific leverage points I should focus on." },
  { icon: LayoutGrid, label: "Portfolio Building", prompt: "What are the absolute key elements of a standout, modern developer portfolio? I want to showcase my frontend and backend capabilities effectively. What specific types of complex projects should I build and feature to immediately grab a hiring manager's attention and demonstrate real-world problem-solving skills?" },
  { icon: Globe, label: "Networking Strategies", prompt: "I struggle with reaching out to strangers, but I know networking is crucial. How can I effectively and authentically network on LinkedIn, attend local industry events, and conduct informational interviews to uncover hidden job opportunities without coming across as overly transactional or pushy?" },
  { icon: Brain, label: "AI Industry Trends", prompt: "How is the rapid advancement of Artificial Intelligence and Machine Learning changing the global job landscape? I want to understand which specific roles are at risk of automation, and which new roles are emerging as the most lucrative and future-proof over the next decade." },
  { icon: Monitor, label: "Remote Work Tips", prompt: "I've just accepted my first fully remote position. What are the absolute best practices for succeeding, staying highly productive, and maintaining a healthy work-life balance? Furthermore, how can I ensure I remain visible to management and stand out for promotions when I'm not physically in the office?" },
  { icon: Award, label: "Leadership Roles", prompt: "I have been working as a senior individual contributor for several years and I'm ready to transition into an engineering management role. What specific leadership skills do I need to develop, and how can I proactively demonstrate to my current managers that I am ready to lead a team successfully?" },
  { icon: Map, label: "Switching Majors", prompt: "I'm currently midway through my university degree but I am seriously considering switching my major to something entirely different. How do I objectively evaluate if this is the right long-term choice? Please help me analyze the potential impact on my graduation timeline, student debt, and future job prospects." },
  { icon: Star, label: "Certifications", prompt: "With so many online courses and bootcamps available, which professional certifications actually hold significant weight and prestige with top-tier employers in the tech industry today? I am particularly interested in cloud computing (AWS/GCP) and cybersecurity certifications that yield the highest return on investment." },
  { icon: Activity, label: "Burnout Recovery", prompt: "I've been feeling incredibly burned out, exhausted, and unmotivated from juggling a demanding full-time job and rigorous evening studies. What are proven, actionable strategies I can implement immediately to recover my mental health, regain my focus, and maintain a sustainable pace without completely derailing my career trajectory?" },
  { icon: Shield, label: "Startup vs Corporate", prompt: "I currently have two very different job offers: one from an early-stage, fast-paced startup and another from a massive, established corporate tech giant. Can you break down the detailed pros and cons of each regarding job security, learning opportunities, work-life balance, and long-term financial upside?" },
  { icon: Lightbulb, label: "Finding Mentors", prompt: "I understand the immense value of having an experienced mentor, but I don't know where to start. How do I identify potential mentors in my specific industry, what is the most respectful and effective way to cold-reach out to them, and how do I structure the relationship so it provides mutual value?" },
  { icon: Presentation, label: "Personal Branding", prompt: "I want to intentionally build a strong, recognizable personal brand online to organically attract recruiters, speaking opportunities, and high-quality career prospects. What platforms should I focus on, what type of content should I consistently share, and how do I uniquely position myself as an authority in my niche?" },
  { icon: Zap, label: "Time Management", prompt: "I am struggling to balance a highly demanding full-time job, my personal life, and my goals to upskill and build side projects. What are the most highly effective, scientifically-backed time management techniques and productivity frameworks I can adopt to get more deep work done without burning out?" },
  { icon: Target, label: "Goal Setting", prompt: "I feel like my career is stagnating and I lack clear direction. Can you help me create a highly structured, actionable 5-year career roadmap? I want to define specific, measurable milestones for my technical skills, leadership abilities, and salary growth to ensure I stay aggressively on track." }
];

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [eduOpen, setEduOpen] = useState(false);
  const [education, setEducation] = useState("");
  const [grades, setGrades] = useState("");
  const [hobbies, setHobbies] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const navigate = useNavigate();
  const { user, sendVerificationEmail } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check for verification cooldown on mount
  useEffect(() => {
    if (!user || user.emailVerified) return;

    const checkVerificationCooldown = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.lastVerificationSent) {
            const lastSent = data.lastVerificationSent.toDate();
            const now = new Date();
            const diffInMs = now.getTime() - lastSent.getTime();
            const diffInHours = diffInMs / (1000 * 60 * 60);

            if (diffInHours < 24) {
              setVerificationSent(true);
            }
          }
        }
      } catch (error) {
        console.error("Error checking verification cooldown:", error);
      }
    };

    checkVerificationCooldown();
  }, [user]);

  // Auto-resize textarea when prompt changes or window resizes
  useEffect(() => {
    const adjustHeight = () => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        const newHeight = Math.min(textareaRef.current.scrollHeight, 168);
        textareaRef.current.style.height = newHeight + 'px';
        textareaRef.current.style.overflowY = textareaRef.current.scrollHeight > 168 ? 'auto' : 'hidden';
      }
    };

    adjustHeight();
    window.addEventListener('resize', adjustHeight);

    return () => {
      window.removeEventListener('resize', adjustHeight);
    };
  }, [prompt]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearInterval(typingTimeoutRef.current);
    };
  }, []);

  // Click away listener for education dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const eduContainer = document.getElementById("edu-dropdown-container");
      if (eduContainer && !eduContainer.contains(event.target as Node)) {
        setEduOpen(false);
      }
    };

    if (eduOpen) {
      window.addEventListener("click", handleClickOutside);
    }
    return () => window.removeEventListener("click", handleClickOutside);
  }, [eduOpen]);

  const MAX_TOTAL_SIZE = 5 * 1024 * 1024; // 5MB

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const allFiles = [...attachedFiles, ...files];
    const totalSize = allFiles.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      alert("Total file size must be under 5MB.");
      return;
    }
    setAttachedFiles(allFiles);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const isEmailVerified = user?.emailVerified;

  const handleVerifyEmail = async () => {
    try {
      await sendVerificationEmail();
      setVerificationSent(true);
      showToast("Verification email sent! Please check your inbox and spam folder. Note: You can only resend this once every 24 hours.", "success");
    } catch (error) {
      console.error("Error sending verification email", error);
      showToast("Failed to send verification email.", "error");
    }
  };

  // Validation: Only prompt and educationLevel are required as per request
  const isSendDisabled = !isEmailVerified || !prompt.trim() || !education || isSending;

  const generateTitle = async (userPrompt: string): Promise<string> => {
    try {
      const model = getGenerativeModel(vertexAI, {
        model: "gemini-2.5-flash-lite", // Using Gemini 2.5 Flash Lite for name generation
      });

      const result = await model.generateContent(`Suggest a very short (2-3 words) professional name for a chat that starts with this prompt: "${userPrompt}". Respond with ONLY the title, no quotes or extra text.`);
      const title = result.response.text()?.trim();
      return title || (userPrompt.slice(0, 30) + "...");
    } catch (err) {
      console.error("Title generation error:", err);
      return userPrompt.slice(0, 30) + "...";
    }
  };

  const handleSend = async () => {
    if (isSendDisabled || !user || isSending) return;

    setIsSending(true);
    try {
      // Step 1: Generate AI Title using Gemma 1B
      const aiTitle = await generateTitle(prompt);

      // Step 2: Create Chat Document
      const docRef = await addDoc(collection(db, "chats"), {
        userId: user.uid,
        title: aiTitle,
        education,
        grades,
        lastMessage: prompt,
        isPinned: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Step 3: Save first message
      await addDoc(collection(db, "chats", docRef.id, "messages"), {
        text: prompt,
        sender: "user",
        createdAt: serverTimestamp(),
      });

      // Step 4: Navigate
      navigate(`/chat/${docRef.id}`, {
        state: {
          userPrompt: prompt,
          educationLevel: education,
          grades: grades,
          hobbies: hobbies || "None specified"
        }
      });
    } catch (error) {
      console.error("Error creating chat:", error);
      setIsSending(false);
    }
  };

  const quickActions = useMemo(() => {
    const shuffled = [...ALL_QUICK_ACTIONS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  }, []);

  const handleQuickActionClick = (fullPrompt: string) => {
    if (typingTimeoutRef.current) {
      clearInterval(typingTimeoutRef.current);
    }
    setPrompt("");
    let i = 0;
    typingTimeoutRef.current = setInterval(() => {
      setPrompt(prev => {
        const nextPrompt = fullPrompt.substring(0, i + 1);
        return nextPrompt;
      });
      i++;
      if (i >= fullPrompt.length) {
        if (typingTimeoutRef.current) clearInterval(typingTimeoutRef.current);
      }
    }, 15); // Adjust speed here
  };

  return (
    <Layout>
      {/* Email Verification Toast */}
      {!isEmailVerified && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-8 md:bottom-auto top-auto md:top-8 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] sm:w-max z-[100] bg-[#1F1F1E] text-white px-4 md:px-5 py-3 md:py-2 rounded-2xl flex items-center justify-between gap-3 md:gap-4 shadow-xl border border-white/10"
        >
          <span className="text-[13px] md:text-[14px] font-medium leading-snug">Please verify your email to continue.</span>
          <button
            onClick={handleVerifyEmail}
            disabled={verificationSent}
            className="shrink-0 bg-[#F8F8F6] text-black px-4 py-1.5 rounded-xl text-[12px] md:text-[13px] font-semibold hover:bg-white transition-colors disabled:opacity-50"
          >
            {verificationSent ? "Sent!" : "Verify"}
          </button>
        </motion.div>
      )}

      {/* Center content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-[42px] font-medium tracking-tight font-serif flex items-center justify-center gap-3 text-[#373734]">
            <HomeTypewriter words={GREETING_WORDS} />
          </h1>
        </motion.div>

        {/* Chat Input Box */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="w-full max-w-[680px]"
        >
          <div className="bg-white rounded-3xl border border-black/[0.08] shadow-[0_1px_6px_rgba(0,0,0,0.04)] transition-all focus-within:border-black/[0.14] focus-within:shadow-[0_2px_12px_rgba(0,0,0,0.07)] relative">
            <div className="px-5 pt-4 pb-1">
              <textarea
                ref={textareaRef}
                placeholder="What career path should I explore after my studies?"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={!isEmailVerified}
                className="w-full bg-transparent border-none focus:ring-0 focus:outline-none p-0 text-[16px] font-[430] font-sans resize-none min-h-[28px] max-h-[168px] overflow-hidden placeholder:text-black/35 leading-relaxed sleek-scroll disabled:opacity-50 disabled:cursor-not-allowed"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (!isSendDisabled) handleSend();
                  }
                }}
              />
              {/* Attached files preview */}
              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {attachedFiles.map((file, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-black/[0.04] rounded-lg px-2.5 py-1 text-[11px] text-black/60">
                      <Paperclip size={11} className="shrink-0" />
                      <span className="truncate max-w-[120px]">{file.name}</span>
                      <button onClick={() => removeFile(i)} className="text-black/30 hover:text-black/60 transition-colors">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="px-3 py-2 flex flex-wrap md:flex-nowrap items-center justify-between gap-y-2 gap-x-2">
              {/* Education & Grades (Top row on mobile, Left on desktop) */}
              <div className="flex items-center gap-2 shrink-0 py-0.5">
                {/* Custom Education Dropdown */}
                <div className="relative shrink-0" id="edu-dropdown-container">
                  <button
                    disabled={!isEmailVerified}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEduOpen(!eduOpen);
                    }}
                    className="flex items-center gap-2 bg-black/[0.03] border border-black/20 rounded-lg text-[12px] font-medium pl-3 pr-2 py-1.5 hover:bg-black/[0.06] transition-colors text-black/60 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className={!education ? "text-black/30" : ""}>{education || "Education"}</span>
                    <ChevronDown size={12} className="text-black/30" />
                  </button>

                  {eduOpen && (
                    <div
                      className="absolute top-full mt-2 left-0 w-40 bg-white rounded-xl py-1.5 z-[9999]"
                      style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.06)" }}
                    >
                      {["10th Grade", "12th Grade", "Bachelor's", "Master's"].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => {
                            setEducation(opt);
                            setEduOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-[13px] font-medium text-black/60 hover:bg-black/[0.04] hover:text-black transition-colors"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Grades Input */}
                <div className="relative shrink-0 flex items-center">
                  <input
                    type="text"
                    placeholder="Grades"
                    value={grades}
                    disabled={!isEmailVerified}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^\d{0,3}(\.\d{0,2})?$/.test(val)) {
                        const num = parseFloat(val);
                        if (val === "" || num <= 100) {
                          setGrades(val);
                        }
                      }
                    }}
                    className="bg-black/[0.03] border border-black/20 rounded-lg text-[12px] font-medium pl-3 pr-6 py-1.5 focus:ring-0 focus:outline-none w-[84px] hover:bg-black/[0.06] transition-colors text-black/60 placeholder:text-black/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="absolute right-2 text-[10px] font-bold text-black/20 pointer-events-none">%</span>
                </div>
              </div>

              {/* Hobbies & Buttons (Bottom row on mobile, Right on desktop) */}
              <div className="flex items-center gap-2 w-full md:w-auto md:flex-1 justify-between py-0.5">
                <input
                  type="text"
                  placeholder="Hobbies & Interests"
                  value={hobbies}
                  disabled={!isEmailVerified}
                  onChange={(e) => setHobbies(e.target.value)}
                  className="bg-black/[0.03] border border-black/20 rounded-lg text-[12px] font-medium px-4 py-1.5 focus:ring-0 focus:outline-none flex-1 min-w-0 md:flex-none md:w-[170px] hover:bg-black/[0.06] transition-colors text-black/60 placeholder:text-black/30 disabled:opacity-50 disabled:cursor-not-allowed"
                />

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileAttach}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 rounded-lg hover:bg-black/[0.04] transition-colors text-black/40 hover:text-black/60 shrink-0"
                    title="Attach files (max 5MB total)"
                  >
                    <Paperclip size={18} strokeWidth={2} />
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={isSendDisabled}
                    className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${isSendDisabled ? 'bg-black/[0.04] text-black/20 cursor-not-allowed' : 'bg-[#D97757] text-white hover:opacity-80'
                      }`}
                  >
                    {isSending ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <ArrowUp size={16} strokeWidth={2.5} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Action Chips */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="flex flex-wrap justify-center gap-2 mt-5"
        >
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => handleQuickActionClick(action.prompt)}
              disabled={!isEmailVerified}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-black/20 bg-white/80 text-[13px] font-medium text-black/55 hover:bg-white hover:border-black/[0.15] hover:text-black/75 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <action.icon size={14} strokeWidth={2} />
              {action.label}
            </button>
          ))}
        </motion.div>
      </div>
      {isSending && <LoadingPage />}
    </Layout>
  );
}

/* ─── Home Typewriter ─── */
export function HomeTypewriter({ words }: { words: string[] }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    const currentWord = words[wordIndex];

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
          setWordIndex(prev => (prev + 1) % words.length);
        }
      }
    }, isDeleting ? 30 : 60);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, wordIndex, words]);

  const currentWord = words[wordIndex];
  const lastSpaceInFull = currentWord.lastIndexOf(" ");
  const colorStart = lastSpaceInFull + 1;

  return (
    <span>
      {displayText.length <= colorStart ? (
        displayText
      ) : (
        <>
          {displayText.slice(0, colorStart)}
          <span className="text-[#D97757]">{displayText.slice(colorStart)}</span>
        </>
      )}
      <span className="animate-pulse text-[#D97757]">|</span>
    </span>
  );
}
