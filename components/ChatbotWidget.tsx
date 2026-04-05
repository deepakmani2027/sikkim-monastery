'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Volume2, VolumeX } from 'lucide-react';
import AvatarMode from './AvatarMode';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const MONK_AVATAR = "https://static.prod-images.emergentagent.com/jobs/555f74e7-3ced-43c1-b248-5241d6ead246/images/a0c4d98db915762b6db9b6c2eca4343838f1e0962a9e7eaf5038f6486af91618.png";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'voice'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Welcome, traveler... to the sacred monasteries of Sikkim. I am Tenzin... your guide. How may I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [speakMode, setSpeakMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('open-chatbot', handler);
    return () => window.removeEventListener('open-chatbot', handler);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          speak_mode: speakMode,
        }),
      });

      if (!res.ok) throw new Error('Chat failed');
      const data = await res.json();

      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);

      if (data.audio_url && speakMode) {
        playAudio(data.audio_url);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Forgive me, traveler... my connection to the world has momentarily faltered. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading, speakMode]);

  const playAudio = (url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    setIsPlaying(true);
    audio.play();
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <audio ref={audioRef} hidden />

      {/* Floating Trigger Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl shadow-monk-red/30 overflow-hidden border-2 border-monk-red/40 hover:border-monk-red transition-all duration-300"
            data-testid="chatbot-trigger"
            style={{ animation: 'pulse-breathe 3s ease-in-out infinite' }}
          >
            <img src={MONK_AVATAR} alt="Tenzin" className="w-full h-full object-cover" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-48px)] rounded-2xl overflow-hidden flex flex-col"
            style={{
              background: 'rgba(245, 245, 240, 0.85)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.4)',
              boxShadow: '0 25px 60px rgba(26,54,34,0.15), 0 8px 24px rgba(139,58,43,0.1)',
            }}
            data-testid="chatbot-window"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-sage/30">
                  <img src={MONK_AVATAR} alt="Tenzin" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-medium text-forest">Tenzin</h3>
                  <p className="font-body text-xs text-forest-light">Monk Guide</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-sand/60 flex items-center justify-center hover:bg-sand transition-colors"
                data-testid="chatbot-close-btn"
              >
                <X size={16} className="text-forest" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border-subtle/50">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-3 font-body text-sm font-medium transition-colors duration-300 ${
                  activeTab === 'chat'
                    ? 'text-monk-red border-b-2 border-monk-red'
                    : 'text-forest-light hover:text-forest'
                }`}
                data-testid="chat-tab"
              >
                <MessageCircle size={14} className="inline mr-2" />
                Chat
              </button>
              <button
                onClick={() => setActiveTab('voice')}
                className={`flex-1 py-3 font-body text-sm font-medium transition-colors duration-300 ${
                  activeTab === 'voice'
                    ? 'text-monk-red border-b-2 border-monk-red'
                    : 'text-forest-light hover:text-forest'
                }`}
                data-testid="voice-tab"
              >
                <Volume2 size={14} className="inline mr-2" />
                Voice
              </button>
            </div>

            {/* Content */}
            {activeTab === 'chat' ? (
              <>
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" data-testid="chat-messages">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] px-4 py-3 rounded-2xl font-body text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-sage/30 text-forest rounded-br-sm'
                            : 'bg-bone border border-border-subtle text-forest rounded-bl-sm'
                        }`}
                        data-testid={`chat-message-${i}`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-bone border border-border-subtle px-4 py-3 rounded-2xl rounded-bl-sm" data-testid="chat-loading">
                        <div className="flex gap-1.5">
                          <span className="w-2 h-2 bg-sage rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-sage rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-sage rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="px-4 py-3 border-t border-border-subtle/50">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSpeakMode(!speakMode)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                        speakMode ? 'bg-monk-red text-bone' : 'bg-sand/60 text-forest-light hover:bg-sand'
                      }`}
                      title={speakMode ? 'Voice responses ON' : 'Voice responses OFF'}
                      data-testid="speak-mode-toggle"
                    >
                      {speakMode ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    </button>
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask Tenzin..."
                      className="flex-1 bg-sand/40 border border-border-subtle rounded-full px-4 py-2.5 font-body text-sm text-forest placeholder:text-forest-light/50 focus:outline-none focus:ring-2 focus:ring-monk-red/20 focus:border-monk-red/30 transition-all"
                      data-testid="chat-input"
                      disabled={loading}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim() || loading}
                      className="w-9 h-9 rounded-full bg-monk-red text-bone flex items-center justify-center hover:bg-monk-red/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      data-testid="chat-send-btn"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <AvatarMode />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breathing animation style */}
      <style>{`
        @keyframes pulse-breathe {
          0%, 100% { box-shadow: 0 0 0 0 rgba(139, 58, 43, 0.4); }
          50% { box-shadow: 0 0 0 12px rgba(139, 58, 43, 0); }
        }
      `}</style>
    </>
  );
}
