/**
 * Note.js - Represents a single note in the game
 * Handles note rendering and state
 */

class Note {
  constructor(lane, spawnTime, laneObject) {
    this.lane = lane;
    this.spawnTime = spawnTime;
    this.laneObject = laneObject;

    // Position and size
    this.x = laneObject.x;
    this.width = laneObject.width;
    this.height = 80;
    this.y = 0;

    // Speed (pixels per second)
    // Note travels from top of screen to hit line
    this.speed = 600; // Adjustable for difficulty

    // State
    this.isHit = false;
    this.isMissed = false;
    this.creationTime = performance.now() / 1000;

    // Visual
    this.color = this.getLaneColor();
    this.glowIntensity = 0;
  }

  /**
   * Get color for lane
   */
  getLaneColor() {
    const colors = [
      '#FF0080', // Left - Magenta
      '#00FFFF', // Down - Cyan
      '#FFFF00', // Up - Yellow
      '#00FF00'  // Right - Green
    ];
    return colors[this.lane];
  }

  /**
   * Update note position
   * @param {number} deltaTime - Time since last frame (seconds)
   * @param {number} musicTime - Current music playback time (seconds)
   */
  update(deltaTime, musicTime = 0) {
    if (this.isHit || this.isMissed) return;

    const hitLineY = window.innerHeight * 0.85;
    const travelDistance = hitLineY + 100;
    const travelTime = 2.0;

    const timeUntilHit = this.spawnTime - musicTime;

    if (timeUntilHit < -0.5) {
      this.isMissed = true;
      return;
    }

    const progress = Math.max(0, Math.min(1, 1.0 - (timeUntilHit / travelTime)));

    this.y = -this.height + (progress * travelDistance);

    this.glowIntensity = Math.sin(performance.now() / 100) * 0.5 + 0.5;
  }

  /**
   * Check if note is missed
   */
  checkMissed() {
    return this.isMissed;
  }

  /**
   * Render note
   */
  render(ctx) {
    if (this.isHit || this.isMissed) return;

    ctx.save();

    ctx.shadowColor = this.color;
    ctx.shadowBlur = 30 + this.glowIntensity * 30;

    ctx.fillStyle = this.color;
    ctx.globalAlpha = 1;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.3)');
    ctx.fillStyle = gradient;
    ctx.globalAlpha = 0.6 + this.glowIntensity * 0.4;
    ctx.fillRect(this.x + 4, this.y + 4, this.width - 8, this.height - 8);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 3;
    ctx.strokeRect(this.x + 1, this.y + 1, this.width - 2, this.height - 2);

    ctx.restore();
  }

  /**
   * Mark note as hit
   */
  markAsHit() {
    this.isHit = true;
  }

  /**
   * Get accuracy based on timing
   * @param {number} currentTime - Current music time in seconds
   */
  getAccuracy(currentTime) {
    const timeDifference = Math.abs(currentTime - this.spawnTime);

    const perfectWindow = 0.08;
    const goodWindow = 0.2;

    if (timeDifference <= perfectWindow) {
      return 'PERFECT';
    } else if (timeDifference <= goodWindow) {
      return 'GOOD';
    } else {
      return 'MISS';
    }
  }

  /**
   * Get note position on screen
   */
  getScreenPosition() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }

  /**
   * Check if note is visible on screen
   */
  isVisible() {
    return this.y < window.innerHeight;
  }
}
