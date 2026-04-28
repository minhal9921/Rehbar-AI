import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import Layout from "./Layout";

export default function ChatsPage() {
  const [chats, setChats] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "chats"),
      where("userId", "==", user.uid),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter((chat: any) => !chat.isDeleted);
      setChats(chatData);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredChats = chats.filter(chat => 
    (chat.title || "Untitled Chat").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return "Just now";
    const date = timestamp.toDate();
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Last message just now";
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `Last message ${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Last message ${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `Last message ${diffInDays} days ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `Last message ${diffInMonths} months ago`;
    
    return `Last message over a year ago`;
  };

  return (
    <Layout>
      <div className="flex-1 bg-[#F8F8F6] overflow-y-auto sleek-scroll">
        <div className="max-w-[800px] mx-auto px-6 py-12 md:py-20">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-[36px] font-medium font-serif text-[#111111]">Chats</h1>
            <button
              onClick={() => navigate("/home")}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#111111] text-white rounded-xl text-[15px] font-medium hover:bg-black/90 transition-all shadow-sm"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>New chat</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-12">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30">
              <Search size={20} strokeWidth={2} />
            </div>
            <input
              type="text"
              placeholder="Search your chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-black/20 rounded-2xl py-2.5 pl-12 pr-4 text-[16px] font-[430] placeholder:text-black/30 focus:outline-none focus:ring-4 focus:ring-black/[0.02] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
            />
          </div>

          {/* Chats List Container */}
          <div className="space-y-4">
            <div className="border-t border-black/[0.06] divide-y divide-black/[0.06]">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => navigate(`/chat/${chat.id}`)}
                  className="group flex flex-col gap-0.5 py-6 px-4 hover:bg-black/[0.01] transition-all cursor-pointer"
                >
                  <h3 className="text-[16px] font-[430] text-black/85 group-hover:text-black transition-colors truncate">
                    {chat.title || "Untitled Chat"}
                  </h3>
                  <p className="text-[13px] text-black/40 font-medium">
                    {formatTimeAgo(chat.updatedAt)}
                  </p>
                </div>
              ))}
              
              {filteredChats.length === 0 && (
                <div className="py-24 text-center">
                   <p className="text-black/30 italic font-medium">No chats found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
