/**
 * InputManager.js - Handles keyboard and gamepad input
 * Manages input events and controller state for accessibility
 */

class InputManager {
  constructor() {
    // Keyboard state
    this.keysPressed = new Set();
    this.keyBuffer = [];

    // Gamepad state
    this.gamepadStates = new Map();
    this.gamepadVibrationSupported = false;

    // Callbacks
    this.onInput = null;

    // Configuration
    this.keyBindings = {
      'left': ['d', 'D', 'ArrowLeft'],
      'down': ['f', 'F', 'ArrowDown'],
      'up': ['j', 'J', 'ArrowUp'],
      'right': ['k', 'K', 'ArrowRight'],
      'escape': ['Escape'],
      'pause': ['p', 'P', ' ']
    };

    // Debounce
    this.lastInputTime = new Map();
    this.inputDebounceMs = 50;
  }

  /**
   * Initialize input manager
   */
  init(inputCallback) {
    this.onInput = inputCallback;

    // Keyboard events
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));

    // Gamepad events
    window.addEventListener('gamepadconnected', this.handleGamepadConnected.bind(this));
    window.addEventListener('gamepaddisconnected', this.handleGamepadDisconnected.bind(this));

    // Start gamepad polling
    this.startGamepadPolling();

    console.log('⌨️ Input manager initialized');
  }

  /**
   * Handle keyboard down event
   */
  handleKeyDown(event) {
    const key = event.key;

    // Prevent default for game keys
    if (this.isGameKey(key)) {
      event.preventDefault();
    }

    if (this.keysPressed.has(key)) return; // Ignore repeats

    this.keysPressed.add(key);
    this.keyBuffer.push(key);

    this.processInput(key);
  }

  /**
   * Handle keyboard up event
   */
  handleKeyUp(event) {
    this.keysPressed.delete(event.key);
  }

  /**
   * Process input
   */
  processInput(key) {
    // Check debounce
    const now = performance.now();
    const lastInputTimeForKey = this.lastInputTime.get(key) || 0;

    if (now - lastInputTimeForKey < this.inputDebounceMs) {
      return; // Ignore rapid repeated inputs
    }

    this.lastInputTime.set(key, now);

    if (this.onInput) {
      this.onInput(key);
    }
  }

  /**
   * Check if key is a game key
   */
  isGameKey(key) {
    for (const keys of Object.values(this.keyBindings)) {
      if (keys.includes(key)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Handle gamepad connected
   */
  handleGamepadConnected(event) {
    console.log(`🎮 Gamepad connected: ${event.gamepad.id}`);
    this.gamepadStates.set(event.gamepad.index, {
      index: event.gamepad.index,
      id: event.gamepad.id,
      buttonsPressed: new Set(),
      axisValues: []
    });

    // Check for vibration support
    if (event.gamepad.vibrationActuator) {
      this.gamepadVibrationSupported = true;
      console.log('📳 Gamepad vibration supported');
    }
  }

  /**
   * Handle gamepad disconnected
   */
  handleGamepadDisconnected(event) {
    console.log(`🎮 Gamepad disconnected: ${event.gamepad.id}`);
    this.gamepadStates.delete(event.gamepad.index);
  }

  /**
   * Start polling gamepads
   */
  startGamepadPolling() {
    setInterval(() => this.pollGamepads(), 16); // ~60fps
  }

  /**
   * Poll gamepad input
   */
  pollGamepads() {
    const gamepads = navigator.getGamepads();

    if (!gamepads) return;

    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i];
      if (!gamepad) continue;

      const state = this.gamepadStates.get(i) || {
        index: i,
        buttonsPressed: new Set(),
        axisValues: []
      };

      // Check buttons
      this.checkGamepadButtons(gamepad, state);

      // Check analog sticks
      this.checkGamepadAnalog(gamepad, state);

      this.gamepadStates.set(i, state);
    }
  }

  /**
   * Check gamepad buttons
   */
  checkGamepadButtons(gamepad, state) {
    const buttonLaneMap = {
      0: 'k', // Button A / Cross - Right
      1: null, // Button B / Circle
      2: 'f', // Button X / Square - Down
      3: 'j', // Button Y / Triangle - Up
      4: 'd', // LB / L1 - Left
      5: 'j', // RB / R1 - Up
      6: 'f', // LT / L2 - Down
      7: 'k', // RT / R2 - Right
      8: null, // Select / Back
      9: null, // Start / Options
      10: null // L3 (left stick click)
    };

    gamepad.buttons.forEach((button, index) => {
      const pressed = button.pressed;
      const wasPressed = state.buttonsPressed.has(index);

      if (pressed && !wasPressed) {
        state.buttonsPressed.add(index);
        if (buttonLaneMap[index]) {
          this.processInput(buttonLaneMap[index]);
        }
      } else if (!pressed && wasPressed) {
        state.buttonsPressed.delete(index);
      }
    });
  }

  /**
   * Check gamepad analog sticks
   */
  checkGamepadAnalog(gamepad, state) {
    const deadzone = 0.5;

    // Left stick: axes 0 (X) and 1 (Y)
    const leftX = gamepad.axes[0];
    const leftY = gamepad.axes[1];

    if (leftX < -deadzone) {
      this.processInput('d'); // Left
    } else if (leftX > deadzone) {
      this.processInput('k'); // Right
    }

    if (leftY < -deadzone) {
      this.processInput('j'); // Up
    } else if (leftY > deadzone) {
      this.processInput('f'); // Down
    }
  }

  /**
   * Vibrate gamepad (for accessibility features like haptic feedback)
   * @param {number} strength - Vibration strength (0-1)
   * @param {number} duration - Duration in milliseconds
   * @param {number} gamepadIndex - Gamepad index
   */
  async vibrateGamepad(strength = 1.0, duration = 100, gamepadIndex = 0) {
    if (!this.gamepadVibrationSupported) return;

    try {
      const gamepad = navigator.getGamepads()[gamepadIndex];
      if (gamepad && gamepad.vibrationActuator) {
        await gamepad.vibrationActuator.playEffect('dual-rumble', {
          startDelay: 0,
          duration: duration,
          weakMagnitude: strength,
          strongMagnitude: strength
        });
      }
    } catch (error) {
      console.debug('Vibration not available:', error);
    }
  }

  /**
   * Get keyboard state
   */
  getKeysPressed() {
    return Array.from(this.keysPressed);
  }

  /**
   * Clear input buffer
   */
  clearBuffer() {
    this.keyBuffer = [];
  }

  /**
   * Get input buffer
   */
  getBuffer() {
    return this.keyBuffer;
  }

  /**
   * Check if gamepad vibration is supported
   */
  isVibrationSupported() {
    return this.gamepadVibrationSupported;
  }

  /**
   * Destroy input manager
   */
  destroy() {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    document.removeEventListener('keyup', this.handleKeyUp.bind(this));
  }
}
