import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Search, 
  MessageSquare,
  ChevronDown,
  LogOut,
  PanelLeft,
  ChevronRight,
  Settings,
  HelpCircle,
  Info,
  Trash2,
  MoreHorizontal,
  Pin,
  Pencil
} from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useToast } from "../ToastContext";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

const SIDEBAR_COLLAPSED_W = 52;
const SIDEBAR_EXPANDED_W = 260;

const sidebarItems = [
  { icon: Plus, label: "New Chat", primary: true },
  { icon: Search, label: "Search" },
  { icon: MessageSquare, label: "Chats" },
  { icon: Trash2, label: "Trash" },
];

const recentChats = [
  "Engineering Roadmap",
  "Medical to Tech Pivot",
  "Career in AI Ethics",
  "Study Abroad Guide",
];

interface SidebarItemDef {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  primary?: boolean;
  dim?: boolean;
}

const SidebarButton: React.FC<{ item: SidebarItemDef; expanded: boolean; onClick?: () => void }> = ({ item, expanded, onClick }) => {
  const Icon = item.icon;

  return (
    <div 
      className={`flex items-center group/btn cursor-pointer mx-2 rounded-lg transition-all ${expanded ? "hover:bg-black/[0.04]" : ""}`}
      onClick={onClick}
    >
      <div className="w-[32px] h-[32px] flex items-center justify-center shrink-0">
        <button
          className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${
            item.primary 
              ? "bg-black/5 text-black hover:bg-black/10" 
              : item.dim 
              ? "text-black/25" 
              : "text-black/60"
          } ${!expanded ? "hover:bg-black/[0.04] hover:text-black" : ""} ${expanded ? "group-hover/btn:text-black" : ""}`}
          title={!expanded ? item.label : undefined}
        >
          <Icon size={18} strokeWidth={1.5} />
        </button>
      </div>
      {expanded && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`flex-1 text-left text-[14px] font-medium whitespace-nowrap overflow-hidden transition-colors pl-1 ${
            item.primary
              ? "text-black"
              : item.dim
              ? "text-black/30 group-hover/btn:text-black/50"
              : "text-black/70 group-hover/btn:text-black"
          }`}
        >
          {item.label}
        </motion.button>
      )}
    </div>
  );
};

function UserMenuItem({ 
  icon: Icon, 
  label, 
  shortcut, 
  hasArrow, 
  danger,
  onClick 
}: { 
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>; 
  label: string; 
  shortcut?: string; 
  hasArrow?: boolean; 
  danger?: boolean;
  onClick?: () => void; 
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 mx-1.5 px-2.5 py-1.5 text-[13px] rounded-lg transition-all text-left ${
        danger ? "text-red-500 hover:bg-red-50" : "text-black hover:bg-black/[0.04]"
      }`}
      style={{ width: "calc(100% - 12px)" }}
    >
      <Icon size={15} strokeWidth={1.5} className={`shrink-0 ${danger ? "text-red-500" : "text-black"}`} />
      <span className="flex-1">{label}</span>
      {shortcut && <span className="text-[10px] text-black/20 font-mono">{shortcut}</span>}
      {hasArrow && <ChevronRight size={13} className="text-black/20" />}
    </button>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  // Initialize sidebar based on screen width (closed on mobile, open on desktop)
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { chatId: currentChatId } = useParams();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [realChats, setRealChats] = useState<{ id: string; title: string; isPinned?: boolean }[]>([]);
  const [userProfile, setUserProfile] = useState<{ firstName?: string; lastName?: string; displayName?: string } | null>(null);
  const [activeChatMenu, setActiveChatMenu] = useState<string | null>(null);
  const [renamingChat, setRenamingChat] = useState<{ id: string; title: string } | null>(null);
  const [newChatTitle, setNewChatTitle] = useState("");
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");

  useEffect(() => {
    if (!user) return;

    const chatQuery = query(
      collection(db, "chats"),
      where("userId", "==", user.uid),
      orderBy("updatedAt", "desc")
    );

    const unsubscribeChats = onSnapshot(chatQuery, 
      (snapshot) => {
        const chats = snapshot.docs
          .map(doc => ({
            id: doc.id,
            title: doc.data().title || "Untitled Chat",
            isPinned: doc.data().isPinned || false,
            isDeleted: doc.data().isDeleted || false,
            updatedAt: doc.data().updatedAt
          }))
          .filter(chat => !chat.isDeleted);

        // Sort in memory: Pinned first, then by updatedAt
        const sortedChats = chats.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return 0; // Maintain Firestore's updatedAt order for both groups
        });

        setRealChats(sortedChats);
      },
      (error) => {
        console.error("Layout Firestore Error (Chats):", error);
      }
    );

    const unsubscribeProfile = onSnapshot(doc(db, "users", user.uid), 
      (doc) => {
        if (doc.exists()) {
          setUserProfile(doc.data() as any);
        }
      },
      (error) => {
        console.error("Layout Firestore Error (Profile):", error);
      }
    );

    return () => {
      unsubscribeChats();
      unsubscribeProfile();
    };
  }, [user]);

  const formatPastTime = (timestamp: any) => {
    if (!timestamp) return "Just now";
    const date = timestamp.toDate();
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays < 1) return "Today";
    if (diffInDays < 7) return "This week";
    if (diffInDays < 30) return "This month";
    if (diffInDays < 365) return "Past month";
    return "Past year";
  };

  const getInitials = (name: string | null) => {
    if (!name || name === "Username") return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name[0].toUpperCase();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const userContainer = document.getElementById("user-menu-container");
      if (userContainer && !userContainer.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      
      if (activeChatMenu) {
        const menuId = `chat-menu-${activeChatMenu}`;
        const menuTriggerId = `chat-trigger-${activeChatMenu}`;
        const menuEl = document.getElementById(menuId);
        const triggerEl = document.getElementById(menuTriggerId);
        
        if (menuEl && !menuEl.contains(event.target as Node) && triggerEl && !triggerEl.contains(event.target as Node)) {
          setActiveChatMenu(null);
        }
      }
    };

    if (userMenuOpen) {
      window.addEventListener("click", handleClickOutside);
    }
    return () => window.removeEventListener("click", handleClickOutside);
  }, [userMenuOpen, activeChatMenu]);

  const handlePin = async (chatId: string, currentPinned: boolean) => {
    try {
      await updateDoc(doc(db, "chats", chatId), {
        isPinned: !currentPinned,
        updatedAt: serverTimestamp()
      });
      setActiveChatMenu(null);
    } catch (error) {
      console.error("Error pinning chat:", error);
      showToast("Failed to pin chat. Please try again.");
    }
  };

  const handleRename = async () => {
    if (!renamingChat || !newChatTitle.trim()) return;
    
    try {
      await updateDoc(doc(db, "chats", renamingChat.id), {
        title: newChatTitle.trim(),
        updatedAt: serverTimestamp()
      });
      setRenamingChat(null);
      setNewChatTitle("");
      showToast("Chat renamed successfully!");
    } catch (error) {
      console.error("Error renaming chat:", error);
      showToast("Failed to rename chat. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!deletingChatId) return;
    
    try {
      await updateDoc(doc(db, "chats", deletingChatId), {
        isDeleted: true,
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      const idToDelete = deletingChatId;
      setDeletingChatId(null);
      setActiveChatMenu(null);
      showToast("Chat deleted successfully.");
      // If we are currently on this chat page, navigate home
      if (window.location.pathname.includes(`/chat/${idToDelete}`)) {
        navigate("/home");
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      showToast("Failed to delete chat. Please try again.");
    }
  };

  return (
    <>
      <style>{`
        .sleek-scroll::-webkit-scrollbar {
          width: 4px !important;
          height: 4px !important;
        }
        .sleek-scroll::-webkit-scrollbar-track {
          background: transparent !important;
        }
        .sleek-scroll::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1) !important;
          border-radius: 100px !important;
        }
        .sleek-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.22) !important;
        }
        .sleek-scroll::-webkit-scrollbar-corner {
          background: transparent !important;
        }
        .sleek-scroll {
          scrollbar-width: thin !important;
          scrollbar-color: rgba(0,0,0,0.1) transparent !important;
        }
      `}</style>
      <div className="h-screen flex bg-[#F8F8F6] text-black font-sans overflow-hidden relative">

        {/* Mobile Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="md:hidden absolute inset-0 bg-black/40 z-[9998] backdrop-blur-[2px]"
            />
          )}
        </AnimatePresence>

        {/* ─── Sidebar ─── */}
        <motion.aside
          initial={false}
          animate={{ width: sidebarOpen ? SIDEBAR_EXPANDED_W : SIDEBAR_COLLAPSED_W }}
          transition={{ type: "spring", stiffness: 400, damping: 34 }}
          className={`h-full border-r border-black/[0.06] bg-[#F8F8F6] flex flex-col shrink-0 z-[9999] absolute md:relative left-0 top-0 bottom-0 transition-transform duration-300 ${!sidebarOpen ? 'max-md:-translate-x-full' : 'max-md:translate-x-0'}`}
        >
          {/* Toggle button & Title */}
          <div className="relative h-[60px] shrink-0 border-b border-black/[0.03]">
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 overflow-hidden whitespace-nowrap flex items-center gap-2"
                >
                  <img src="/app-icon.svg" alt="Rehbar AI" className="w-7 h-7 object-contain" />
                  <span className="text-[20px] font-medium tracking-tight font-serif">Rehbar AI</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.div
              animate={{ 
                left: sidebarOpen ? 212 : 10,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 34 }}
              className="absolute top-1/2 -translate-y-1/2 shrink-0"
            >
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-black/[0.08] text-black/40 hover:bg-black/[0.04] transition-colors shrink-0 bg-[#F0EFED]"
                title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                <PanelLeft size={18} strokeWidth={1.5} />
              </button>
            </motion.div>
          </div>

          {/* Nav items */}
          <div className="flex flex-1 flex-col py-2 gap-0.5 overflow-y-auto sleek-scroll overflow-x-visible">
            {sidebarItems.map((item) => {
              const isActive = (item.label === "Chats" && location.pathname === "/chats") || 
                               (item.label === "Trash" && location.pathname === "/trash") ||
                               (item.label === "New Chat" && location.pathname === "/home");
              return (
                <SidebarButton 
                  key={item.label} 
                  item={{...item, primary: item.primary || isActive} as SidebarItemDef} 
                  expanded={sidebarOpen} 
                  onClick={() => {
                    if (item.label === "New Chat") navigate("/home");
                    if (item.label === "Search") setSearchModalOpen(true);
                    if (item.label === "Chats") navigate("/chats");
                    if (item.label === "Trash") navigate("/trash");
                  }}
                />
              );
            })}

            {/* Recent chats */}
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 whitespace-nowrap"
                >
                  <h4 className="px-5 text-[13px] text-black/40 font-medium mb-3">
                    Recents
                  </h4>
                  <div className="space-y-0.5 px-2">
                    {realChats.map((chat) => (
                      <div key={chat.id} className="relative group/chat">
                        <button
                          onClick={() => navigate(`/chat/${chat.id}`)}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-[16px] font-[430] text-black/80 hover:bg-black/[0.04] rounded-lg transition-all text-left truncate pr-8 ${currentChatId === chat.id ? "bg-black/[0.04] text-black" : ""} ${activeChatMenu === chat.id ? "bg-black/[0.04]" : ""}`}
                        >
                          {chat.isPinned && <Pin size={12} className="shrink-0 text-[#D97757] rotate-[45deg]" fill="currentColor" />}
                          <span className="truncate">{chat.title}</span>
                        </button>
                        
                        <button
                          id={`chat-trigger-${chat.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveChatMenu(activeChatMenu === chat.id ? null : chat.id);
                          }}
                          className={`absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-md transition-all hover:bg-black/5 hover:text-black/60 opacity-100 ${activeChatMenu === chat.id ? "text-black/60 bg-black/5" : "text-black/20"}`}
                        >
                          <MoreHorizontal size={14} />
                        </button>

                        {activeChatMenu === chat.id && (
                          <div
                            id={`chat-menu-${chat.id}`}
                            className="absolute right-8 top-0 w-32 bg-white rounded-xl py-1.5 z-[10000] border border-black/10 shadow-xl"
                          >
                            <UserMenuItem 
                              icon={Pin} 
                              label={chat.isPinned ? "Unpin" : "Pin"} 
                              onClick={() => handlePin(chat.id, !!chat.isPinned)} 
                            />
                            <UserMenuItem 
                              icon={Pencil} 
                              label="Rename" 
                              onClick={() => {
                                setRenamingChat(chat);
                                setNewChatTitle(chat.title);
                                setActiveChatMenu(null);
                              }} 
                            />
                            <div className="h-px bg-black/[0.04] mx-2 my-1" />
                            <UserMenuItem icon={Trash2} label="Delete" danger onClick={() => {
                              setDeletingChatId(chat.id);
                              setActiveChatMenu(null);
                            }} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom: User Profile Bar */}
          <div className="border-t border-black/[0.04] relative" id="user-menu-container">
            {/* User Menu Popup */}
            {userMenuOpen && (
              <div
                className={`absolute bottom-full mb-2 bg-white rounded-xl py-1.5 z-[9999] border border-black/20 ${sidebarOpen ? "left-2 right-2" : "left-2 w-[244px]"}`}
                style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
              >
                {/* Email */}
                <div className="px-3 py-1.5 text-[12px] text-black/40 border-b border-black/[0.06]">
                  {user?.email}
                </div>

                <div className="py-1">
                  <UserMenuItem icon={Settings} label="Settings" shortcut="⇧+Ctrl+," onClick={() => {
                    setUserMenuOpen(false);
                    navigate("/settings");
                  }} />
                  <UserMenuItem icon={HelpCircle} label="Get help" onClick={() => {
                    setUserMenuOpen(false);
                    navigate("/privacy");
                  }} />
                </div>

                <div className="h-px bg-black/[0.05] mx-3" />

                <div className="py-1">
                  <UserMenuItem icon={Info} label="Learn more" hasArrow onClick={() => {
                    setUserMenuOpen(false);
                    navigate("/terms");
                  }} />
                </div>

                <div className="h-px bg-black/[0.05] mx-3" />

                <div className="py-1">
                  <UserMenuItem 
                    icon={LogOut} 
                    label="Log out" 
                    onClick={async () => { 
                      setUserMenuOpen(false); 
                      await logout();
                      showToast("Logged out successfully. See you soon!");
                      navigate("/"); 
                    }} 
                  />
                </div>
              </div>
            )}

            {/* User bar */}
            <div
              className="flex items-center gap-3 px-3 py-3 cursor-pointer hover:bg-black/[0.03] transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setUserMenuOpen(!userMenuOpen);
              }}
            >
              <div className="w-8 h-8 rounded-full bg-[#d97757] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                {userProfile ? getInitials(userProfile.displayName || `${userProfile.firstName} ${userProfile.lastName}`) : getInitials(user?.displayName || null)}
              </div>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between flex-1 min-w-0"
                >
                  <span className="text-[13px] font-semibold truncate text-black/80">
                    {userProfile?.displayName || user?.displayName || "Username"}
                  </span>
                  <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                </motion.div>
              )}
            </div>
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <main className="flex-1 relative flex flex-col min-w-0">
          {/* Mobile Header (Absolute on Chat, Static on others) */}
          <div className={`md:hidden flex px-2 z-10 ${currentChatId ? 'h-[100px] absolute top-0 left-0 right-0 pointer-events-none bg-gradient-to-b from-[#F8F8F6] via-[#F8F8F6] to-transparent' : 'h-[64px] items-center shrink-0'}`}>
             <div className={`flex w-full pointer-events-auto ${currentChatId ? 'items-start pt-3' : 'items-center'}`}>
               <button onClick={() => setSidebarOpen(true)} className="w-10 h-10 flex items-center justify-center rounded-lg text-black/60 hover:bg-black/5 shrink-0">
                  <PanelLeft size={22} strokeWidth={1.5} />
               </button>
               {currentChatId ? (
                  <div className="bg-[#EFEEEB] px-3 py-1.5 rounded-xl border border-black/[0.04] flex items-center shadow-[0_1px_4px_rgba(0,0,0,0.02)] mt-[4px] ml-1">
                     <span className="text-[14px] font-[500] text-[#373734] truncate max-w-[200px]">
                        {realChats.find(c => c.id === currentChatId)?.title || "Untitled Chat"}
                     </span>
                  </div>
               ) : (
                  <div className="flex items-center gap-2 ml-2">
                    <img src="/app-icon.svg" alt="Rehbar AI" className="w-7 h-7 object-contain" />
                    <span className="text-[18px] font-medium tracking-tight font-serif text-[#373734]">Rehbar AI</span>
                  </div>
               )}
             </div>
          </div>

          {/* Desktop Top-left branding when sidebar is collapsed */}
          <AnimatePresence>
            {!sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="hidden md:flex absolute top-4 left-5 items-center gap-2 z-10"
              >
                {currentChatId ? (() => {
                   const currentChat = realChats.find(c => c.id === currentChatId);
                   if (!currentChat) return null;
                   return (
                     <div className="bg-[#EFEEEB] px-3 py-1.5 rounded-xl border border-black/[0.04] flex items-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                       <span className="text-[14px] font-[500] text-[#373734] truncate max-w-[300px]">
                         {currentChat.title}
                       </span>
                     </div>
                   );
                })() : (
                  <>
                    <img src="/app-icon.svg" alt="Rehbar AI" className="w-7 h-7 object-contain" />
                    <span className="text-[18px] font-medium tracking-tight font-serif text-[#373734]">Rehbar AI</span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {children}
        </main>
      </div>

      {/* Rename Modal */}
      <AnimatePresence>
        {renamingChat && (
          <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRenamingChat(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-[420px] bg-[#F8F8F6] rounded-[24px] shadow-2xl overflow-hidden border border-black/5"
            >
              <div className="p-6">
                <h3 className="text-[24px] font-[600] text-black mb-4">Rename chat</h3>
                
                <div className="relative mb-5">
                  <input
                    autoFocus
                    type="text"
                    value={newChatTitle}
                    onChange={(e) => setNewChatTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename();
                      if (e.key === "Escape") setRenamingChat(null);
                    }}
                    className="w-full bg-white border border-black/10 rounded-xl px-4 py-2.5 text-[16px] font-[430] focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black/20 transition-all shadow-sm"
                    placeholder="Enter chat title..."
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setRenamingChat(null)}
                    className="px-6 py-2 rounded-xl text-[16px] font-[430] text-black/70 bg-white border border-black/20 hover:bg-black/5 hover:border-black/40 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRename}
                    className="px-8 py-2 rounded-xl text-[16px] font-[430] bg-[#1D1D1B] text-white hover:bg-black transition-colors shadow-lg shadow-black/10"
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Delete Modal */}
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
                <h3 className="text-[24px] font-[600] text-black mb-3">Delete chat</h3>
                <p className="text-[16px] font-[430] text-black/70 mb-6 leading-relaxed">
                  Are you sure you want to delete this chat? You can recover this chat within 3 days from trash.
                </p>

                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setDeletingChatId(null)}
                    className="px-6 py-2 rounded-xl text-[16px] font-[430] text-black/70 bg-white border border-black/20 hover:bg-black/5 hover:border-black/40 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
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
      {/* Search Modal */}
      <AnimatePresence>
        {searchModalOpen && (
          <div className="fixed inset-0 z-[10002] flex items-start justify-center pt-24 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchModalOpen(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              className="relative w-full max-w-[640px] bg-white rounded-[20px] shadow-2xl border border-black/20 overflow-hidden"
            >
              {/* Search Header */}
              <div className="p-4 flex items-center gap-3 border-b border-black/[0.04]">
                <Search size={20} className="text-black/30" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search chats and projects"
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-[16px] font-[430] placeholder:text-black/30"
                />
                <button 
                  onClick={() => setSearchModalOpen(false)}
                  className="p-1 hover:bg-black/5 rounded-md text-black/60 transition-colors"
                >
                  <Plus size={20} className="rotate-45" />
                </button>
              </div>

              {/* Search Results */}
              <div className="max-h-[480px] overflow-y-auto sleek-scroll py-2">
                {realChats
                  .filter(chat => chat.title.toLowerCase().includes(globalSearchQuery.toLowerCase()))
                  .map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => {
                      navigate(`/chat/${chat.id}`);
                      setSearchModalOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-black/[0.03] transition-colors text-left group"
                  >
                    <MessageSquare size={18} className="text-black/30 group-hover:text-black/60 transition-colors" />
                    <span className="flex-1 text-[15px] font-[430] text-black/80 truncate">
                      {chat.title}
                    </span>
                    <span className="text-[13px] text-black/30 font-medium whitespace-nowrap">
                      {formatPastTime((chat as any).updatedAt)}
                    </span>
                  </button>
                ))}
                
                {realChats.filter(chat => chat.title.toLowerCase().includes(globalSearchQuery.toLowerCase())).length === 0 && (
                  <div className="py-12 text-center text-black/30 italic font-medium">
                    No results found for "{globalSearchQuery}"
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
