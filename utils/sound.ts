// Simple Web Audio API Synthesizer for POS Sound Effects
// No external assets required

const getAudioContext = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return null;
  return new AudioContext();
};

let audioCtx: AudioContext | null = null;

const initAudio = () => {
  if (!audioCtx) audioCtx = getAudioContext();
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

const playTone = (freq: number, type: OscillatorType, duration: number, vol: number = 0.1) => {
  const ctx = initAudio();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  
  gain.gain.setValueAtTime(vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + duration);
};

export const playBeep = () => playTone(1200, 'sine', 0.1, 0.05); // Standard scan beep
export const playClick = () => playTone(800, 'triangle', 0.05, 0.03); // UI interaction
export const playError = () => {
  // Low double beep
  playTone(200, 'sawtooth', 0.15, 0.1);
  setTimeout(() => playTone(150, 'sawtooth', 0.15, 0.1), 150);
};
export const playSuccess = () => {
  // Cha-ching / Success chord
  playTone(1000, 'sine', 0.2, 0.05);
  setTimeout(() => playTone(1500, 'sine', 0.3, 0.05), 100);
  setTimeout(() => playTone(2000, 'sine', 0.5, 0.05), 200);
};