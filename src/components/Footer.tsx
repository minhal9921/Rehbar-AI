import React from "react";
import { Mail } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    if (location.pathname === path) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate(path);
    }
  };

  return (
    <footer className="bg-[#0A0A0A] text-white font-sans mt-24">
      <div className="max-w-7xl mx-auto px-8 py-16 lg:py-24 grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-32">
        {/* Brand Col */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <img src="/app-icon-footer.svg" alt="Rehbar AI Logo" className="w-10 h-10 object-contain" />
            <h3 className="text-3xl font-semibold tracking-tight font-serif text-white">Rehbar AI</h3>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs font-sans">
            Guiding the future of students worldwide. Empowering the next generation with data-driven career roadmaps.
          </p>
        </div>

        {/* Links Col */}
        <div className="space-y-8">
          <h4 className="text-xs font-medium tracking-widest text-gray-500 uppercase font-serif">Quick Links</h4>
          <ul className="space-y-4">
            <li><button onClick={() => handleNavigation("/")} className="text-sm text-gray-400 hover:text-white transition-colors font-medium font-sans">Home</button></li>
            <li><button onClick={() => handleNavigation("/features")} className="text-sm text-gray-400 hover:text-white transition-colors font-medium font-sans">Features</button></li>
          </ul>
        </div>

        {/* Legal Col */}
        <div className="space-y-8">
          <h4 className="text-xs font-medium tracking-widest text-gray-500 uppercase font-serif">Legal & Contact</h4>
          <ul className="space-y-4">
            <li><button onClick={() => handleNavigation("/privacy")} className="text-sm text-gray-400 hover:text-white transition-colors font-medium font-sans">Privacy Policy</button></li>
            <li><button onClick={() => handleNavigation("/terms")} className="text-sm text-gray-400 hover:text-white transition-colors font-medium font-sans">Terms of Service</button></li>
            <li>
              <a href="mailto:help@rehbarai.tech" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors font-medium font-sans">
                <Mail size={14} /> help@rehbarai.tech
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 py-8 text-center text-gray-600 text-xs tracking-widest uppercase">
        © 2026 Rehbar AI — Guiding the Future
      </div>
    </footer>
  );
}
