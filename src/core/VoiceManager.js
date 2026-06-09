/**
 * VoiceManager.js - Text-to-Speech system using Web Speech API
 * Provides accessible voice feedback for blind players
 */

class VoiceManager {
  constructor() {
    this.enabled = true;
    this.rate = 0.9;
    this.pitch = 1.0;
    this.volume = 1.0;
    this.lang = 'es-MX';
    this.voice = null;
    this.synth = window.speechSynthesis;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;

    if ('speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      this.initialized = true;
      console.log('🔊 VoiceManager initialized');
    } else {
      console.warn('Web Speech API not supported');
      this.enabled = false;
    }
  }

  loadVoices() {
    const voices = this.synth.getVoices();
    const spanishVoices = voices.filter(v => v.lang.startsWith('es'));

    if (spanishVoices.length > 0) {
      this.voice = spanishVoices.find(v => v.name.includes('Sabina')) ||
                  spanishVoices.find(v => v.name.includes('Laura')) ||
                  spanishVoices[0];
    } else if (voices.length > 0) {
      this.voice = voices[0];
    }

    if (this.voice) {
      console.log(`🎙️ Using voice: ${this.voice.name} (${this.voice.lang})`);
    }
  }

  speak(text, options = {}) {
    if (!this.enabled || !this.synth) return;

    if (this.synth.paused) {
      this.synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);

    if (this.voice) {
      utterance.voice = this.voice;
    }

    utterance.rate = options.rate || this.rate;
    utterance.pitch = options.pitch || this.pitch;
    utterance.volume = options.volume || this.volume;
    utterance.lang = options.lang || this.lang;

    utterance.onstart = () => {
      console.log(`🎙️ Speaking: "${text}"`);
    };

    utterance.onend = () => {
      console.log('🎙️ Speech complete');
    };

    utterance.onerror = (e) => {
      console.warn('Speech error:', e);
    };

    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  pause() {
    if (this.synth) {
      this.synth.pause();
    }
  }

  resume() {
    if (this.synth) {
      this.synth.resume();
    }
  }

  setRate(rate) {
    this.rate = Math.max(0.1, Math.min(2.0, rate));
  }

  setPitch(pitch) {
    this.pitch = Math.max(0.1, Math.min(2.0, pitch));
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  setLang(lang) {
    this.lang = lang;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  announceLevel(level) {
    this.speak(`Nivel ${level}`);
  }

  announceCorrect() {
    const phrases = ['¡Muy bien!', '¡Correcto!', '¡Excelente!', '¡Perfecto!', '¡Sigue así!'];
    this.speak(phrases[Math.floor(Math.random() * phrases.length)]);
  }

  announceIncorrect(expectedPattern) {
    this.speak('Incorrecto');
  }

  announcePatternComplete(level) {
    this.speak(`Patrón nivel ${level} completado`);
  }

  announceGameOver(score, maxCombo) {
    this.speak(`Fin del juego. Puntuación: ${score}. Mejor racha: ${maxCombo}`);
  }

  announceTutorialStep(step, buttonName) {
    const instructions = {
      1: `Presiona el gatillo izquierdo L2`,
      2: `Presiona el botón superior izquierdo L1`,
      3: `Presiona el botón superior derecho R1`,
      4: `Presiona el gatillo derecho R2`
    };
    this.speak(instructions[step] || `Presiona ${buttonName}`);
  }

  announceButtonSound(buttonName) {
    const names = {
      'L2': 'Sonido izquierdo',
      'L1': 'Sonido izquierdo superior',
      'R1': 'Sonido derecho superior',
      'R2': 'Sonido derecho'
    };
    this.speak(names[buttonName] || `Sonido ${buttonName}`);
  }

  announceYourTurn() {
    this.speak('Tu turno');
  }

  announceWatchPattern() {
    this.speak('Observa el patrón');
  }
}

window.VoiceManager = VoiceManager;