import { Injectable, Inject, Optional } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { XPDesktopAppRenderer, XPDesktopRenderer, XPScreenContent } from './xp-desktop/xp-desktop-renderer';
import { ModelOptimizerService } from './model-optimizer.service';

interface RetroSceneDelta {
  x?: number;
  y?: number;
  z?: number;
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
  zoom?: number;
}

interface RetroSceneState {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  modelRoot?: THREE.Object3D;
  baseModelPosition?: THREE.Vector3;
  baseModelRotation?: THREE.Euler;
  baseCameraPosition: THREE.Vector3;
  positionOffset: THREE.Vector3;
  rotationOffset: THREE.Vector3;
  zoomOffset: number;
  pointer: { x: number; y: number };
  enableAutoRotation: boolean;
  rotationSpeed: { x: number; y: number; z: number };
  resizeHandler?: () => void;
  screenMesh?: THREE.Mesh;
  screenMaterial?: THREE.MeshStandardMaterial;
  xpApps: XPDesktopApp[];
  xpOpenAppId: string | null;
  usesExternalXPScreen: boolean;
  lastExternalXPScreenPaintAt: number;
}

/** Represents an app icon on the XP desktop. Easy to extend — just push to the array. */
export interface XPDesktopApp {
  id: string;
  iconLabel: string;   // Short label shown under the icon
  title: string;       // Window title when opened
  renderContent: XPDesktopAppRenderer;
  action?: string;     // Optional action: 'scroll:sectionId' | 'modal:quote'
}

/**
 * Premium 3D Animation Service
 * Inspired by Lando Norris and Sergio Perez F1 driver websites
 * Features: 3D rotating objects, premium scroll effects, fluid transitions
 */

@Injectable({
  providedIn: 'root'
})
export class Premium3DAnimationService {
  private scenes: Map<string, THREE.Scene> = new Map();
  private renderers: Map<string, THREE.WebGLRenderer> = new Map();
  private animationFrames: Map<string, number> = new Map();
  private retroSceneStates: Map<string, RetroSceneState> = new Map();

  constructor(
    @Optional() @Inject(DOCUMENT) private document: Document,
    private modelOptimizer: ModelOptimizerService
  ) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /**
   * Create a 3D rotating cube/box scene
   * Perfect for hero sections or technology showcases
   */
  create3DRotatingBox(canvasId: string, options?: {
    size?: number;
    speed?: number;
    colors?: string[];
    depth?: number;
  }): void {
    const canvas = this.document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      
      return;
    }

    const {
      size = 100,
      speed = 0.005,
      colors = ['#00b7c2', '#2196F3', '#00E5FF', '#FF5722', '#9c27b0', '#4CAF50'],
      depth = 200
    } = options || {};

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    
    camera.position.z = depth;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    scene.background = null;

    // Create cube with individual materials for each face
    const geometry = new THREE.BoxGeometry(size, size, size);
    
    // Create 6 materials for 6 faces (ensure we have enough colors)
    const materials = [];
    for (let i = 0; i < 6; i++) {
      const colorIndex = i % colors.length;
      materials.push(
        new THREE.MeshPhongMaterial({ 
          color: colors[colorIndex], 
          emissive: colors[colorIndex],
          emissiveIntensity: 0.2,
          shininess: 100,
          wireframe: false,
          flatShading: false
        })
      );
    }
    
    const box = new THREE.Mesh(geometry, materials);
    scene.add(box);

    // Add multiple light sources for better visibility
    const light1 = new THREE.DirectionalLight(0xffffff, 1);
    light1.position.set(100, 100, 100);
    scene.add(light1);

    const light2 = new THREE.DirectionalLight(0x00b7c2, 0.6);
    light2.position.set(-100, -100, 50);
    scene.add(light2);

    const light3 = new THREE.DirectionalLight(0x9c27b0, 0.4);
    light3.position.set(50, -50, 100);
    scene.add(light3);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Store for later
    this.scenes.set(canvasId, scene);
    this.renderers.set(canvasId, renderer);

    // Animation loop
    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      this.animationFrames.set(canvasId, frameId);

      box.rotation.x += speed;
      box.rotation.y += speed * 1.3;
      box.rotation.z += speed * 0.7;

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
  }

  /**
   * Premium fade-in effect with staggered letters
   * Like premium agency websites
   */
  premiumTextReveal(selector: string, options?: {
    duration?: number;
    delay?: number;
    stagger?: number;
  }): void {
    const {
      duration = 0.8,
      delay = 0,
      stagger = 0.02
    } = options || {};

    const elements = this.document.querySelectorAll(selector);
    
    elements.forEach(el => {
      const text = el.textContent || '';
      el.innerHTML = text
        .split('')
        .map((char, i) => `<span style="opacity: 0; display: inline-block;">${char === ' ' ? '&nbsp;' : char}</span>`)
        .join('');

      const spans = el.querySelectorAll('span');
      gsap.to(spans, {
        opacity: 1,
        duration,
        stagger,
        delay,
        ease: 'power2.out'
      });
    });
  }

  /**
   * Magnetic hover effect - element follows cursor
   * Creates premium interactive feel
   */
  magneticHover(selector: string, strength: number = 0.3): void {
    const elements = this.document.querySelectorAll(selector);

    elements.forEach(el => {
      const element = el as HTMLElement;
      let mouseX = 0;
      let mouseY = 0;
      let elementX = 0;
      let elementY = 0;

      element.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        mouseX = (e.clientX - centerX) * strength;
        mouseY = (e.clientY - centerY) * strength;

        gsap.to(element, {
          x: mouseX,
          y: mouseY,
          duration: 0.3,
          overwrite: 'auto'
        });
      });

      element.addEventListener('mouseleave', () => {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.5)'
        });
      });
    });
  }

  /**
   * Smooth scroll-linked animation with parallax
   * Premium scrolling experience
   */
  scrollPinAnimation(triggerSelector: string, animateSelector: string, options?: {
    duration?: number;
    distance?: number;
  }): void {
    const {
      duration = 1,
      distance = 100
    } = options || {};

    const trigger = this.document.querySelector(triggerSelector) as HTMLElement;
    const target = this.document.querySelector(animateSelector) as HTMLElement;

    if (!trigger || !target) return;

    gsap.to(target, {
      scrollTrigger: {
        trigger,
        start: 'top center',
        end: 'bottom center',
        scrub: 1.2,
        markers: false
      },
      y: distance,
      opacity: 1,
      duration,
      ease: 'power1.inOut'
    });
  }

  /**
   * Fluid card hover animation
   * Premium 3D perspective effect
   */
  fluidCardHover(selector: string): void {
    const cards = this.document.querySelectorAll(selector);

    cards.forEach(card => {
      const element = card as HTMLElement;
      
      element.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = element.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((e.clientY - rect.top - centerY) / centerY) * 10;
        const rotateY = ((e.clientX - rect.left - centerX) / centerX) * 10;

        gsap.to(element, {
          rotationX: rotateX,
          rotationY: rotateY,
          transformPerspective: 1000,
          duration: 0.3
        });
      });

      element.addEventListener('mouseleave', () => {
        gsap.to(element, {
          rotationX: 0,
          rotationY: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.4)'
        });
      });
    });
  }

  /**
   * Gradient shift animation
   * Like premium F1 team websites
   */
  animateGradient(selector: string, colors: string[], duration: number = 6): void {
    const element = this.document.querySelector(selector) as HTMLElement;
    if (!element) return;

    let colorIndex = 0;

    setInterval(() => {
      colorIndex = (colorIndex + 1) % colors.length;
      const nextColor = colors[colorIndex];
      
      gsap.to(element, {
        backgroundPosition: '100% 50%',
        duration,
        ease: 'none'
      });
    }, duration * 1000);
  }

  /**
   * Number counter animation
   * Premium stat display (e.g., "500+ Projects")
   */
  countUpNumbers(selector: string, options?: {
    duration?: number;
  }): void {
    const {
      duration = 2
    } = options || {};

    const elements = this.document.querySelectorAll(selector);

    elements.forEach(el => {
      const element = el as HTMLElement;
      const finalValue = parseInt(element.textContent || '0', 10);
      
      gsap.to({ value: 0 }, {
        value: finalValue,
        duration,
        onUpdate: function(this: any) {
          element.textContent = Math.floor(this.value).toLocaleString();
        },
        ease: 'power2.out'
      });
    });
  }

  /**
   * Blur-in effect on scroll
   * Creates depth effect
   */
  blurInOnScroll(selector: string, options?: {
    blurAmount?: number;
    distance?: number;
  }): void {
    const {
      blurAmount = 10,
      distance = 100
    } = options || {};

    gsap.to(selector, {
      scrollTrigger: {
        trigger: selector,
        start: 'top 80%',
        end: 'top 20%',
        scrub: 0.5,
        markers: false
      },
      filter: `blur(0px)`,
      y: 0,
      opacity: 1,
      duration: 1,
      ease: 'power2.out'
    });

    // Initial state
    gsap.set(selector, {
      filter: `blur(${blurAmount}px)`,
      y: distance,
      opacity: 0
    });
  }

  /**
   * Glossy button effect on hover
   * Premium interactive element
   */
  glossyButtonHover(selector: string): void {
    const buttons = this.document.querySelectorAll(selector);

    buttons.forEach(btn => {
      const button = btn as HTMLElement;
      
      button.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        gsap.to(button, {
          '--shine-x': `${x}px`,
          '--shine-y': `${y}px`,
          duration: 0.3
        } as any);
      });

      button.addEventListener('mouseleave', () => {
        gsap.to(button, {
          '--shine-x': '50%',
          '--shine-y': '50%',
          duration: 0.3
        } as any);
      });
    });
  }

  /**
   * Cleanup - remove animations for a canvas
   */
  dispose(canvasId: string): void {
    const frameId = this.animationFrames.get(canvasId);
    if (frameId) cancelAnimationFrame(frameId);

    const retroSceneState = this.retroSceneStates.get(canvasId);
    if (retroSceneState?.resizeHandler) {
      window.removeEventListener('resize', retroSceneState.resizeHandler);
    }

    const renderer = this.renderers.get(canvasId);
    if (renderer) renderer.dispose();

    const scene = this.scenes.get(canvasId);
    if (scene) {
      scene.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    }

    this.scenes.delete(canvasId);
    this.renderers.delete(canvasId);
    this.animationFrames.delete(canvasId);
    this.retroSceneStates.delete(canvasId);
  }

  /**
   * Kill all active animations
   */
  killAll(): void {
    gsap.killTweensOf('*');
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }

  /**
   * Raycast a click onto the XP desktop rendered on the model screen.
   * Returns a hit-zone id or null:
   *   'icon-0' … 'icon-3'  — desktop shortcut icons
   *   'start'               — Start button
   *   'zoom-in'             — + zoom button on window title bar
   *   'zoom-out'            — − zoom button on window title bar
   *   'screen'              — hit the screen but no specific button
   */
  // ── XP Desktop App management ──────────────────────────────────────

  setXPApps(canvasId: string, apps: XPDesktopApp[]): void {
    const state = this.retroSceneStates.get(canvasId);
    if (state) state.xpApps = apps;
  }

  openXPApp(canvasId: string, appId: string): void {
    const state = this.retroSceneStates.get(canvasId);
    if (state) state.xpOpenAppId = appId;
  }

  closeXPApp(canvasId: string): void {
    const state = this.retroSceneStates.get(canvasId);
    if (state) state.xpOpenAppId = null;
  }

  setExternalXPScreenMode(canvasId: string, enabled: boolean): void {
    const state = this.retroSceneStates.get(canvasId);
    if (!state) return;

    state.usesExternalXPScreen = enabled;
    if (enabled) {
      state.lastExternalXPScreenPaintAt = Date.now();
    }
  }

  paintDomCanvasToXPScreen(canvasId: string, sourceCanvas: HTMLCanvasElement): boolean {
    const state = this.retroSceneStates.get(canvasId);
    if (!state || !state.screenMaterial) return false;

    const screenMaterial = state.screenMaterial;
    const canvas = (screenMaterial as any).screenCanvas as HTMLCanvasElement;
    const ctx = (screenMaterial as any).screenCtx as CanvasRenderingContext2D;
    const texture = (screenMaterial as any).screenTexture as THREE.CanvasTexture;
    if (!canvas || !ctx || !texture || sourceCanvas.width === 0 || sourceCanvas.height === 0) return false;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const originalTextureData = (screenMaterial as any).originalTextureData as ImageData;
    if (originalTextureData) {
      ctx.putImageData(originalTextureData, 0, 0);
    }

    const xMin = 111, xMax = 1989, yMin = 93, yMax = 2633;
    const screenWidth = xMax - xMin;
    const screenHeight = yMax - yMin;

    ctx.save();
    ctx.beginPath();
    ctx.rect(xMin, yMin, screenWidth, screenHeight);
    ctx.clip();

    // Apply the same transform used by XPDesktopRenderer so pixels map to the model UV correctly.
    ctx.translate(xMin, yMin);
    ctx.rotate(Math.PI / 2);
    ctx.translate(0, -screenWidth);
    ctx.scale(-1, 1);
    ctx.translate(-screenHeight, 0);

    const viewW = screenHeight;
    const viewH = screenWidth;
    ctx.drawImage(sourceCanvas, 0, 0, viewW, viewH);

    ctx.restore();

    texture.needsUpdate = true;
    screenMaterial.needsUpdate = true;
    state.usesExternalXPScreen = true;
    state.lastExternalXPScreenPaintAt = Date.now();
    return true;
  }

  /**
   * Raycast click → XP desktop hit zone.
   * Returns: 'app-{id}', 'app-close', 'start', 'screen', or null.
   *
   * The model material covers both the screen AND surrounding details.
   * A raycast can hit a detail face whose UV is outside the screen area.
   * We therefore check EVERY hit on this material and try multiple UV
   * mappings (raw, matrix-transformed, Y-flipped) until one lands inside
   * the screen region.
   */
  hitTestXPDesktop(canvasId: string, clientX: number, clientY: number): string | null {
    const state = this.retroSceneStates.get(canvasId);
    if (!state) return null;

    const screenMesh = state.screenMesh;
    const screenMat = state.screenMaterial;
    if (!screenMesh || !screenMat) return null;

    state.scene.updateMatrixWorld(true);

    const rect = state.renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, state.camera);

    const allHits = raycaster.intersectObjects(state.scene.children, true);

    // Collect every hit on meshes that share the screen material
    const screenHits = allHits.filter(h => {
      if (!h.uv) return false;
      if (h.object === screenMesh) return true;
      if (h.object instanceof THREE.Mesh) {
        const mats = Array.isArray(h.object.material) ? h.object.material : [h.object.material];
        return mats.some(m => (m as any).screenCanvas);
      }
      return false;
    });

    if (screenHits.length === 0) return null;

    // Screen region on the 4096×4096 canvas
    const xMin = 111, xMax = 1989, yMin = 93, yMax = 2633;

    // Build texture matrix once
    const tex = screenMat.map as THREE.CanvasTexture | null;
    let texMatrix: THREE.Matrix3 | null = null;
    if (tex) {
      tex.updateMatrix();
      texMatrix = tex.matrix;
    }

    // For each hit, try multiple UV→canvas mappings; first one inside the
    // screen region wins.
    for (const hit of screenHits) {
      const uv = hit.uv!;
      const attempts: [number, number][] = [
        [uv.x * 4096, uv.y * 4096],                           // raw
        [uv.x * 4096, (1 - uv.y) * 4096],                     // Y-flipped
      ];

      // matrix-transformed
      if (texMatrix) {
        const t = new THREE.Vector2(uv.x, uv.y).applyMatrix3(texMatrix);
        attempts.push([t.x * 4096, t.y * 4096]);
        attempts.push([t.x * 4096, (1 - t.y) * 4096]);
      }

      for (const [cx, cy] of attempts) {
        if (cx >= xMin && cx <= xMax && cy >= yMin && cy <= yMax) {
          return this.resolveScreenZone(cx, cy, state);
        }
      }
    }

    return null;
  }

  mapXPDesktopClickToDrawPoint(
    canvasId: string,
    clientX: number,
    clientY: number
  ): { x: number; y: number; viewW: number; viewH: number } | null {
    const state = this.retroSceneStates.get(canvasId);
    if (!state) return null;

    const screenMesh = state.screenMesh;
    const screenMat = state.screenMaterial;
    if (!screenMesh || !screenMat) return null;

    state.scene.updateMatrixWorld(true);

    const rect = state.renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, state.camera);

    const allHits = raycaster.intersectObjects(state.scene.children, true);
    const screenHits = allHits.filter(h => {
      if (!h.uv) return false;
      if (h.object === screenMesh) return true;
      if (h.object instanceof THREE.Mesh) {
        const mats = Array.isArray(h.object.material) ? h.object.material : [h.object.material];
        return mats.some(m => (m as any).screenCanvas);
      }
      return false;
    });

    if (screenHits.length === 0) return null;

    const xMin = 111, xMax = 1989, yMin = 93, yMax = 2633;
    const viewW = yMax - yMin;
    const viewH = xMax - xMin;

    const tex = screenMat.map as THREE.CanvasTexture | null;
    let texMatrix: THREE.Matrix3 | null = null;
    if (tex) {
      tex.updateMatrix();
      texMatrix = tex.matrix;
    }

    for (const hit of screenHits) {
      const uv = hit.uv!;
      const attempts: [number, number][] = [
        [uv.x * 4096, uv.y * 4096],
        [uv.x * 4096, (1 - uv.y) * 4096],
      ];

      if (texMatrix) {
        const t = new THREE.Vector2(uv.x, uv.y).applyMatrix3(texMatrix);
        attempts.push([t.x * 4096, t.y * 4096]);
        attempts.push([t.x * 4096, (1 - t.y) * 4096]);
      }

      for (const [cx, cy] of attempts) {
        if (cx >= xMin && cx <= xMax && cy >= yMin && cy <= yMax) {
          return {
            x: yMax - cy,
            y: xMax - cx,
            viewW,
            viewH
          };
        }
      }
    }

    return null;
  }

  /** Given a canvas pixel inside the screen region, determine which XP zone was clicked. */
  private resolveScreenZone(canvasX: number, canvasY: number, state: RetroSceneState): string {
    const xMax = 1989, yMax = 2633, xMin = 111, yMin = 93;
    const viewW = yMax - yMin; // 2540
    const viewH = xMax - xMin; // 1878

    // canvas → draw-space (inverse of the paint transform)
    const drawX = yMax - canvasY;
    const drawY = xMax - canvasX;

    // If an app window is open, check close [X] button first
    if (state.xpOpenAppId) {
      const winX = Math.round(viewW * 0.12);
      const winW = Math.round(viewW * 0.82);
      const winY = 40;
      const closeX = winX + winW - 60;
      const closeY = winY + 4;
      const closeSize = 50;
      if (drawX >= closeX - 20 && drawX <= closeX + closeSize + 20 &&
          drawY >= closeY - 20 && drawY <= closeY + closeSize + 20) {
        return 'app-close';
      }
    }

    // Desktop app icons
    const apps = state.xpApps;
    for (let i = 0; i < apps.length; i++) {
      const iconY = 60 + i * 130;
      if (drawX >= 0 && drawX <= 320 && drawY >= iconY - 30 && drawY <= iconY + 90) {
        return `app-${apps[i].id}`;
      }
    }

    // Taskbar Start button
    if (drawX >= 0 && drawX <= 180 && drawY >= viewH - 60) {
      return 'start';
    }

    return 'screen';
  }

  nudgeRetroPCScene(canvasId: string, delta: RetroSceneDelta): void {
    const state = this.retroSceneStates.get(canvasId);
    if (!state) return;

    state.positionOffset.x = THREE.MathUtils.clamp(state.positionOffset.x + (delta.x ?? 0), -1.6, 1.6);
    state.positionOffset.y = THREE.MathUtils.clamp(state.positionOffset.y + (delta.y ?? 0), -1.2, 1.2);
    state.positionOffset.z = THREE.MathUtils.clamp(state.positionOffset.z + (delta.z ?? 0), -1.2, 1.2);
    state.rotationOffset.x = THREE.MathUtils.clamp(state.rotationOffset.x + (delta.rotationX ?? 0), -0.75, 0.75);
    state.rotationOffset.y = THREE.MathUtils.clamp(state.rotationOffset.y + (delta.rotationY ?? 0), -1.5, 1.5);
    state.rotationOffset.z = THREE.MathUtils.clamp(state.rotationOffset.z + (delta.rotationZ ?? 0), -0.75, 0.75);
    state.zoomOffset = THREE.MathUtils.clamp(state.zoomOffset + (delta.zoom ?? 0), -2, 2);
  }

  resetRetroPCScene(canvasId: string): void {
    const state = this.retroSceneStates.get(canvasId);
    if (!state) return;

    state.positionOffset.set(0, 0, 0);
    state.rotationOffset.set(0, 0, 0);
    state.zoomOffset = 0;
    state.pointer = { x: 0, y: 0 };
  }

  setRetroPCPointer(canvasId: string, x: number, y: number): void {
    const state = this.retroSceneStates.get(canvasId);
    if (!state) return;

    state.pointer = {
      x: THREE.MathUtils.clamp(x, -1, 1),
      y: THREE.MathUtils.clamp(y, -1, 1)
    };
  }

  /**
   * Create a 3D Retro PC Model with typing animation on screen
   * Perfect for programming-themed hero sections
   */
  createRetroPCScene(canvasId: string, options?: {
    modelPath?: string;
    typingText?: string[];
    typingSpeed?: number;
    screenColor?: string;
    glowIntensity?: number;
    enableOptimization?: boolean;
    maxVertices?: number;
    screenPosition?: { x: number; y: number; z: number };
    screenRotation?: { x: number; y: number; z: number };
    screenScale?: { x: number; y: number };
    enableRotation?: boolean;
    rotationSpeed?: { x: number; y: number; z: number };
    screenMode?: 'typing' | 'xpDesktop';
    xpScreenContent?: Partial<XPScreenContent>;
    onProgress?: (percent: number) => void;
    onLoaded?: () => void;
  }): void {
    const canvas = this.document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      
      return;
    }

    const {
      modelPath = '/assets/models/sony-playstation/scene.gltf',
      typingText = ['Hello World!', 'Welcome to my portfolio'],
      typingSpeed = 100,
      screenColor = '#00ff88',
      glowIntensity = 0.8,
      enableOptimization = true,
      maxVertices = 100000,
      screenPosition = { x: 0, y: 0.05, z: 0.15 },
      screenRotation = { x: 0, y: 0, z: 0 },
      screenScale = { x: 1.0, y: 0.7 },
      enableRotation = false,
      rotationSpeed = { x: 0.002, y: 0.005, z: 0.001 },
      screenMode = 'typing',
      xpScreenContent = {}
    } = options || {};

    const screenDesktopContent: XPScreenContent = {
      title: xpScreenContent.title ?? 'Freelance Workspace',
      status: xpScreenContent.status ?? 'Ready',
      apps: xpScreenContent.apps ?? ['Terminal', 'Apps', 'Workflow', 'Contact'],
      commandLines: xpScreenContent.commandLines ?? typingText,
      locale: xpScreenContent.locale ?? 'en-US'
    };

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 5);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = false;

    // Enhanced lighting setup for iMac scene
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Main directional light (key light)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(3, 3, 3);
    directionalLight.castShadow = false;
    scene.add(directionalLight);

    // Fill light from the side
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
    fillLight.position.set(-2, 1, 2);
    scene.add(fillLight);

    // Rim light for definition
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
    rimLight.position.set(0, 2, -3);
    scene.add(rimLight);

    const retroSceneState: RetroSceneState = {
      scene,
      camera,
      renderer,
      baseCameraPosition: camera.position.clone(),
      positionOffset: new THREE.Vector3(),
      rotationOffset: new THREE.Vector3(),
      zoomOffset: 0,
      pointer: { x: 0, y: 0 },
      enableAutoRotation: enableRotation,
      rotationSpeed,
      xpApps: [],
      xpOpenAppId: null,
      usesExternalXPScreen: false,
      lastExternalXPScreenPaintAt: 0
    };
    this.retroSceneStates.set(canvasId, retroSceneState);

    // Show loading text immediately while model loads
    {
      const ctx2d = canvas.getContext('2d');
      if (ctx2d) {
        ctx2d.fillStyle = '#0a1628';
        ctx2d.fillRect(0, 0, canvas.width, canvas.height);
        ctx2d.fillStyle = '#5ab4ff';
        ctx2d.font = 'bold 28px Tahoma, Arial, sans-serif';
        ctx2d.textAlign = 'center';
        ctx2d.fillText('Loading 3D model…', canvas.width / 2, canvas.height / 2);
      }
    }

    // Load GLTF model or create geometric fallback
    if (modelPath) {
      const loader = new GLTFLoader();
      loader.load(
        modelPath,
        async (gltf) => {
          // Model loaded successfully
          const model = gltf.scene;
          model.name = 'retroPC';



          // Apply optimization if enabled and model is high-poly
          // This runs asynchronously to not block rendering
          if (enableOptimization) {
            try {
              const result = await this.modelOptimizer.optimizeModelGeometry(model, maxVertices);

              
              // Also optimize materials based on device capabilities
              const deviceProfile = this.modelOptimizer.detectDeviceProfile();
              this.modelOptimizer.optimizeModelMaterials(model, deviceProfile.textureQuality);

            } catch (error) {

            }
          }

          // Compute bounding box to center and scale the model properly
          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());

          // Center the model
          model.position.sub(center);

          // Scale to fit nicely in the scene (adjust based on model size)
          const maxDimension = Math.max(size.x, size.y, size.z);
          const targetSize = 8.0; // Increased size for bigger model
          const scale = targetSize / maxDimension;
          model.scale.setScalar(scale);

          // Position slightly above ground
          model.position.y += size.y * scale * 0.3;

          // Add slight rotation for better viewing angle
          model.rotation.y = Math.PI / 5;

          // Enable shadows for all meshes
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          // Find and replace screen material texture for typing animation
          screenMaterialRef = this.setupScreenTexture(model, screenColor);

          // Store screen mesh reference for raycasting (set inside setupScreenTexture)
          if (screenMaterialRef) {
            retroSceneState.screenMaterial = screenMaterialRef;
            retroSceneState.screenMesh = (screenMaterialRef as any)._screenMesh ?? undefined;

          }

          scene.add(model);
          this.attachRetroSceneModel(retroSceneState, model);
          options?.onLoaded?.();
        },
        (progress) => {
          if (progress.total) {
            const pct = Math.round((progress.loaded / progress.total) * 100);
            options?.onProgress?.(pct);
          }
        },
        (error) => {
          
          const fallbackModel = this.createRetroPCGeometry(scene, screenColor);
          this.attachRetroSceneModel(retroSceneState, fallbackModel);
          options?.onLoaded?.();
        }
      );
    } else {
      // No model path provided, use geometric fallback
      const fallbackModel = this.createRetroPCGeometry(scene, screenColor);
      this.attachRetroSceneModel(retroSceneState, fallbackModel);
    }

    // Find the screen material from the scene
    scene.traverse((obj) => {
      if (obj.name === 'screen' && obj instanceof THREE.Mesh) {
        screenMaterialRef = obj.material as THREE.MeshStandardMaterial;
      }
    });

    // Typing animation setup
    let currentTextIndex = 0;
    let currentCharIndex = 0;
    let currentText = '';
    let isTyping = true;
    let lastTypingTime = Date.now();
    let cursorVisible = true;
    let lastCursorBlink = Date.now();
    let isWaitingForNextText = false;
    let screenMaterialRef: THREE.MeshStandardMaterial | null = null;
    let lastDesktopPaint = 0;

    // Animation loop
    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      const now = Date.now();

      // Cursor blinking
      if (now - lastCursorBlink > 500) {
        cursorVisible = !cursorVisible;
        lastCursorBlink = now;
      }

      if (screenMode === 'typing') {
        // Typing animation logic
        if (isTyping && !isWaitingForNextText && now - lastTypingTime > this.getTypingDelay(typingText[currentTextIndex][currentCharIndex])) {
          const fullText = typingText[currentTextIndex];
          if (currentCharIndex < fullText.length) {
            currentText += fullText[currentCharIndex];
            currentCharIndex++;
            lastTypingTime = now;
            if (screenMaterialRef) {
              this.updateScreenTextDirect(screenMaterialRef, currentText, screenColor, cursorVisible);
            }
          } else {
            // Text complete, wait then move to next
            isWaitingForNextText = true;
            setTimeout(() => {
              currentText = '';
              currentCharIndex = 0;
              currentTextIndex = (currentTextIndex + 1) % typingText.length;
              isWaitingForNextText = false;
            }, 2500);
          }
        }

        // Update text display even when not typing (for cursor blinking)
        if (!isWaitingForNextText && screenMaterialRef) {
          this.updateScreenTextDirect(screenMaterialRef, currentText, screenColor, cursorVisible);
        }
      } else if (screenMaterialRef && now - lastDesktopPaint > 320) {
        // In external mode, XP visuals come only from captured Angular DOM.
        if (!retroSceneState.usesExternalXPScreen) {
          XPDesktopRenderer.paint(screenMaterialRef, screenDesktopContent, cursorVisible, retroSceneState);
          lastDesktopPaint = now;
        }
      }

      this.updateRetroSceneState(retroSceneState);

      renderer.render(scene, camera);
      this.animationFrames.set(canvasId, frameId);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    retroSceneState.resizeHandler = handleResize;

    // Store for cleanup
    this.scenes.set(canvasId, scene);
    this.renderers.set(canvasId, renderer);
  }

  private createRetroPCGeometry(scene: THREE.Scene, screenColor: string): THREE.Group {
    // Create a detailed retro PC using multiple geometries
    const pcGroup = new THREE.Group();
    pcGroup.name = 'retroPC';
    pcGroup.position.set(0, -0.5, 0);

    // Main tower case (beige retro style)
    const caseGeometry = new THREE.BoxGeometry(0.8, 2.2, 0.6);
    const caseMaterial = new THREE.MeshLambertMaterial({
      color: 0xF5F5DC, // Beige color
      transparent: false
    });
    const pcCase = new THREE.Mesh(caseGeometry, caseMaterial);
    pcCase.position.set(0, 0.6, 0);
    pcCase.castShadow = true;
    pcGroup.add(pcCase);

    // Case front panel with details
    const frontPanelGeometry = new THREE.BoxGeometry(0.82, 2.3, 0.05);
    const frontPanelMaterial = new THREE.MeshLambertMaterial({ color: 0xE8E8E8 });
    const frontPanel = new THREE.Mesh(frontPanelGeometry, frontPanelMaterial);
    frontPanel.position.set(0, 0.6, 0.325);
    pcGroup.add(frontPanel);

    // Power button (red)
    const powerButtonGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.02, 8);
    const powerButtonMaterial = new THREE.MeshLambertMaterial({ color: 0xFF0000 });
    const powerButton = new THREE.Mesh(powerButtonGeometry, powerButtonMaterial);
    powerButton.position.set(-0.2, 0.9, 0.33);
    powerButton.rotation.z = Math.PI / 2;
    pcGroup.add(powerButton);

    // Drive bays (dark rectangles)
    for (let i = 0; i < 3; i++) {
      const driveBayGeometry = new THREE.BoxGeometry(0.6, 0.08, 0.03);
      const driveBayMaterial = new THREE.MeshLambertMaterial({ color: 0x2C2C2C });
      const driveBay = new THREE.Mesh(driveBayGeometry, driveBayMaterial);
      driveBay.position.set(0, 0.3 - i * 0.15, 0.32);
      pcGroup.add(driveBay);
    }

    // Monitor stand
    const standBaseGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
    const standBaseMaterial = new THREE.MeshLambertMaterial({ color: 0xC0C0C0 });
    const standBase = new THREE.Mesh(standBaseGeometry, standBaseMaterial);
    standBase.position.set(1.2, -0.05, 0);
    pcGroup.add(standBase);

    // Monitor stand pole
    const standPoleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
    const standPoleMaterial = new THREE.MeshLambertMaterial({ color: 0xA0A0A0 });
    const standPole = new THREE.Mesh(standPoleGeometry, standPoleMaterial);
    standPole.position.set(1.2, 0.35, 0);
    pcGroup.add(standPole);

    // Monitor base
    const monitorBaseGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.3);
    const monitorBaseMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
    const monitorBase = new THREE.Mesh(monitorBaseGeometry, monitorBaseMaterial);
    monitorBase.position.set(1.2, 0.75, 0);
    pcGroup.add(monitorBase);

    // CRT Monitor
    const monitorGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.6, 16, 1, false, 0, Math.PI * 2);
    const monitorMaterial = new THREE.MeshLambertMaterial({ color: 0x2C2C2C });
    const monitor = new THREE.Mesh(monitorGeometry, monitorMaterial);
    monitor.position.set(1.2, 1.2, 0);
    monitor.rotation.z = Math.PI / 2;
    pcGroup.add(monitor);

    // Monitor screen (flat surface for text)
    const screenGeometry = new THREE.PlaneGeometry(1.2, 0.9);
    
    // Create canvas texture for text rendering - 4096x4096 to match your PNG texture
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 4096;  // Match your PNG texture dimensions
    screenCanvas.height = 4096;
    const screenCtx = screenCanvas.getContext('2d');
    
    if (!screenCtx) {
      scene.add(pcGroup);
      return pcGroup;
    }
    
    // Create texture from canvas
    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTexture.magFilter = THREE.LinearFilter;
    screenTexture.minFilter = THREE.LinearFilter;
    
    const screenMaterial = new THREE.MeshStandardMaterial({
      map: screenTexture,
      emissive: 0x00ff88,
      emissiveIntensity: 0.3,
      color: 0xffffff
    });
    
    // Attach canvas properties to material for later access
    (screenMaterial as any).screenCanvas = screenCanvas;
    (screenMaterial as any).screenCtx = screenCtx;
    (screenMaterial as any).screenTexture = screenTexture;
    
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.name = 'screen';
    screen.position.set(1.2, 1.2, 0.32);
    pcGroup.add(screen);

    // Monitor frame
    const frameGeometry = new THREE.TorusGeometry(0.82, 0.05, 8, 16, Math.PI);
    const frameMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.set(1.2, 1.2, 0.3);
    frame.rotation.z = Math.PI / 2;
    pcGroup.add(frame);

    // Keyboard
    const keyboardGeometry = new THREE.BoxGeometry(1.6, 0.08, 0.5);
    const keyboardMaterial = new THREE.MeshLambertMaterial({ color: 0x3a3a3a });
    const keyboard = new THREE.Mesh(keyboardGeometry, keyboardMaterial);
    keyboard.position.set(0, -0.8, 0.5);
    keyboard.castShadow = true;
    pcGroup.add(keyboard);

    // Keyboard keys (simplified)
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 12; col++) {
        const keyGeometry = new THREE.BoxGeometry(0.04, 0.02, 0.04);
        const keyMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const key = new THREE.Mesh(keyGeometry, keyMaterial);
        key.position.set(
          -0.6 + col * 0.12,
          -0.76,
          0.3 + row * 0.08
        );
        pcGroup.add(key);
      }
    }

    // Mouse
    const mouseGeometry = new THREE.SphereGeometry(0.08, 8, 6);
    const mouseMaterial = new THREE.MeshLambertMaterial({ color: 0x2C2C2C });
    const mouse = new THREE.Mesh(mouseGeometry, mouseMaterial);
    mouse.position.set(0.8, -0.7, 0.6);
    mouse.scale.set(1.2, 0.6, 1);
    pcGroup.add(mouse);

    // Cables (simplified)
    const cableGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.8, 6);
    const cableMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
    const cable = new THREE.Mesh(cableGeometry, cableMaterial);
    cable.position.set(0.6, -0.3, 0.3);
    cable.rotation.z = Math.PI / 4;
    pcGroup.add(cable);

    // Add screen glow effect
    const glowGeometry = new THREE.PlaneGeometry(1.4, 1.1);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: screenColor,
      transparent: true,
      opacity: 0.1
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.set(1.2, 1.2, 0.31);
    pcGroup.add(glow);

    scene.add(pcGroup);
    return pcGroup;
  }

  private attachRetroSceneModel(state: RetroSceneState, model: THREE.Object3D): void {
    state.modelRoot = model;
    state.baseModelPosition = model.position.clone();
    state.baseModelRotation = model.rotation.clone();
  }

  private updateRetroSceneState(state: RetroSceneState): void {
    if (!state.modelRoot || !state.baseModelPosition || !state.baseModelRotation) return;

    const { modelRoot, baseModelPosition, baseModelRotation, baseCameraPosition, positionOffset, rotationOffset, pointer } = state;
    const targetPosition = new THREE.Vector3(
      baseModelPosition.x + positionOffset.x + pointer.x * 0.18,
      baseModelPosition.y + positionOffset.y - pointer.y * 0.12,
      baseModelPosition.z + positionOffset.z
    );
    modelRoot.position.lerp(targetPosition, 0.08);

    const targetRotationX = baseModelRotation.x + rotationOffset.x - pointer.y * 0.12;
    const targetRotationY = baseModelRotation.y + rotationOffset.y + pointer.x * 0.2;
    const targetRotationZ = baseModelRotation.z + rotationOffset.z;

    modelRoot.rotation.x += (targetRotationX - modelRoot.rotation.x) * 0.08;
    modelRoot.rotation.y += (targetRotationY - modelRoot.rotation.y) * 0.08;
    modelRoot.rotation.z += (targetRotationZ - modelRoot.rotation.z) * 0.08;

    if (state.enableAutoRotation) {
      modelRoot.rotation.x += state.rotationSpeed.x;
      modelRoot.rotation.y += state.rotationSpeed.y;
      modelRoot.rotation.z += state.rotationSpeed.z;
    }

    const targetCameraX = baseCameraPosition.x + pointer.x * 0.2;
    const targetCameraY = baseCameraPosition.y + pointer.y * 0.08;
    const targetCameraZ = baseCameraPosition.z + state.zoomOffset;

    state.camera.position.x += (targetCameraX - state.camera.position.x) * 0.06;
    state.camera.position.y += (targetCameraY - state.camera.position.y) * 0.06;
    state.camera.position.z += (targetCameraZ - state.camera.position.z) * 0.08;
    state.camera.lookAt(0, 1, 0);
  }

  private getTypingDelay(char: string): number {
    // Variable typing speed based on character type
    if (char === ' ' || char === '\n') {
      return 100; // Faster for spaces and newlines
    } else if (char === '.' || char === ',' || char === '!' || char === '?') {
      return 200; // Pause at punctuation
    } else {
      return 50; // Normal typing speed
    }
  }

  private updateScreenTextDirect(
  screenMaterial: THREE.MeshStandardMaterial,
  text: string,
  color: string,
  cursorVisible: boolean
): void {
  const canvas = (screenMaterial as any).screenCanvas as HTMLCanvasElement;
  const ctx = (screenMaterial as any).screenCtx as CanvasRenderingContext2D;
  const texture = (screenMaterial as any).screenTexture as THREE.CanvasTexture;

  if (!ctx || !canvas || !texture) return;

  // ----------------------------------
  // 1. CLEAR
  // ----------------------------------
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ----------------------------------
  // 2. DRAW ORIGINAL TEXTURE
  // ----------------------------------
  const originalTextureData = (screenMaterial as any).originalTextureData as ImageData;

  if (originalTextureData) {
    ctx.putImageData(originalTextureData, 0, 0);
  } else {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // ----------------------------------
  // 3. SCREEN UV AREA
  // ----------------------------------
  const xMin = 111;
  const xMax = 1989;
  const yMin = 93;
  const yMax = 2633;

  const screenWidth = xMax - xMin;
  const screenHeight = yMax - yMin;

  // ----------------------------------
  // 4. CLIP TO SCREEN AREA (IMPORTANT)
  // ----------------------------------
  ctx.save();
  ctx.beginPath();
  ctx.rect(xMin, yMin, screenWidth, screenHeight);
  ctx.clip();

  // ----------------------------------
  // 5. TRANSFORM (🔥 THIS IS THE FIX)
  // Rotate + mirror INSIDE screen only
  // ----------------------------------
// Move to TOP-LEFT of screen
ctx.translate(xMin, yMin);

// Rotate around that corner
ctx.rotate(Math.PI / 2);

// Because of rotation, adjust origin
ctx.translate(0, -screenWidth);

// Mirror horizontally
ctx.scale(-1, 1);

// Fix mirror offset
ctx.translate(-screenHeight, 0);
  // ----------------------------------
  // 6. TEXT SETUP
  // ----------------------------------
  ctx.fillStyle = '#0eaa0e'; // Bright green for old PC terminal look
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const fontSize = Math.floor(screenHeight * 0.04); // Smaller text
  ctx.font = `bold ${fontSize}px monospace`;
const padding = 60; // More padding for bigger modal
const maxWidth = screenHeight - padding * 2;
  const displayText = cursorVisible ? text + '█' : text;
const rawLines = displayText.split('\n');
const lines: string[] = [];

for (const rawLine of rawLines) {
  const wrapped = this.wrapText(ctx, rawLine, maxWidth);
  lines.push(...wrapped);
}  const lineHeight = fontSize * 1.4;

  // Because rotated, width/height swap roles
let y = padding;

  for (const line of lines) {
  ctx.fillText(line, padding, y);
  y += lineHeight;
  }

  ctx.restore();

  // ----------------------------------
  // 8. UPDATE TEXTURE
  // ----------------------------------
  texture.needsUpdate = true;
  screenMaterial.needsUpdate = true;
}

  private setupScreenTexture(model: THREE.Object3D, screenColor: string): THREE.MeshStandardMaterial | null {
    // Find the screen material in the GLTF model
    let screenMaterial: THREE.MeshStandardMaterial | null = null;
    let screenMesh: THREE.Mesh | null = null;
    const allMaterials: { name: string; material: THREE.Material; meshName: string; isArray: boolean; arrayIndex?: number }[] = [];

    // Traverse and collect ALL materials and their locations
    model.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        for (let idx = 0; idx < materials.length; idx++) {
          const material = materials[idx];
          if (material instanceof THREE.MeshStandardMaterial) {
            const entry = {
              name: material.name,
              material,
              meshName: child.name,
              isArray: Array.isArray(child.material),
              arrayIndex: Array.isArray(child.material) ? idx : undefined
            };
            allMaterials.push(entry);

            // Priority 1: Look for exact match
            if (material.name === 'pvm_screen_and_details_mat') {
              screenMaterial = material;
              screenMesh = child;
              
            }
            // Priority 2: Look for "screen" in name
            else if (!screenMaterial && material.name.toLowerCase().includes('screen')) {
              screenMaterial = material;
              screenMesh = child;
              
            }
          }
        }
      }
    });

    // Log detailed material info for debugging
    
    allMaterials.forEach((entry, i) => {
      
    });
    

    if (screenMaterial && screenMesh) {
      

      // DEBUG: Log original material properties
      
      const mat = screenMaterial as THREE.MeshStandardMaterial;
      const originalEmissive = mat.emissive.clone();
      const originalEmissiveIntensity = mat.emissiveIntensity;
      const originalMetalness = mat.metalness;
      const originalRoughness = mat.roughness;
      
      
      
      
      
      
      
      
      

      // DEBUG: Log mesh and geometry info
      
      const mesh = screenMesh as THREE.Mesh;
      
      
      
      if (mesh.geometry.attributes['uv']) {
        
        // Log first few UV coordinates
        const uvArray = mesh.geometry.attributes['uv'].array as Float32Array;
        
      }
      

      // Create dynamic canvas texture for typing animation
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      canvas.width = 4096;
      canvas.height = 4096;

      // PRESERVE ORIGINAL TEXTURE: Draw the original material texture first
      let originalTextureData: ImageData | null = null;

      if (mat.map) {
        

        const originalTexture = mat.map as THREE.Texture;

        // Try to draw the original texture image directly
        if (originalTexture.image) {
          
          
          if (originalTexture.image instanceof HTMLImageElement || originalTexture.image instanceof HTMLCanvasElement) {
            ctx.drawImage(originalTexture.image, 0, 0, canvas.width, canvas.height);
            
          } else if (originalTexture.source && originalTexture.source.data) {
            const img = originalTexture.image || originalTexture.source?.data;

if (
  img instanceof HTMLImageElement ||
  img instanceof HTMLCanvasElement ||
  img instanceof ImageBitmap
) {
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
} else {
  
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
          
          } else {
            
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
        } else {
          
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Store the original texture data for redrawing
        try {
          originalTextureData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const hasPixels = originalTextureData.data.some(val => val > 0);
          
        } catch (e) {
          
        }
      } else {
        // No original texture, use dark background
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // DEBUG: Log canvas info
      
      

      // Try to get canvas pixel data to verify drawing
      try {
        const imageData = ctx.getImageData(40, 110, 100, 20);
        const hasPixels = imageData.data.some(val => val > 0);
        
      } catch (e) {
        
      }
      
const originalMap = mat.map;

      // Create texture from canvas
      const texture = new THREE.CanvasTexture(canvas);
texture.flipY = false;
texture.colorSpace = THREE.SRGBColorSpace;

// 🔥 Copy ALL transform data
if (originalMap) {
  texture.offset.copy(originalMap.offset);
  texture.repeat.copy(originalMap.repeat);
  texture.center.copy(originalMap.center);
  texture.rotation = originalMap.rotation;
  texture.wrapS = originalMap.wrapS;
  texture.wrapT = originalMap.wrapT;
}

mat.map = texture;
mat.emissiveMap = texture;

texture.needsUpdate = true;
mat.needsUpdate = true;
      // DEBUG: Before applying texture
      
      
      
      

      // Keep existing PBR maps/properties (normal/roughness/etc.) and only replace the
      // color/emissive content with the dynamic screen texture.
      mat.map = texture;
      mat.emissiveMap = texture;
      mat.emissive.copy(originalEmissive);
      mat.emissiveIntensity = Math.min(originalEmissiveIntensity || 0.35, 0.55);
      mat.metalness = originalMetalness;
      mat.roughness = originalRoughness;
      mat.side = THREE.FrontSide;

      // NO offset/repeat - use full texture without mapping adjustments
      // This will show us the complete canvas so we can see what's visible

      mat.needsUpdate = true;

      // DEBUG: Log texture transform
      
      
      

      // Store references for updating the texture during animation
      (screenMaterial as any).screenCanvas = canvas;
      (screenMaterial as any).screenCtx = ctx;
      (screenMaterial as any).screenTexture = texture;
      (screenMaterial as any).originalTextureData = originalTextureData;
      // Store the exact mesh for raycasting
      (screenMaterial as any)._screenMesh = screenMesh;

      return screenMaterial;
    } else {
      
      return null;
    }
    // For now, skip optimization to preserve model quality
    // Complex GLTF models like the Sony PlayStation need their full geometry
    

    // Future optimization code (commented out):
    /*
    let totalVertices = 0;

    // Count total vertices in the model
    model.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        const geometry = child.geometry;
        if (geometry.index) {
          totalVertices += geometry.index.count;
        } else {
          totalVertices += geometry.attributes.position.count;
        }
      }
    });

    

    if (totalVertices > maxVertices) {
      
      // For complex models, it's better to use external tools like Blender for optimization
      // rather than runtime geometry modification which can break the model
    }
    */
  }

private wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? currentLine + ' ' + word : word;
    const { width } = ctx.measureText(testLine);

    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) lines.push(currentLine);

  return lines;
}
}
