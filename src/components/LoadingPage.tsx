import React from "react";
import { motion } from "motion/react";

export default function LoadingPage() {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#F8F8F6]">
      <div className="relative flex flex-col items-center gap-6">
        {/* Spinning Icon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 flex items-center justify-center"
        >
          <img src="/app-icon.svg" alt="Loading..." className="w-full h-full object-contain" />
        </motion.div>
        
        {/* Animated Text */}
        <motion.p
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: "mirror" }}
          className="text-[18px] font-serif font-medium text-black/60 tracking-tight"
        >
          Preparing your journey...
        </motion.p>
      </div>
    </div>
  );
}
