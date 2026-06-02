/**
 * SettingsScreen.js - Settings/Options screen
 * Allows users to adjust game settings
 */

class SettingsScreen {
  constructor(game) {
    this.game = game;
    this.container = null;
  }

  /**
   * Show settings screen
   */
  show() {
    this.render();
  }

  /**
   * Hide settings screen
   */
  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }

  /**
   * Render settings screen
   */
  render() {
    let container = document.getElementById('settings-screen');
    if (!container) {
      container = document.createElement('div');
      container.id = 'settings-screen';
      container.className = 'menu-container';
      document.body.appendChild(container);
    }

    const settings = this.game.settings;

    container.style.display = 'flex';
    container.innerHTML = `
      <div class="settings-content">
        <h2>Settings</h2>

        <div class="settings-group">
          <label class="setting-item">
            <span class="label">Music Volume</span>
            <div class="volume-control">
              <input type="range" id="music-volume" min="0" max="100" value="${settings.musicVolume * 100}" class="slider">
              <span class="value-display">${Math.round(settings.musicVolume * 100)}%</span>
            </div>
          </label>

          <label class="setting-item">
            <span class="label">SFX Volume</span>
            <div class="volume-control">
              <input type="range" id="sfx-volume" min="0" max="100" value="${settings.sfxVolume * 100}" class="slider">
              <span class="value-display">${Math.round(settings.sfxVolume * 100)}%</span>
            </div>
          </label>

          <label class="setting-item">
            <span class="label">Difficulty</span>
            <select id="difficulty" class="select">
              <option value="easy" ${settings.difficulty === 'easy' ? 'selected' : ''}>Easy</option>
              <option value="normal" ${settings.difficulty === 'normal' ? 'selected' : ''}>Normal</option>
              <option value="hard" ${settings.difficulty === 'hard' ? 'selected' : ''}>Hard</option>
            </select>
          </label>

          <label class="setting-item checkbox">
            <input type="checkbox" id="vibration-toggle" ${settings.enableVibration ? 'checked' : ''}>
            <span class="label">Enable Vibration (Gamepad)</span>
          </label>

          <label class="setting-item checkbox">
            <input type="checkbox" id="debug-toggle" ${settings.showDebug ? 'checked' : ''}>
            <span class="label">Show Debug Info</span>
          </label>
        </div>

        <div class="settings-buttons">
          <button id="save-button" class="btn btn-primary">Save</button>
          <button id="back-button" class="btn btn-secondary">Cancel</button>
        </div>

        <div class="settings-footer">
          <h3>Controls</h3>
          <table class="controls-table">
            <tr>
              <td><kbd>D</kbd></td>
              <td>Left Lane</td>
            </tr>
            <tr>
              <td><kbd>F</kbd></td>
              <td>Down Lane</td>
            </tr>
            <tr>
              <td><kbd>J</kbd></td>
              <td>Up Lane</td>
            </tr>
            <tr>
              <td><kbd>K</kbd></td>
              <td>Right Lane</td>
            </tr>
            <tr>
              <td><kbd>ESC</kbd></td>
              <td>Pause / Menu</td>
            </tr>
          </table>
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
    // Music volume slider
    const musicVolumeSlider = document.getElementById('music-volume');
    if (musicVolumeSlider) {
      musicVolumeSlider.addEventListener('input', (e) => {
        const value = e.target.value / 100;
        this.game.audioManager.setMusicVolume(value);
        e.target.parentElement.querySelector('.value-display').textContent = `${e.target.value}%`;
      });
    }

    // SFX volume slider
    const sfxVolumeSlider = document.getElementById('sfx-volume');
    if (sfxVolumeSlider) {
      sfxVolumeSlider.addEventListener('input', (e) => {
        const value = e.target.value / 100;
        this.game.audioManager.setSFXVolume(value);
        e.target.parentElement.querySelector('.value-display').textContent = `${e.target.value}%`;
      });
    }

    // Difficulty select
    const difficultySelect = document.getElementById('difficulty');
    if (difficultySelect) {
      difficultySelect.addEventListener('change', (e) => {
        this.game.settings.difficulty = e.target.value;
      });
    }

    // Vibration toggle
    const vibrationToggle = document.getElementById('vibration-toggle');
    if (vibrationToggle) {
      vibrationToggle.addEventListener('change', (e) => {
        this.game.settings.enableVibration = e.target.checked;
      });
    }

    // Debug toggle
    const debugToggle = document.getElementById('debug-toggle');
    if (debugToggle) {
      debugToggle.addEventListener('change', (e) => {
        this.game.settings.showDebug = e.target.checked;
      });
    }

    // Save button
    document.getElementById('save-button').addEventListener('click', () => {
      this.game.saveSettings();
      this.game.changeState(this.game.STATE.MENU);
    });

    // Back button
    document.getElementById('back-button').addEventListener('click', () => {
      this.game.changeState(this.game.STATE.MENU);
    });
  }
}
