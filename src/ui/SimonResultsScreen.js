/**
 * SimonResultsScreen.js - Results screen for Simon game
 * Shows score, level reached, and best combo with navigation support
 */

class SimonResultsScreen {
  constructor(game) {
    this.game = game;
    this.container = null;
    this.selectedIndex = 0;
    this.buttons = [];
    this.voiceManager = new VoiceManager();
    this.voiceManager.init();
  }

  show(results, level = 1) {
    this.currentLevel = level;
    this.results = results;
    this.render(results, level);
    this.setupNavigation();
    this.playBackgroundMusic();
  }

  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    if (this.gamepadInterval) clearInterval(this.gamepadInterval);
    if (this.audioManager) {
      this.audioManager.stopMusic();
    }
  }

  playBackgroundMusic() {
    if (!this.audioManager) {
      this.audioManager = new AudioManager();
      this.audioManager.init(0.7, 0.5);
    }
    this.audioManager.playBackgroundMusic('assets/audio/fondo/menu.mp3', 0.3);
  }

  render(results, level) {
    let container = document.getElementById('simon-results-screen');
    if (!container) {
      container = document.createElement('div');
      container.id = 'simon-results-screen';
      container.className = 'results-container';
      document.body.appendChild(container);
    }

    const levelNames = { 1: 'FÁCIL', 2: 'NORMAL', 3: 'DIFÍCIL' };

    container.style.cssText = `
      display: flex;
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: radial-gradient(ellipse at center, #1a0a2e 0%, #0a0a15 70%);
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 200;
      font-family: 'Press Start 2P', monospace;
    `;

    const scoreStr = String(results.score).padStart(6, '0');
    const levelStr = String(results.level).padStart(2, '0');
    const comboStr = String(results.maxCombo).padStart(3, '0');

    container.innerHTML = `
      <div class="crt-flicker"></div>

      <div class="results-content">
        <div class="neon-lights">
          <span class="light red"></span>
          <span class="light yellow"></span>
          <span class="light green"></span>
        </div>

        <div class="results-header">
          <h1 class="results-title">
            <span class="logo-note">◎</span>
            FIN DEL JUEGO
          </h1>
          <p class="results-level-badge">NIVEL ${level} - ${levelNames[level]}</p>
          <div class="neon-line"></div>
        </div>

        <div class="results-stats">
          <div class="stat-box">
            <span class="stat-label">PUNTUACIÓN</span>
            <span class="stat-value score">${scoreStr}</span>
          </div>

          <div class="stat-box">
            <span class="stat-label">RONDAS COMPLETADAS</span>
            <span class="stat-value level">${levelStr}</span>
          </div>

          <div class="stat-box">
            <span class="stat-label">MEJOR RACHA</span>
            <span class="stat-value combo">${comboStr}</span>
          </div>

          <div class="stat-box">
            <span class="stat-label">PATRÓN FINAL</span>
            <span class="stat-value pattern">${results.patternLength}</span>
          </div>
        </div>

        <div class="results-message">
          <p class="message-text">¡Buen intento!</p>
        </div>

        <div class="results-buttons" id="results-buttons">
          <button id="results-retry" class="arcade-btn primary selected" data-action="retry">
            <span class="btn-icon">↺</span>
            <span class="btn-label">REINTENTAR</span>
          </button>

          <button id="results-menu" class="arcade-btn" data-action="menu">
            <span class="btn-icon">⌂</span>
            <span class="btn-label">MENÚ</span>
          </button>
        </div>

        <div class="controls-hint-text">
          <p>↑↓ O D-PAD PARA NAVEGAR</p>
          <p>ENTER O A PARA SELECCIONAR</p>
        </div>
      </div>

      <div class="ambient-glow"></div>
    `;

    this.container = container;
    this.buttons = document.querySelectorAll('#results-buttons .arcade-btn');
    this.selectedIndex = 0;
    this.updateSelection();

    this.voiceManager.speak(`Fin del juego. Puntuación: ${results.score}. Ronda: ${results.level}.`);

    setTimeout(() => {
      this.voiceManager.speak('Usa arriba y abajo para navegar, enter para seleccionar.');
    }, 2000);
  }

  setupNavigation() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));

    this.gamepadInterval = setInterval(() => {
      this.pollGamepad();
    }, 50);
  }

  handleKeyDown(e) {
    const totalButtons = this.buttons.length;

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        e.preventDefault();
        this.selectedIndex = (this.selectedIndex - 1 + totalButtons) % totalButtons;
        this.updateSelection();
        this.announceSelection();
        break;

      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault();
        this.selectedIndex = (this.selectedIndex + 1) % totalButtons;
        this.updateSelection();
        this.announceSelection();
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        this.selectButton(this.selectedIndex);
        break;
    }
  }

  pollGamepad() {
    const gamepads = navigator.getGamepads();
    if (!gamepads) return;

    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i];
      if (!gamepad) continue;

      const pressed = gamepad.buttons[12]?.pressed || gamepad.buttons[13]?.pressed ||
                     gamepad.buttons[0]?.pressed;

      if (pressed && !this.gamepadPressed) {
        if (gamepad.buttons[12]?.pressed || gamepad.buttons[13]?.pressed) {
          const isDown = gamepad.buttons[13]?.pressed;
          const totalButtons = this.buttons.length;

          if (isDown) {
            this.selectedIndex = (this.selectedIndex + 1) % totalButtons;
          } else {
            this.selectedIndex = (this.selectedIndex - 1 + totalButtons) % totalButtons;
          }

          this.updateSelection();
          this.announceSelection();
        }

        if (gamepad.buttons[0]?.pressed) {
          this.selectButton(this.selectedIndex);
        }
      }

      this.gamepadPressed = pressed;
    }
  }

  updateSelection() {
    this.buttons.forEach((btn, index) => {
      btn.classList.toggle('selected', index === this.selectedIndex);
    });
  }

  announceSelection() {
    const button = this.buttons[this.selectedIndex];
    const label = button.querySelector('.btn-label')?.textContent || '';
    this.voiceManager.speak(label);
  }

  selectButton(index) {
    const button = this.buttons[index];
    const action = button.dataset.action;

    this.voiceManager.speak('Seleccionado');

    if (action === 'retry') {
      window.location.href = `game.html?level=${this.currentLevel}`;
    } else if (action === 'menu') {
      window.location.href = 'index.html';
    }
  }
}

window.SimonResultsScreen = SimonResultsScreen;