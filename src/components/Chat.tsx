/// <reference types="vite/client" />
import React, { useState, useEffect, useRef } from "react";
import { getGenerativeModel } from "firebase/ai";
import ReactMarkdown from 'react-markdown';
import { motion } from "motion/react";
import {
  Paperclip,
  ArrowUp,
  X
} from "lucide-react";
import { useParams, useLocation } from "react-router-dom";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { db, vertexAI } from "../firebase";
import { useAuth } from "../AuthContext";
import Layout from "./Layout";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  createdAt?: any;
}

interface ChatLocationState {
  userPrompt: string;
  educationLevel: string;
  grades: string;
  hobbies: string;
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash-lite"; // Main chat model
// Note: Title generation uses Gemma in Home.tsx

const SYSTEM_PROMPT = `You are "Rehbar AI", an elite, highly empathetic, and globally aware Career Counselor and Future-Skills Expert. Your mission is to help students from around the world navigate their educational and professional journeys, specifically preparing them for the AI-driven job market of 2026 and beyond.

YOUR STRICT RULES & GUIDELINES:
1. Tone & Persona: Be extremely encouraging, professional, and practical. Speak like an expert mentor who wants the best for the student. Do not use overly robotic language.
2. Global & Future-Focused: Base your advice on international job market trends, remote work opportunities, and how AI is changing industries. 
3. Fact-Based: If a student with low grades wants a highly competitive medical/engineering field, gently provide reality checks and offer excellent alternative pathways (like allied health, tech diplomas, or skill-based certifications) that match their hobbies.
4. No Hallucinations: Do not invent fake university names or fake links. Suggest general platforms (e.g., "Look for Python courses on Coursera or Udemy").
5. Formatting (Crucial): The response will be displayed on a modern web app. You MUST use Markdown. Use clean headings (###), bold text for emphasis, bullet points, and short paragraphs. Never output huge walls of text.

REQUIRED OUTPUT STRUCTURE:
Whenever you respond, organize your answer beautifully using this exact structure:

### 🎯 Your Career Compass
[Provide a direct, empathetic, and insightful answer to their main question, analyzing their grades and hobbies.]

### 🛤️ The Actionable Roadmap
[Give a clear, 3-step actionable plan for what they should do next based on their education level.]

### 🛠️ Future-Proof Skills for 2026
[Suggest 1 or 2 specific modern skills or AI tools they should learn (e.g., Data Analysis, Prompt Engineering, UI/UX) that combine their interests with market demand.]

CONVERSATIONAL CONTINUITY RULES:
1. NEVER re-introduce yourself ("Hi, I am Rehbar AI...") if the user is asking a follow-up question.
2. Assume the conversation is ongoing. If the user says "Yes, delve deeper" or asks for more details, strictly look at the previous context to continue the discussion seamlessly. 
3. Only use the full 3-heading format (Compass, Roadmap, Skills) for the FIRST main query. For follow-up questions, respond naturally, directly answering the user's specific request without forcing the 3-heading structure unless it makes sense.`;

const MarkdownRenderer = ({ content }: { content: string }) => {
  return (
    <div className="space-y-3 text-[16px] leading-relaxed text-black/85">
      <ReactMarkdown
        components={{
          h3: ({ node, ...props }) => <h3 className="text-[20px] font-semibold text-black mt-6 mb-2 flex items-center gap-2" {...props} />,
          h1: ({ node, ...props }) => <h1 className="text-[24px] font-bold text-black mt-6 mb-3" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-[22px] font-bold text-black mt-6 mb-3" {...props} />,
          p: ({ node, ...props }) => <p className="mb-2" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc ml-4 pl-2 mb-2" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal ml-4 pl-2 mb-2" {...props} />,
          li: ({ node, ...props }) => <li className="text-black/80 mb-1" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-bold text-black" {...props} />,
          em: ({ node, ...props }) => <strong className="font-bold text-black" {...props} />, // Map em to bold as requested
          hr: ({ node, ...props }) => <hr className="my-6 border-black/5" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default function Chat() {
  const { chatId } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasTriggeredInitial = useRef(false);
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "model", parts: { text: string }[] }[]>([]);

  const buildAIQuery = (data: ChatLocationState) => {
    return `User Question: ${data.userPrompt}
---
User Context:
Education Level: ${data.educationLevel}
Grades/Marks: ${data.grades}%
Hobbies/Interests: ${data.hobbies || "None specified"}`;
  };

  const callGeminiAPI = async (userText: string, isInitial: boolean = false, superPrompt: string = "") => {
    setIsTyping(true);
    try {
      const model = getGenerativeModel(vertexAI, {
        model: GEMINI_MODEL,
        systemInstruction: SYSTEM_PROMPT
      });

      const chatSession = model.startChat({
        history: chatHistory,
      });

      const messageToSend = isInitial ? superPrompt : userText;
      const result = await chatSession.sendMessage(messageToSend);
      const aiResponse = result.response.text() || "I'm sorry, I couldn't generate a response. Please try again.";

      // Maintain React state variable for chat history as requested
      setChatHistory(prev => [
        ...prev,
        { role: "user", parts: [{ text: messageToSend }] },
        { role: "model", parts: [{ text: aiResponse }] }
      ]);

      // Save AI response to Firestore
      if (chatId && user) {
        await addDoc(collection(db, "chats", chatId, "messages"), {
          text: aiResponse,
          sender: "ai",
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (!chatId || !user || chatId === ":chatId") return;

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);

      // Sync chatHistory state from Firestore (only on initial load or if empty)
      // We skip the last message if it's a user message and AI hasn't replied yet, 
      // as that will be handled by the ongoing API call.
      setChatHistory(msgs.filter(m => !(m.sender === 'user' && m === msgs[msgs.length - 1] && isTyping)).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      })));

      // If we have context from Home and just 1 user message, trigger AI with full context
      if (location.state && msgs.length === 1 && msgs[0].sender === "user" && !hasTriggeredInitial.current) {
        hasTriggeredInitial.current = true;
        const queryText = buildAIQuery(location.state as ChatLocationState);
        callGeminiAPI(queryText, true, queryText);
      }
    });

    return () => unsubscribe();
  }, [chatId, user, location.state]);

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

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

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

  const handleSend = async () => {
    if ((!prompt.trim() && attachedFiles.length === 0) || !chatId || !user) return;

    const textToSend = prompt;
    setPrompt("");
    setAttachedFiles([]);

    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        text: textToSend,
        sender: "user",
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "chats", chatId), {
        lastMessage: textToSend,
        updatedAt: serverTimestamp(),
      });

      // Call API - it will use the chatHistory state for context
      callGeminiAPI(textToSend);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <Layout>
      <div className="flex-1 flex flex-col h-full relative">
        {/* Top Smoke Header (Desktop Only) to mask scrolled messages seamlessly */}
        <div className="hidden md:block absolute top-0 left-0 right-0 h-[100px] bg-gradient-to-b from-[#F8F8F6] via-[#F8F8F6] to-transparent z-[5] pointer-events-none" />

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 pt-24 pb-[140px] sleek-scroll">
          <div className="max-w-3xl mx-auto space-y-8 flex flex-col relative z-0">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 max-w-[90%] ${msg.sender === "user" ? "self-end flex-row-reverse" : "self-start"}`}
              >
                {/* AI Avatar */}
                {msg.sender === "ai" && (
                  <div className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center shrink-0 bg-white mt-1 shadow-sm">
                    <img src="/app-icon.svg" alt="Rehbar AI" className="w-5 h-5 object-contain" />
                  </div>
                )}

                {/* Message Bubble */}
                <div className={`
                  ${msg.sender === "user"
                    ? "bg-[#EFEEEB] px-5 py-3 rounded-2xl rounded-tr-sm text-[16px] font-[430] text-black/85 shadow-sm"
                    : "bg-transparent py-1 text-[16px] font-[430] leading-relaxed text-black/85 font-sans w-full"
                  }
                `}>
                  {msg.sender === "user" ? (
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  ) : (
                    <MarkdownRenderer content={msg.text} />
                  )}
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 self-start max-w-[85%]"
              >
                <div className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center shrink-0 bg-white mt-1 shadow-sm">
                  <img src="/app-icon.svg" alt="Rehbar AI" className="w-5 h-5 object-contain" />
                </div>
                <div className="flex items-center gap-2 py-3 text-black/40 text-[14px] font-medium italic">
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Rehbar AI is thinking...
                  </motion.div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Bottom Prompt Area */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#F8F8F6] via-[#F8F8F6] to-transparent pt-12 pointer-events-none">
          <div className="max-w-3xl mx-auto pointer-events-auto">
            <div className="bg-white rounded-3xl border border-black/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.04)] focus-within:border-black/[0.14] focus-within:shadow-[0_4px_30px_rgba(0,0,0,0.08)] transition-all">
              <div className="px-5 pt-4 pb-1">
                <textarea
                  ref={textareaRef}
                  placeholder="Reply to Rehbar AI..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 focus:outline-none p-0 text-[16px] font-[430] font-sans resize-none min-h-[30px] max-h-[168px] overflow-hidden placeholder:text-black/35 leading-relaxed sleek-scroll"
                  rows={1}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    const newHeight = Math.min(target.scrollHeight, 168);
                    target.style.height = newHeight + 'px';
                    target.style.overflowY = target.scrollHeight > 168 ? 'auto' : 'hidden';
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />

                {/* Attached files preview */}
                {attachedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 mb-1">
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

              <div className="flex items-center justify-between px-2 pb-2">
                <div className="flex items-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileAttach}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 flex items-center gap-2 rounded-xl hover:bg-black/[0.04] transition-colors text-black/40 hover:text-black/60 shrink-0 text-[13px] font-medium"
                    title="Attach files (max 5MB total)"
                  >
                    <Paperclip size={18} strokeWidth={2} />
                    <span>Attachments</span>
                  </button>
                </div>

                <button
                  onClick={handleSend}
                  className="px-4 py-1.5 flex items-center gap-2 rounded-xl bg-[#D97757] text-white hover:opacity-80 transition-colors shadow-sm text-[13px] font-medium"
                >
                  <span>Send</span>
                  <ArrowUp size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            <div className="text-center mt-3 text-[11px] text-black/30 font-sans">
              Rehbar AI can make mistakes. Verify important information.
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
