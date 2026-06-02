/**
 * ResultsScreen.js - Results/Score screen shown after gameplay
 * Displays final statistics and allows replay or menu return
 */

class ResultsScreen {
  constructor(game) {
    this.game = game;
    this.container = null;
  }

  /**
   * Show results screen
   */
  show() {
    this.render();
  }

  /**
   * Hide results screen
   */
  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }

  /**
   * Render results screen
   */
  render() {
    let container = document.getElementById('results-screen');
    if (!container) {
      container = document.createElement('div');
      container.id = 'results-screen';
      container.className = 'menu-container results-container';
      document.body.appendChild(container);
    }

    // Get final statistics
    const stats = this.game.scoreManager.getFinalStats();
    const breakdown = this.game.scoreManager.getHitBreakdown();

    // Create rating display
    const ratingClass = `rating-${stats.rating.toLowerCase()}`;

    container.style.display = 'flex';
    container.innerHTML = `
      <div class="results-content">
        <div class="results-header">
          <h2>RESULTS</h2>
          <p class="song-title">${this.game.currentSong.name}</p>
        </div>

        <div class="results-main">
          <div class="rating-display ${ratingClass}">
            <div class="rating-letter">${stats.rating}</div>
          </div>

          <div class="results-stats">
            <div class="stat-row">
              <span class="stat-label">Score:</span>
              <span class="stat-value">${stats.score}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Accuracy:</span>
              <span class="stat-value">${stats.accuracy}%</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Max Combo:</span>
              <span class="stat-value">${stats.maxCombo}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Health:</span>
              <span class="stat-value">${Math.round(stats.finalHealth)}%</span>
            </div>
          </div>

          <div class="results-breakdown">
            <h3>Hit Breakdown</h3>
            <div class="breakdown-row">
              <span class="label perfect">Perfect:</span>
              <span class="value">${breakdown.perfect}</span>
            </div>
            <div class="breakdown-row">
              <span class="label good">Good:</span>
              <span class="value">${breakdown.good}</span>
            </div>
            <div class="breakdown-row">
              <span class="label miss">Miss:</span>
              <span class="value">${breakdown.miss}</span>
            </div>
          </div>
        </div>

        <div class="results-buttons">
          <button id="retry-button" class="btn btn-primary">
            <span class="btn-icon">🔄</span>
            Retry
          </button>
          <button id="select-button" class="btn btn-secondary">
            <span class="btn-icon">🎵</span>
            Select Song
          </button>
          <button id="menu-button" class="btn btn-secondary">
            <span class="btn-icon">🏠</span>
            Main Menu
          </button>
        </div>
      </div>
    `;

    this.container = container;
    this.attachEventListeners();
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    document.getElementById('retry-button').addEventListener('click', () => {
      this.game.changeState(this.game.STATE.GAMEPLAY);
    });

    document.getElementById('select-button').addEventListener('click', () => {
      this.game.changeState(this.game.STATE.LEVEL_SELECT);
    });

    document.getElementById('menu-button').addEventListener('click', () => {
      this.game.changeState(this.game.STATE.MENU);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (this.game.currentState !== this.game.STATE.RESULTS) return;

      if (e.key === 'Enter' || e.key === ' ') {
        this.game.changeState(this.game.STATE.GAMEPLAY);
      }
    });
  }
}
