'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { Camera, StickyNote, Star, Mic, X, Award } from 'lucide-react';
import styles from './ar-game.module.css';

// Mock Data for "Sticker Pack"
const VOCABULARY = [
  { text: 'Table', emoji: '🪑' },
  { text: 'Lamp', emoji: '💡' },
  { text: 'Plant', emoji: '🌿' },
  { text: 'Cup', emoji: '☕' },
  { text: 'Book', emoji: '📚' },
  { text: 'Cat', emoji: '🐱' },
];

interface Note {
  id: number;
  x: number;
  y: number;
  word: string;
  emoji: string;
  rotation: number;
}

export default function ARGamePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [score, setScore] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [currentVocabIndex, setCurrentVocabIndex] = useState(0);

  // Debug State
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const log = (msg: string) => setDebugLog(prev => [msg, ...prev].slice(0, 5));

  // Initialize Camera
  const startCamera = async () => {
    log("Requesting camera...");
    
    // 1. Feature Detection
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Camera API is not available. Please ensure you are using HTTPS or localhost.");
      log("Error: Camera API missing");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      log(`Stream acquired: ${stream.id}`);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
           log("Video metadata loaded");
           videoRef.current?.play().then(() => log("Video playing")).catch(e => log(`Play error: ${e.message}`));
        };
      }
      setHasPermission(true);
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      log(`Error: ${err.message || err}`);
      alert("Could not access camera. Please allow permissions.");
    }
  };

  useEffect(() => {
    // Check if we are in a secure context
    if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      console.warn("Camera requires HTTPS");
      log("Warning: Insecure Context (HTTP)");
    }
    
    // Auto-start (attempt)
    startCamera();
  }, []);

  const handleScreenTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasPermission) return;

    // Don't add note if clicking on UI buttons (handled by stopping propagation if needed, 
    // but since UI is in a separate layer with pointer-events, we need to be careful)
    // The main container has the click handler.

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    addStickyNote(x, y);
  };

  const addStickyNote = (x: number, y: number) => {
    const vocab = VOCABULARY[currentVocabIndex];
    
    // Add new note
    const newNote: Note = {
      id: Date.now(),
      x,
      y,
      word: vocab.text,
      emoji: vocab.emoji,
      rotation: Math.random() * 10 - 5, // Random tilt
    };

    setNotes((prev) => [...prev, newNote]);
    setScore((prev) => prev + 1);
    
    // Cycle to next word
    setCurrentVocabIndex((prev) => (prev + 1) % VOCABULARY.length);
  };

  const handleRecord = () => {
    setIsRecording(true);
    // Simulate recording delay
    setTimeout(() => {
      setIsRecording(false);
      // Give bonus points for "Pronunciation"
      setScore((prev) => prev + 3);
      alert(`Correct! That is a ${VOCABULARY[(currentVocabIndex - 1 + VOCABULARY.length) % VOCABULARY.length].text}!`);
    }, 1500);
  };

      {/* Debug Overlay */}
      <div style={{ position: 'absolute', top: 80, left: 10, zIndex: 100, color: 'lime', background: 'rgba(0,0,0,0.7)', padding: 5, fontSize: 10, pointerEvents: 'none' }}>
        {debugLog.map((l, i) => <div key={i}>{l}</div>)}
      </div>

      {/* Manual Start Button (if video is stuck) */}
      <button 
        onClick={() => {
            if(videoRef.current) {
                videoRef.current.play()
                .then(() => log("Manual play success"))
                .catch(e => log("Manual play error: " + e.message));
            }
        }}
        style={{
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            zIndex: 50,
            padding: '15px 30px',
            borderRadius: '30px',
            background: 'rgba(0,0,0,0.6)',
            color: 'white',
            border: '2px solid white',
            display: hasPermission ? 'block' : 'none', // Show if we have permission but maybe video isn't playing? 
            // In a real app we'd track isPlaying state, for debug we just show it always or let user tap to force
        }}
      >
        Force Start Camera
      </button>

  if (!hasPermission) {
    return (
      <div className={styles.permissionRequest}>
        <div style={{color:'red', marginBottom: 10}}>{debugLog[0]}</div>
        <Award size={64} className="text-accent" style={{ color: '#D97706', marginBottom: 20 }} />
        <h1>Ready to Play?</h1>
        <p>We need access to your camera to see the room and stick some notes!</p>
        <button className={styles.permissionButton} onClick={startCamera}>
          Enable Camera & Start
        </button>
        <Link href="/" style={{ marginTop: 20, color: '#64748B' }}>
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container} onClick={handleScreenTap}>
      {/* 1. Camera Layer */}
      <video
        ref={videoRef}
        className={styles.cameraFeed}
        autoPlay
        playsInline
        muted
        onLoadedMetadata={() => log("Video ready to play")}
      />

      {/* 2. AR Overlay Layer (Notes) */}
      <div className={styles.overlay}>
        {notes.map((note) => (
          <div
            key={note.id}
            className={styles.stickyNote}
            style={{
              left: note.x - 70, // center the 140px wide note
              top: note.y - 70,
              transform: `rotate(${note.rotation}deg)`,
            }}
            onClick={(e) => {
              e.stopPropagation(); // Prevent adding a new note when clicking an existing one
              alert(`You found: ${note.word}!`);
            }}
          >
            <div className={styles.stickyEmoji}>{note.emoji}</div>
            <div className={styles.stickyText}>{note.word}</div>
          </div>
        ))}
      </div>

      {/* 3. UI Layer (Controls) */}
      <div className={styles.uiLayer}>
        {/* Top Bar */}
        <div className={styles.topBar}>
          <Link href="/">
            <button className={styles.backButton}>
              <X size={24} />
            </button>
          </Link>
          
          <div className={styles.scoreBoard}>
            <Star fill="#D97706" color="#D97706" size={20} />
            <span>{score}</span>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className={styles.bottomControls}>
          <button 
            className={styles.secondaryButton}
            onClick={(e) => {
              e.stopPropagation();
              setNotes([]); // Clear all
              setScore(0);
            }}
          >
           <Camera size={24} />
          </button>

          <button 
            className={`${styles.actionButton} ${isRecording ? 'animate-pulse' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handleRecord();
            }}
            style={{ backgroundColor: isRecording ? '#dc2626' : '#D97706' }}
          >
            <Mic size={32} />
          </button>

           <button 
            className={styles.secondaryButton}
            onClick={(e) => {
              e.stopPropagation();
              // In future: Open collection
              alert('Sticker Collection feature coming soon!');
            }}
          >
           <StickyNote size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
