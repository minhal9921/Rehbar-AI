import React from "react";
import { motion } from "motion/react";
import { Mic, FileText, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Features() {
  const navigate = useNavigate();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: [0.21, 0.45, 0.32, 0.9] }
  } as const;

  const stagger = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  } as const;

  return (
    <div className="min-h-screen bg-[#F8F8F6] selection:bg-blue-200 selection:text-blue-900 font-sans text-brand-black overflow-x-hidden">
      {/* Navbar */}
      <Navbar />

      {/* Hero Header */}
      <header className="pt-24 pb-16 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          <h1 className="text-5xl md:text-7xl font-medium tracking-tight font-serif text-[#111111]">
            Everything you need to navigate <span className="text-[#D97757]">your future.</span>
          </h1>
          <p className="text-xl md:text-2xl text-black/50 font-sans max-w-2xl mx-auto leading-relaxed">
            Discover how Rehbar AI uses intelligent global data to craft your perfect career roadmap.
          </p>
        </motion.div>
      </header>

      {/* Core Features Section */}
      <main className="max-w-7xl mx-auto px-6 py-20 space-y-32">
        
        {/* Feature 1: The Roadmap */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <motion.div {...fadeIn} className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-medium font-serif leading-tight">
              Personalized Career Roadmaps
            </h2>
            <p className="text-lg text-black/60 leading-relaxed font-sans">
              We don't believe in one-size-fits-all advice. Our AI analyzes your unique educational background—whether you're finishing 10th, 12th, or mid-degree—to project a detailed, actionable 5-year plan tailored precisely to your goals.
            </p>
          </motion.div>
          <motion.div 
            {...fadeIn} 
            transition={{ ...fadeIn.transition, delay: 0.2 }}
            className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/5 border border-black/5"
          >
            <img 
              src="/Personalized Career Roadmaps.svg" 
              alt="Personalized Career Roadmaps" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
            />
          </motion.div>
        </section>

        {/* Feature 2: Global Markets */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <motion.div 
            {...fadeIn} 
            className="order-2 lg:order-1 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/5 border border-black/5"
          >
            <img 
              src="/Global Job Market Insights.svg" 
              alt="Global Job Market Insights" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
            />
          </motion.div>
          <motion.div 
            {...fadeIn} 
            transition={{ ...fadeIn.transition, delay: 0.2 }}
            className="order-1 lg:order-2 space-y-6"
          >
            <h2 className="text-4xl md:text-5xl font-medium font-serif leading-tight">
              Global Job Market Insights
            </h2>
            <p className="text-lg text-black/60 leading-relaxed font-sans">
              Stay ahead of the curve. Rehbar AI continuously ingests international job market data to predict trends for 2026 and beyond. We help you understand not just where the jobs are now, but where the world is moving.
            </p>
          </motion.div>
        </section>

        {/* Feature 3: Skill Gap Analysis */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <motion.div {...fadeIn} className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-medium font-serif leading-tight">
              Identify Your Skill Gaps
            </h2>
            <p className="text-lg text-black/60 leading-relaxed font-sans">
              Knowing where you want to go is half the battle. We show you exactly what's missing in your toolkit. From AI-driven analytics to creative design, discover the modern tools you need to master to remain indispensable.
            </p>
          </motion.div>
          <motion.div 
            {...fadeIn} 
            transition={{ ...fadeIn.transition, delay: 0.2 }}
            className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/5 border border-black/5"
          >
            <img 
              src="/Identify Your Skill Gaps.svg" 
              alt="Identify Your Skill Gaps" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
            />
          </motion.div>
        </section>
      </main>

      {/* Coming Soon Section */}
      <section className="bg-white py-32 px-6">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-medium font-serif">What's on the horizon.</h2>
            <p className="text-lg text-black/50 font-sans">
              We are constantly building. Here is what is coming to Rehbar AI soon.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <motion.div 
              {...stagger}
              transition={{ delay: 0.1 }}
              className="border border-black/5 p-10 rounded-3xl bg-[#F8F8F6]/50 transition-all duration-500"
            >
              <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center mb-8 transition-transform duration-500">
                <Mic size={24} />
              </div>
              <h3 className="text-2xl font-medium font-serif mb-4">Voice AI Mock Interviews</h3>
              <p className="text-black/50 leading-relaxed font-sans">
                Practice your job interviews with real-time voice feedback. Our AI simulates high-pressure environments to get you ready.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div 
              {...stagger}
              transition={{ delay: 0.2 }}
              className="border border-black/5 p-10 rounded-3xl bg-[#F8F8F6]/50 transition-all duration-500"
            >
              <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center mb-8 transition-transform duration-500">
                <FileText size={24} />
              </div>
              <h3 className="text-2xl font-medium font-serif mb-4">1-Click ATS Resumes</h3>
              <p className="text-black/50 leading-relaxed font-sans">
                Instantly generate resumes tailored perfectly to your new roadmap. Optimized to pass through any modern hiring system.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div 
              {...stagger}
              transition={{ delay: 0.3 }}
              className="border border-black/5 p-10 rounded-3xl bg-[#F8F8F6]/50 transition-all duration-500"
            >
              <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center mb-8 transition-transform duration-500">
                <Target size={24} />
              </div>
              <h3 className="text-2xl font-medium font-serif mb-4">Daily Study Tracker</h3>
              <p className="text-black/50 leading-relaxed font-sans">
                Let the AI check in on you daily to ensure you are hitting your goals. Stay accountable with personalized learning schedules.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-32 px-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto space-y-10"
        >
          <h2 className="text-4xl md:text-5xl font-medium font-serif text-[#111111]">Ready to start your journey?</h2>
          <button 
            onClick={() => navigate("/auth", { state: { mode: "signup" } })}
            className="px-10 py-4 bg-[#111111] text-white rounded-2xl text-lg font-medium hover:bg-black/90 transition-all duration-300 shadow-lg shadow-black/5"
          >
            Create free account
          </button>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
