import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const handleScroll = (id: string) => {
    if (isHomePage) {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(`/#${id}`);
    }
  };

  return (
    <nav className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center border-b border-black/5 font-sans relative z-50">
      <div 
        className="flex items-center gap-2 shrink-0 cursor-pointer" 
        onClick={() => {
          if (location.pathname === "/") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else {
            navigate("/");
          }
        }}
      >
        <img src="/app-icon.svg" alt="Rehbar AI Logo" className="w-8 h-8 object-contain" />
        <span className="text-xl font-semibold tracking-tight font-serif">Rehbar AI</span>
      </div>
      
      {/* Center Links */}
      <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-black/50">
        <button onClick={() => handleScroll("how-it-works")} className="hover:text-black transition-colors">How it Works</button>
        <button onClick={() => handleScroll("statistics")} className="hover:text-black transition-colors">Statistics</button>
        <button 
          onClick={() => {
            if (location.pathname === "/features") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
              navigate("/features");
            }
          }} 
          className={`hover:text-black transition-colors ${location.pathname === "/features" ? "text-black" : ""}`}
        >
          Features
        </button>
        <button onClick={() => handleScroll("testimonials")} className="hover:text-black transition-colors">Testimonials</button>
        <button onClick={() => handleScroll("faq")} className="hover:text-black transition-colors">FAQ</button>
      </div>

      {/* Auth Buttons */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => navigate("/auth")}
          className="px-5 py-2 bg-brand-bg border border-black/10 rounded-xl text-sm font-medium hover:bg-black/5 transition-colors"
        >
          Sign In
        </button>
        <button 
          onClick={() => navigate("/auth", { state: { mode: "signup" } })}
          className="px-5 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-black/85 transition-colors"
        >
          Try Rehbar AI
        </button>
      </div>
    </nav>
  );
}
