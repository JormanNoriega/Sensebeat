/**
 * LevelSelect.js - Level/Song selection screen
 * Retro arcade aesthetic with CRT filter effect
 */

class LevelSelect {
  constructor(game) {
    this.game = game;
    this.container = null;
    this.selectedIndex = 0;
    this.songs = [];
    this.scanlineCanvas = null;
    this.scanlineCtx = null;
    this.animationFrame = null;
  }

  show() {
    console.log('LevelSelect.show() called');
    this.songs = this.game.getSongs();
    console.log('Songs loaded:', this.songs.length);
    this.render();
    this.startScanlineEffect();
  }

  hide() {
    console.log('LevelSelect.hide() called');
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
    this.scanlineCtx = this.scanlineCanvas.getContext('2d');
    document.body.appendChild(this.scanlineCanvas);

    const drawScanlines = () => {
      if (!this.scanlineCtx) return;

      const ctx = this.scanlineCtx;
      const width = this.scanlineCanvas.width;
      const height = this.scanlineCanvas.height;

      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      for (let y = 0; y < height; y += 4) {
        ctx.fillRect(0, y, width, 2);
      }

      const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height) * 0.7
      );
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = 'rgba(0, 255, 255, 0.02)';
      for (let y = 0; y < height; y += 3) {
        ctx.fillRect(0, y, width, 1);
      }

      this.animationFrame = requestAnimationFrame(drawScanlines);
    };

    drawScanlines();
  }

  stopScanlineEffect() {
    if (this.scanlineCanvas) {
      this.scanlineCanvas.remove();
      this.scanlineCanvas = null;
      this.scanlineCtx = null;
    }
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  render() {
    console.log('LevelSelect.render() called, songs:', this.songs.length);

    let container = document.getElementById('level-select');
    if (!container) {
      container = document.createElement('div');
      container.id = 'level-select';
      container.className = 'menu-container level-select-container';
      document.body.appendChild(container);
      console.log('Created new level-select container');
    }

    container.style.display = 'flex';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100vw';
    container.style.height = '100vh';
    container.style.zIndex = '100';

    if (this.songs.length === 0) {
      container.innerHTML = `
        <div class="retro-content">
          <div class="crt-flicker"></div>
          <div class="arcade-cabinet">
            <div class="screen-frame">
              <div class="screen-content error-screen">
                <h2 class="glitch-text" data-text="NO SONGS FOUND">NO SONGS FOUND</h2>
                <p class="subtitle">INSERT COIN TO CONTINUE</p>
                <button id="back-button" class="retro-btn">
                  <span class="btn-glow"></span>
                  <span class="btn-text">[ COIN ]</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      const selectedIndex = this.selectedIndex;

      container.innerHTML = `
        <div class="retro-content">
          <div class="crt-flicker"></div>

          <div class="arcade-cabinet">
            <div class="cabinet-top">
              <div class="neon-lights">
                <span class="light red"></span>
                <span class="light yellow"></span>
                <span class="light green"></span>
              </div>
              <h1 class="arcade-title">
                <span class="title-glow">SELECT</span>
                <span class="title-shadow">YOUR</span>
                <span class="title-main">TRACK</span>
              </h1>
              <div class="insert-coin ${selectedIndex >= 0 ? 'pulse' : ''}">
                PRESS START TO PLAY
              </div>
            </div>

            <div class="screen-frame">
              <div class="screen-content">
                <div class="song-list-container">
                  <div class="song-list" id="song-list">
                    ${this.songs.map((song, index) => this.renderSongItem(song, index)).join('')}
                  </div>
                </div>

                <div class="song-preview" id="song-preview">
                  <div class="preview-art">
                    <div class="vinyl-record ${selectedIndex >= 0 ? 'spin' : ''}">
                      <div class="vinyl-label"></div>
                    </div>
                  </div>
                  <div class="preview-info">
                    <h3 class="song-title-display">${this.songs[selectedIndex]?.name || 'Unknown'}</h3>
                    <div class="song-stats">
                      <span class="stat">DIFFICULTY: <span class="value">${this.songs[selectedIndex]?.difficulty || 'Normal'}</span></span>
                      <span class="stat">BPM: <span class="value">${this.getSongBpm(this.songs[selectedIndex])}</span></span>
                    </div>
                  </div>
                </div>

                <div class="controls-hint">
                  <span class="key-hint"><kbd>↑</kbd><kbd>↓</kbd> SELECT</span>
                  <span class="key-hint"><kbd>ENTER</kbd> PLAY</span>
                  <span class="key-hint"><kbd>ESC</kbd> BACK</span>
                </div>
              </div>
            </div>

            <div class="cabinet-bottom">
              <div class="score-display">
                HIGH SCORE: <span class="score-value">000000</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    this.container = container;
    this.attachEventListeners();

    if (this.songs.length > 0) {
      this.updateSongList();
    }

    console.log('LevelSelect.render() complete, container innerHTML length:', container.innerHTML.length);
  }

  renderSongItem(song, index) {
    const isSelected = index === this.selectedIndex;
    const laneColors = ['#FF0080', '#00FFFF', '#FFFF00', '#00FF00'];

    return `
      <div class="song-item ${isSelected ? 'selected' : ''}" data-index="${index}">
        <div class="song-number">${String(index + 1).padStart(2, '0')}</div>
        <div class="song-visual">
          <div class="mini-arrows">
            ${laneColors.map((color, i) => `<span class="mini-arrow" style="color: ${color}">▷</span>`).join('')}
          </div>
        </div>
        <div class="song-details">
          <h3 class="song-name">${song.name}</h3>
          <div class="song-difficulty-bar">
            <div class="difficulty-fill" style="width: ${this.getDifficultyPercent(song.difficulty)}%"></div>
          </div>
        </div>
        ${isSelected ? '<div class="select-indicator">◀</div>' : ''}
      </div>
    `;
  }

  getSongBpm(song) {
    if (!song) return '---';
    if (this.game.currentChart && this.game.currentChart.bpm) {
      return this.game.currentChart.bpm;
    }
    return '---';
  }

  getDifficultyPercent(difficulty) {
    const diffs = { 'Easy': 25, 'Normal': 50, 'Hard': 75, 'Expert': 100 };
    return diffs[difficulty] || 50;
  }

  updateSongList() {
    document.querySelectorAll('.song-item').forEach((item, index) => {
      item.classList.toggle('selected', index === this.selectedIndex);
      const indicator = item.querySelector('.select-indicator');
      if (index === this.selectedIndex && !indicator) {
        item.innerHTML += '<div class="select-indicator">◀</div>';
      } else if (indicator && index !== this.selectedIndex) {
        indicator.remove();
      }
    });

    const preview = document.getElementById('song-preview');
    if (preview && this.songs[this.selectedIndex]) {
      preview.querySelector('.song-title-display').textContent = this.songs[this.selectedIndex].name;
    }
  }

  attachEventListeners() {
    document.querySelectorAll('.song-item').forEach((item, index) => {
      item.addEventListener('click', () => {
        this.selectSong(index);
      });

      item.addEventListener('mouseenter', () => {
        this.selectSong(index);
      });
    });

    const playButton = document.getElementById('play-button');
    if (playButton) {
      playButton.addEventListener('click', () => {
        this.playSong();
      });
    }

    const backButton = document.getElementById('back-button');
    if (backButton) {
      backButton.addEventListener('click', () => {
        this.game.changeState(this.game.STATE.MENU);
      });
    }

    document.addEventListener('keydown', (e) => {
      if (this.game.currentState !== this.game.STATE.LEVEL_SELECT) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          this.previousSong();
          e.preventDefault();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          this.nextSong();
          e.preventDefault();
          break;
        case 'Enter':
        case ' ':
          this.playSong();
          e.preventDefault();
          break;
        case 'Escape':
          this.game.changeState(this.game.STATE.MENU);
          e.preventDefault();
          break;
      }
    });
  }

  selectSong(index) {
    this.selectedIndex = Math.max(0, Math.min(index, this.songs.length - 1));
    this.updateSongList();
  }

  previousSong() {
    this.selectSong(this.selectedIndex - 1);
  }

  nextSong() {
    this.selectSong(this.selectedIndex + 1);
  }

  async playSong() {
    const song = this.songs[this.selectedIndex];
    if (!song) return;

    this.stopScanlineEffect();

    const success = await this.game.loadSong(song);
    if (success) {
      this.game.changeState(this.game.STATE.GAMEPLAY);
    }
  }
}