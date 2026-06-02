/**
 * AudioManager.js - Handles all audio playback
 * Manages music and SFX with volume control and synchronization
 */

class AudioManager {
  constructor() {
    // Audio contexts
    this.musicAudio = null;
    this.sfxAudios = new Map();

    // Volume settings
    this.musicVolume = 0.7;
    this.sfxVolume = 0.5;

    // State
    this.isMusicPlaying = false;
    this.isBackgroundMusic = false;
    this.musicStartTime = 0;
    this.musicPauseTime = 0;
    this.musicOffset = 0;
    this.isMuted = false;

    // SFX cache
    this.sfxCache = new Map();
  }

  /**
   * Initialize audio manager
   */
  init(musicVolume = 0.7, sfxVolume = 0.5) {
    this.musicVolume = musicVolume;
    this.sfxVolume = sfxVolume;

    // Create music audio element
    this.musicAudio = new Audio();
    this.musicAudio.volume = this.musicVolume;
    this.musicAudio.addEventListener('ended', () => {
      this.isMusicPlaying = false;
    });

    console.log('🔊 Audio manager initialized');
  }

  /**
   * Play music
   * @param {string} audioPath - Path to MP3 file
   * @param {number} offsetSeconds - Offset in seconds
   * @param {Function} onEnd - Callback when music ends
   */
  playMusic(audioPath, offsetSeconds = 0, onEnd = null) {
    try {
      // Don't stop if already playing the same track
      // (helps with test mode where we don't want to interrupt)
      if (this.isMusicPlaying && this.musicAudio.src === audioPath) {
        return;
      }

      this.stopMusic();

      // Only set src if it's a real Audio element
      if (this.musicAudio && this.musicAudio.src !== undefined) {
        this.musicAudio.src = audioPath;
        this.musicAudio.currentTime = Math.max(0, offsetSeconds);
      }
      
      this.musicAudio.volume = this.musicVolume;

      if (onEnd && this.musicAudio.onended !== undefined) {
        this.musicAudio.onended = onEnd;
      }

      const playPromise = this.musicAudio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.isMusicPlaying = true;
            this.musicStartTime = performance.now() / 1000;
            this.musicOffset = this.musicAudio.currentTime || 0;
            console.log(`🎵 Playing music: ${audioPath} at offset ${offsetSeconds}s`);
          })
          .catch(error => {
            console.error('Failed to play music:', error);
          });
      } else {
        // Older browser
        this.isMusicPlaying = true;
        this.musicStartTime = performance.now() / 1000;
        this.musicOffset = this.musicAudio.currentTime || 0;
      }
    } catch (error) {
      console.error('Failed to play music:', error);
    }
  }

  /**
   * Stop music
   */
  stopMusic() {
    if (this.musicAudio) {
      this.musicAudio.pause();
      this.musicAudio.currentTime = 0;
      this.isMusicPlaying = false;
    }
  }

  /**
   * Play background music (for menus) at lower volume
   * @param {string} audioPath - Path to audio file
   * @param {number} volume - Volume level (0-1), default 0.3 for background
   */
  playBackgroundMusic(audioPath, volume = 0.3) {
    if (!this.musicAudio) return;

    if (this.musicAudio.src && this.musicAudio.src.includes(audioPath) && this.isMusicPlaying && this.isBackgroundMusic) {
      return;
    }

    this.stopMusic();

    this.musicAudio.src = audioPath;
    this.musicAudio.volume = this.isMuted ? 0 : volume;
    this.musicAudio.loop = true;
    this.isBackgroundMusic = true;

    this.musicAudio.play()
      .then(() => {
        this.isMusicPlaying = true;
        this.musicStartTime = performance.now() / 1000;
        console.log(`🎵 Playing background music: ${audioPath}`);
      })
      .catch(error => {
        console.warn('Could not play background music:', error);
      });
  }

  /**
   * Set background music volume
   * @param {number} volume - Volume level (0-1)
   */
  setBackgroundMusicVolume(volume) {
    if (this.musicAudio && !this.isMuted) {
      this.musicAudio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Toggle mute for background music
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.musicAudio) {
      if (this.isMuted) {
        this.musicAudio.volume = 0;
      } else if (this.isBackgroundMusic) {
        this.musicAudio.volume = 0.25;
      }
    }
    console.log(`🔊 Background music ${this.isMuted ? 'muted' : 'unmuted'}`);
    return this.isMuted;
  }

  /**
   * Check if background music is muted
   */
  isMuted() {
    return this.isMuted;
  }

  /**
   * Pause music
   */
  pauseMusic() {
    if (this.musicAudio && this.isMusicPlaying) {
      this.musicAudio.pause();
      this.musicPauseTime = this.musicAudio.currentTime;
      this.isMusicPlaying = false;
    }
  }

  /**
   * Resume music
   */
  resumeMusic() {
    if (this.musicAudio && !this.isMusicPlaying) {
      this.musicAudio.play()
        .then(() => {
          this.isMusicPlaying = true;
        })
        .catch(e => console.error('Failed to resume music:', e));
    }
  }

  /**
   * Get current music time
   */
  getMusicTime() {
    if (!this.musicAudio) {
      return 0;
    }
    if (!this.isMusicPlaying) {
      return this.musicAudio.currentTime || 0;
    }
    return this.musicAudio.currentTime || 0;
  }

  /**
   * Play SFX (sound effect)
   * @param {string} sfxName - Name of SFX (hit-perfect, hit-good, hit-miss, etc.)
   */
  async playSFX(sfxName) {
    try {
      let audio = this.sfxCache.get(sfxName);

      if (!audio) {
        // Try to load SFX
        const sfxPath = `assets/sfx/${sfxName}.mp3`;
        audio = new Audio(sfxPath);
        audio.volume = this.sfxVolume;

        // Add to cache after loading
        audio.oncanplaythrough = () => {
          this.sfxCache.set(sfxName, audio);
        };
      } else {
        // Clone audio for multiple simultaneous plays
        audio = audio.cloneNode();
        audio.volume = this.sfxVolume;
      }

      audio.currentTime = 0;
      audio.play().catch(e => {
        console.debug(`Could not play SFX: ${sfxName}`, e);
      });
    } catch (error) {
      console.debug(`SFX not available: ${sfxName}`);
    }
  }

  /**
   * Set music volume (0 to 1)
   */
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.musicAudio) {
      this.musicAudio.volume = this.musicVolume;
    }
  }

  /**
   * Set SFX volume (0 to 1)
   */
  setSFXVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Get music duration
   */
  getMusicDuration() {
    if (this.musicAudio) {
      return this.musicAudio.duration || 0;
    }
    return 0;
  }

  /**
   * Check if music is playing
   */
  isPlaying() {
    return this.isMusicPlaying;
  }
}
