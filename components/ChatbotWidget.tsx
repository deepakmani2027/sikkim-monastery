'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Mic, MicOff, X, Send, Volume2, VolumeX } from 'lucide-react';
import AvatarMode from './AvatarMode';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const MONK_AVATAR = "https://static.prod-images.emergentagent.com/jobs/555f74e7-3ced-43c1-b248-5241d6ead246/images/a0c4d98db915762b6db9b6c2eca4343838f1e0962a9e7eaf5038f6486af91618.png";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    { role: 'assistant', content: 'Welcome, traveler! I am Tenzin, your guide to the sacred monasteries of Sikkim. How may I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [speakMode, setSpeakMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputValueRef = useRef(''); // Synchronous ref for the current input value
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const shouldKeepListeningRef = useRef(false);
  const speechTextRef = useRef('');

  // Keep the ref in sync with the input state
  useEffect(() => {
    inputValueRef.current = input;
  }, [input]);

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('open-chatbot', handler);
    return () => window.removeEventListener('open-chatbot', handler);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const speechWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };

    const SpeechRecognitionClass = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      if (shouldKeepListeningRef.current) {
        window.setTimeout(() => {
          try {
            recognition.start();
          } catch (error) {
            console.error('Speech recognition restart failed:', error);
            setIsListening(false);
            shouldKeepListeningRef.current = false;
          }
        }, 250);
        return;
      }

      setIsListening(false);
    };
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event);

      if (shouldKeepListeningRef.current) {
        window.setTimeout(() => {
          try {
            recognition.start();
          } catch (error) {
            console.error('Speech recognition restart failed:', error);
            setIsListening(false);
            shouldKeepListeningRef.current = false;
          }
        }, 250);
        return;
      }

      setIsListening(false);
    };
    recognition.onresult = (event) => {
      let transcript = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        if (event.results[index].isFinal) {
          transcript += event.results[index][0].transcript;
        }
      }

      const transcriptTrimmed = transcript.trim();

      if (!transcriptTrimmed) {
        return;
      }

      const currentValue = inputRef.current?.value ?? '';
      const baseValue = currentValue.trimEnd() || speechTextRef.current.trimEnd();
      const nextValue = baseValue
        ? `${baseValue} ${transcriptTrimmed}`
        : transcriptTrimmed;

      speechTextRef.current = nextValue;

      setInput(nextValue);
      window.requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  const playAudio = useCallback((url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(url);
    setIsPlaying(true);
    audio.play().catch(e => console.error('Audio play failed:', e));
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => {
      setIsPlaying(false);
      console.error('Audio error');
    };
  }, []);

  const stripGreeting = (text: string): string => {
    const greeting = 'Welcome, traveler... to the sacred monasteries of Sikkim. I am Tenzin... your guide. ';
    if (text.startsWith(greeting)) {
      return text.substring(greeting.length).trim();
    }
    return text;
  };

  const sendMessage = useCallback(async (messageText: string) => {
    const trimmed = messageText.trim();
    if (!trimmed || loading) return;

    const userMsg = { role: 'user', content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    speechTextRef.current = '';
    setLoading(true);

    setTimeout(() => inputRef.current?.focus(), 100);

    if (!API_URL) {
      console.warn('API_URL not configured - using mock response');
      setTimeout(() => {
        const mockReply = `The winds echo your words: "${trimmed}". But the sacred connection to the backend is missing. Please set NEXT_PUBLIC_BACKEND_URL.`;
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: stripGreeting(mockReply)
        }]);
        setLoading(false);
      }, 800);
      return;
    }

    try {
      // Create abort controller with 10 second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [userMsg],
          speak_mode: speakMode,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const reply = data.text || data.message || data.response || 'I have received your message, traveler.';
      const cleanedReply = stripGreeting(reply);
      
      setMessages(prev => [...prev, { role: 'assistant', content: cleanedReply }]);

      if (data.audio_url && speakMode) {
        playAudio(data.audio_url);
      }
    } catch (err: any) {
      console.error('API error:', err);
      const isTimeout = err.name === 'AbortError';
      const errorMsg = isTimeout 
        ? 'The backend is taking too long to respond. Please check if the server is running and try again.'
        : 'Forgive me, traveler... my connection to the world has momentarily faltered. Please try again.';
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: stripGreeting(errorMsg)
      }]);
    } finally {
      setLoading(false);
    }
  }, [loading, speakMode, playAudio, API_URL]);

  const toggleSpeechToText = () => {
    const recognition = recognitionRef.current;

    if (!recognition) {
      console.warn('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      shouldKeepListeningRef.current = false;
      recognition.stop();
      return;
    }

    shouldKeepListeningRef.current = true;
    recognition.start();
  };

  // Direct send handler using the ref to avoid closure issues
  const handleSend = () => {
    const currentInput = inputValueRef.current;
    if (currentInput.trim() && !loading) {
      sendMessage(currentInput);
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
            initial={{ opacity: 0, y: 40, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 280, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-48px)] h-[620px] max-h-[calc(100vh-48px)] rounded-3xl overflow-hidden flex flex-col"
            style={{
              background: 'linear-gradient(135deg, #faf8f3 0%, #f5f3ee 100%)',
              boxShadow: '0 30px 80px rgba(26,54,34,0.2), 0 0 40px rgba(139,58,43,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
              border: '1px solid rgba(139,58,43,0.08)',
            }}
          >
            {/* Header */}
            <div className="relative px-6 py-6 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-monk-red/5 to-amber-600/5" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-3 border-white shadow-lg">
                    <img src={MONK_AVATAR} alt="Tenzin" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Tenzin</h3>
                    <p className="text-xs text-gray-600 font-medium">Monk Guide</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-9 h-9 rounded-full bg-gray-200/80 flex items-center justify-center hover:bg-gray-300 transition-colors"
                >
                  <X size={20} className="text-gray-700" />
                </button>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

            {/* Tabs */}
            <div className="flex px-2 py-2 bg-gray-50/50">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeTab === 'chat'
                    ? 'bg-red-800 text-white shadow-md hover:bg-red-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MessageCircle size={18} className={activeTab === 'chat' ? 'text-white' : ''} />
                Chat
              </button>
              <button
                onClick={() => setActiveTab('voice')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeTab === 'voice'
                    ? 'bg-red-800 text-white shadow-md hover:bg-red-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Volume2 size={18} className={activeTab === 'voice' ? 'text-white' : ''} />
                Voice
              </button>
            </div>

            {/* Content */}
            {activeTab === 'chat' ? (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 flex flex-col bg-gradient-to-b from-white/50 to-gray-50/50">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-xs px-5 py-4 rounded-2xl font-medium text-sm leading-relaxed shadow-sm ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-900 rounded-br-none'
                            : 'bg-white border-2 border-gray-200 text-gray-900 rounded-bl-none'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-white border-2 border-gray-200 px-5 py-4 rounded-2xl rounded-bl-none shadow-sm">
                        <div className="flex gap-2">
                          <span className="w-2.5 h-2.5 bg-red-900 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2.5 h-2.5 bg-red-900 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                          <span className="w-2.5 h-2.5 bg-red-900 rounded-full animate-bounce" style={{ animationDelay: '350ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

                {/* Input Area - ULTRA RELIABLE SEND BUTTON */}
                <div className="px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={toggleSpeechToText}
                      type="button"
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${
                        isListening
                          ? 'bg-red-800 text-white hover:bg-red-900'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                      title={isListening ? 'Stop listening' : 'Start speech to text'}
                    >
                      {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
                    
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Ask Tenzin..."
                      className="flex-1 bg-gray-100 border-2 border-gray-200 rounded-full px-5 py-3 font-medium text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-monk-red/40 focus:border-monk-red transition-all"
                      disabled={loading}
                      autoComplete="off"
                    />
                    
                    {/* SEND BUTTON - NO DISABLED, always clickable, uses ref for current value */}
                    <button
                      type="button"
                      onMouseDown={handleSend}
                      className={`min-w-10 min-h-10 w-10 h-10 shrink-0 rounded-full bg-red-800 text-white flex items-center justify-center transition-colors cursor-pointer pointer-events-auto ${
                        (!input.trim() || loading) ? 'opacity-40 cursor-not-allowed' : ''
                      }`}
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

      <style>{`
        @keyframes pulse-breathe {
          0%, 100% { box-shadow: 0 0 0 0 rgba(139, 58, 43, 0.4); }
          50% { box-shadow: 0 0 0 12px rgba(139, 58, 43, 0); }
        }
      `}</style>
    </>
  );
}