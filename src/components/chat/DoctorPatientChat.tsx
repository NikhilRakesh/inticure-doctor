"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Stethoscope, MessageCircle, X, ArrowLeft } from "lucide-react";
import { useAuthStore } from "../../features/Auth/authSlice";
import { useQuery } from "@tanstack/react-query";
import { token_api } from "../../lib/api";
import { format, parseISO } from "date-fns";
import ChatBox from "./ChatBox";
import { useSearchParams } from "react-router-dom";

interface Participant {
  user_id: number;
  username: string;
  is_current_user: boolean;
  is_active: boolean;
  joined_at: string;
  role: string;
  display_name: string;
  doctor_id?: number;
  customer_id?: number;
}

interface LastMessage {
  id: number;
  content: string;
  sender_id: number;
  sender_name: string;
  timestamp: string;
  is_from_current_user: boolean;
}

interface Session {
  session_id: number;
  description: string;
  created_at: string;
  closed_at: string | null;
  is_open: boolean;
  created_by: string;
  expires_at: string;
  participants: Participant[];
  participant_count: number;
  last_message: LastMessage;
  unread_count: number;
  user_token: string;
  can_join: boolean;
  chat_url: string;
}

interface ApiResponse {
  success: boolean;
  user_id: number;
  username: string;
  total_sessions: number;
  sessions: Session[];
}

const DoctorPatientChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Session | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const accessToken = useAuthStore((state) => state.accessToken);
  const [totalUnreadCount, setTotalUnreadCount] = useState<number>(0);
  const [searchParams] = useSearchParams();
  const aid = searchParams.get("aid");
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedPatient]);

  useQuery({
    queryKey: ["initiate_chat_doctor_patient"],
    queryFn: () => {
      return token_api(accessToken)
        .get(`chat/initiate_chat_doctor_patient/?appointment_id=${aid}`)
        .then((res) => {
          return res.data;
        })
        .then(() => refetch());
    },
  });

  useQuery({
    queryKey: ["initiate_chat_doctor_admin"],
    queryFn: () => {
      return token_api(accessToken)
        .get(`chat/initiate_chat_doctor_admin/`)
        .then((res) => {
          return res.data;
        });
    },
  });

  const { data, refetch } = useQuery<ApiResponse>({
    queryKey: ["active_sessions"],
    queryFn: () => {
      return token_api(accessToken)
        .post("chat/active_sessions/", {
          include_closed: false,
          limit: 20,
          appointment_id: aid,
        })
        .then((res) => {
          const unreadTotal = res.data.sessions.reduce(
            (sum: number, session: Session) => sum + session.unread_count,
            0
          );
          setTotalUnreadCount(unreadTotal);
          return res.data;
        });
    },
    enabled: false,
  });

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <motion.button
          onClick={() => setIsOpen(true)}
          className="relative bg-gradient-to-br from-[#8a4baf] to-[#c6658e] p-5 rounded-full shadow-xl hover:shadow-2xl transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageCircle className="h-7 w-7 text-white" />
          {totalUnreadCount > 0 && (
            <motion.span
              className="absolute -top-2 -right-2 bg-[#d6779e] text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500 }}
            >
              {totalUnreadCount}
            </motion.span>
          )}
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              onClick={() => {
                setIsOpen(false);
                setSelectedPatient(null);
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Chat Container */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-20 right-6 z-50 flex h-[80vh] w-[90vw] max-w-[1000px] rounded-2xl overflow-hidden bg-white shadow-2xl border border-gray-200"
            >
              {/* Sidebar */}
              <div
                className={`w-full md:w-[300px] border-r border-gray-200 bg-gradient-to-b from-[#fbf3f6] to-white
  ${selectedPatient ? "hidden md:block" : "block"}`}
              >
                <div className="px-4 py-3 border-b border-gray-200 bg-white font-semibold text-gray-700">
                  Patients
                </div>
                <div className="overflow-y-auto custom-scrollbar h-[calc(80vh-60px)]">
                  {data &&
                    data?.sessions.map((session) => {
                      return (
                        <button
                          key={session.session_id}
                          onClick={() => setSelectedPatient(session)}
                          className={`w-full flex items-center justify-between cursor-pointer px-4 py-3 text-left hover:bg-[#f9f1f5] transition ${
                            selectedPatient?.session_id === session.session_id
                              ? "bg-[#f3e1f0]"
                              : ""
                          }`}
                        >
                          <div>
                            <p className="font-medium text-gray-800">
                              {session.description}
                            </p>
                            <p className="text-xs text-gray-500 truncate w-[180px]">
                              {session.last_message?.content}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-xs text-gray-400">
                              {format(
                                parseISO(session.last_message.timestamp),
                                "hh:mm a"
                              )}
                            </span>
                            {session.unread_count > 0 && (
                              <span className="bg-[#d6779e] text-white text-xs px-2 py-0.5 rounded-full">
                                {session.unread_count}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Chat Window */}
              <div
                className={`flex-1 flex flex-col ${
                  !selectedPatient ? "hidden md:flex" : "flex"
                }`}
              >
                {data && accessToken && selectedPatient ? (
                  <>
                    <div className="flex items-center justify-between bg-gradient-to-r from-[#2d1335] to-[#8a4baf] px-6 py-5 text-white">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setSelectedPatient(null)}
                          className="md:hidden p-2 rounded-full hover:bg-white/10"
                        >
                          <ArrowLeft className="h-5 w-5 text-white" />
                        </button>

                        <div className="relative">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <Stethoscope className="h-6 w-6 text-white" />
                          </div>
                          {selectedPatient.is_open && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <div>
                          <h2 className="font-semibold text-lg">
                            {selectedPatient.description}
                          </h2>
                          {/* <p className="text-sm text-white/80 font-medium">
                            {selectedPatient.specialization} •{" "}
                            {selectedPatient.online ? "Online" : "Offline"}
                          </p> */}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          setSelectedPatient(null);
                        }}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                      >
                        <X className="h-5 w-5 text-white/90 hover:text-white" />
                      </button>
                    </div>
                    <ChatBox
                      sessionId={selectedPatient.session_id.toString()}
                      token={selectedPatient.user_token}
                      userId={data.username}
                      csrfToken="csrf-token"
                      isSessionOpen={selectedPatient.is_open}
                      containerMode={true}
                    />
                  </>
                ) : (
                  <div className="hidden md:flex flex-1 items-center justify-center text-gray-400 text-sm">
                    Select a patient to start chatting
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorPatientChat;
