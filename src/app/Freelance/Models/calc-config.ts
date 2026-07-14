// -------------------------------------------------------------------------
// TYPES & INTERFACES
// -------------------------------------------------------------------------

export type ExpertiseID = 'VR' | 'WEB' | 'DESK' | 'CPP' | 'AI';
export type Complexity = 'SIMPLE' | 'MEDIUM' | 'COMPLEX';
export type DbType = 'SQLITE' | 'SQLSERVER' | 'POSTGRESQL';
export type VRPlatform = 'quest' | 'pico' | 'steamvr' | 'appleVisionPro';

export interface Range {
  min: number;
  max: number;
}

export interface ExpertiseItem {
  id: ExpertiseID;
  title: string;
  desc: string;
  icon: string;
  color: string;
  tags: string[]; // Moved from Component to here
  
  // Project-Based Pricing (2026 Model)
  minProjectPrice: number;  // Minimum starting price in EUR
  baseRate: number;         // For reference/details only (EUR/hour)
  setupHours: number;
  designHours: Range;
  
  // Project Sizing Multipliers (Hours)
  sizeMultipliers: {
    proto: number;
    mvp: number;
    production: number;
  };
}

export interface HardwareItem {
  id: string; 
  name: string;
  price: number;
  allowedTypes: ExpertiseID[];
}

// -------------------------------------------------------------------------
// CONFIGURATION
// -------------------------------------------------------------------------

export const CONFIG = {
  global: {
    procurementFeePct: 0.10,
    weeksDivisor: { min: 20, max: 17 } // Hours per week range
  },

  // -----------------------------------------------------
  // EXPERTISES
  // -----------------------------------------------------
  expertises: [
    {
      id: 'AI',
      title: 'freelance.calc.expertises.AI.title',
      desc: 'freelance.calc.expertises.AI.desc',
      icon: 'psychology',
      color: '#9c27b0',
      tags: ['ML/AI', 'TensorFlow', 'Python'],
      minProjectPrice: 2000,
      setupHours: 12,
      baseRate: 70,
      designHours: { min: 20, max: 50 },
      sizeMultipliers: {
        proto: 20,
        mvp: 60,
        production: 200
      }
    },
    {
      id: 'WEB',
      title: 'freelance.calc.expertises.WEB.title',
      desc: 'freelance.calc.expertises.WEB.desc',
      icon: 'language',
      color: '#006680',
      tags: ['Angular', '.NET', 'TypeScript'],
      minProjectPrice: 1200,
      setupHours: 6,
      baseRate: 50,
      designHours: { min: 8, max: 20 },
      sizeMultipliers: {
        proto: 6,
        mvp: 50,
        production: 120
      }
    },
    {
      id: 'DESK',
      title: 'freelance.calc.expertises.DESK.title',
      desc: 'freelance.calc.expertises.DESK.desc',
      icon: 'monitor',
      color: '#e5aa35',
      tags: ['WPF', 'SQL', 'C#'],
      minProjectPrice: 1500,
      setupHours: 8,
      baseRate: 50,
      designHours: { min: 10, max: 25 },
      sizeMultipliers: {
        proto: 8,
        mvp: 40,
        production: 120
      }
    },
    {
      id: 'VR',
      title: 'freelance.calc.expertises.VR.title',
      desc: 'freelance.calc.expertises.VR.desc',
      icon: 'view_in_ar',
      color: '#00b7c2',
      tags: ['Unity', 'Unreal Engine', 'OpenXR', 'WebXR'],
      minProjectPrice: 2500,
      setupHours: 10,
      baseRate: 75,
      designHours: { min: 15, max: 40 },
      sizeMultipliers: {
        proto: 10,
        mvp: 30,
        production: 150
      }
    },
    {
      id: 'CPP',
      title: 'freelance.calc.expertises.CPP.title',
      desc: 'freelance.calc.expertises.CPP.desc',
      icon: 'memory',
      color: '#f44336',
      tags: ['Qt', 'C++98', 'C++23'],
      minProjectPrice: 1800,
      setupHours: 4,
      baseRate: 55,
      designHours: { min: 12, max: 28 },
      sizeMultipliers: {
        proto: 8,
        mvp: 30,
        production: 90
      }
    }
  ] as ExpertiseItem[],

  // -----------------------------------------------------
  // PROJECT SIZES (Logic only)
  // -----------------------------------------------------
  sizes: {
    proto: { discountPct: 0, icon: 'science' },
    mvp: { discountPct: 5, icon: 'rocket_launch' },
    production: { discountPct: 10, icon: 'verified' }
  },

  // -----------------------------------------------------
  // COMMON FEATURES (Hours)
  // -----------------------------------------------------
  common: {
    auth: { min: 8, max: 12 },
    payments: { min: 16, max: 24 },
    analytics: { min: 4, max: 8 },
    backend: {
      SIMPLE: { min: 8, max: 12 },
      MEDIUM: { min: 20, max: 30 },
      COMPLEX: { min: 40, max: 60 }
    }
  },

  // -----------------------------------------------------
  // DOMAIN: VR / AR
  // -----------------------------------------------------
  vr: {
    // Matrix: [Base Platform][Target Platform] = {min, max}
    // Diagonal = Single platform base cost. 
    // Off-diagonal = Extra cost to add Target if Base is selected.
    platformSupportMatrix: {
      quest: {
        quest: { min: 0, max: 10 },          // Base
        pico: { min: 8, max: 18 },            // Add-on
        steamvr: { min: 12, max: 25 },        // Add-on
        appleVisionPro: { min: 30, max: 60 }  // Add-on
      },
      pico: {
        quest: { min: 8, max: 18 },
        pico: { min: 10, max: 30 },           // Base
        steamvr: { min: 12, max: 25 },
        appleVisionPro: { min: 30, max: 60 }
      },
      steamvr: {
        quest: { min: 8, max: 18 },
        pico: { min: 8, max: 18 },
        steamvr: { min: 15, max: 40 },        // Base
        appleVisionPro: { min: 35, max: 65 }
      },
      appleVisionPro: {
        quest: { min: 15, max: 30 },
        pico: { min: 15, max: 30 },
        steamvr: { min: 20, max: 40 },
        appleVisionPro: { min: 40, max: 90 }  // Base
      }
    } as Record<VRPlatform, Record<VRPlatform, Range>>,

    interaction: {
      BASIC: { min: 2, max: 6 },
      ADVANCED: { min: 40, max: 90 },
      PHYSICS: { min: 70, max: 120 }
    },
    graphics: {
      LOW: { min: 0, max: 10 },
      MEDIUM: { min: 20, max: 60 },
      HIGH: { min: 80, max: 120 }
    },
    multiplayer: { min: 80, max: 140 },
    voiceChat: { min: 20, max: 40 },
    shaders: { min: 50, max: 70 }
  },

  // -----------------------------------------------------
  // DOMAIN: WEB
  // -----------------------------------------------------
  web: {
    pwa: { min: 8, max: 12 },
    ssr: { min: 12, max: 20 },
    realtime: { min: 20, max: 30 },
    mobile: { min: 12, max: 18 },
    admin: { min: 25, max: 40 },
    ui: {
      SIMPLE: { min: 0, max: 0 },
      MEDIUM: { min: 10, max: 15 },
      COMPLEX: { min: 20, max: 35 }
    }
  },

  // -----------------------------------------------------
  // DOMAIN: DESKTOP
  // -----------------------------------------------------
  desk: {
    reporting: { min: 16, max: 25 },
    installer: { min: 4, max: 8 },
    io: {
      SIMPLE: { min: 12, max: 18 },
      MEDIUM: { min: 25, max: 35 },
      COMPLEX: { min: 40, max: 60 }
    },
    db: {
      SQLITE: { min: 8, max: 12 },
      SQLSERVER: { min: 16, max: 24 },
      POSTGRESQL: { min: 20, max: 30 }
    }
  },

  // -----------------------------------------------------
  // DOMAIN: C++
  // -----------------------------------------------------
  cpp: {
    platformPerExtra: { min: 12, max: 18 },
    drivers: { min: 40, max: 70 },
    realtime: { min: 20, max: 35 },
    threading: { min: 16, max: 28 },
    gui: { min: 25, max: 40 },
    opt: {
      STANDARD: { min: 0, max: 0 },
      HIGH: { min: 12, max: 20 },
      EXTREME: { min: 30, max: 50 }
    }
  },

  // -----------------------------------------------------
  // HARDWARE CATALOG
  // -----------------------------------------------------
  hardware: [
    { id: 'PICO4', name: 'freelance.calc.hardware.pico4', price: 400, allowedTypes: ['VR'] },
    { id: 'QUEST3', name: 'freelance.calc.hardware.quest3', price: 550, allowedTypes: ['VR'] },
    { id: 'STEAMVR_HEADSET', name: 'freelance.calc.hardware.steamvr', price: 1200, allowedTypes: ['VR'] },
    { id: 'APPLEVP', name: 'freelance.calc.hardware.applevp', price: 4000, allowedTypes: ['VR'] },
    
    { id: 'ARDUINO', name: 'freelance.calc.hardware.arduino', price: 50, allowedTypes: ['DESK', 'CPP'] },
    { id: 'RASPI',name: 'freelance.calc.hardware.raspberryPi', price: 150, allowedTypes: ['DESK', 'CPP'] },
    { id: 'INDUSTRIAL_PC', name: 'freelance.calc.hardware.basicPc', price: 800, allowedTypes: ['DESK', 'CPP'] },
    { id: 'CUSTOM_PC', name: 'freelance.calc.hardware.customPc', price: 1500, allowedTypes: ['DESK', 'CPP'] }
  ] as HardwareItem[]
};