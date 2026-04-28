import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { useToast } from "../ToastContext";
import Layout from "./Layout";
import { AnimatePresence, motion } from "motion/react";

export default function TrashPage() {
  const [chats, setChats] = useState<any[]>([]);
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
  const { user } = useAuth();
  const { showToast } = useToast();
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
        .filter((chat: any) => chat.isDeleted === true);
      setChats(chatData);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user || chats.length === 0) return;

    // Auto-delete chats older than 3 days
    const deleteExpiredChats = async () => {
      const now = new Date();
      const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
      
      for (const chat of chats) {
        if (chat.deletedAt) {
          const deletedDate = chat.deletedAt.toDate();
          if (now.getTime() - deletedDate.getTime() > threeDaysInMs) {
            try {
              await deleteDoc(doc(db, "chats", chat.id));
              console.log(`Auto-deleted expired chat: ${chat.id}`);
            } catch (err) {
              console.error("Auto-delete error:", err);
            }
          }
        }
      }
    };

    deleteExpiredChats();
  }, [chats, user]);

  const handleRecover = async (chatId: string) => {
    try {
      await updateDoc(doc(db, "chats", chatId), {
        isDeleted: false,
        updatedAt: serverTimestamp()
      });
      showToast("Chat recovered successfully.");
    } catch (error) {
      console.error("Error recovering chat:", error);
      showToast("Failed to recover chat.", "error");
    }
  };

  const handlePermanentDelete = async () => {
    if (!deletingChatId) return;
    try {
      await deleteDoc(doc(db, "chats", deletingChatId));
      setDeletingChatId(null);
      showToast("Chat permanently deleted.");
    } catch (error) {
      console.error("Error deleting chat:", error);
      showToast("Failed to delete chat.", "error");
    }
  };

  const formatTimeRemaining = (timestamp: any) => {
    if (!timestamp) return "Deleting soon";
    const deletedDate = timestamp.toDate();
    const now = new Date();
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
    const expiryDate = new Date(deletedDate.getTime() + threeDaysInMs);
    const diffInMs = expiryDate.getTime() - now.getTime();

    if (diffInMs <= 0) return "Deleting now...";

    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) return `Permanently deletes in ${diffInDays} day${diffInDays > 1 ? 's' : ''}`;
    if (diffInHours > 0) return `Permanently deletes in ${diffInHours} hour${diffInHours > 1 ? 's' : ''}`;
    if (diffInMinutes > 0) return `Permanently deletes in ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    return `Permanently deletes in less than a minute`;
  };

  return (
    <Layout>
      <div className="flex-1 bg-[#F8F8F6] overflow-y-auto sleek-scroll">
        <div className="max-w-[800px] mx-auto px-6 py-12 md:py-20">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-[36px] font-[600] font-serif text-[#111111]">Trash</h1>
          </div>

          <p className="text-[14px] text-black/40 mb-10 font-medium italic">
            Items in trash will be permanently deleted after 3 days.
          </p>

          {/* Chats List Container */}
          <div className="space-y-4">
            <div className="border-t border-black/[0.06] divide-y divide-black/[0.06]">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className="group flex items-center justify-between py-6 px-4 hover:bg-black/[0.01] transition-all"
                >
                  <div className="flex flex-col gap-0.5 truncate flex-1 pr-4">
                    <h3 className="text-[16px] font-[430] text-black/85 truncate">
                      {chat.title || "Untitled Chat"}
                    </h3>
                    <p className="text-[13px] text-black/40 font-medium">
                      {formatTimeRemaining(chat.deletedAt)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => handleRecover(chat.id)}
                      className="px-4 py-2 bg-[#F8F8F6] border border-black/20 rounded-xl text-[14px] font-medium text-black/70 hover:bg-black/5 hover:border-black/40 transition-all"
                    >
                      Recover
                    </button>
                    <button
                      onClick={() => setDeletingChatId(chat.id)}
                      className="px-4 py-2 bg-[#D33C3C] text-white rounded-xl text-[14px] font-medium hover:bg-red-700 transition-all shadow-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              
              {chats.length === 0 && (
                <div className="py-24 text-center">
                   <p className="text-black/30 italic font-medium">Your trash is empty.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Permanent Delete Modal */}
      <AnimatePresence>
        {deletingChatId && (
          <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingChatId(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-[420px] bg-[#F8F8F6] rounded-[24px] shadow-2xl overflow-hidden border border-black/5"
            >
              <div className="p-6">
                <h3 className="text-[24px] font-[600] text-black mb-3">Delete Permanently</h3>
                <p className="text-[16px] font-[430] text-black/70 mb-6 leading-relaxed">
                  Are you sure you want to delete this chat? This action cannot be undone.
                </p>

                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setDeletingChatId(null)}
                    className="px-6 py-2 rounded-xl text-[16px] font-[430] text-black/70 bg-white border border-black/20 hover:bg-black/5 hover:border-black/40 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePermanentDelete}
                    className="px-8 py-2 rounded-xl text-[16px] font-medium bg-[#D33C3C] text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-900/10"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
