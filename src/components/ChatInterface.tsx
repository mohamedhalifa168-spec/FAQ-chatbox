import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getChatResponse } from '../services/gemini';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'bot',
      text: "Hello! I'm your FAQ assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: m.text }]
      }));

      const responseText = await getChatResponse(userMessage.text, history);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: responseText || "I'm sorry, I couldn't process that request.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: "Oops! Something went wrong. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-zinc-50 shadow-2xl border-x border-zinc-200">
      {/* Header */}
      <header className="p-4 border-b border-zinc-200 bg-white flex items-center gap-3 sticky top-0 z-10">
        <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white">
          <Bot size={24} />
        </div>
        <div>
          <h1 className="font-semibold text-zinc-900">FAQ Assistant</h1>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-zinc-500">Online & Ready</span>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}
            >
              {message.role === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 flex-shrink-0 mb-1">
                  <Bot size={16} />
                </div>
              )}
              <div className={message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                <span className={`text-[10px] mt-1 block opacity-50 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 flex-shrink-0 mb-1">
                  <User size={16} />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start items-center gap-2"
          >
            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600">
              <Bot size={16} />
            </div>
            <div className="chat-bubble-bot flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-zinc-400" />
              <span className="text-sm text-zinc-400 italic">Thinking...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <footer className="p-4 bg-white border-t border-zinc-200">
        <form 
          onSubmit={handleSend}
          className="relative flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 bg-zinc-100 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-zinc-900 transition-all outline-none pr-12"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-1.5 p-2 bg-zinc-900 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
        <p className="text-[10px] text-center text-zinc-400 mt-3 flex items-center justify-center gap-1">
          <MessageSquare size={10} />
          Powered by Gemini AI • Instant FAQ Support
        </p>
      </footer>
    </div>
  );
}
