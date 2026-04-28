import React, { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { useToast } from "../ToastContext";
import Layout from "./Layout";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const SETTINGS_TABS = [
  "General"
];

export default function SettingsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("General");
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    workFunction: "",
    preferences: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState({ firstName: "", lastName: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        let fName = data.firstName || "";
        let lName = data.lastName || "";
        
        // Fallback to auth displayName if firestore fields are empty
        if (!fName && !lName && user.displayName) {
          const parts = user.displayName.split(" ");
          fName = parts[0] || "";
          lName = parts.slice(1).join(" ") || "";
        }
        
        setProfile({
          firstName: fName,
          lastName: lName,
          workFunction: data.workFunction || "",
          preferences: data.preferences || ""
        });
        setTempProfile({ firstName: fName, lastName: lName });
      } else {
        // If doc doesn't exist yet, use auth displayName
        if (user.displayName) {
          const parts = user.displayName.split(" ");
          const fName = parts[0] || "";
          const lName = parts.slice(1).join(" ") || "";
          setProfile(prev => ({
            ...prev,
            firstName: fName,
            lastName: lName
          }));
          setTempProfile({ firstName: fName, lastName: lName });
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSaveAll = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid), {
        firstName: tempProfile.firstName,
        lastName: tempProfile.lastName,
      }, { merge: true });
      
      setProfile(prev => ({ ...prev, ...tempProfile }));
      setIsEditing(false);
      showToast("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      showToast("Failed to update profile", "error");
    }
  };

  const handleSaveField = async (field: string, value: string) => {
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid), {
        [field]: value
      }, { merge: true });
    } catch (err) {
      console.error("Error updating profile:", err);
      showToast("Failed to update profile", "error");
    }
  };

  const getInitials = () => {
    if (profile.firstName && profile.lastName) return (profile.firstName[0] + profile.lastName[0]).toUpperCase();
    if (profile.firstName) return profile.firstName[0].toUpperCase();
    return "U";
  };

  if (loading) return <Layout><div></div></Layout>;

  return (
    <Layout>
      <div className="flex-1 bg-[#F8F8F6] overflow-y-auto sleek-scroll">
        <div className="max-w-[1000px] mx-auto px-8 py-12 md:py-20">
          <h1 className="text-[36px] font-medium font-serif text-[#111111] mb-12">Settings</h1>

          <div className="flex flex-col md:flex-row gap-12 md:gap-20">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-52 shrink-0 space-y-1">
              {SETTINGS_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-[15px] font-medium transition-all ${
                    activeTab === tab 
                      ? "bg-black/[0.04] text-black" 
                      : "text-black/40 hover:text-black/80 hover:bg-black/[0.02]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 max-w-[640px]">
              {activeTab === "General" && (
                <div className="space-y-14">
                  {/* Profile Section */}
                  <section>
                    <h2 className="text-[20px] font-semibold text-black mb-8">Profile</h2>
                    
                    <div className="space-y-2.5 mb-10">
                      <label className="text-[14px] font-medium text-black/40 px-1">Full name</label>
                      <div className="flex items-center gap-3">
                         <div className="w-[44px] h-[44px] bg-white border border-black/10 rounded-xl flex items-center justify-center shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                           <div className="w-8 h-8 rounded-full bg-[#D97757] flex items-center justify-center text-white text-[11px] font-bold">
                             {getInitials()}
                           </div>
                         </div>
                         
                         <div className="flex-1 overflow-hidden">
                           <AnimatePresence mode="wait">
                             {!isEditing ? (
                               <motion.div
                                 key="readonly-name"
                                 initial={{ opacity: 0, x: -10 }}
                                 animate={{ opacity: 1, x: 0 }}
                                 exit={{ opacity: 0, x: 10 }}
                                 transition={{ duration: 0.2 }}
                                 className="bg-white border border-black/10 rounded-xl px-4 py-2 text-[16px] font-[430] text-black/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] cursor-not-allowed"
                               >
                                 {profile.firstName} {profile.lastName}
                               </motion.div>
                             ) : (
                               <motion.div
                                 key="editing-names"
                                 initial={{ opacity: 0, x: 10 }}
                                 animate={{ opacity: 1, x: 0 }}
                                 exit={{ opacity: 0, x: -10 }}
                                 transition={{ duration: 0.2 }}
                                 className="flex items-center gap-3"
                               >
                                 <div className="flex-1 bg-white border border-black/10 rounded-xl px-4 py-2 focus-within:border-black/20 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                   <input
                                     autoFocus
                                     type="text"
                                     placeholder="First name"
                                     value={tempProfile.firstName}
                                     onChange={(e) => setTempProfile(prev => ({ ...prev, firstName: e.target.value }))}
                                     className="w-full bg-transparent border-none outline-none text-[16px] font-[430]"
                                   />
                                 </div>
                                 <div className="flex-1 bg-white border border-black/10 rounded-xl px-4 py-2 focus-within:border-black/20 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                   <input
                                     type="text"
                                     placeholder="Last name"
                                     value={tempProfile.lastName}
                                     onChange={(e) => setTempProfile(prev => ({ ...prev, lastName: e.target.value }))}
                                     className="w-full bg-transparent border-none outline-none text-[16px] font-[430]"
                                   />
                                 </div>
                               </motion.div>
                             )}
                           </AnimatePresence>
                         </div>
                      </div>
                    </div>

                    <div className="space-y-2.5 mb-6">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-[14px] font-medium text-black/40">Email</label>
                        {user?.emailVerified ? (
                          <span className="text-[11px] font-semibold bg-[#E8F5E9] text-[#2E7D32] px-2 py-0.5 rounded-full">Verified</span>
                        ) : (
                          <span className="text-[11px] font-semibold bg-[#FFF3E0] text-[#E65100] px-2 py-0.5 rounded-full">Not Verified</span>
                        )}
                      </div>
                      <div className="w-full bg-white border border-black/10 rounded-xl px-4 py-2 text-[16px] font-[430] text-black/50 shadow-[0_1px_2px_rgba(0,0,0,0.02)] cursor-not-allowed">
                        <input
                          type="text"
                          readOnly
                          value={user?.email || ""}
                          className="w-full bg-transparent border-none outline-none text-[16px] font-[430]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 mb-10">
                      {!isEditing ? (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="px-8 py-2 bg-[#111111] text-white rounded-xl text-[14px] font-medium hover:bg-black border border-transparent transition-all shadow-sm"
                        >
                          Edit
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setTempProfile({ firstName: profile.firstName, lastName: profile.lastName });
                              setIsEditing(false);
                            }}
                            className="px-6 py-2 bg-[#F8F8F6] border border-black/20 rounded-xl text-[14px] font-medium text-black/70 hover:bg-black/5 hover:border-black/40 transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveAll}
                            disabled={!tempProfile.firstName.trim() || !tempProfile.lastName.trim()}
                            className="px-8 py-2 bg-[#111111] text-white rounded-xl text-[14px] font-medium hover:bg-black border border-transparent transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            Save
                          </button>
                        </>
                      )}
                    </div>

                    <div className="space-y-2.5">
                      <label className="text-[14px] font-medium text-black/40 px-1">
                        What <span className="underline cursor-help decoration-black/10 underline-offset-4">personal preferences</span> should Rehbar AI consider in responses?
                      </label>
                      <p className="text-[13px] text-black/30 mb-3 px-1 leading-relaxed">
                        Your preferences will apply to all conversations, within Rehbar AI's guidelines.
                      </p>
                      <textarea
                        value={profile.preferences}
                        onChange={(e) => setProfile(prev => ({ ...prev, preferences: e.target.value }))}
                        onBlur={() => handleSaveField("preferences", profile.preferences)}
                        placeholder="e.g. keep explanations brief and to the point"
                        className="w-full bg-white border border-black/10 rounded-xl px-4 py-4 text-[16px] font-[430] focus:outline-none focus:border-black/20 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] min-h-[140px] resize-none leading-relaxed"
                      />
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
