/**
 * MainMenu.js - Main menu for Simon Memory Game
 * Shows level selection and game options
 */

class MainMenu {
  constructor(gameController) {
    this.gameController = gameController;
    this.container = null;
  }

  show() {
    this.render();
  }

  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
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

          <div class="menu-buttons">
            <button id="btn-nivel-1" class="arcade-btn level-btn" data-level="1">
              <span class="btn-icon">▶</span>
              <span class="btn-label">NIVEL 1</span>
              <span class="btn-desc">FÁCIL</span>
            </button>

            <button id="btn-nivel-2" class="arcade-btn level-btn" data-level="2">
              <span class="btn-icon">▶</span>
              <span class="btn-label">NIVEL 2</span>
              <span class="btn-desc">NORMAL</span>
            </button>

            <button id="btn-nivel-3" class="arcade-btn level-btn" data-level="3">
              <span class="btn-icon">▶</span>
              <span class="btn-label">NIVEL 3</span>
              <span class="btn-desc">DIFÍCIL</span>
            </button>

            <button id="btn-tutorial" class="arcade-btn tutorial-btn">
              <span class="btn-icon">?</span>
              <span class="btn-label">TUTORIAL</span>
            </button>
          </div>

          <div class="controls-preview">
            <div class="keys-display">
              <div class="key-box" data-key="D" style="border-color: #FF0080;">
                <span class="key-letter" style="color: #FF0080;">L1</span>
                <span class="key-label">IZQ. SUP.</span>
              </div>
              <div class="key-box" data-key="F" style="border-color: #00FFFF;">
                <span class="key-letter" style="color: #00FFFF;">L2</span>
                <span class="key-label">IZQ.</span>
              </div>
              <div class="key-box" data-key="J" style="border-color: #FFFF00;">
                <span class="key-letter" style="color: #FFFF00;">R1</span>
                <span class="key-label">DER. SUP.</span>
              </div>
              <div class="key-box" data-key="K" style="border-color: #00FF00;">
                <span class="key-letter" style="color: #00FF00;">R2</span>
                <span class="key-label">DER.</span>
              </div>
            </div>
            <p class="controls-hint-text">USA D F J K O EL MANDO</p>
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
    this.attachEventListeners();
    this.startScanlineEffect();
  }

  attachEventListeners() {
    document.querySelectorAll('.level-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const level = parseInt(btn.dataset.level);
        if (this.gameController.onStartGame) {
          this.gameController.onStartGame(level);
        }
      });
    });

    const tutorialBtn = document.getElementById('btn-tutorial');
    if (tutorialBtn) {
      tutorialBtn.addEventListener('click', () => {
        window.location.href = 'game.html?tutorial=true';
      });
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
  }
}

window.MainMenu = MainMenu;