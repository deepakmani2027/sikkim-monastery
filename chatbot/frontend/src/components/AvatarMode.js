import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Phone, PhoneOff } from 'lucide-react';
import { createClient } from '@anam-ai/js-sdk';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const MONK_AVATAR_IMG = "https://static.prod-images.emergentagent.com/jobs/555f74e7-3ced-43c1-b248-5241d6ead246/images/a0c4d98db915762b6db9b6c2eca4343838f1e0962a9e7eaf5038f6486af91618.png";

export default function AvatarMode() {
  const [status, setStatus] = useState('idle');
  const [statusMsg, setStatusMsg] = useState('Start a voice session with Tenzin');
  const clientRef = useRef(null);
  const videoRef = useRef(null);

  const startSession = useCallback(async () => {
    try {
      setStatus('connecting');
      setStatusMsg('Creating session...');

      // Get session token from backend
      const res = await fetch(`${API_URL}/api/anam/session-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Session token failed: ${res.status}`);
      }

      const { sessionToken } = await res.json();
      if (!sessionToken) throw new Error('No session token received');

      setStatusMsg('Connecting to Tenzin...');

      // Create Anam client
      const client = createClient(sessionToken, {
        disableInputAudio: false,
      });

      clientRef.current = client;

      // Stream to video element
      await client.streamToVideoElement('tenzin-avatar-video');

      setStatus('connected');
      setStatusMsg('Connected! Speak to Tenzin... he is listening');

    } catch (err) {
      console.error('Anam session error:', err);
      setStatus('error');
      setStatusMsg(err.message || 'Connection failed. Please try again.');
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
    <div className="flex-1 flex flex-col items-center justify-center p-6" data-testid="avatar-mode">
      {/* Avatar Area */}
      <div className="relative w-56 h-56 mb-6">
        {/* Pulsing rings when connected */}
        {status === 'connected' && (
          <>
            <div className="absolute inset-0 rounded-2xl border-2 border-monk-red/20 animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-2 rounded-2xl border border-monk-red/15 animate-ping" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }} />
          </>
        )}

        {/* Video element for Anam avatar stream */}
        <video
          ref={videoRef}
          id="tenzin-avatar-video"
          autoPlay
          playsInline
          className={`w-full h-full rounded-2xl object-cover border-2 border-sage/30 bg-sand ${
            status === 'connected' ? 'block' : 'hidden'
          }`}
          data-testid="avatar-video"
        />

        {/* Static avatar shown when not connected */}
        {status !== 'connected' && (
          <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-sage/30 bg-sand">
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
      <p className="font-body text-sm text-forest-light mb-2 text-center" data-testid="avatar-status">
        {statusMsg}
      </p>

      {status === 'connected' && (
        <p className="font-body text-xs text-sage mb-4 text-center">
          Speak naturally. Tenzin will respond with voice and animation.
        </p>
      )}

      {/* Controls */}
      <div className="flex items-center gap-4 mt-2">
        {(status === 'idle' || status === 'error') && (
          <button
            onClick={startSession}
            className="flex items-center gap-2 bg-monk-red text-bone px-6 py-3 rounded-full font-body text-sm font-medium hover:bg-monk-red/90 transition-all duration-300 hover:shadow-lg hover:shadow-monk-red/20"
            data-testid="start-voice-btn"
          >
            <Phone size={16} />
            Start Voice Session
          </button>
        )}

        {status === 'connecting' && (
          <div className="flex items-center gap-2 bg-sand text-forest-light px-6 py-3 rounded-full font-body text-sm">
            <div className="w-4 h-4 border-2 border-monk-red/40 border-t-monk-red rounded-full animate-spin" />
            Connecting...
          </div>
        )}

        {status === 'connected' && (
          <button
            onClick={stopSession}
            className="flex items-center gap-2 bg-forest text-bone px-6 py-3 rounded-full font-body text-sm font-medium hover:bg-forest/90 transition-all duration-300"
            data-testid="stop-voice-btn"
          >
            <PhoneOff size={16} />
            End Session
          </button>
        )}
      </div>

      {/* Error retry hint */}
      {status === 'error' && (
        <p className="font-body text-xs text-monk-red/70 mt-3 text-center max-w-xs">
          Tip: Make sure to allow microphone access when prompted by your browser.
        </p>
      )}

      {/* Info */}
      <div className="mt-6 text-center">
        <p className="font-body text-xs text-forest-light/60 leading-relaxed max-w-xs">
          Voice mode uses your microphone. Allow access when prompted. The avatar will respond with speech and facial expressions.
        </p>
      </div>
    </div>
  );
}
