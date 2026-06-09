/**
 * TutorialScreen.js - Tutorial for Simon game
 * Teaches players the 4 button sounds
 */

class TutorialScreen {
  constructor(game) {
    this.game = game;
    this.audioManager = game.audioManager;
    this.voiceManager = game.voiceManager;
    this.inputManager = game.inputManager;
    this.container = null;
    this.currentStep = 0;
    this.totalSteps = 4;

    this.buttons = [
      { id: 'L2', name: 'Gatillo Izquierdo', sound: 'assets/audio/sounds/sound2.mp3' },
      { id: 'L1', name: 'Botón Superior Izquierdo', sound: 'assets/audio/sounds/sound1.mp3' },
      { id: 'R1', name: 'Botón Superior Derecho', sound: 'assets/audio/sounds/sound3.mp3' },
      { id: 'R2', name: 'Gatillo Derecho', sound: 'assets/audio/sounds/sound4.mp3' }
    ];

    this.buttonColors = {
      'L1': '#FF0080',
      'L2': '#00FFFF',
      'R1': '#FFFF00',
      'R2': '#00FF00'
    };

    this.onComplete = null;
  }

  show() {
    this.currentStep = 0;
    this.render();
    this.startTutorial();
  }

  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
    this.voiceManager.stop();
  }

  render() {
    let container = document.getElementById('tutorial-screen');
    if (!container) {
      container = document.createElement('div');
      container.id = 'tutorial-screen';
      container.className = 'tutorial-container';
      document.body.appendChild(container);
    }

    container.style.display = 'flex';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100vw';
    container.style.height = '100vh';
    container.style.zIndex = '200';
    container.style.background = 'linear-gradient(135deg, #0a0a15 0%, #1a1a2e 100%)';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.fontFamily = "'Press Start 2P', monospace";

    container.innerHTML = `
      <div class="tutorial-header">
        <h1 class="tutorial-title glitch-text" data-text="TUTORIAL">TUTORIAL</h1>
        <p class="tutorial-subtitle">Aprende los 4 sonidos</p>
      </div>

      <div class="tutorial-progress">
        <div class="progress-dots">
          ${this.buttons.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}" data-step="${i}">●</span>`).join('')}
        </div>
        <span class="progress-text">Paso ${this.currentStep + 1} de ${this.totalSteps}</span>
      </div>

      <div class="tutorial-instruction" id="tutorial-instruction">
        <p class="instruction-text">Preparando...</p>
      </div>

      <div class="tutorial-buttons-grid">
        ${this.buttons.map(btn => `
          <div class="tutorial-button-box" id="tutorial-btn-${btn.id}" data-button="${btn.id}">
            <div class="button-glow" style="background: ${this.buttonColors[btn.id]}"></div>
            <div class="button-visual" style="border-color: ${this.buttonColors[btn.id]}">
              <span class="button-label">${btn.id}</span>
            </div>
            <p class="button-name">${btn.name}</p>
          </div>
        `).join('')}
      </div>

      <div class="tutorial-actions">
        <button id="tutorial-skip" class="retro-btn">
          <span class="btn-text">SKIP</span>
        </button>
        <button id="tutorial-next" class="retro-btn primary">
          <span class="btn-text">SIGUIENTE</span>
        </button>
      </div>

      <div class="tutorial-hint">
        <p>Presiona ESC para volver al menú</p>
      </div>
    `;

    this.container = container;
    this.attachEventListeners();
    this.setupInputHandler();
  }

  attachEventListeners() {
    const skipBtn = document.getElementById('tutorial-skip');
    const nextBtn = document.getElementById('tutorial-next');

    if (skipBtn) {
      skipBtn.addEventListener('click', () => this.skipTutorial());
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextStep());
    }
  }

  setupInputHandler() {
    this.inputHandler = (key) => {
      if (this.currentStep < this.totalSteps) {
        const expectedButton = this.buttons[this.currentStep].id;
        const keyToButton = { 'f': 'L2', 'd': 'L1', 'j': 'R1', 'k': 'R2' };

        const pressedButton = keyToButton[key];
        if (pressedButton) {
          this.handleButtonPress(pressedButton);
        }
      }
    };

    this.game.inputManager.onInput = this.inputHandler;
  }

  async startTutorial() {
    await this.delay(500);
    this.showStepInstruction();
  }

  showStepInstruction() {
    const instruction = document.getElementById('tutorial-instruction');
    if (!instruction) return;

    const step = this.currentStep;
    const button = this.buttons[step];

    const messages = [
      'Presiona el Gatillo Izquierdo (L2)',
      'Presiona el Botón Superior Izquierdo (L1)',
      'Presiona el Botón Superior Derecho (R1)',
      'Presiona el Gatillo Derecho (R2)'
    ];

    instruction.innerHTML = `
      <p class="instruction-text">${messages[step]}</p>
    `;

    this.voiceManager.announceTutorialStep(step + 1, button.id);
    this.highlightExpectedButton(button.id);

    this.updateProgress();
  }

  highlightExpectedButton(buttonId) {
    this.buttons.forEach(btn => {
      const element = document.getElementById(`tutorial-btn-${btn.id}`);
      if (element) {
        element.classList.remove('expected');
        element.style.opacity = '0.5';
      }
    });

    const expectedElement = document.getElementById(`tutorial-btn-${buttonId}`);
    if (expectedElement) {
      expectedElement.classList.add('expected');
      expectedElement.style.opacity = '1';
      expectedElement.style.transform = 'scale(1.1)';
    }
  }

  async handleButtonPress(buttonId) {
    const expectedButton = this.buttons[this.currentStep].id;

    if (buttonId === expectedButton) {
      this.playButtonSound(buttonId);
      this.activateButtonVisual(buttonId);
      this.voiceManager.announceButtonSound(buttonId);

      this.inputManager.vibrateGamepad(0.8, 150, 0);

      await this.delay(800);

      this.currentStep++;

      if (this.currentStep >= this.totalSteps) {
        this.completeTutorial();
      } else {
        this.showStepInstruction();
      }
    }
  }

  playButtonSound(buttonId) {
    const button = this.buttons.find(b => b.id === buttonId);
    if (button && button.sound) {
      const audio = new Audio(button.sound);
      audio.volume = 0.8;
      audio.play();
    }
  }

  activateButtonVisual(buttonId) {
    const element = document.getElementById(`tutorial-btn-${buttonId}`);
    if (element) {
      element.classList.add('pressed');
      setTimeout(() => element.classList.remove('pressed'), 300);
    }
  }

  updateProgress() {
    const dots = document.querySelectorAll('.progress-dots .dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === this.currentStep);
      dot.classList.toggle('completed', i < this.currentStep);
    });

    const progressText = document.querySelector('.progress-text');
    if (progressText) {
      progressText.textContent = `Paso ${this.currentStep + 1} de ${this.totalSteps}`;
    }
  }

  async completeTutorial() {
    const instruction = document.getElementById('tutorial-instruction');
    if (instruction) {
      instruction.innerHTML = `
        <p class="instruction-text success">¡Tutorial Completado!</p>
      `;
    }

    this.voiceManager.speak('¡Muy bien! Has aprendido los 4 sonidos. Prepárate para el juego.');
    this.inputManager.vibrateGamepad(1.0, 300, 0);

    await this.delay(2500);

    if (this.onComplete) {
      this.onComplete();
    }
  }

  skipTutorial() {
    this.voiceManager.stop();
    if (this.onComplete) {
      this.onComplete();
    }
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.handleButtonPress(this.buttons[this.currentStep].id);
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  destroy() {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    this.game.inputManager.onInput = this.game.handleInput.bind(this.game);
  }
}

window.TutorialScreen = TutorialScreen;