/**
 * Game.js - Main game controller
 * Orchestrates all game systems and manages game states
 */

class Game {
  constructor() {
    // Game states
    this.STATE = {
      LOADING: 'loading',
      MENU: 'menu',
      LEVEL_SELECT: 'levelSelect',
      GAMEPLAY: 'gameplay',
      RESULTS: 'results',
      SETTINGS: 'settings',
      PAUSE: 'pause',
      COUNTDOWN: 'countdown'
    };

    this.currentState = this.STATE.LOADING;
    this.previousState = null;

    // Core systems
    this.audioManager = new AudioManager();
    this.inputManager = new InputManager();
    this.scoreManager = new ScoreManager();
    this.chartLoader = new ChartLoader();
    this.noteSpawner = null;

    // Game data
    this.currentSong = null;
    this.currentChart = null;
    this.lanes = [];
    this.notes = [];
    this.activeLanes = new Map();

    // UI systems
    this.mainMenu = null;
    this.levelSelect = null;
    this.gameplayUI = null;
    this.resultsScreen = null;
    this.settingsScreen = null;

    // Canvas and rendering
    this.canvas = null;
    this.ctx = null;
    this.gameContainer = null;

    // Game loop
    this.isRunning = false;
    this.frameTime = 0;
    this.deltaTime = 0;
    this.lastFrameTime = 0;
    this.animationFrameId = null;

    // Settings
    this.settings = {
      musicVolume: 0.7,
      sfxVolume: 0.5,
      difficulty: 'normal',
      showDebug: false,
      enableVibration: false
    };

    // UI state
    this.uiVisible = {
      mainMenu: true,
      levelSelect: false,
      gameplayUI: false,
      resultsScreen: false,
      settingsScreen: false,
      pauseMenu: false
    };

    this.init();
  }

  /**
   * Initialize the game
   */
  async init() {
    console.log('🎮 Initializing SensaBeat Game Engine...');

    try {
      // Setup DOM
      this.setupDOM();

      // Load settings
      this.loadSettings();

      // Initialize core systems
      this.audioManager.init(this.settings.musicVolume, this.settings.sfxVolume);
      this.inputManager.init(this.handleInput.bind(this));

      // Load all available songs
      await this.chartLoader.loadAllSongs();
      const songs = this.chartLoader.getSongs();
      console.log(`📦 Loaded ${songs.length} songs`);

      // Initialize UI systems
      this.initializeUI();

      // Set initial state
      this.changeState(this.STATE.MENU);

      // Start game loop
      this.startGameLoop();

      console.log('✅ Game initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize game:', error);
      this.showErrorDialog('Failed to initialize game. Please refresh the page.');
    }
  }

  /**
   * Setup DOM elements
   */
  setupDOM() {
    this.gameContainer = document.getElementById('game-container') || document.body;
    this.canvas = document.getElementById('game-canvas');

    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'game-canvas';
      this.gameContainer.appendChild(this.canvas);
    }

    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();

    window.addEventListener('resize', () => this.resizeCanvas());
  }

  /**
   * Resize canvas to fit window
   */
  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  /**
   * Initialize UI systems
   */
  initializeUI() {
    this.mainMenu = new MainMenu(this);
    this.levelSelect = new LevelSelect(this);
    this.gameplayUI = new GameplayUI(this);
    this.gameplayUI.init();
    this.resultsScreen = new ResultsScreen(this);
    this.settingsScreen = new SettingsScreen(this);
  }

  /**
   * Change game state
   */
  changeState(newState) {
    if (this.currentState === newState) return;

    // Cleanup previous state
    this.hideAllUI();

    this.previousState = this.currentState;
    this.currentState = newState;

    console.log(`🔄 State changed: ${this.previousState} → ${newState}`);

    // Setup new state
    switch (newState) {
      case this.STATE.MENU:
        this.uiVisible.mainMenu = true;
        this.mainMenu.show();
        break;

      case this.STATE.LEVEL_SELECT:
        this.uiVisible.levelSelect = true;
        this.levelSelect.show();
        break;

      case this.STATE.GAMEPLAY:
        this.uiVisible.gameplayUI = true;
        this.gameplayUI.show();
        this.startCountdown();
        break;

      case this.STATE.RESULTS:
        this.uiVisible.resultsScreen = true;
        if (this.gameplayUI) this.gameplayUI.hide();
        this.resultsScreen.show();
        break;

      case this.STATE.SETTINGS:
        this.uiVisible.settingsScreen = true;
        if (this.gameplayUI) this.gameplayUI.hide();
        this.settingsScreen.show();
        break;

      case this.STATE.PAUSE:
        this.audioManager.pauseMusic();
        this.uiVisible.pauseMenu = true;
        if (this.gameplayUI) this.gameplayUI.hide();
        this.showPauseMenu();
        break;
    }
  }

  /**
   * Hide all UI elements
   */
  hideAllUI() {
    Object.keys(this.uiVisible).forEach(key => {
      this.uiVisible[key] = false;
    });

    // Clear all UI containers
    const containers = ['main-menu', 'level-select', 'gameplay-ui', 'results-screen', 'settings-screen', 'pause-menu'];
    containers.forEach(id => {
      const element = document.getElementById(id);
      if (element) element.style.display = 'none';
    });
  }

  /**
   * Start countdown before gameplay
   */
  async startCountdown() {
    this.currentState = this.STATE.COUNTDOWN;
    const countdownElement = document.getElementById('countdown');

    if (!countdownElement) {
      const div = document.createElement('div');
      div.id = 'countdown';
      div.className = 'countdown';
      this.gameContainer.appendChild(div);
    }

    const element = document.getElementById('countdown');

    for (let i = 3; i >= 1; i--) {
      element.textContent = i;
      element.style.display = 'block';
      element.style.animation = 'none';
      setTimeout(() => {
        element.style.animation = 'countdownPulse 1s ease-out';
      }, 10);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    element.textContent = 'GO!';
    element.style.animation = 'countdownPulse 0.5s ease-out';
    await new Promise(resolve => setTimeout(resolve, 500));
    element.style.display = 'none';

    // Start gameplay
    this.startGameplay();
  }

  /**
   * Start gameplay
   */
  startGameplay() {
    this.currentState = this.STATE.GAMEPLAY;
    this.scoreManager.reset();
    this.currentNoteIndex = 0;

    if (this.noteSpawner) {
      this.noteSpawner.reset();
    }

    if (this.audioManager) {
      this.audioManager.playMusic(
        this.currentSong.audioPath,
        this.currentChart.offsetMs / 1000,
        () => this.endGameplay()
      );
    }
  }

  /**
   * End gameplay and show results
   */
  endGameplay() {
    this.audioManager.stopMusic();

    if (this.gameplayUI) {
      this.gameplayUI.hide();
    }

    const stats = this.scoreManager.getFinalStats();
    const accuracy = this.scoreManager.getAccuracy();

    console.log('🏁 Gameplay ended', {
      score: stats.score,
      combo: stats.maxCombo,
      accuracy: accuracy
    });

    setTimeout(() => {
      this.changeState(this.STATE.RESULTS);
    }, 500);
  }

  /**
   * Show pause menu
   */
  showPauseMenu() {
    const pauseMenuId = 'pause-menu';
    let pauseMenu = document.getElementById(pauseMenuId);

    if (!pauseMenu) {
      pauseMenu = document.createElement('div');
      pauseMenu.id = pauseMenuId;
      pauseMenu.className = 'pause-menu';
      pauseMenu.innerHTML = `
        <div class="pause-menu-content">
          <h2>PAUSED</h2>
          <button id="resume-button" class="btn btn-primary">Resume</button>
          <button id="retry-button" class="btn btn-secondary">Retry</button>
          <button id="menu-button" class="btn btn-secondary">Main Menu</button>
        </div>
      `;
      this.gameContainer.appendChild(pauseMenu);
    }

    pauseMenu.style.display = 'flex';

    document.getElementById('resume-button').onclick = () => this.resumeGameplay();
    document.getElementById('retry-button').onclick = () => this.retryGameplay();
    document.getElementById('menu-button').onclick = () => this.changeState(this.STATE.MENU);
  }

  /**
   * Resume gameplay
   */
  resumeGameplay() {
    this.currentState = this.STATE.GAMEPLAY;
    this.audioManager.resumeMusic();
    const pauseMenu = document.getElementById('pause-menu');
    if (pauseMenu) pauseMenu.style.display = 'none';
    if (this.gameplayUI) this.gameplayUI.show();
  }

  /**
   * Retry current song
   */
  retryGameplay() {
    this.changeState(this.STATE.GAMEPLAY);
  }

  /**
   * Handle user input
   */
  handleInput(key) {
    // Map keys to lanes: D=0(Left), F=1(Down), J=2(Up), K=3(Right)
    const keyToLane = {
      'd': 0, 'D': 0,
      'f': 1, 'F': 1,
      'j': 2, 'J': 2,
      'k': 3, 'K': 3
    };

    const lane = keyToLane[key];

    if (lane !== undefined && this.currentState === this.STATE.GAMEPLAY) {
      this.activateLane(lane);
    }

    // Pause on ESC
    if (key === 'Escape' && this.currentState === this.STATE.GAMEPLAY) {
      this.changeState(this.STATE.PAUSE);
    }

    // Back to menu
    if (key === 'Escape' && this.currentState === this.STATE.LEVEL_SELECT) {
      this.changeState(this.STATE.MENU);
    }

    if (key === 'Escape' && this.currentState === this.STATE.SETTINGS) {
      this.changeState(this.STATE.MENU);
    }
  }

  /**
   * Activate a lane (note hit)
   */
  activateLane(laneIndex) {
    if (!this.lanes[laneIndex]) return;

    const lane = this.lanes[laneIndex];
    lane.activate();

    const currentTime = this.audioManager.getMusicTime();

    let nearestNote = null;
    let minDistance = Infinity;

    for (const note of this.notes) {
      if (note.lane === laneIndex && !note.isHit && !note.isMissed) {
        const distance = Math.abs(currentTime - note.spawnTime);
        if (distance < 0.35 && distance < minDistance) {
          minDistance = distance;
          nearestNote = note;
        }
      }
    }

    if (nearestNote) {
      const accuracy = this.getHitAccuracy(currentTime, nearestNote.spawnTime);
      nearestNote.markAsHit();

      this.scoreManager.addHit(accuracy);

      this.audioManager.playSFX(`hit-${accuracy.toLowerCase()}`);

      lane.deactivate();

      this.vibrateGamepad(laneIndex, 0.5 + (accuracy === 'PERFECT' ? 0.5 : 0));

      if (this.gameplayUI) {
        this.gameplayUI.updateScore(this.scoreManager.getScore());
        this.gameplayUI.updateCombo(this.scoreManager.getCombo());
        this.gameplayUI.updateAccuracy(this.scoreManager.getAccuracy());
        this.gameplayUI.showHitEffect(laneIndex, accuracy);
      }
    } else {
      setTimeout(() => {
        lane.deactivate();
      }, 100);
    }
  }

  /**
   * Vibrate gamepad for haptic feedback based on lane
   * @param {number} laneIndex - Lane index (0-3)
   * @param {number} intensity - Vibration intensity (0-1)
   */
  vibrateGamepad(laneIndex, intensity) {
    const laneVibrationMap = [0.3, 0.5, 0.7, 1.0];
    const vibrationStrength = laneVibrationMap[laneIndex] * intensity;

    this.inputManager.vibrateGamepad(vibrationStrength, 100, 0);
  }

  /**
   * Get accuracy based on timing
   */
  getHitAccuracy(currentTime, noteTime) {
    const timeDifference = Math.abs(currentTime - noteTime);
    const perfectWindow = 0.08;
    const goodWindow = 0.2;

    if (timeDifference <= perfectWindow) {
      return 'PERFECT';
    } else if (timeDifference <= goodWindow) {
      return 'GOOD';
    } else {
      return 'MISS';
    }
  }

  /**
   * Update game logic
   */
  update(deltaTime) {
    if (this.currentState !== this.STATE.GAMEPLAY) return;

    const musicTime = this.audioManager.getMusicTime();

    if (this.noteSpawner) {
      this.noteSpawner.update(musicTime);
    }

    this.notes.forEach(note => {
      note.update(deltaTime, musicTime);
    });

    this.notes = this.notes.filter(note => {
      if (note.checkMissed()) {
        this.scoreManager.addMiss();
        if (this.gameplayUI) {
          this.gameplayUI.showHitEffect(note.lane, 'MISS');
        }
        this.vibrateGamepad(note.lane, 0.2);
        return false;
      }
      return true;
    });

    this.lanes.forEach(lane => lane.update(deltaTime));

    if (this.gameplayUI) {
      this.gameplayUI.updateHealth(this.scoreManager.getHealth());
    }

    if (this.scoreManager.getHealth() <= 0) {
      this.endGameplay();
    }
  }

  /**
   * Render game
   */
  render() {
    this.ctx.fillStyle = '#0a0a15';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.currentState === this.STATE.COUNTDOWN) {
      this.ctx.fillStyle = '#333333';
      this.ctx.font = '14px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('GET READY...', this.canvas.width / 2, 50);
    }

    if (this.currentState === this.STATE.GAMEPLAY || this.currentState === this.STATE.COUNTDOWN) {
      if (this.lanes.length > 0) {
        this.lanes.forEach(lane => lane.render(this.ctx));
      }

      if (this.notes.length > 0) {
        this.notes.forEach(note => note.render(this.ctx));
      }

      if (this.gameplayUI) {
        this.gameplayUI.render(this.ctx);
      }
    }

    if (this.settings.showDebug) {
      this.renderDebugInfo();
    }
  }

  /**
   * Render debug information
   */
  renderDebugInfo() {
    const musicTime = this.audioManager.getMusicTime();

    this.ctx.fillStyle = '#00FF00';
    this.ctx.font = '12px monospace';
    const debugInfo = [
      `FPS: ${Math.round(1000 / Math.max(1, this.deltaTime))}`,
      `State: ${this.currentState}`,
      `MusicTime: ${musicTime.toFixed(3)}s`,
      `Notes: ${this.notes.length}`,
      `SpawnerIndex: ${this.noteSpawner ? this.noteSpawner.currentNoteIndex : 'null'}`,
      `Score: ${this.scoreManager.getScore()}`,
      `Combo: ${this.scoreManager.getCombo()}`,
      `Health: ${this.scoreManager.getHealth().toFixed(0)}%`
    ];

    debugInfo.forEach((info, i) => {
      this.ctx.fillText(info, 10, 20 + i * 20);
    });
  }

  /**
   * Start game loop
   */
  startGameLoop() {
    this.isRunning = true;
    const gameLoop = (currentTime) => {
      if (!this.lastFrameTime) {
        this.lastFrameTime = currentTime;
      }

      this.deltaTime = (currentTime - this.lastFrameTime) / 1000;
      this.lastFrameTime = currentTime;

      if (this.deltaTime > 0.5) {
        this.deltaTime = 0.016;
      }

      this.update(this.deltaTime);
      this.render();

      this.animationFrameId = requestAnimationFrame(gameLoop);
    };

    this.animationFrameId = requestAnimationFrame(gameLoop);
  }

  /**
   * Stop game loop
   */
  stopGameLoop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  /**
   * Load song for gameplay
   */
  async loadSong(song) {
    try {
      this.currentSong = song;
      this.notes = [];

      this.currentChart = await this.chartLoader.loadChart(song.chartPath);

      console.log(`📊 Chart loaded:`, {
        bpm: this.currentChart.bpm,
        offsetMs: this.currentChart.offsetMs,
        totalNotes: this.currentChart.totalNotes,
        notesArray: this.currentChart.notes.length
      });

      this.initializeLanes();

      this.noteSpawner = new NoteSpawner(this.currentChart, this.lanes, (note) => {
        this.notes.push(note);
      });

      console.log(`🎵 Loaded song: ${song.name} | Notes to spawn: ${this.currentChart.notes.length}`);
      return true;
    } catch (error) {
      console.error('Failed to load song:', error);
      this.showErrorDialog(`Failed to load song: ${song.name}`);
      return false;
    }
  }

  /**
   * Initialize game lanes
   */
  initializeLanes() {
    this.lanes = [];
    const laneWidth = this.canvas.width / 4;
    const laneNames = ['LEFT', 'DOWN', 'UP', 'RIGHT'];
    const keyGuides = ['D', 'F', 'J', 'K'];

    for (let i = 0; i < 4; i++) {
      this.lanes.push(new Lane(
        i,
        i * laneWidth,
        laneWidth,
        this.canvas.height,
        laneNames[i],
        keyGuides[i]
      ));
    }
  }

  /**
   * Get available songs
   */
  getSongs() {
    return this.chartLoader.getSongs();
  }

  /**
   * Load settings from localStorage
   */
  loadSettings() {
    const saved = localStorage.getItem('gameSettings');
    if (saved) {
      try {
        Object.assign(this.settings, JSON.parse(saved));
      } catch (e) {
        console.warn('Failed to load settings');
      }
    }
  }

  /**
   * Save settings to localStorage
   */
  saveSettings() {
    localStorage.setItem('gameSettings', JSON.stringify(this.settings));
  }

  /**
   * Show error dialog
   */
  showErrorDialog(message) {
    alert(message);
  }

  /**
   * Get game canvas context
   */
  getCanvasContext() {
    return this.ctx;
  }

  /**
   * Get game canvas
   */
  getCanvas() {
    return this.canvas;
  }
}
