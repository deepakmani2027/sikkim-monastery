'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Phone, PhoneOff } from 'lucide-react';
import { createClient } from '@anam-ai/js-sdk';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const MONK_AVATAR_IMG = "https://static.prod-images.emergentagent.com/jobs/555f74e7-3ced-43c1-b248-5241d6ead246/images/a0c4d98db915762b6db9b6c2eca4343838f1e0962a9e7eaf5038f6486af91618.png";

type SessionStatus = 'idle' | 'connecting' | 'connected' | 'error';

export default function AvatarMode() {
  const [status, setStatus] = useState<SessionStatus>('idle');
  const [statusMsg, setStatusMsg] = useState('Start a voice session with Tenzin');
  const clientRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startSession = useCallback(async () => {
    try {
      console.log('[Avatar] Starting session...');
      setStatus('connecting');
      setStatusMsg('Creating session...');

      // Verify video element exists
      const videoElement = document.getElementById('tenzin-avatar-video') as HTMLVideoElement;
      if (!videoElement) {
        throw new Error('Video element not found in DOM');
      }
      console.log('[Avatar] Video element found:', videoElement);

      // Get session token from backend
      console.log('[Avatar] Fetching session token from:', API_URL);
      const res = await fetch(`${API_URL}/api/anam/session-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMsg = data.detail || `HTTP ${res.status}`;
        console.error('[Avatar] Session token error:', errorMsg);
        throw new Error(errorMsg);
      }

      const { sessionToken } = data;
      if (!sessionToken) {
        console.error('[Avatar] No sessionToken in response:', data);
        throw new Error('Server returned no session token');
      }

      console.log('[Avatar] Got session token, initializing Anam SDK...');
      setStatusMsg('Initializing avatar...');

      setStatusMsg('Connecting to Tenzin...');

      // Create Anam client with error handling
      let client;
      try {
        console.log('[Avatar] Creating SDK client...');
        client = createClient(sessionToken, {
          disableInputAudio: false,
        });
        console.log('[Avatar] SDK client created successfully');
      } catch (sdkError) {
        console.error('[Avatar] SDK initialization error:', sdkError);
        throw new Error(`Failed to initialize Anam SDK: ${sdkError instanceof Error ? sdkError.message : String(sdkError)}`);
      }

      clientRef.current = client;

      // Stream to video element with error handling
      try {
        console.log('[Avatar] Starting stream to video element...');
        await client.streamToVideoElement('tenzin-avatar-video');
        console.log('[Avatar] Stream started successfully');
      } catch (streamError) {
        console.error('[Avatar] Stream error:', streamError);
        console.error('[Avatar] Stream error type:', streamError instanceof Error ? streamError.message : typeof streamError);
        throw new Error(`Failed to stream avatar: ${streamError instanceof Error ? streamError.message : String(streamError)}`);
      }

      setStatus('connected');
      setStatusMsg('Connected! Speak to Tenzin... he is listening');

    } catch (err) {
      console.error('[Avatar] Anam session error:', err);
      console.error('[Avatar] Error stack:', err instanceof Error ? err.stack : 'no stack');
      setStatus('error');
      const errorMessage = err instanceof Error ? err.message : String(err);
      setStatusMsg(`Error: ${errorMessage}`);
      // Clean up on error
      if (clientRef.current) {
        try { clientRef.current.stopStreaming(); } catch (e) {}
        clientRef.current = null;
      }
    }
  }, []);

  const stopSession = useCallback(async () => {
    if (clientRef.current) {
      try {
        await clientRef.current.stopStreaming();
      } catch (e) {
        console.error('Stop streaming error:', e);
      }
      clientRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus('idle');
    setStatusMsg('Start a voice session with Tenzin');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clientRef.current) {
        try { clientRef.current.stopStreaming(); } catch (e) {}
        clientRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden w-full" data-testid="avatar-mode">
      {/* Avatar Area */}
      <div className="relative w-64 h-64 mb-6 rounded-3xl overflow-hidden shadow-lg">
        {/* Video element for Anam avatar stream */}
        <video
          ref={videoRef}
          id="tenzin-avatar-video"
          autoPlay
          muted
          playsInline
          className="w-full h-full rounded-3xl object-cover bg-sand"
          data-testid="avatar-video"
        />

        {/* Static avatar shown when not connected */}
        {status !== 'connected' && (
          <div className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden bg-sand z-0">
            <img
              src={MONK_AVATAR_IMG}
              alt="Tenzin Avatar"
              className="w-full h-full object-cover"
              data-testid="avatar-static-image"
            />
          </div>
        )}
      </div>

      {/* Status text */}
      <p className="font-body text-sm text-forest-light mb-1 text-center" data-testid="avatar-status">
        {statusMsg}
      </p>

      {status === 'connected' && (
        <p className="font-body text-xs text-sage mb-3 text-center px-2">
          Speak naturally. Tenzin will respond with voice and animation.
        </p>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3 mt-2 flex-wrap justify-center">
        {(status === 'idle' || status === 'error') && (
          <button
            onClick={startSession}
            className="flex items-center gap-2 bg-green-500 text-white px-8 py-3 rounded-full font-body text-sm font-medium hover:bg-red-950 transition-all duration-300 whitespace-nowrap"
            data-testid="start-voice-btn"
          >
            <Phone size={18} />
            Start Session
          </button>
        )}

        {status === 'connecting' && (
          <div className="flex items-center gap-2 bg-sand text-forest-light px-4 py-2 rounded-full font-body text-xs">
            <div className="w-3 h-3 border-2 border-monk-red/40 border-t-monk-red rounded-full animate-spin" />
            Connecting...
          </div>
        )}

        {status === 'connected' && (
          <button
            onClick={stopSession}
            className="flex items-center gap-2 bg-red-900 text-white px-8 py-3 rounded-full font-body text-sm font-medium hover:bg-red-950 transition-all duration-300 whitespace-nowrap"
            data-testid="stop-voice-btn"
          >
            <PhoneOff size={18} />
            End Session
          </button>
        )}
      </div>

      {/* Error retry hint */}
      {status === 'error' && (
        <p className="font-body text-xs text-monk-red/70 mt-2 text-center max-w-xs px-2">
          Tip: Allow microphone access when prompted by your browser.
        </p>
      )}

      {/* Info */}
      <div className="mt-4 text-center max-h-20 overflow-hidden">
        <p className="font-body text-xs text-forest-light/60 leading-relaxed max-w-xs px-2">
          Voice mode uses your microphone. The avatar will respond with speech and facial expressions.
        </p>
      </div>
    </div>
  );
}
