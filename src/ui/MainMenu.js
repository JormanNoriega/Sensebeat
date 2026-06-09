/**
 * MainMenu.js - Main menu for Simon Memory Game
 * Shows level selection with keyboard/gamepad navigation
 */

class MainMenu {
  constructor(gameController) {
    this.gameController = gameController;
    this.container = null;
    this.selectedIndex = 0;
    this.buttons = [];
    this.voiceManager = new VoiceManager();
    this.voiceManager.init();
  }

  show() {
    this.render();
  }

  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }

  render() {
    let container = document.getElementById('main-menu-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'main-menu-container';
      document.body.appendChild(container);
    }

    container.innerHTML = `
      <div class="main-menu-screen">
        <div class="crt-flicker"></div>

        <div class="arcade-cabinet">
          <div class="cabinet-header">
            <div class="neon-lights">
              <span class="light red"></span>
              <span class="light yellow"></span>
              <span class="light green"></span>
            </div>
          </div>

          <div class="logo-section">
            <div class="logo-glow"></div>
            <h1 class="game-logo">
              <span class="logo-note">◎</span>
              <span class="logo-text">SENSA</span>
              <span class="logo-beat">BEAT</span>
            </h1>
            <p class="tagline">JUEGO DE MEMORIA</p>
          </div>

          <div class="menu-buttons" id="menu-buttons">
            <button id="btn-nivel-1" class="arcade-btn level-btn selected" data-level="1" data-index="0">
              <span class="btn-icon">▶</span>
              <span class="btn-label">NIVEL 1</span>
              <span class="btn-desc">FÁCIL</span>
            </button>

            <button id="btn-nivel-2" class="arcade-btn level-btn" data-level="2" data-index="1">
              <span class="btn-icon">▶</span>
              <span class="btn-label">NIVEL 2</span>
              <span class="btn-desc">NORMAL</span>
            </button>

            <button id="btn-nivel-3" class="arcade-btn level-btn" data-level="3" data-index="2">
              <span class="btn-icon">▶</span>
              <span class="btn-label">NIVEL 3</span>
              <span class="btn-desc">DIFÍCIL</span>
            </button>

            <button id="btn-tutorial" class="arcade-btn tutorial-btn" data-index="3">
              <span class="btn-icon">?</span>
              <span class="btn-label">TUTORIAL</span>
            </button>
          </div>

          <div class="controls-preview">
            <div class="keys-display">
              <div class="key-box" style="border-color: #FF0080;">
                <span class="key-letter" style="color: #FF0080;">L1</span>
                <span class="key-label">D</span>
              </div>
              <div class="key-box" style="border-color: #00FFFF;">
                <span class="key-letter" style="color: #00FFFF;">L2</span>
                <span class="key-label">F</span>
              </div>
              <div class="key-box" style="border-color: #FFFF00;">
                <span class="key-letter" style="color: #FFFF00;">R1</span>
                <span class="key-label">J</span>
              </div>
              <div class="key-box" style="border-color: #00FF00;">
                <span class="key-letter" style="color: #00FF00;">R2</span>
                <span class="key-label">K</span>
              </div>
            </div>
            <p class="controls-hint-text">USA ↑↓ O D-PAD PARA NAVEGAR</p>
            <p class="controls-hint-text">ENTER O A PARA SELECCIONAR</p>
          </div>

          <div class="insert-coin-text">
            <span class="coin-icon">◉</span>
            SELECCIONA UN NIVEL PARA COMENZAR
            <span class="coin-icon">◉</span>
          </div>
        </div>

        <div class="ambient-glow"></div>
      </div>
    `;

    this.container = container;
    this.buttons = document.querySelectorAll('.level-btn, .tutorial-btn');
    this.selectedIndex = 0;
    this.updateSelection();

    this.attachEventListeners();
    this.setupNavigation();
    this.startScanlineEffect();

    this.voiceManager.speak('Bienvenido a Sensabeat. Usa las flechas arriba y abajo para navegar, enter para seleccionar.');
  }

  attachEventListeners() {
    this.buttons.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        this.selectButton(index);
      });

      btn.addEventListener('mouseenter', () => {
        this.selectedIndex = index;
        this.updateSelection();
      });
    });
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
    const desc = button.querySelector('.btn-desc')?.textContent || '';

    this.voiceManager.speak(`${label}${desc ? `. ${desc}` : ''}`);
  }

  selectButton(index) {
    const button = this.buttons[index];
    const level = button.dataset.level;
    const isTutorial = button.id === 'btn-tutorial';

    this.voiceManager.speak('Seleccionado');

    if (isTutorial) {
      window.location.href = 'game.html?tutorial=true';
    } else if (level) {
      window.location.href = `game.html?level=${level}`;
    }
  }

  startScanlineEffect() {
    if (this.scanlineCanvas) return;

    this.scanlineCanvas = document.createElement('canvas');
    this.scanlineCanvas.id = 'scanline-overlay';
    this.scanlineCanvas.width = window.innerWidth;
    this.scanlineCanvas.height = window.innerHeight;
    this.scanlineCanvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
    `;
    const ctx = this.scanlineCanvas.getContext('2d');
    document.body.appendChild(this.scanlineCanvas);

    const drawScanlines = () => {
      const width = this.scanlineCanvas.width;
      const height = this.scanlineCanvas.height;

      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      for (let y = 0; y < height; y += 3) {
        ctx.fillRect(0, y, width, 1);
      }

      const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height) * 0.6
      );
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.25)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      this.animationFrame = requestAnimationFrame(drawScanlines);
    };

    drawScanlines();
  }

  stopScanlineEffect() {
    if (this.scanlineCanvas) {
      this.scanlineCanvas.remove();
      this.scanlineCanvas = null;
    }
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    if (this.gamepadInterval) {
      clearInterval(this.gamepadInterval);
    }
  }
}

window.MainMenu = MainMenu;