"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Stethoscope,
  CheckCheck,
  MessageCircle,
  X,
} from "lucide-react";

interface Message {
  id: number;
  sender: "doctor" | "patient";
  text: string;
  time: string;
  read?: boolean;
}

const DoctorPatientChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "patient",
      text: "Hello Doctor, I’ve been having mild chest pain since last night.",
      time: "10:15 AM",
      read: false,
    },
    {
      id: 2,
      sender: "doctor",
      text: "Hello! Could you describe the pain? Is it sharp or dull?",
      time: "10:16 AM",
      read: true,
    },
  ]);

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const unreadCount = messages.filter(
    (msg) => msg.sender === "patient" && !msg.read
  ).length;

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        sender: "doctor",
        text: input,
        time: "Now",
        read: true,
      },
    ]);
    setInput("");
  };

  const handleOpenChat = () => {
    setIsOpen(true);
    setMessages((prev) =>
      prev.map((m) => (m.sender === "patient" ? { ...m, read: true } : m))
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <motion.button
          onClick={handleOpenChat}
          className="relative bg-gradient-to-br cursor-pointer from-[#8a4baf] to-[#c6658e] p-5 rounded-full shadow-xl hover:shadow-2xl transition-all group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            boxShadow:
              "0 10px 25px -5px rgba(214,119,158,0.4), 0 8px 12px -6px rgba(45,19,53,0.25)",
          }}
        >
          <MessageCircle className="h-7 w-7 text-white" />
          {unreadCount > 0 && (
            <motion.span
              className="absolute -top-2 -right-2 bg-[#d6779e] text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500 }}
            >
              {unreadCount}
            </motion.span>
          )}
        </motion.button>
      )}

      {/* Overlay + Chat */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Chat Box */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-20 right-6 z-50 flex flex-col h-[600px] w-[380px] border border-gray-100 rounded-2xl shadow-2xl bg-white overflow-hidden"
              style={{
                boxShadow:
                  "0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1) inset",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between bg-gradient-to-r from-[#2d1335] to-[#8a4baf] px-6 py-5 text-white relative">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Stethoscope className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg">Dr. Meera Sharma</h2>
                    <p className="text-sm text-white/80 font-medium">
                      Cardiologist • Online
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 cursor-pointer rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-white/90 hover:text-white" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 bg-gradient-to-b from-[#fbf3f6] to-white">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${
                      msg.sender === "doctor"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm relative ${
                        msg.sender === "doctor"
                          ? "bg-gradient-to-r from-[#8a4baf] to-[#c6658e] text-white shadow-md"
                          : "bg-white text-gray-800 border border-[#f0e1e8] shadow-sm"
                      }`}
                    >
                      <p className="leading-relaxed">{msg.text}</p>
                      <div
                        className={`flex items-center gap-2 mt-2 text-xs ${
                          msg.sender === "doctor"
                            ? "text-white/70"
                            : "text-gray-500"
                        }`}
                      >
                        <span>{msg.time}</span>
                        {msg.sender === "doctor" && (
                          <CheckCheck className="h-3 w-3" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-100 bg-white px-5 py-4">
                <div className="flex items-center gap-3 bg-[#fbf3f6] rounded-full px-4 py-2 border border-[#f0e1e8] focus-within:ring-2 focus-within:ring-[#d6779e]/30">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 placeholder-gray-400 py-1"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  />
                  <motion.button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className={`p-2 rounded-full transition-all ${
                      input.trim()
                        ? "bg-gradient-to-r from-[#8a4baf] to-[#c6658e] text-white shadow-md hover:shadow-lg"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                    whileHover={input.trim() ? { scale: 1.05 } : {}}
                    whileTap={input.trim() ? { scale: 0.95 } : {}}
                  >
                    <Send className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorPatientChat;
