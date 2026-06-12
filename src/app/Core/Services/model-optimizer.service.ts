/**
 * Model Optimizer Service
 * Handles runtime optimization of 3D models including:
 * - Polygon decimation
 * - LOD management
 * - Progressive loading
 * - Texture quality fallback
 */

import { Injectable } from '@angular/core';
import * as THREE from 'three';

interface LODLevel {
  name: string;
  maxVertices: number;
  textureSize: number;
  description: string;
}

interface OptimizationResult {
  originalVertexCount: number;
  optimizedVertexCount: number;
  vertexReduction: number;
  estimatedFileSizeSavings: number;
  timeTaken: number;
}

interface DeviceProfile {
  quality: 'high' | 'medium' | 'low' | 'ultra-low';
  lodLevel: number;
  textureQuality: number;
  enableParticles: boolean;
  maxTextures: number;
}

@Injectable({
  providedIn: 'root'
})
export class ModelOptimizerService {
  
  private lodLevels: LODLevel[] = [
    { name: 'Hero', maxVertices: 180000, textureSize: 4096, description: 'Full detail for close-ups' },
    { name: 'High', maxVertices: 100000, textureSize: 2048, description: 'Medium distance viewing' },
    { name: 'Medium', maxVertices: 60000, textureSize: 1024, description: 'Default quality' },
    { name: 'Low', maxVertices: 30000, textureSize: 512, description: 'Mobile/slow networks' },
    { name: 'Ultra-Low', maxVertices: 10000, textureSize: 256, description: 'Fallback only' }
  ];

  constructor() {}

  /**
   * Detect device capabilities and return appropriate profile
   */
  detectDeviceProfile(): DeviceProfile {
    const isLowEnd = this.isLowEndDevice();
    const isTablet = this.isTablet();
    const isMobile = this.isMobile();

    if (isLowEnd) {
      return {
        quality: 'ultra-low',
        lodLevel: 4,
        textureQuality: 256,
        enableParticles: false,
        maxTextures: 1
      };
    }

    if (isMobile) {
      return {
        quality: 'low',
        lodLevel: 3,
        textureQuality: 512,
        enableParticles: false,
        maxTextures: 2
      };
    }

    if (isTablet) {
      return {
        quality: 'medium',
        lodLevel: 2,
        textureQuality: 1024,
        enableParticles: true,
        maxTextures: 4
      };
    }

    // Desktop
    return {
      quality: 'high',
      lodLevel: 1,
      textureQuality: 2048,
      enableParticles: true,
      maxTextures: 8
    };
  }

  /**
   * Optimize model mesh by reducing vertex count (ASYNC - non-blocking)
   * @param model THREE.Object3D to optimize
   * @param targetVertexCount Target vertex count
   * @param preserveUVs Whether to preserve UV mapping
   * @returns Promise with optimization result metrics
   */
  async optimizeModelGeometry(
    model: THREE.Object3D,
    targetVertexCount: number = 80000,
    preserveUVs: boolean = true
  ): Promise<OptimizationResult> {
    const startTime = performance.now();
    let originalVertexCount = 0;
    let optimizedVertexCount = 0;

    // Count original vertices
    model.traverse((node) => {
      if (node instanceof THREE.Mesh && node.geometry) {
        const geo = node.geometry as THREE.BufferGeometry;
        const positions = geo.getAttribute('position');
        if (positions) {
          originalVertexCount += positions.count;
        }
      }
    });



    // Calculate reduction ratio
    const reductionRatio = Math.max(0.1, Math.min(1, targetVertexCount / (originalVertexCount || 1)));

    // Skip decimation if model already meets target or is small
    if (reductionRatio > 0.85) {

      return {
        originalVertexCount,
        optimizedVertexCount: originalVertexCount,
        vertexReduction: 0,
        estimatedFileSizeSavings: 0,
        timeTaken: performance.now() - startTime
      };
    }

    // Apply geometry optimization asynchronously (yield to browser frequently)
    const meshes: Array<{ node: THREE.Mesh; geo: THREE.BufferGeometry }> = [];
    model.traverse((node) => {
      if (node instanceof THREE.Mesh && node.geometry) {
        meshes.push({ node, geo: node.geometry as THREE.BufferGeometry });
      }
    });



    // Process meshes one at a time, yielding to the browser
    for (const { node, geo } of meshes) {
      const optimized = await this.decimateGeometryAsync(geo, reductionRatio, preserveUVs);

      if (optimized) {
        const positions = optimized.getAttribute('position');
        if (positions) {
          optimizedVertexCount += positions.count;
        }

        // Replace original geometry with optimized
        node.geometry.dispose();
        node.geometry = optimized;
      }

      // Yield to browser every mesh to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    const timeTaken = performance.now() - startTime;
    const estimatedFileSizeSavings = ((1 - reductionRatio) * 100).toFixed(1);

    return {
      originalVertexCount,
      optimizedVertexCount,
      vertexReduction: ((1 - reductionRatio) * 100),
      estimatedFileSizeSavings: parseFloat(estimatedFileSizeSavings as any),
      timeTaken
    };
  }

  /**
   * Async geometry decimation - non-blocking using stride-based sampling
   * Faster and better quality than random removal
   */
  private async decimateGeometryAsync(
    geometry: THREE.BufferGeometry,
    ratio: number,
    preserveUVs: boolean
  ): Promise<THREE.BufferGeometry | null> {
    try {
      const positions = geometry.getAttribute('position');
      const normals = geometry.getAttribute('normal');
      const uvs = geometry.getAttribute('uv');

      if (!positions) return null;

      const posArray = positions.array as Float32Array;
      const posCount = positions.count;

      // Use stride-based sampling: take every Nth vertex
      // This is faster and creates fewer artifacts than random sampling
      const stride = Math.max(1, Math.ceil(1 / ratio));
      const indices: number[] = [];

      // Sample vertices at regular intervals
      for (let i = 0; i < posCount; i += stride) {
        indices.push(i);
      }

      // Ensure we always have at least some vertices
      if (indices.length < 3) {
        indices.length = 0;
        for (let i = 0; i < Math.min(3, posCount); i++) {
          indices.push(i);
        }
      }

      // Yield to browser before heavy processing
      await new Promise(resolve => setTimeout(resolve, 0));

      // Create new geometry with decimated vertices
      const newGeometry = new THREE.BufferGeometry();

      // Copy and subset position attribute
      const newPosArray = new Float32Array(indices.length * 3);
      for (let i = 0; i < indices.length; i++) {
        const idx = indices[i];
        newPosArray[i * 3] = posArray[idx * 3];
        newPosArray[i * 3 + 1] = posArray[idx * 3 + 1];
        newPosArray[i * 3 + 2] = posArray[idx * 3 + 2];
      }
      newGeometry.setAttribute('position', new THREE.BufferAttribute(newPosArray, 3));

      // Copy normals if exist
      if (normals) {
        const normalArray = normals.array as Float32Array;
        const newNormalArray = new Float32Array(indices.length * 3);
        for (let i = 0; i < indices.length; i++) {
          const idx = indices[i];
          newNormalArray[i * 3] = normalArray[idx * 3];
          newNormalArray[i * 3 + 1] = normalArray[idx * 3 + 1];
          newNormalArray[i * 3 + 2] = normalArray[idx * 3 + 2];
        }
        newGeometry.setAttribute('normal', new THREE.BufferAttribute(newNormalArray, 3));
      }

      // Copy UVs if requested
      if (preserveUVs && uvs) {
        const uvArray = uvs.array as Float32Array;
        const newUVArray = new Float32Array(indices.length * 2);
        for (let i = 0; i < indices.length; i++) {
          const idx = indices[i];
          newUVArray[i * 2] = uvArray[idx * 2];
          newUVArray[i * 2 + 1] = uvArray[idx * 2 + 1];
        }
        newGeometry.setAttribute('uv', new THREE.BufferAttribute(newUVArray, 2));
      }

      newGeometry.computeBoundingBox();
      newGeometry.computeBoundingSphere();

      return newGeometry;
    } catch (error) {

      return null;
    }
  }

  /**
   * Optimize model materials and textures
   * Disables expensive features, optimizes texture filtering
   */
  optimizeModelMaterials(model: THREE.Object3D, maxTextureSize: number = 2048): void {
    let optimizedCount = 0;

    model.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        const materials = Array.isArray(node.material) ? node.material : [node.material];

        materials.forEach((material) => {
          if (material instanceof THREE.MeshStandardMaterial) {
            // Disable expensive shadow calculations
            material.shadowSide = THREE.BackSide;

            // Optimize texture filtering (faster than resizing)
            if (material.map) {
              material.map.magFilter = THREE.LinearFilter;
              material.map.minFilter = THREE.LinearMipmapLinearFilter;
            }

            // Other texture optimizations
            if (material.normalMap) {
              material.normalMap.magFilter = THREE.LinearFilter;
              material.normalMap.minFilter = THREE.LinearFilter;
            }

            if (material.metalnessMap) {
              material.metalnessMap.magFilter = THREE.LinearFilter;
              material.metalnessMap.minFilter = THREE.LinearFilter;
            }

            if (material.roughnessMap) {
              material.roughnessMap.magFilter = THREE.LinearFilter;
              material.roughnessMap.minFilter = THREE.LinearFilter;
            }

            optimizedCount++;
          }
        });
      }
    });


  }

  /**
   * Create LOD versions of a model (async - requires gltf-transform in production)
   */
  async createLOD(model: THREE.Object3D, lodLevel: number): Promise<THREE.Object3D> {
    const cloned = model.clone();
    const lod = this.lodLevels[Math.min(lodLevel, this.lodLevels.length - 1)];

    // Optimize for this LOD level
    await this.optimizeModelGeometry(cloned, lod.maxVertices);
    this.optimizeModelMaterials(cloned, lod.textureSize);

    return cloned;
  }

  /**
   * Get LOD level details
   */
  getLODLevel(level: number): LODLevel {
    return this.lodLevels[Math.min(level, this.lodLevels.length - 1)];
  }

  /**
   * Check if device is low-end (old phone, weak GPU)
   */
private isLowEndDevice(): boolean {
  const canvas = document.createElement('canvas');
  const gl = (
    canvas.getContext('webgl') ||
    canvas.getContext('experimental-webgl')
  ) as WebGLRenderingContext | null;

  if (!gl) return true;

  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  if (!debugInfo) return false;

  const renderer = gl.getParameter(
    debugInfo.UNMASKED_RENDERER_WEBGL
  ) as string;

  const lowEndKeywords = ['Mali-400', 'Adreno 200', 'GMA 950', 'Intel HD Graphics 2000'];

  return lowEndKeywords.some(keyword => renderer.includes(keyword));
}

  /**
   * Detect if user is on mobile
   */
  private isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Detect if user is on tablet
   */
  private isTablet(): boolean {
    return /iPad|Android (?!.*Mobile)/i.test(navigator.userAgent);
  }

  /**
   * Get recommended LOD for current device and network
   */
  getRecommendedLOD(): number {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const effectiveType = connection?.effectiveType || '4g';

      switch (effectiveType) {
        case '4g':
        case '5g':
          return this.detectDeviceProfile().lodLevel;
        case '3g':
          return Math.min(this.detectDeviceProfile().lodLevel + 1, 4);
        case '2g':
        case 'slow-2g':
          return 4; // Ultra-low
      }
    }

    return this.detectDeviceProfile().lodLevel;
  }

  /**
   * Generate optimization report
   */
  generateReport(result: OptimizationResult): string {
    return `
    ═══════════════════════════════════════════════════
    📊 MODEL OPTIMIZATION REPORT
    ═══════════════════════════════════════════════════
    
    📈 Vertex Optimization:
       • Original Vertices:  ${result.originalVertexCount.toLocaleString()}
       • Optimized Vertices: ${result.optimizedVertexCount.toLocaleString()}
       • Reduction:          ${result.vertexReduction.toFixed(1)}%
    
    💾 Memory Impact:
       • Estimated Savings:  ~${result.estimatedFileSizeSavings}%
    
    ⏱️  Performance:
       • Optimization Time:  ${result.timeTaken.toFixed(2)}ms
    
    ═══════════════════════════════════════════════════
    `;
  }
}
