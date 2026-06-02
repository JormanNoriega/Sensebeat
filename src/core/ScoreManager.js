/**
 * ScoreManager.js - Manages scoring, combo, and health
 * Tracks performance metrics throughout gameplay
 */

class ScoreManager {
  constructor() {
    // Score tracking
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;

    // Hit statistics
    this.perfectHits = 0;
    this.goodHits = 0;
    this.misses = 0;
    this.totalNotes = 0;

    // Health system
    this.health = 100;
    this.maxHealth = 100;

    // Scoring multipliers
    this.scoreMultipliers = {
      'PERFECT': 1.0,
      'GOOD': 0.6,
      'MISS': 0
    };

    // Base points per note
    this.basePoints = {
      'PERFECT': 100,
      'GOOD': 50,
      'MISS': 0
    };

    // Health changes
    this.healthChanges = {
      'PERFECT': 3,
      'GOOD': 1,
      'MISS': -5
    };
  }

  /**
   * Reset score manager
   */
  reset() {
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.perfectHits = 0;
    this.goodHits = 0;
    this.misses = 0;
    this.totalNotes = 0;
    this.health = this.maxHealth;
  }

  /**
   * Add a hit
   * @param {string} accuracy - 'PERFECT', 'GOOD', or 'MISS'
   */
  addHit(accuracy) {
    accuracy = accuracy.toUpperCase();

    // Update statistics
    if (accuracy === 'PERFECT') {
      this.perfectHits++;
    } else if (accuracy === 'GOOD') {
      this.goodHits++;
    }

    this.totalNotes++;

    // Update score
    const points = this.basePoints[accuracy] || 0;
    const multiplier = Math.floor(this.combo / 10) + 1; // Every 10 combo adds 1x multiplier
    this.score += Math.floor(points * multiplier);

    // Update combo
    if (accuracy !== 'MISS') {
      this.combo++;
      this.maxCombo = Math.max(this.maxCombo, this.combo);
    } else {
      this.combo = 0;
    }

    // Update health
    const healthChange = this.healthChanges[accuracy] || 0;
    this.health = Math.max(0, Math.min(this.maxHealth, this.health + healthChange));

    console.debug(`Hit: ${accuracy} | Score: ${this.score} | Combo: ${this.combo} | Health: ${this.health}`);
  }

  /**
   * Add a miss
   */
  addMiss() {
    this.addHit('MISS');
  }

  /**
   * Get current score
   */
  getScore() {
    return this.score;
  }

  /**
   * Get current combo
   */
  getCombo() {
    return this.combo;
  }

  /**
   * Get max combo
   */
  getMaxCombo() {
    return this.maxCombo;
  }

  /**
   * Get health (0-100)
   */
  getHealth() {
    return this.health;
  }

  /**
   * Get accuracy percentage
   */
  getAccuracy() {
    if (this.totalNotes === 0) return 0;

    const perfectWeight = 100;
    const goodWeight = 50;
    const totalPossiblePoints = this.totalNotes * perfectWeight;
    const earnedPoints = (this.perfectHits * perfectWeight) + (this.goodHits * goodWeight);

    return Math.round((earnedPoints / totalPossiblePoints) * 100);
  }

  /**
   * Get rating based on accuracy
   */
  getRating() {
    const accuracy = this.getAccuracy();

    if (accuracy >= 95) return 'S';
    if (accuracy >= 85) return 'A';
    if (accuracy >= 75) return 'B';
    if (accuracy >= 60) return 'C';
    return 'F';
  }

  /**
   * Get final statistics
   */
  getFinalStats() {
    return {
      score: this.score,
      accuracy: this.getAccuracy(),
      rating: this.getRating(),
      maxCombo: this.maxCombo,
      perfectHits: this.perfectHits,
      goodHits: this.goodHits,
      misses: this.misses,
      totalNotes: this.totalNotes,
      finalHealth: this.health
    };
  }

  /**
   * Get hit breakdown
   */
  getHitBreakdown() {
    return {
      perfect: this.perfectHits,
      good: this.goodHits,
      miss: this.misses
    };
  }

  /**
   * Is game over (health <= 0)
   */
  isGameOver() {
    return this.health <= 0;
  }
}
