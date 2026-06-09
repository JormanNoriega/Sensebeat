/**
 * Game.js - Main game controller for Simon Memory Game
 * Simple, accessible memory game for blind players
 */

class Game {
  constructor() {
    this.STATE = {
      LOADING: 'loading',
      TUTORIAL: 'tutorial',
      SIMON_PLAY: 'simonPlay',
      RESULTS: 'results'
    };

    this.currentState = this.STATE.LOADING;
    this.previousState = null;

    this.audioManager = null;
    this.inputManager = null;
    this.voiceManager = null;

    this.simonGame = null;
    this.simonUI = null;
    this.tutorialScreen = null;
    this.simonResultsScreen = null;

    this.canvas = null;
    this.ctx = null;
    this.currentLevel = 1;
  }

  async init() {
    console.log('🎮 Initializing SensaBeat Memory Game...');
    this.setupDOM();
    this.audioManager = new AudioManager();
    this.inputManager = new InputManager();
    this.voiceManager = new VoiceManager();

    this.audioManager.init(0.7, 0.5);
    this.voiceManager.init();
    this.inputManager.init(this.handleInput.bind(this));

    this.initializeUI();
    this.createMuteButton();

    console.log('✅ Game initialized successfully');
  }

  initWithLevel(level, isTutorial) {
    this.currentLevel = level;
    this.init();

    if (isTutorial) {
      this.startTutorial();
    } else {
      this.startSimonGame();
    }
  }

  setupDOM() {
    this.canvas = document.getElementById('game-canvas');
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'game-canvas';
      document.body.appendChild(this.canvas);
    }
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createMuteButton() {
    const existingBtn = document.getElementById('mute-button');
    if (existingBtn) return;

    const muteBtn = document.createElement('button');
    muteBtn.id = 'mute-button';
    muteBtn.innerHTML = '🔊';
    muteBtn.title = 'Toggle sound';
    muteBtn.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: 2px solid #00FFFF;
      background: rgba(0, 0, 0, 0.8);
      color: #00FFFF;
      font-size: 24px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
      transition: all 0.2s ease;
    `;

    muteBtn.addEventListener('click', () => {
      const isMuted = this.audioManager.toggleMute();
      muteBtn.innerHTML = isMuted ? '🔇' : '🔊';
      muteBtn.style.borderColor = isMuted ? '#FF0080' : '#00FFFF';
    });

    document.body.appendChild(muteBtn);
  }

  initializeUI() {
    this.tutorialScreen = new TutorialScreen(this);
    this.simonUI = new SimonUI(this);
    this.simonResultsScreen = new SimonResultsScreen(this);
  }

  changeState(newState) {
    if (this.currentState === newState) return;

    this.hideAllUI();
    this.previousState = this.currentState;
    this.currentState = newState;

    console.log(`🔄 State changed: ${this.previousState} → ${newState}`);

    switch (newState) {
      case this.STATE.TUTORIAL:
        this.startTutorial();
        break;

      case this.STATE.SIMON_PLAY:
        this.startSimonGame();
        break;

      case this.STATE.RESULTS:
        break;
    }
  }

  hideAllUI() {
    const containers = ['tutorial-screen', 'simon-ui', 'simon-results-screen'];
    containers.forEach(id => {
      const element = document.getElementById(id);
      if (element) element.style.display = 'none';
    });

    if (this.simonUI) this.simonUI.hide();
    if (this.tutorialScreen) this.tutorialScreen.hide();
    if (this.simonResultsScreen) this.simonResultsScreen.hide();
  }

  startTutorial() {
    this.tutorialScreen.onComplete = () => {
      this.changeState(this.STATE.SIMON_PLAY);
    };
    this.tutorialScreen.show();
  }

  startSimonGame() {
    if (!this.simonGame) {
      this.simonGame = new SimonGame(this, this.currentLevel);
    }

    this.simonUI.show();
    this.simonUI.updateLevel(this.currentLevel);

    this.simonGame.onGameOver = (results) => {
      this.simonUI.hide();
      this.simonResultsScreen.show(results, this.currentLevel);
    };

    this.simonGame.onScoreUpdate = (data) => {
      this.simonUI.updateStats(data);
    };

    this.simonGame.startGame();
  }

  handleInput(key) {
    if (key === 'Escape') {
      switch (this.currentState) {
        case this.STATE.TUTORIAL:
        case this.STATE.SIMON_PLAY:
          window.location.href = 'index.html';
          break;
      }
    }
  }

  goToMenu() {
    window.location.href = 'index.html';
  }
}

window.Game = Game;