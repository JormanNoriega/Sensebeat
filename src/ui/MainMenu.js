/**
 * MainMenu.js - Main menu screen UI
 * Retro arcade aesthetic with CRT effects
 */

class MainMenu {
  constructor(game) {
    this.game = game;
    this.container = null;
    this.scanlineCanvas = null;
    this.animationFrame = null;
  }

  show() {
    this.render();
    this.startScanlineEffect();
  }

  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
    this.stopScanlineEffect();
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

  render() {
    let container = document.getElementById('main-menu');
    if (!container) {
      container = document.createElement('div');
      container.id = 'main-menu';
      container.className = 'menu-container main-menu-container';
      document.body.appendChild(container);
    }

    container.style.display = 'flex';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100vw';
    container.style.height = '100vh';
    container.style.zIndex = '100';
    container.innerHTML = `
      <div class="retro-content">
        <div class="crt-flicker"></div>

        <div class="arcade-cabinet main-menu-cabinet">
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
              <span class="logo-note">♪</span>
              <span class="logo-text">SENSA</span>
              <span class="logo-beat">BEAT</span>
            </h1>
            <p class="tagline">RHYTHM GAME EXPERIENCE</p>
          </div>

          <div class="menu-buttons">
            <button id="start-button" class="arcade-btn start-btn">
              <span class="btn-icon">▶</span>
              <span class="btn-label">START GAME</span>
              <span class="btn-shine"></span>
            </button>

            <button id="settings-button" class="arcade-btn settings-btn">
              <span class="btn-icon">⚙</span>
              <span class="btn-label">SETTINGS</span>
              <span class="btn-shine"></span>
            </button>

            <button id="about-button" class="arcade-btn about-btn">
              <span class="btn-icon">ℹ</span>
              <span class="btn-label">HOW TO PLAY</span>
              <span class="btn-shine"></span>
            </button>
          </div>

          <div class="controls-preview">
            <div class="keys-display">
              <div class="key-box" data-key="D">
                <span class="key-letter">D</span>
                <span class="key-label">LEFT</span>
              </div>
              <div class="key-box" data-key="F">
                <span class="key-letter">F</span>
                <span class="key-label">DOWN</span>
              </div>
              <div class="key-box" data-key="J">
                <span class="key-letter">J</span>
                <span class="key-label">UP</span>
              </div>
              <div class="key-box" data-key="K">
                <span class="key-letter">K</span>
                <span class="key-label">RIGHT</span>
              </div>
            </div>
            <p class="controls-hint-text">PRESS KEYS TO HIT THE NOTES</p>
          </div>

          <div class="insert-coin-text">
            <span class="coin-icon">◉</span>
            PRESS START TO BEGIN
            <span class="coin-icon">◉</span>
          </div>
        </div>

        <div class="ambient-glow"></div>
      </div>
    `;

    this.container = container;
    this.attachEventListeners();
  }

  attachEventListeners() {
    document.getElementById('start-button').addEventListener('click', () => {
      this.game.changeState(this.game.STATE.LEVEL_SELECT);
    });

    document.getElementById('settings-button').addEventListener('click', () => {
      this.game.changeState(this.game.STATE.SETTINGS);
    });

    document.getElementById('about-button').addEventListener('click', () => {
      this.showHowToPlay();
    });
  }

  showHowToPlay() {
    const dialog = document.createElement('div');
    dialog.className = 'retro-dialog';
    dialog.innerHTML = `
      <div class="dialog-overlay"></div>
      <div class="dialog-content">
        <div class="dialog-header">
          <h2>HOW TO PLAY</h2>
          <button class="dialog-close" id="close-dialog">×</button>
        </div>
        <div class="dialog-body">
          <div class="instruction-section">
            <h3>OBJECTIVE</h3>
            <p>Hit the falling arrows in time with the music to build your score and combo!</p>
          </div>

          <div class="instruction-section">
            <h3>CONTROLS</h3>
            <div class="controls-grid">
              <div class="control-item">
                <span class="control-key" style="background: #FF0080;">D</span>
                <span class="control-desc">Left Lane</span>
              </div>
              <div class="control-item">
                <span class="control-key" style="background: #00FFFF;">F</span>
                <span class="control-desc">Down Lane</span>
              </div>
              <div class="control-item">
                <span class="control-key" style="background: #FFFF00;">J</span>
                <span class="control-desc">Up Lane</span>
              </div>
              <div class="control-item">
                <span class="control-key" style="background: #00FF00;">K</span>
                <span class="control-desc">Right Lane</span>
              </div>
            </div>
          </div>

          <div class="instruction-section">
            <h3>SCORING</h3>
            <div class="scoring-info">
              <div class="score-row">
                <span class="accuracy perfect">PERFECT</span>
                <span class="points">+100 pts</span>
              </div>
              <div class="score-row">
                <span class="accuracy good">GOOD</span>
                <span class="points">+50 pts</span>
              </div>
              <div class="score-row">
                <span class="accuracy miss">MISS</span>
                <span class="points">+0 pts</span>
              </div>
            </div>
            <p class="combo-info">Build combos for score multipliers!</p>
          </div>

          <div class="instruction-section">
            <h3>TIPS</h3>
            <ul class="tips-list">
              <li>Watch the hit line and time your keypresses</li>
              <li>Keep your combo going for higher scores</li>
              <li>Don't let your health reach zero!</li>
            </ul>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    document.getElementById('close-dialog').addEventListener('click', () => {
      dialog.remove();
    });

    dialog.querySelector('.dialog-overlay').addEventListener('click', () => {
      dialog.remove();
    });
  }
}