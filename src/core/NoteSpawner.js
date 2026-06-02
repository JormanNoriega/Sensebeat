/**
 * NoteSpawner.js - Manages note spawning based on chart data
 * Spawns notes at correct times synchronized with music
 */

class NoteSpawner {
  constructor(chart, lanes, onNoteSpawn) {
    this.chart = chart;
    this.lanes = lanes;
    this.onNoteSpawn = onNoteSpawn;

    this.currentNoteIndex = 0;
    this.lastSpawnTime = 0;
    this.offsetMs = chart.offsetMs;
    this.offsetSeconds = this.offsetMs / 1000;
    this.lastSpawnedTime = -999;
  }

  reset() {
    this.currentNoteIndex = 0;
    this.lastSpawnTime = 0;
    this.lastSpawnedTime = -999;
    this.offsetSeconds = this.offsetMs / 1000;
  }

  update(currentMusicTime) {
    if (!this.chart || !this.chart.notes || this.chart.notes.length === 0) {
      return;
    }

    const safeTime = Math.max(0, currentMusicTime);

    while (this.currentNoteIndex < this.chart.notes.length) {
      const noteData = this.chart.notes[this.currentNoteIndex];
      const noteTime = noteData.time;

      if (safeTime >= noteTime - 2.0 && noteTime > this.lastSpawnedTime) {
        this.spawnNote(noteData);
        this.lastSpawnedTime = noteTime;
        this.currentNoteIndex++;
      } else if (noteTime > safeTime + 2.0) {
        break;
      } else {
        this.currentNoteIndex++;
      }
    }
  }

  spawnNote(noteData) {
    const laneIndex = noteData.lane;

    if (laneIndex < 0 || laneIndex >= this.lanes.length) {
      return;
    }

    const lane = this.lanes[laneIndex];

    const note = new Note(
      laneIndex,
      noteData.time,
      lane
    );

    if (this.onNoteSpawn) {
      this.onNoteSpawn(note);
    }
  }

  getCurrentNoteIndex() {
    return this.currentNoteIndex;
  }

  getProgress() {
    if (!this.chart || this.chart.totalNotes === 0) return 0;
    return (this.currentNoteIndex / this.chart.totalNotes) * 100;
  }
}