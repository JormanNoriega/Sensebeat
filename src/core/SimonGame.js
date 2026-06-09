/**
 * SimonGame.js - Simon Says memory game logic
 * Handles pattern generation, player input, and game state
 */

class SimonGame {
  constructor(game, level = 1) {
    this.game = game;
    this.audioManager = game.audioManager;
    this.voiceManager = game.voiceManager;
    this.inputManager = game.inputManager;
    this.level = level;

    this.buttons = ['L1', 'L2', 'R1', 'R2'];
    this.buttonColors = {
      'L1': '#FF0080',
      'L2': '#00FFFF',
      'R1': '#FFFF00',
      'R2': '#00FF00'
    };
    this.buttonSounds = {
      'L1': 'assets/audio/sounds/sound1.mp3',
      'L2': 'assets/audio/sounds/sound2.mp3',
      'R1': 'assets/audio/sounds/sound3.mp3',
      'R2': 'assets/audio/sounds/sound4.mp3'
    };

    this.pattern = [];
    this.playerInput = [];
    this.currentLevelNum = 1;
    this.score = 0;
    this.maxCombo = 0;
    this.currentCombo = 0;
    this.isPlayingPattern = false;
    this.isPlayerTurn = false;
    this.isGameOver = false;

    this.patternIndex = 0;
    this.inputIndex = 0;

    this.levelConfig = {
      1: { initialLength: 2, speed: 1.0, name: 'FÁCIL' },
      2: { initialLength: 3, speed: 1.0, name: 'NORMAL' },
      3: { initialLength: 4, speed: 0.75, name: 'DIFÍCIL' }
    };

    this.onGameOver = null;
    this.onScoreUpdate = null;

    this.init();
  }

  init() {
    console.log(`🎮 SimonGame initialized - Level: ${this.level} (${this.levelConfig[this.level].name})`);
  }

  startGame() {
    this.pattern = [];
    this.playerInput = [];
    this.currentLevelNum = 1;
    this.score = 0;
    this.maxCombo = 0;
    this.currentCombo = 0;
    this.isGameOver = false;
    this.isPlayerTurn = false;

    const config = this.levelConfig[this.level];
    for (let i = 0; i < config.initialLength; i++) {
      this.addToPattern();
    }

    this.voiceManager.speak(`Nivel ${this.level}, ${config.name}. Observa el patrón.`);
    this.playPattern();
  }

  addToPattern() {
    const randomButton = this.buttons[Math.floor(Math.random() * this.buttons.length)];
    this.pattern.push(randomButton);
    console.log(`Pattern extended: [${this.pattern.join(', ')}]`);
  }

  async playPattern() {
    this.isPlayingPattern = true;
    this.isPlayerTurn = false;

    this.game.simonUI.updateStatus('OBSERVA', 'playing');

    await this.delay(1000);

    const config = this.levelConfig[this.level];
    const speedMultiplier = config.speed;

    for (let i = 0; i < this.pattern.length; i++) {
      const button = this.pattern[i];
      await this.activateButton(button, true);
      await this.delay(400 * speedMultiplier);
    }

    this.isPlayingPattern = false;
    this.isPlayerTurn = true;
    this.playerInput = [];
    this.inputIndex = 0;

    this.game.simonUI.updateStatus('TU TURNO', 'your-turn');
    this.voiceManager.announceYourTurn();
  }

  async activateButton(button, isPatternPlay = false) {
    const buttonElement = document.getElementById(`simon-${button}`);
    if (!buttonElement) return;

    buttonElement.classList.add('active');
    this.playButtonSound(button);

    if (isPatternPlay) {
      this.highlightButton(button);
    }

    await this.delay(300);

    buttonElement.classList.remove('active');
  }

  playButtonSound(button) {
    const soundPath = this.buttonSounds[button];
    if (soundPath) {
      try {
        const audio = new Audio(soundPath);
        audio.volume = 0.8;
        audio.play().catch(e => console.warn('Sound not available:', e));
      } catch (e) {
        console.warn('Could not play sound:', e);
      }
    }
  }

  highlightButton(button) {
    const buttonElement = document.getElementById(`simon-${button}`);
    if (buttonElement) {
      const glowColor = this.buttonColors[button];
      buttonElement.style.boxShadow = `0 0 30px ${glowColor}, 0 0 60px ${glowColor}`;
      buttonElement.style.transform = 'scale(1.1)';

      setTimeout(() => {
        buttonElement.style.boxShadow = '';
        buttonElement.style.transform = '';
      }, 400);
    }
  }

  handleButtonPress(button) {
    if (!this.isPlayerTurn || this.isPlayingPattern || this.isGameOver) {
      return;
    }

    this.playButtonSound(button);
    this.highlightButton(button);
    this.playerInput.push(button);

    const currentIndex = this.playerInput.length - 1;

    if (this.playerInput[currentIndex] === this.pattern[currentIndex]) {
      this.currentCombo++;
      const baseScore = 100 * this.level;
      this.score += baseScore * this.currentCombo;

      if (this.currentCombo > this.maxCombo) {
        this.maxCombo = this.currentCombo;
      }

      this.updateUI();
      this.inputManager.vibrateGamepad(0.5, 100, 0);

      if (this.playerInput.length === this.pattern.length) {
        this.handlePatternComplete();
      }
    } else {
      this.handleIncorrectInput();
    }
  }

  async handlePatternComplete() {
    this.isPlayerTurn = false;
    this.currentLevelNum++;
    this.score += 500 * this.level;

    const phrases = ['¡Muy bien!', '¡Excelente!', '¡Perfecto!', '¡Sigue así!'];
    this.voiceManager.speak(phrases[Math.floor(Math.random() * phrases.length)]);
    this.updateUI();

    this.game.simonUI.updateStatus('¡CORRECTO!', 'success');
    this.inputManager.vibrateGamepad(0.8, 200, 0);

    await this.delay(1500);

    this.addToPattern();
    this.voiceManager.speak(`Nivel ${this.currentLevelNum}`);
    await this.delay(800);

    this.playPattern();
  }

  async handleIncorrectInput() {
    this.isPlayerTurn = false;
    this.isGameOver = true;
    this.currentCombo = 0;

    this.vibrateAllButtons();
    this.voiceManager.speak('Incorrecto');

    this.game.simonUI.updateStatus('INCORRECTO', 'error');
    this.updateUI();

    await this.delay(2000);

    if (this.onGameOver) {
      this.onGameOver({
        score: this.score,
        maxCombo: this.maxCombo,
        level: this.currentLevelNum,
        patternLength: this.pattern.length
      });
    }
  }

  vibrateAllButtons() {
    this.inputManager.vibrateGamepad(1.0, 300, 0);
  }

  updateUI() {
    if (this.onScoreUpdate) {
      this.onScoreUpdate({
        score: this.score,
        combo: this.currentCombo,
        level: this.currentLevelNum
      });
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  reset() {
    this.pattern = [];
    this.playerInput = [];
    this.currentLevelNum = 1;
    this.score = 0;
    this.maxCombo = 0;
    this.currentCombo = 0;
    this.isPlayingPattern = false;
    this.isPlayerTurn = false;
    this.isGameOver = false;
  }
}

window.SimonGame = SimonGame;