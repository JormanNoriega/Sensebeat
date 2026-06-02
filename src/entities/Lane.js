/**
 * Lane.js - Represents a game lane
 * Handles lane rendering and hit detection
 */

class Lane {
  constructor(index, x, width, height, name, keyGuide) {
    this.index = index;
    this.x = x;
    this.width = width;
    this.height = height;
    this.name = name;
    this.keyGuide = keyGuide;

    // Hit line position (85% down the screen)
    this.hitLineY = height * 0.85;
    this.hitWindow = 120;

    // Visual
    this.color = this.getLaneColor();
    this.isActive = false;
    this.activeTime = 0;
    this.brightness = 0;
    this.activeAnimationDuration = 0.25; // seconds (250ms)

    // Hit visual feedback
    this.lastHitAccuracy = null;
    this.lastHitTime = 0;
    this.feedbackDuration = 500;
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
    return colors[this.index];
  }

  /**
   * Update lane state
   */
  update(deltaTime) {
    if (this.isActive) {
      this.activeTime += deltaTime;
      if (this.activeTime > this.activeAnimationDuration) {
        this.isActive = false;
        this.activeTime = 0;
        this.brightness = 0;
      } else {
        const progress = this.activeTime / this.activeAnimationDuration;
        this.brightness = 0.7 * Math.pow(1 - progress, 2);
      }
    } else {
      this.brightness = 0;
    }

    const now = performance.now();
    if (now - this.lastHitTime > this.feedbackDuration) {
      this.lastHitAccuracy = null;
    }
  }

  /**
   * Deactivate lane immediately
   */
  deactivate() {
    this.isActive = false;
    this.activeTime = 0;
    this.brightness = 0;
  }

  /**
   * Activate lane (visual feedback for key press)
   */
  activate() {
    this.isActive = true;
    this.activeTime = 0;
    this.brightness = 0.7;
  }

  /**
   * Check for hit
   * @param {Note} note - Note to check
   * @param {number} currentTime - Current music time
   */
  checkHit(note, currentTime) {
    if (!note || note.isHit) return null;

    // Check if note is in hit window
    const noteCenter = note.y + note.height / 2;
    const distance = Math.abs(noteCenter - this.hitLineY);

    if (distance <= this.hitWindow) {
      // Calculate accuracy
      const accuracy = note.getAccuracy(currentTime);
      note.markAsHit();

      this.lastHitAccuracy = accuracy;
      this.lastHitTime = performance.now();

      return {
        note: note,
        accuracy: accuracy,
        distance: distance
      };
    }

    return null;
  }

  /**
   * Render lane
   */
  render(ctx) {
    ctx.save();

    const baseBrightness = 0.1;
    const finalBrightness = baseBrightness + this.brightness;
    ctx.fillStyle = `rgba(${this.hexToRgb(this.color)}, ${finalBrightness})`;
    ctx.fillRect(this.x, 0, this.width, this.height);

    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 1;
    ctx.strokeRect(this.x, 0, this.width, this.height);

    ctx.strokeStyle = this.color;
    ctx.lineWidth = 5;
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.moveTo(this.x, this.hitLineY);
    ctx.lineTo(this.x + this.width, this.hitLineY);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.6;
    ctx.strokeRect(this.x, this.hitLineY - this.hitWindow, this.width, this.hitWindow * 2);

    this.renderKeyGuide(ctx);

    if (this.lastHitAccuracy) {
      this.renderHitFeedback(ctx);
    }

    ctx.restore();
  }

  /**
   * Render key guide
   */
  renderKeyGuide(ctx) {
    ctx.save();

    ctx.shadowColor = this.color;
    ctx.shadowBlur = 15;

    ctx.fillStyle = this.color;
    ctx.globalAlpha = 0.8;
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillText(
      this.keyGuide,
      this.x + this.width / 2,
      60
    );

    ctx.restore();
  }

  /**
   * Render hit feedback
   */
  renderHitFeedback(ctx) {
    const elapsed = performance.now() - this.lastHitTime;
    const progress = elapsed / this.feedbackDuration;

    if (progress > 1) return;

    ctx.save();

    let feedbackColor, feedbackText;
    switch (this.lastHitAccuracy) {
      case 'PERFECT':
        feedbackColor = '#FFD700';
        feedbackText = 'PERFECT';
        break;
      case 'GOOD':
        feedbackColor = '#00FF00';
        feedbackText = 'GOOD';
        break;
      case 'MISS':
        feedbackColor = '#FF0000';
        feedbackText = 'MISS';
        break;
    }

    const alpha = 1 - progress;
    const scale = 1 + progress * 0.5;

    ctx.shadowColor = feedbackColor;
    ctx.shadowBlur = 30;

    ctx.globalAlpha = alpha;
    ctx.fillStyle = feedbackColor;
    ctx.font = `bold ${36 * scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const y = this.hitLineY - 80 - (progress * 60);

    ctx.fillText(feedbackText, this.x + this.width / 2, y);

    ctx.restore();
  }

  /**
   * Convert hex color to RGB
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
    }
    return '0, 0, 0';
  }

  /**
   * Get hit line position
   */
  getHitLineY() {
    return this.hitLineY;
  }

  /**
   * Get hit window
   */
  getHitWindow() {
    return this.hitWindow;
  }

  /**
   * Check if point is in lane
   */
  containsPoint(x, y) {
    return x >= this.x && x < this.x + this.width &&
           y >= 0 && y < this.height;
  }
}
