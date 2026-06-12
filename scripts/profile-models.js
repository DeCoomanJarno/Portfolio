#!/usr/bin/env node

/**
 * Model Performance Profiler
 * 
 * Usage:
 *   npm run profile-models
 * 
 * Profiles model loading performance:
 * - File size
 * - Network load time (simulated)
 * - Parse time
 * - VRAM consumption estimate
 * - FPS impact
 */

const fs = require('fs');
const path = require('path');

const MODELS_DIR = path.join(__dirname, '../src/assets/models');

class ModelProfiler {
  constructor() {
    this.profiles = [];
    this.networkSpeeds = {
      'slow-4g': 400,      // kb/s
      '4g': 1600,          // kb/s
      '3g': 400,           // kb/s
      'wifi': 5000         // kb/s
    };
  }

  /**
   * Find all model files
   */
  findModelFiles() {
    const models = [];

    const findFiles = (dir) => {
      try {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            findFiles(fullPath);
          } else if (file.endsWith('.gltf') || file.endsWith('.glb')) {
            models.push({
              name: file,
              path: fullPath,
              dir: dir,
              ext: path.extname(file),
              size: stat.size,
              relPath: path.relative(MODELS_DIR, fullPath)
            });
          }
        });
      } catch (error) {
        console.error(`Error reading directory ${dir}:`, error.message);
      }
    };

    if (fs.existsSync(MODELS_DIR)) {
      findFiles(MODELS_DIR);
    }

    return models;
  }

  /**
   * Profile a single model
   */
  profileModel(model) {
    const profile = {
      model: model.relPath,
      fileSize: model.size,
      fileSizeString: this.formatBytes(model.size),
      loadTimes: {},
      estimates: {}
    };

    // Calculate load times for different network speeds
    Object.entries(this.networkSpeeds).forEach(([network, speedKbps]) => {
      const speedBytesPerSec = (speedKbps * 1024) / 8;
      const loadTimeSeconds = model.size / speedBytesPerSec;
      profile.loadTimes[network] = {
        seconds: loadTimeSeconds.toFixed(3),
        ms: (loadTimeSeconds * 1000).toFixed(0)
      };
    });

    // Estimate VRAM
    profile.estimates.estimatedVRAM = this.estimateVRAM(model.size);
    profile.estimates.estimatedParseTime = this.estimateParseTime(model.size);
    profile.estimates.estimatedFPSImpact = this.estimateFPSImpact(model.size);

    this.profiles.push(profile);
    this.printProfile(profile);

    return profile;
  }

  /**
   * Estimate VRAM based on file size
   * Rule: Uncompressed model in VRAM is typically 4-10x file size
   */
  estimateVRAM(fileSize) {
    const uncompressedEstimate = fileSize * 6; // Conservative 6x
    return {
      mb: (uncompressedEstimate / (1024 * 1024)).toFixed(2),
      estimate: 'With GPU buffer allocation'
    };
  }

  /**
   * Estimate parse/decode time
   * Rule: ~10-50MB per second on modern hardware
   */
  estimateParseTime(fileSize) {
    const parseSpeedMbps = 25; // Average: 25MB/sec
    const bytes = fileSize / (1024 * 1024);
    const timeMs = (bytes / parseSpeedMbps) * 1000;
    return {
      ms: timeMs.toFixed(0),
      estimate: 'On desktop hardware'
    };
  }

  /**
   * Estimate FPS impact during load
   */
  estimateFPSImpact(fileSize) {
    let fpsImpact = 60; // Assume 60 FPS baseline

    if (fileSize > 10 * 1024 * 1024) {
      fpsImpact = 30; // Large files cause significant impact
    } else if (fileSize > 5 * 1024 * 1024) {
      fpsImpact = 40;
    } else if (fileSize > 2 * 1024 * 1024) {
      fpsImpact = 50;
    }

    return {
      estimatedMinFPS: fpsImpact,
      recommendation: fpsImpact < 45 ? '⚠️  May cause stuttering' : '✅ Acceptable'
    };
  }

  /**
   * Print profile
   */
  printProfile(profile) {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║  🔍 PROFILE: ${profile.model.padEnd(52)} ║
╚════════════════════════════════════════════════════════════╝

📦 File Size: ${profile.fileSizeString}

📡 Network Load Times:
   • Slow 4G (400 kb/s):  ${profile.loadTimes['slow-4g'].ms}ms (${profile.loadTimes['slow-4g'].seconds}s)
   • 4G (1600 kb/s):      ${profile.loadTimes['4g'].ms}ms (${profile.loadTimes['4g'].seconds}s)
   • 3G (400 kb/s):       ${profile.loadTimes['3g'].ms}ms (${profile.loadTimes['3g'].seconds}s)
   • WiFi (5000 kb/s):    ${profile.loadTimes['wifi'].ms}ms (${profile.loadTimes['wifi'].seconds}s)

💾 Memory Estimate:
   • VRAM Usage:          ~${profile.estimates.estimatedVRAM.mb}MB ${profile.estimates.estimatedVRAM.estimate}
   • Parse Time:          ${profile.estimates.estimatedParseTime.ms}ms ${profile.estimates.estimatedParseTime.estimate}

⚡ Performance Impact:
   • Estimated Min FPS:   ${profile.estimates.estimatedFPSImpact.estimatedMinFPS}
   • Status:              ${profile.estimates.estimatedFPSImpact.recommendation}
    `);
  }

  /**
   * Generate summary
   */
  generateSummary() {
    if (this.profiles.length === 0) {
      console.log('\n⚠️  No models found to profile.');
      return;
    }

    let totalSize = 0;
    let largestSize = 0;
    let largestModel = '';

    this.profiles.forEach(p => {
      totalSize += p.fileSize;
      if (p.fileSize > largestSize) {
        largestSize = p.fileSize;
        largestModel = p.model;
      }
    });

    console.log(`
╔═══════════════════════════════════════════════════════════╗
║           📊 PROFILE SUMMARY                              ║
╚═══════════════════════════════════════════════════════════╝

📁 Models Profiled: ${this.profiles.length}

📈 Size Analysis:
   • Total Size:       ${this.formatBytes(totalSize)}
   • Average Size:     ${this.formatBytes(Math.round(totalSize / this.profiles.length))}
   • Largest Model:    ${largestModel} (${this.formatBytes(largestSize)})

🎯 Load Time Ranges (4G network):
   • Fastest:          ${this.profiles.reduce((min, p) => Math.min(min, parseInt(p.loadTimes['4g'].ms)), Infinity)}ms
   • Slowest:          ${this.profiles.reduce((max, p) => Math.max(max, parseInt(p.loadTimes['4g'].ms)), 0)}ms
   • Average:          ${Math.round(this.profiles.reduce((sum, p) => sum + parseInt(p.loadTimes['4g'].ms), 0) / this.profiles.length)}ms

⚠️  OPTIMIZATION TARGETS:
   • Model >5MB:       Should reduce to <2MB
   • Load time >3s:    Should reduce to <1.5s on 4G
   • VRAM >100MB:      Should reduce to <30MB

📚 Recommended Priority:
${this.profiles
  .sort((a, b) => b.fileSize - a.fileSize)
  .slice(0, 3)
  .map((p, i) => `   ${i + 1}. ${p.model} (${this.formatBytes(p.fileSize)} - LARGEST)`)
  .join('\n')}
    `);

    // Save profiles to file
    const reportPath = path.join(__dirname, '../MODEL_PROFILES.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.profiles, null, 2));
    console.log(`\n📄 Detailed profiles saved to: MODEL_PROFILES.json`);
  }

  /**
   * Format bytes
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Run profiler
   */
  run() {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║         🔍 MODEL PERFORMANCE PROFILER STARTED            ║
║      Target Directory: ${MODELS_DIR.padEnd(42)} ║
╚═══════════════════════════════════════════════════════════╝
    `);

    const models = this.findModelFiles();
    console.log(`\n✅ Found ${models.length} model(s) to profile\n`);

    models.forEach(model => this.profileModel(model));
    this.generateSummary();

    console.log(`
╔═══════════════════════════════════════════════════════════╗
║              ✅ PROFILING COMPLETE                       ║
╚═══════════════════════════════════════════════════════════╝
    `);
  }
}

// Run the profiler
const profiler = new ModelProfiler();
profiler.run();
