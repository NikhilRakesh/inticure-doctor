"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { baseurl } from "../../lib/api";

// Type definitions
interface Message {
  id?: number | string;
  content: string;
  sender_id: string;
  sender_name: string;
  timestamp: string;
  isCurrentUser: boolean;
}

interface WebSocketMessage {
  type: "message" | "typing" | "error" | "chat_history";
  content?: string;
  sender_id?: string;
  sender_name?: string;
  timestamp?: string;
  user_id?: string;
  is_typing?: boolean;
  message?: string;
  messages?: Message[];
  isCurrentUser?: boolean;
}

interface InticureChatProps {
  sessionId: string;
  token: string;
  userId: string;
  isSessionOpen?: boolean;
  csrfToken: string;
  customer?: string | null;
  doctor?: string | null;
  admin?: string | null;
  initialMessages?: Message[];
  containerMode?: boolean;
}

type ConnectionStatus = "connected" | "disconnected" | "connecting";

const ChatBox: React.FC<InticureChatProps> = ({
  sessionId,
  token,
  userId,
  isSessionOpen = true,
  csrfToken,
  customer = null,
  doctor = null,
  admin = null,
  initialMessages = [],
  containerMode = false,
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typingUser, setTypingUser] = useState<string>("");
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [error, setError] = useState<string>("");

  const messageContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatSocketRef = useRef<WebSocket | null>(null);
  const lastMessageTimeRef = useRef<number>(0);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const MESSAGE_RATE_LIMIT = 1000;

  const clearTimeouts = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Initialize WebSocket connection
  const initWebSocket = useCallback((): void => {
    if (typeof window === "undefined") return;

    // Close existing connection
    if (chatSocketRef.current) {
      chatSocketRef.current.close();
    }

    // const wsProtocol =
    //   window.location.protocol === "https:" ? "wss://" : "ws://";
    const queryString = `?token=${encodeURIComponent(token)}`;
    const url = new URL(baseurl);
    const baseHost = url.host;
    const wsUrl = `wss://${baseHost}/ws/support/${sessionId}/${queryString}`;

    setConnectionStatus("connecting");
    chatSocketRef.current = new WebSocket(wsUrl);

    chatSocketRef.current.onopen = (): void => {
      setConnectionStatus("connected");
      setError("");
      clearTimeouts();

      chatSocketRef.current?.send(
        JSON.stringify({
          type: "load_history",
        })
      );
    };

    chatSocketRef.current.onmessage = (e: MessageEvent): void => {
      try {
        const data: WebSocketMessage = JSON.parse(e.data);
        handleSocketMessage(data);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    chatSocketRef.current.onclose = (e: CloseEvent): void => {
      setConnectionStatus("disconnected");
      if (e.code === 4003) {
        setError("Session expired or invalid. Please refresh the page.");
      } else if (e.code === 4005) {
        setError(
          "Message rate limit exceeded. Please wait before sending more messages."
        );
      } else if (!e.wasClean) {
        // Auto-reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          initWebSocket();
        }, 3000);
      }
    };

    chatSocketRef.current.onerror = (): void => {
      setError("Connection error. Please check your network.");
      setConnectionStatus("disconnected");
    };
  }, [sessionId, token]);

  // Handle incoming WebSocket messages
  const handleSocketMessage = useCallback(
    (data: WebSocketMessage): void => {
      switch (data.type) {
        case "chat_history":
          if (data.messages && Array.isArray(data.messages)) {
            setMessages(data.messages);
          }
          break;

        case "message":
          if (
            data.content &&
            data.sender_id &&
            data.sender_name &&
            data.timestamp
          ) {
            const newMessage: Message = {
              id: `${data.sender_id}-${data.timestamp}-${Date.now()}`, // More unique ID
              content: data.content,
              sender_id: data.sender_id,
              sender_name: data.sender_name,
              timestamp: data.timestamp,
              isCurrentUser: data.isCurrentUser ? true : false,
            };

            // Prevent duplicate messages by checking if message already exists
            setMessages((prev) => {
              const exists = prev.some(
                (msg) =>
                  msg.content === newMessage.content &&
                  msg.sender_id === newMessage.sender_id &&
                  msg.timestamp === newMessage.timestamp
              );

              if (exists) {
                return prev;
              }

              return [...prev, newMessage];
            });
          }
          break;

        case "typing":
          if (data.user_id !== userId && data.sender_name) {
            setTypingUser(data.sender_name);
            setIsTyping(data.is_typing ?? false);
          }
          break;

        case "error":
          if (data.message) {
            setError(data.message);
          }
          break;
      }
    },
    [userId]
  );

  // Send message via WebSocket
  const sendMessage = useCallback((): void => {
    const now = Date.now();
    if (now - lastMessageTimeRef.current < MESSAGE_RATE_LIMIT) {
      setError("Please wait before sending another message");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const message = inputValue.trim();
    if (!message) return;

    if (
      chatSocketRef.current &&
      chatSocketRef.current.readyState === WebSocket.OPEN
    ) {
      chatSocketRef.current.send(
        JSON.stringify({
          type: "message",
          message: message,
          csrfmiddlewaretoken: csrfToken,
        })
      );

      lastMessageTimeRef.current = now;
      setInputValue("");
      sendTypingIndicator(false);
    } else {
      setError("Connection not ready. Please wait...");
      setTimeout(() => setError(""), 3000);
    }
  }, [inputValue, csrfToken]);

  // Send typing indicator
  const sendTypingIndicator = useCallback(
    (isTypingNow: boolean): void => {
      if (
        chatSocketRef.current &&
        chatSocketRef.current.readyState === WebSocket.OPEN
      ) {
        chatSocketRef.current.send(
          JSON.stringify({
            type: "typing",
            is_typing: isTypingNow,
            csrfmiddlewaretoken: csrfToken,
          })
        );

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        if (isTypingNow) {
          typingTimeoutRef.current = setTimeout(() => {
            sendTypingIndicator(false);
          }, 2000);
        }
      }
    },
    [csrfToken]
  );

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ): void => {
    setInputValue(e.target.value);
    sendTypingIndicator(e.target.value.length > 0);
  };

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Scroll to bottom
  const scrollToBottom = useCallback((): void => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, []);

  // Get welcome message
  const getWelcomeMessage = (): string => {
    if (customer) return `${customer}`;
    if (doctor) return `${doctor}`;
    if (admin) return `${admin}`;
    return "Guest";
  };

  // Format timestamp
  const formatTime = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  // Effects
  useEffect(() => {
    if (typeof window !== "undefined") {
      initWebSocket();
    }

    return () => {
      clearTimeouts();
      if (chatSocketRef.current) {
        chatSocketRef.current.close();
      }
    };
  }, [initWebSocket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => {
        setError("");
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [error]);

  if (containerMode) {
    return (
      <div className="h-full flex flex-col">
        {/* Connection Status Bar */}
        {connectionStatus !== "connected" && (
          <div className="px-3 py-1 bg-gray-100 border-b text-center">
            <div className="flex items-center justify-center gap-2 text-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === "connecting"
                    ? "bg-yellow-400 animate-pulse"
                    : "bg-red-400"
                }`}
              ></span>
              <span className="text-gray-600">
                {connectionStatus === "connecting"
                  ? "Connecting..."
                  : "Disconnected"}
              </span>
            </div>
          </div>
        )}

        {/* Messages Container */}
        <div
          ref={messageContainerRef}
          className="flex-1 p-3 overflow-y-auto bg-gray-50 flex flex-col gap-2"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 m-auto">
              <p className="text-sm">Welcome to Inticure Support!</p>
              <p className="text-xs text-gray-400 mt-1">
                How can we help you today?
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={
                  message.id ||
                  `${message.sender_id}-${message.timestamp}-${index}`
                }
                className={`max-w-xs w-4/5  p-2 rounded-lg text-xs animate-fade-in ${
                  message.isCurrentUser
                    ? "self-end bg-[#4c2d67] text-white rounded-br-sm"
                    : "self-start bg-white border border-gray-200 rounded-bl-sm text-gray-800"
                }`}
              >
                <div className="message-content break-words">
                  {message.content}
                </div>
                <div
                  className={`text-xs mt-1 opacity-70 ${
                    message.isCurrentUser ? "text-end" : "text-start"
                  }`}
                >
                  <span>{formatTime(message.timestamp)}</span>
                </div>
              </div>
            ))
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="text-gray-500 italic text-xs px-2 animate-fade-in">
              {typingUser} is typing...
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-2 py-1 rounded text-xs animate-fade-in">
              {error}
            </div>
          )}
        </div>

        {/* Input Container */}
        {isSessionOpen ? (
          <div className="p-2 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                maxLength={2000}
                rows={1}
                className="flex-1 text-gray-900 p-2 border border-gray-300 rounded text-xs resize-none transition-colors min-h-8 max-h-20 focus:outline-none focus:border-[#431d64] focus:ring-1 focus:ring-[#9d4ce4]"
                style={{ height: "auto", minHeight: "32px", maxHeight: "80px" }}
              />
              <button
                onClick={sendMessage}
                disabled={
                  !inputValue.trim() || connectionStatus !== "connected"
                }
                className="px-3 py-2 text-white rounded text-xs bg-[#672f99] hover:bg-[#431d64] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        ) : (
          <div className="p-2 bg-gray-100 text-center">
            <p className="text-gray-600 text-xs">Chat session is closed</p>
          </div>
        )}
      </div>
    );
  }

  // Legacy standalone mode (fixed bottom-right popup)
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className="bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 ease-in-out animate-slide-up flex flex-col"
        style={{ width: "350px", height: "500px" }}
      >
        {/* Chat Header */}
        <div className="bg-[#431d64] text-white p-3 rounded-t-lg flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold">Inticure Support</h4>
            <div className="flex items-center gap-2 text-xs">
              <span>{getWelcomeMessage()}</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === "connected"
                    ? "bg-green-400"
                    : connectionStatus === "connecting"
                    ? "bg-yellow-400"
                    : "bg-red-400"
                }`}
              ></span>
              <span className="text-xs opacity-75">{connectionStatus}</span>
            </div>
          </div>
        </div>

        {/* Chat Body */}
        <div className="flex-1 flex flex-col">
          {/* Connection Status Bar */}
          {connectionStatus !== "connected" && (
            <div className="px-3 py-1 bg-gray-100 border-b text-center">
              <div className="flex items-center justify-center gap-2 text-xs">
                <span
                  className={`w-2 h-2 rounded-full ${
                    connectionStatus === "connecting"
                      ? "bg-yellow-400 animate-pulse"
                      : "bg-red-400"
                  }`}
                ></span>
                <span className="text-gray-600">
                  {connectionStatus === "connecting"
                    ? "Connecting..."
                    : "Disconnected"}
                </span>
              </div>
            </div>
          )}

          {/* Messages Container */}
          <div
            ref={messageContainerRef}
            className="flex-1 p-3 overflow-y-auto bg-gray-50 flex flex-col gap-2"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 m-auto">
                <p className="text-sm">Welcome to Inticure Support!</p>
                <p className="text-xs text-gray-400 mt-1">
                  How can we help you today?
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={
                    message.id ||
                    `${message.sender_id}-${message.timestamp}-${index}`
                  }
                  className={`max-w-xs p-2 rounded-lg text-xs animate-fade-in ${
                    message.isCurrentUser
                      ? "self-end bg-[#4c2d67] text-white rounded-br-sm"
                      : "self-start bg-white border border-gray-200 rounded-bl-sm text-gray-800"
                  }`}
                >
                  <div className="message-content break-words">
                    {message.content}
                  </div>
                  <div
                    className={`text-xs mt-1 opacity-70 ${
                      message.isCurrentUser ? "text-end" : "text-start"
                    }`}
                  >
                    <span>{formatTime(message.timestamp)}</span>
                  </div>
                </div>
              ))
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="text-gray-500 italic text-xs px-2 animate-fade-in">
                {typingUser} is typing...
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-2 py-1 rounded text-xs animate-fade-in">
                {error}
              </div>
            )}
          </div>

          {/* Input Container */}
          {isSessionOpen ? (
            <div className="p-2 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  maxLength={2000}
                  rows={1}
                  className="flex-1 text-gray-900 p-2 border border-gray-300 rounded text-xs resize-none transition-colors min-h-8 max-h-20 focus:outline-none focus:border-[#431d64] focus:ring-1 focus:ring-[#9d4ce4]"
                  style={{
                    height: "auto",
                    minHeight: "32px",
                    maxHeight: "80px",
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={
                    !inputValue.trim() || connectionStatus !== "connected"
                  }
                  className="px-3 py-2 text-white rounded text-xs bg-[#672f99] hover:bg-[#431d64] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          ) : (
            <div className="p-2 bg-gray-100 text-center">
              <p className="text-gray-600 text-xs">Chat session is closed</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
