/**
 * GameplayUI.js - In-game HUD and UI elements
 * Displays score, combo, health, etc. during gameplay
 */

class GameplayUI {
  constructor(game) {
    this.game = game;
    this.container = null;
    this.scoreDisplay = null;
    this.comboDisplay = null;
    this.accuracyDisplay = null;
    this.healthFill = null;
    this.hitEffects = [];
    this.lastScore = -1;
    this.lastCombo = -1;
    this.lastAccuracy = -1;
    this.lastHealth = -1;
    this.scanlineCanvas = null;
  }

  init() {
    if (this.container) return;

    this.container = document.createElement('div');
    this.container.id = 'gameplay-ui';
    this.container.className = 'gameplay-ui';
    this.container.innerHTML = `
      <div class="hud-top">
        <div class="hud-element score-display">
          <div class="label">SCORE</div>
          <div class="value" id="score-value">0</div>
        </div>
        <div class="hud-element accuracy-display">
          <div class="label">ACCURACY</div>
          <div class="value" id="accuracy-value">0%</div>
        </div>
      </div>

      <div class="hud-bottom">
        <div class="hud-element combo-display">
          <div class="label">COMBO</div>
          <div class="value combo-counter" id="combo-value">0</div>
        </div>
        <div class="hud-element health-display">
          <div class="label">HEALTH</div>
          <div class="health-bar">
            <div class="health-fill" id="health-fill"></div>
          </div>
        </div>
      </div>

      <div class="hint-text">ESC to Pause</div>
    `;
    document.body.appendChild(this.container);

    this.scoreDisplay = document.getElementById('score-value');
    this.comboDisplay = document.getElementById('combo-value');
    this.accuracyDisplay = document.getElementById('accuracy-value');
    this.healthFill = document.getElementById('health-fill');

    this.initScanlines();
  }

  initScanlines() {
    if (this.scanlineCanvas) return;

    this.scanlineCanvas = document.createElement('canvas');
    this.scanlineCanvas.id = 'gameplay-scanlines';
    this.scanlineCanvas.width = window.innerWidth;
    this.scanlineCanvas.height = window.innerHeight;
    this.scanlineCanvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 49;
      mix-blend-mode: overlay;
    `;
    document.body.appendChild(this.scanlineCanvas);

    this.drawScanlines();
  }

  drawScanlines() {
    if (!this.scanlineCanvas || !this.scanlineCanvas.ctx) {
      this.scanlineCanvas.ctx = this.scanlineCanvas.getContext('2d');
    }

    const ctx = this.scanlineCanvas.ctx;
    const width = this.scanlineCanvas.width;
    const height = this.scanlineCanvas.height;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
    for (let y = 0; y < height; y += 3) {
      ctx.fillRect(0, y, width, 1);
    }

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    this.animationFrame = requestAnimationFrame(() => this.drawScanlines());
  }

  removeScanlines() {
    if (this.scanlineCanvas) {
      this.scanlineCanvas.remove();
      this.scanlineCanvas = null;
    }
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  /**
   * Show gameplay UI
   */
  show() {
    this.init();
    this.container.style.display = 'block';
    this.initScanlines();
  }

  /**
   * Hide gameplay UI
   */
  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
    this.removeScanlines();
  }

  /**
   * Render gameplay UI
   */
  render(ctx) {
    this.renderHitEffects(ctx);
  }

  /**
   * Render hit effects (canvas-based)
   */
  renderHitEffects(ctx) {
    const now = performance.now();

    this.hitEffects = this.hitEffects.filter(effect => {
      const elapsed = now - effect.startTime;
      if (elapsed > 500) return false;

      const progress = elapsed / 500;
      const alpha = 1 - progress;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = effect.color;
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const y = effect.y - (progress * 50);
      ctx.fillText(effect.text, effect.x, y);

      ctx.restore();

      return true;
    });
  }

  /**
   * Update score display
   */
  updateScore(score) {
    if (!this.scoreDisplay || this.lastScore === score) return;
    this.lastScore = score;
    this.scoreDisplay.textContent = score;
  }

  /**
   * Update combo display
   */
  updateCombo(combo) {
    if (!this.comboDisplay || this.lastCombo === combo) return;
    this.lastCombo = combo;
    this.comboDisplay.textContent = combo;
    if (combo > 0) {
      this.comboDisplay.classList.remove('combo-bump');
      void this.comboDisplay.offsetWidth;
      this.comboDisplay.classList.add('combo-bump');
    }
  }

  /**
   * Update accuracy display
   */
  updateAccuracy(accuracy) {
    if (!this.accuracyDisplay || this.lastAccuracy === accuracy) return;
    this.lastAccuracy = accuracy;
    this.accuracyDisplay.textContent = accuracy + '%';
  }

  /**
   * Update health display
   */
  updateHealth(health) {
    if (!this.healthFill || this.lastHealth === health) return;
    this.lastHealth = health;
    this.healthFill.style.width = health + '%';
  }

  /**
   * Show hit effect
   */
  showHitEffect(laneIndex, accuracy) {
    const lane = this.game.lanes[laneIndex];
    if (!lane) return;

    let text, color;

    switch (accuracy) {
      case 'PERFECT':
        text = 'PERFECT';
        color = '#FFD700';
        break;
      case 'GOOD':
        text = 'GOOD';
        color = '#00FF00';
        break;
      case 'MISS':
        text = 'MISS';
        color = '#FF0000';
        break;
      default:
        return;
    }

    this.hitEffects.push({
      text: text,
      color: color,
      x: lane.x + lane.width / 2,
      y: lane.hitLineY,
      startTime: performance.now()
    });
  }
}
