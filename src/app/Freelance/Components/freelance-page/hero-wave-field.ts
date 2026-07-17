// hero-wave-field.ts
// Lazily-instantiated Three.js particle wave field rendered behind the hero.
// `three` is dynamically imported so it ships as a separate lazy chunk and
// never blocks first paint. All state is fully disposed via destroy().

import type {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  ShaderMaterial,
  BufferGeometry,
  Points,
  Timer,
  Color,
  IUniform,
} from 'three';

type ThreeModule = typeof import('three');

export interface WavePalette {
  /** Base color for low points (css color string). */
  colorA: string;
  /** Highlight color for wave crests (css color string). */
  colorB: string;
  /** Global particle opacity (0..1). */
  opacity: number;
  /** Additive blending pops on dark backgrounds, washes out on light ones. */
  additive: boolean;
}

interface WaveUniforms {
  uTime: IUniform<number>;
  uAmp: IUniform<number>;
  uSize: IUniform<number>;
  uPixelRatio: IUniform<number>;
  uOpacity: IUniform<number>;
  uColorA: IUniform<Color>;
  uColorB: IUniform<Color>;
  [uniform: string]: IUniform;
}

const GRID_COLS = 100;
const GRID_ROWS = 60;
const SPACING_X = 0.46;
const SPACING_Z = 0.5;
const CAMERA_BASE_Y = 9.2;
const TIME_SCALE = 0.55;

const VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uAmp;
  uniform float uSize;
  uniform float uPixelRatio;
  attribute float aRand;
  varying float vElev;
  varying float vDist;
  varying float vX;
  varying float vRand;

  float wave(vec2 p, float t) {
    float w = 0.0;
    w += sin(p.x * 0.24 + t * 0.60) * 0.50;
    w += sin(p.y * 0.20 - t * 0.45) * 0.55;
    w += sin((p.x + p.y) * 0.14 + t * 0.35) * 0.60;
    w += sin(length(p * 0.30) - t * 0.85) * 0.35;
    return w;
  }

  void main() {
    vec3 pos = position;
    float w = wave(pos.xz, uTime);
    pos.y += w * uAmp;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vElev = w;
    vDist = -mv.z;
    vX = pos.x;
    vRand = aRand;

    gl_PointSize = uSize * (uPixelRatio / max(vDist, 0.001));
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vElev;
  varying float vDist;
  varying float vX;
  varying float vRand;

  void main() {
    // Soft round sprite.
    float d = length(gl_PointCoord - 0.5);
    float disc = smoothstep(0.5, 0.1, d);

    // Crests glow in the highlight color.
    vec3 col = mix(uColorA, uColorB, smoothstep(-1.2, 1.6, vElev));
    col *= 0.78 + 0.34 * smoothstep(0.0, 1.6, vElev);

    // Gentle per-particle shimmer.
    float tw = 0.82 + 0.18 * sin(uTime * 2.0 + vRand * 6.28318);

    // Fade with distance, near-plane and lateral edges.
    float fade = smoothstep(52.0, 16.0, vDist)
               * smoothstep(3.5, 7.5, vDist)
               * smoothstep(46.0, 28.0, abs(vX));

    float alpha = disc * tw * fade * uOpacity;
    if (alpha < 0.003) discard;
    gl_FragColor = vec4(col, alpha);
  }
`;

export class HeroWaveField {
  private readonly renderer: WebGLRenderer;
  private readonly scene: Scene;
  private readonly camera: PerspectiveCamera;
  private readonly material: ShaderMaterial;
  private readonly geometry: BufferGeometry;
  private readonly points: Points;
  private readonly timer: Timer;
  private readonly uniforms: WaveUniforms;
  private readonly resizeObserver: ResizeObserver;
  private readonly onContextLost: (event: Event) => void;

  private rafId = 0;
  private running = false;
  private disposed = false;
  private elapsed = 0;
  private lastFrameTime = 0;
  private pointerTarget = { x: 0, y: 0 };
  private pointerCurrent = { x: 0, y: 0 };
  
  private static readonly FRAME_INTERVAL = 1000 / 30;

  static async create(canvas: HTMLCanvasElement, palette: WavePalette): Promise<HeroWaveField | null> {
    try {
      const THREE = await import('three');
      const field = new HeroWaveField(THREE, canvas, palette);
      field.setRunning(true);
      return field;
    } catch {
      // WebGL unavailable or chunk failed to load — CSS backdrop remains.
      return null;
    }
  }

  private constructor(
    private readonly THREE: ThreeModule,
    private readonly canvas: HTMLCanvasElement,
    palette: WavePalette,
  ) {
    const width = canvas.clientWidth || 1;
    const height = canvas.clientHeight || 1;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'low-power',
    });
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(width, height, false);
    this.renderer.setClearColor(0x000000, 0);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 120);
    this.camera.position.set(0, CAMERA_BASE_Y, 9);

    this.uniforms = {
      uTime: { value: 0 },
      uAmp: { value: 1.5 },
      uSize: { value: 70 },
      uPixelRatio: { value: pixelRatio },
      uOpacity: { value: palette.opacity },
      uColorA: { value: new THREE.Color(palette.colorA) },
      uColorB: { value: new THREE.Color(palette.colorB) },
    };

    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: palette.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    });

    this.geometry = this.buildGeometry();
    this.points = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.points);

    this.timer = new THREE.Timer();

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(canvas);

    this.onContextLost = (event: Event) => {
      event.preventDefault();
      this.setRunning(false);
    };
    canvas.addEventListener('webglcontextlost', this.onContextLost, false);

    this.timer.update(performance.now());
    // First frame before the fade-in class so there is no flash.
    this.renderFrame(0);
    canvas.classList.add('is-live');
  }

  /** Pointer position normalised to -1..1 on both axes. */
  setPointer(nx: number, ny: number): void {
    this.pointerTarget.x = nx;
    this.pointerTarget.y = ny;
  }

  setTheme(palette: WavePalette): void {
    if (this.disposed) return;
    this.uniforms.uColorA.value.set(palette.colorA);
    this.uniforms.uColorB.value.set(palette.colorB);
    this.uniforms.uOpacity.value = palette.opacity;
    this.material.blending = palette.additive
      ? this.THREE.AdditiveBlending
      : this.THREE.NormalBlending;
    this.material.needsUpdate = true;
    if (!this.running) this.renderFrame(0);
  }

  setRunning(run: boolean): void {
    if (this.disposed || run === this.running) return;
    this.running = run;
    if (run) {
      // Prime the timer so the first delta after resume is not huge.
      this.timer.update(performance.now());
      this.rafId = requestAnimationFrame(this.loop);
    } else {
      cancelAnimationFrame(this.rafId);
    }
  }

  destroy(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.setRunning(false);
    this.resizeObserver.disconnect();
    this.canvas.removeEventListener('webglcontextlost', this.onContextLost, false);
    this.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
  }

  private buildGeometry(): BufferGeometry {
    const count = GRID_COLS * GRID_ROWS;
    const positions = new Float32Array(count * 3);
    const rands = new Float32Array(count);

    const halfWidth = ((GRID_COLS - 1) * SPACING_X) / 2;
    let i = 0;
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        // Slight jitter breaks up moiré patterns.
        positions[i * 3] = col * SPACING_X - halfWidth + (Math.random() - 0.5) * 0.12;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = -4 - row * SPACING_Z + (Math.random() - 0.5) * 0.12;
        rands[i] = Math.random();
        i++;
      }
    }

    const geometry = new this.THREE.BufferGeometry();
    geometry.setAttribute('position', new this.THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aRand', new this.THREE.BufferAttribute(rands, 1));
    return geometry;
  }

  private handleResize(): void {
    if (this.disposed) return;
    const width = this.canvas.clientWidth || 1;
    const height = this.canvas.clientHeight || 1;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  private loop = (timestamp: DOMHighResTimeStamp): void => {
    if (!this.running || this.disposed) return;
    this.rafId = requestAnimationFrame(this.loop);
    // Throttle to ~60fps — decorative background, but choppy at 30.
    if (timestamp - this.lastFrameTime < HeroWaveField.FRAME_INTERVAL) return;
    this.lastFrameTime = timestamp;
    this.timer.update(timestamp);
    // Cap delta to avoid a large animation jump after a tab/visibility pause.
    const delta = Math.min(this.timer.getDelta(), 0.067);
    this.renderFrame(delta);
  };

  private renderFrame(delta: number): void {
    this.elapsed += delta * TIME_SCALE;
    this.uniforms.uTime.value = this.elapsed;

    // Ease camera toward the pointer, plus a slow autonomous sway.
    this.pointerCurrent.x += (this.pointerTarget.x - this.pointerCurrent.x) * 0.045;
    this.pointerCurrent.y += (this.pointerTarget.y - this.pointerCurrent.y) * 0.045;
    const sway = Math.sin(this.elapsed * 0.25) * 0.35;
    this.camera.position.x = this.pointerCurrent.x * 2.2 + sway;
    this.camera.position.y = CAMERA_BASE_Y - this.pointerCurrent.y * 1.1;
    this.camera.lookAt(0, -0.6, -20);

    this.renderer.render(this.scene, this.camera);
  }
}
