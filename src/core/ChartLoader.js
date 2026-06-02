/**
 * ChartLoader.js - Manages loading and parsing chart data
 * Handles song discovery, chart parsing, and metadata loading
 */

class ChartLoader {
  constructor() {
    this.songs = [];
    this.chartCache = new Map();
    this.songMetadataCache = new Map();
  }

  /**
   * Load all available songs from assets folder
   */
  async loadAllSongs() {
    try {
      // For browser, we need to know the songs in advance
      // In a real app, you'd use a backend API or service worker
      // For now, we'll use predefined songs that must exist in assets/audio/

      const songFolders = [
        { id: 'song1', name: 'Song 1' },
        { id: 'song2', name: 'Song 2' },
        { id: 'song3', name: 'Song 3' }
      ];

      this.songs = [];

      for (const folder of songFolders) {
        try {
          const song = await this.loadSongMetadata(folder.id, folder.name);
          if (song) {
            this.songs.push(song);
          }
        } catch (error) {
          console.warn(`Failed to load song ${folder.id}:`, error);
        }
      }

      console.log(`✅ Loaded ${this.songs.length} songs`);
      return this.songs;
    } catch (error) {
      console.error('Failed to load songs:', error);
      return [];
    }
  }

  /**
   * Load song metadata
   */
  async loadSongMetadata(songId, songName) {
    try {
      const basePath = `assets/audio/${songId}`;
      const chartPath = `${basePath}/chart.json`;
      const audioPath = `${basePath}/song.mp3`;
      const coverPath = `${basePath}/cover.png`;

      // Try to fetch chart to verify it exists
      try {
        const chartResponse = await fetch(chartPath);
        if (!chartResponse.ok) {
          console.warn(`Chart not found: ${chartPath} (Status: ${chartResponse.status})`);
          return null;
        }

        // Try to parse to ensure it's valid JSON
        const chartData = await chartResponse.json();
        console.log(`✅ Found chart: ${chartPath}`);

      } catch (e) {
        console.warn(`Failed to load chart from ${chartPath}:`, e.message);
        return null;
      }

      // Check if audio file exists (non-blocking)
      try {
        const audioResponse = await fetch(audioPath, { method: 'HEAD' });
        if (!audioResponse.ok) {
          console.warn(`Audio file may not exist: ${audioPath}`);
        }
      } catch (e) {
        console.warn(`Could not verify audio file: ${audioPath}`);
      }

      const song = {
        id: songId,
        name: songName,
        basePath: basePath,
        chartPath: chartPath,
        audioPath: audioPath,
        coverPath: coverPath,
        difficulty: 'Normal'
      };

      this.songMetadataCache.set(songId, song);
      console.log(`✅ Loaded song metadata: ${songName}`);
      return song;

    } catch (error) {
      console.warn(`Failed to load song metadata for ${songId}:`, error);
      return null;
    }
  }

  /**
   * Load chart from JSON file
   */
  async loadChart(chartPath) {
    try {
      // Check cache
      if (this.chartCache.has(chartPath)) {
        return this.chartCache.get(chartPath);
      }

      const response = await fetch(chartPath);
      if (!response.ok) {
        throw new Error(`Failed to fetch chart: ${response.statusText}`);
      }

      const chartData = await response.json();

      // Validate chart format
      this.validateChart(chartData);

      // Parse chart
      const chart = this.parseChart(chartData);

      // Cache it
      this.chartCache.set(chartPath, chart);

      console.log(`📊 Loaded chart: ${chartPath} (${chart.totalNotes} notes)`);

      return chart;
    } catch (error) {
      console.error(`Failed to load chart from ${chartPath}:`, error);
      throw error;
    }
  }

  /**
   * Validate chart format
   */
  validateChart(chartData) {
    const required = ['bpm', 'timeFormat', 'offsetMs', 'notes'];

    for (const field of required) {
      if (!(field in chartData)) {
        throw new Error(`Missing required field in chart: ${field}`);
      }
    }

    if (!Array.isArray(chartData.notes)) {
      throw new Error('Chart notes must be an array');
    }

    for (const note of chartData.notes) {
      if (!('time' in note) || !('lane' in note)) {
        throw new Error('Each note must have time and lane properties');
      }

      if (note.lane < 0 || note.lane > 3) {
        throw new Error(`Invalid lane: ${note.lane}. Must be 0-3`);
      }
    }
  }

  /**
   * Parse chart data into game format
   */
  parseChart(chartData) {
    return {
      bpm: chartData.bpm,
      timeFormat: chartData.timeFormat || 's',
      offsetMs: chartData.offsetMs || 0,
      totalNotes: chartData.notes.length,
      notes: chartData.notes.map(note => ({
        time: this.convertTimeToSeconds(note.time, chartData.timeFormat),
        lane: note.lane,
        originalTime: note.time
      }))
    };
  }

  /**
   * Convert time to seconds based on format
   */
  convertTimeToSeconds(time, format) {
    switch (format) {
      case 's':
        return time;
      case 'ms':
        return time / 1000;
      case 'beats':
        // Would need BPM to convert
        return time;
      default:
        return time;
    }
  }

  /**
   * Get all loaded songs
   */
  getSongs() {
    return this.songs;
  }

  /**
   * Get song by ID
   */
  getSongById(songId) {
    return this.songs.find(song => song.id === songId);
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.chartCache.clear();
    this.songMetadataCache.clear();
  }
}
