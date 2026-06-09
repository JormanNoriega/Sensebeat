/**
 * SimonResultsScreen.js - Results screen for Simon game
 * Shows score, level reached, and best combo
 */

class SimonResultsScreen {
  constructor(game) {
    this.game = game;
    this.container = null;
  }

  show(results, level = 1) {
    this.render(results, level);
  }

  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
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
      background: linear-gradient(135deg, #0a0a15 0%, #1a1a2e 100%);
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
      <div class="results-content">
        <div class="results-header">
          <h1 class="results-title glitch-text" data-text="FIN DEL JUEGO">FIN DEL JUEGO</h1>
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
          <p class="message-sub">Presiona ENTER para volver al menú</p>
        </div>

        <div class="results-actions">
          <button id="results-retry" class="arcade-btn primary">
            <span class="btn-icon">↺</span>
            <span class="btn-label">REINTENTAR</span>
          </button>

          <button id="results-menu" class="arcade-btn">
            <span class="btn-icon">⌂</span>
            <span class="btn-label">MENÚ</span>
          </button>
        </div>

        <div class="results-hint">
          <p>Presiona ESC para volver al menú</p>
        </div>
      </div>
    `;

    this.container = container;
    this.attachEventListeners(level);
  }

  attachEventListeners(level) {
    const retryBtn = document.getElementById('results-retry');
    const menuBtn = document.getElementById('results-menu');

    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        window.location.href = `game.html?level=${level}`;
      });
    }

    if (menuBtn) {
      menuBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        window.location.href = 'index.html';
      }
    });
  }
}

window.SimonResultsScreen = SimonResultsScreen;