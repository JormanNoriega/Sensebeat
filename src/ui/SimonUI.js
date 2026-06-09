/**
 * SimonUI.js - Visual interface for Simon game
 * Renders the 4 buttons in a retro style
 */

class SimonUI {
  constructor(game) {
    this.game = game;
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
    let container = document.getElementById('simon-ui');
    if (!container) {
      container = document.createElement('div');
      container.id = 'simon-ui';
      container.className = 'simon-container';
      document.body.appendChild(container);
    }

    container.style.cssText = `
      display: flex;
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: linear-gradient(180deg, #0a0a15 0%, #1a1a2e 50%, #0a0a15 100%);
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 150;
      font-family: 'Press Start 2P', monospace;
    `;

    container.innerHTML = `
      <div class="simon-header">
        <div class="simon-title-section">
          <h1 class="simon-title">SENSA<span class="accent">BEAT</span></h1>
          <p class="simon-level-name" id="simon-level-name">NIVEL 1 - FÁCIL</p>
        </div>
      </div>

      <div class="simon-stats-bar">
        <div class="stat-item">
          <span class="stat-label">RONDA</span>
          <span class="stat-value" id="simon-level">01</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">PUNTOS</span>
          <span class="stat-value" id="simon-score">000000</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">RACHA</span>
          <span class="stat-value" id="simon-combo">000</span>
        </div>
      </div>

      <div class="simon-buttons-area">
        <div class="simon-row">
          <div class="simon-button-wrapper" id="simon-wrapper-L1">
            <div class="simon-button" id="simon-L1" data-button="L1">
              <div class="button-inner">
                <span class="button-key">L1</span>
                <span class="button-name">IZQ. SUP.</span>
              </div>
            </div>
          </div>

          <div class="simon-button-wrapper" id="simon-wrapper-L2">
            <div class="simon-button" id="simon-L2" data-button="L2">
              <div class="button-inner">
                <span class="button-key">L2</span>
                <span class="button-name">IZQ.</span>
              </div>
            </div>
          </div>
        </div>

        <div class="simon-status-area">
          <div class="status-indicator" id="simon-status">
            <span class="status-text">ESPERANDO...</span>
          </div>
        </div>

        <div class="simon-row">
          <div class="simon-button-wrapper" id="simon-wrapper-R1">
            <div class="simon-button" id="simon-R1" data-button="R1">
              <div class="button-inner">
                <span class="button-key">R1</span>
                <span class="button-name">DER. SUP.</span>
              </div>
            </div>
          </div>

          <div class="simon-button-wrapper" id="simon-wrapper-R2">
            <div class="simon-button" id="simon-R2" data-button="R2">
              <div class="button-inner">
                <span class="button-key">R2</span>
                <span class="button-name">DER.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="simon-controls-hint">
        <p>Presiona ESC para volver al menú</p>
      </div>
    `;

    this.container = container;
    this.setupInputHandler();
  }

  setupInputHandler() {
    this.game.inputManager.onInput = (key) => {
      this.handleKeyPress(key);
    };
  }

  handleKeyPress(key) {
    const keyToButton = {
      'd': 'L1', 'D': 'L1',
      'f': 'L2', 'F': 'L2',
      'j': 'R1', 'J': 'R1',
      'k': 'R2', 'K': 'R2'
    };

    const button = keyToButton[key];
    if (button && this.game.simonGame) {
      this.game.simonGame.handleButtonPress(button);
      this.flashButton(button);
    }
  }

  flashButton(button) {
    const buttonElement = document.getElementById(`simon-${button}`);
    if (buttonElement) {
      buttonElement.classList.add('flash');
      setTimeout(() => buttonElement.classList.remove('flash'), 200);
    }
  }

  updateLevel(level) {
    const levelNames = { 1: 'FÁCIL', 2: 'NORMAL', 3: 'DIFÍCIL' };
    const levelNameEl = document.getElementById('simon-level-name');
    if (levelNameEl) {
      levelNameEl.textContent = `NIVEL ${level} - ${levelNames[level]}`;
    }
  }

  updateStats(data) {
    const levelEl = document.getElementById('simon-level');
    const scoreEl = document.getElementById('simon-score');
    const comboEl = document.getElementById('simon-combo');

    if (levelEl) levelEl.textContent = String(data.level).padStart(2, '0');
    if (scoreEl) scoreEl.textContent = String(data.score).padStart(6, '0');
    if (comboEl) comboEl.textContent = String(data.combo).padStart(3, '0');
  }

  updateStatus(text, type = 'waiting') {
    const statusEl = document.getElementById('simon-status');
    if (statusEl) {
      statusEl.querySelector('.status-text').textContent = text;
      statusEl.className = `status-indicator ${type}`;
    }
  }

  destroy() {
    this.game.inputManager.onInput = this.game.handleInput.bind(this.game);
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }
}

window.SimonUI = SimonUI;