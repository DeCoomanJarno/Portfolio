import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { animate, style, transition, trigger } from '@angular/animations';
import { Complexity, CONFIG, DbType, ExpertiseID, VRPlatform } from '../../Models/calc-config';

@Component({
  selector: 'ui-project-calculator',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  templateUrl: './calculator.html',
  styleUrl: './calculator.scss',
  animations: [
    trigger('slideUp', [
      transition(':enter', [
        style({ transform: 'translateY(100%)' }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateY(100%)' }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class Calculator {
  readonly config = CONFIG;

  // NEW: Helper array to iterate over keys in the HTML, since config.sizes is now an object
  readonly projectSizes = ['proto', 'mvp', 'production'] as const;
  
  vrPlatformsList: VRPlatform[] = ['quest', 'pico', 'appleVisionPro', 'steamvr'];

  // --- UI STATE ---
  showMobileDetails = signal<boolean>(false);

  toggleMobileDetails() {
    this.showMobileDetails.update(v => !v);
  }

  scrollTo(elementId: string) {
    const el = document.getElementById(elementId);
    if(el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    this.showMobileDetails.set(false);
  }

  // --- STATE SIGNALS ---
  calcType = signal<string>('VR');
  calcSize = signal<string>('mvp');

  // Common Features
  hasDesign = signal<boolean>(false);
  hasBackend = signal<boolean>(false);
  backendComplexity = signal<Complexity>('SIMPLE');
  needsAuth = signal<boolean>(false);
  needsPayments = signal<boolean>(false);
  needsAnalytics = signal<boolean>(false);

  // VR/AR Specific
  vrPlatforms = signal<('quest' | 'pico' | 'appleVisionPro' | 'steamvr')[]>(['quest']);
  vrInteractionType = signal<string>('BASIC');
  vrHasMultiplayer = signal<boolean>(false);
  vrHasVoiceChat = signal<boolean>(false);
  vrGraphicsQuality = signal<string>('LOW');
  vrNeedsCustomShaders = signal<boolean>(false);

  // Web Specific
  webNeedsPWA = signal<boolean>(false);
  webNeedsSSR = signal<boolean>(false);
  webNeedsRealtime = signal<boolean>(false);
  webComplexUI = signal<Complexity>('MEDIUM');
  webNeedsMobile = signal<boolean>(true);
  webNeedsAdmin = signal<boolean>(false);

  // Desktop Specific
  deskNeedsHardwareIO = signal<boolean>(false);
  deskIOComplexity = signal<Complexity>('SIMPLE');
  deskNeedsDatabase = signal<boolean>(false);
  deskDatabaseType = signal<DbType>('SQLITE');
  deskNeedsReporting = signal<boolean>(false);
  deskNeedsInstaller = signal<boolean>(true);

  // C++ Specific
  cppTargetPlatform = signal<string[]>(['WINDOWS']);
  cppNeedsDrivers = signal<boolean>(false);
  cppNeedsRealtime = signal<boolean>(false);
  cppOptimizationLevel = signal<string>('STANDARD');
  cppNeedsThreading = signal<boolean>(false);
  cppNeedsGUI = signal<boolean>(false);

  // Hardware
  needsHardware = signal<boolean>(false);
  hardwareType = signal<string>('');

  // --- HELPERS / CONSTRAINTS ---
  isPrototype = computed(() => this.calcSize() === 'proto');

  // Computed booleans for template disabling
  canEnableBackend = computed(() => !this.isPrototype());
  canEnablePayments = computed(() => !this.isPrototype());
  canEnableAnalytics = computed(() => !this.isPrototype());
  canEnableVRAdvanced = computed(() => !this.isPrototype());
  canSelectMultipleVRPlatforms = computed(() => !this.isPrototype());
  canEnableDeskIO = computed(() => !this.isPrototype());
  canEnableDeskDB = computed(() => !this.isPrototype());
  canEnableCppAdvanced = computed(() => !this.isPrototype());

  availableHardware = computed(() => {
    return this.config.hardware.filter(h =>
      h.allowedTypes.includes(this.calcType() as ExpertiseID)
    );
  });

  // --- ACTIONS ---

  setCalcType(newType: string) {
    const prev = this.calcType();
    if (prev === newType) return;
    this.calcType.set(newType);

    // Reset logic (same as your original code, simplified for brevity here)
    if (newType !== 'VR') {
      this.vrPlatforms.set([]);
      this.vrInteractionType.set('BASIC');
      this.vrHasMultiplayer.set(false);
      this.vrHasVoiceChat.set(false);
      this.vrNeedsCustomShaders.set(false);
    } else if (this.vrPlatforms().length === 0) {
      this.vrPlatforms.set(['quest']);
    }

    if (newType !== 'WEB') {
      this.webNeedsPWA.set(false);
      this.webNeedsSSR.set(false);
      this.webNeedsRealtime.set(false);
      this.webComplexUI.set('MEDIUM');
      this.webNeedsMobile.set(true);
      this.webNeedsAdmin.set(false);
    }

    if (newType !== 'DESK') {
      this.deskNeedsHardwareIO.set(false);
      this.deskIOComplexity.set('SIMPLE');
      this.deskNeedsDatabase.set(false);
      this.deskDatabaseType.set('SQLITE');
      this.deskNeedsReporting.set(false);
      this.deskNeedsInstaller.set(true);
    }

    if (newType !== 'CPP') {
      this.cppTargetPlatform.set(['WINDOWS']);
      this.cppNeedsDrivers.set(false);
      this.cppNeedsRealtime.set(false);
      this.cppOptimizationLevel.set('STANDARD');
      this.cppNeedsThreading.set(false);
      this.cppNeedsGUI.set(false);
    }

    // Hardware check
    const hw = this.config.hardware.find(h => h.id === this.hardwareType());
    if (hw && !hw.allowedTypes.includes(newType as ExpertiseID)) {
      this.hardwareType.set('');
      this.needsHardware.set(false);
    }
  }

  setCalcSize(newSize: string) {
    this.calcSize.set(newSize);
    if (newSize === 'proto') {
      // Logic to disable heavy features
      this.hasBackend.set(false);
      this.needsPayments.set(false);
      this.needsAnalytics.set(false);
      this.needsAuth.set(false);
      
      this.vrHasMultiplayer.set(false);
      this.vrHasVoiceChat.set(false);
      this.vrNeedsCustomShaders.set(false);
      
      this.webNeedsRealtime.set(false);
      this.webNeedsAdmin.set(false);
      this.webNeedsSSR.set(false);
      this.webNeedsPWA.set(false);
      
      this.deskNeedsHardwareIO.set(false);
      this.deskNeedsDatabase.set(false);
      this.deskNeedsReporting.set(false);
      
      this.cppNeedsDrivers.set(false);
      this.cppNeedsRealtime.set(false);
      this.cppNeedsThreading.set(false);
      this.cppNeedsGUI.set(false);

      this.needsHardware.set(false);
      this.hardwareType.set('');
    }
  }

  toggleVRPlatform(platform: VRPlatform) {
    const current = this.vrPlatforms();
    if (this.isPrototype()) {
      if (current.includes(platform)) {
        this.vrPlatforms.set(current.filter(p => p !== platform));
      } else {
        this.vrPlatforms.set([platform]);
      }
      return;
    }
    if (current.includes(platform)) {
      this.vrPlatforms.set(current.filter(p => p !== platform));
    } else {
      this.vrPlatforms.set([...current, platform]);
    }
  }

  toggleCppPlatform(platform: string) {
    const current = this.cppTargetPlatform();
    if (this.isPrototype()) {
      if (current.includes(platform)) this.cppTargetPlatform.set(current.filter(p => p !== platform));
      else this.cppTargetPlatform.set([platform]);
      return;
    }
    if (current.includes(platform)) this.cppTargetPlatform.set(current.filter(p => p !== platform));
    else this.cppTargetPlatform.set([...current, platform]);
  }

  setHardwareType(hwId: string) {
    const hw = this.config.hardware.find(h => h.id === hwId);
    if (!hw) {
      this.hardwareType.set('');
      this.needsHardware.set(false);
      return;
    }
    if (!hw.allowedTypes.includes(this.calcType() as ExpertiseID)) {
      this.hardwareType.set('');
      this.needsHardware.set(false);
      return;
    }
    this.hardwareType.set(hwId);
    this.needsHardware.set(true);
  }

  // --- CALCULATION UPDATES ---

  // UPDATED: Accepts string key and maps to new structure
  getSetupHourRange(sizeKey: string) : number {
    const type = this.calcType();
    const tech = this.config.expertises.find(e => e.id === type);
    
    // cast key to strict type for access
    const key = sizeKey as 'proto' | 'mvp' | 'production';

    if (!tech || !key) return 0;

    // New structure uses sizeMultipliers
    return tech.sizeMultipliers[key];
  }

  estimate = computed(() => {
    const type = this.calcType();
    const sizeKey = this.calcSize() as 'proto' | 'mvp' | 'production';

    const tech = this.config.expertises.find(e => e.id === type);
    // UPDATED: Access size via Dictionary
    const sizeData = this.config.sizes[sizeKey];

    if (!tech || !sizeData) return this.getEmptyEstimate();

    // UPDATED: Start with Base Setup Hours + Size Multiplier
    // Note: Config has both `setupHours` (fixed) and `sizeMultipliers` (range)
    let hoursMin = tech.setupHours + tech.sizeMultipliers[sizeKey];
    let hoursMax = tech.setupHours + tech.sizeMultipliers[sizeKey];

    // Common Features (Uses designHours from config now)
    if (!this.hasDesign()) {
      hoursMin += tech.designHours.min;
      hoursMax += tech.designHours.max;
    }

    if (this.hasBackend()) {
      const complexity = this.config.common.backend[this.backendComplexity()];
      hoursMin += complexity.min;
      hoursMax += complexity.max;
    }

    if (this.needsAuth()) {
      hoursMin += this.config.common.auth.min;
      hoursMax += this.config.common.auth.max;
    }
    if (this.needsPayments()) {
      hoursMin += this.config.common.payments.min;
      hoursMax += this.config.common.payments.max;
    }
    if (this.needsAnalytics()) {
      hoursMin += this.config.common.analytics.min;
      hoursMax += this.config.common.analytics.max;
    }

    // Type-Specific Features
    if (type === 'VR') this.addVRHours(val => { hoursMin += val.min; hoursMax += val.max; });
    else if (type === 'WEB') this.addWebHours(val => { hoursMin += val.min; hoursMax += val.max; });
    else if (type === 'DESK') this.addDeskHours(val => { hoursMin += val.min; hoursMax += val.max; });
    else if (type === 'CPP') this.addCppHours(val => { hoursMin += val.min; hoursMax += val.max; });

    if(hoursMin === hoursMax)
    {
      hoursMax *= 1.25; // add 25 procent if equal
    }
    // Hardware
    const hardware = this.calculateHardwareCost();

    // Rates & Discounts
    const laborMin = Math.round(hoursMin * tech.baseRate);
    const laborMax = Math.round(hoursMax * tech.baseRate);

    const discountPct = sizeData.discountPct; // from object
    const discountMin = Math.round(laborMin * (discountPct / 100));
    const discountMax = Math.round(laborMax * (discountPct / 100));

    const totalMin = laborMin - discountMin + hardware.total;
    const totalMax = laborMax - discountMax + hardware.total;
    // UPDATED: Weeks calculation using new config structure
    return {
      hoursMin: Math.round(hoursMin),
      hoursMax: Math.round(hoursMax),
      baseRate: tech.baseRate,
      discountPct,
      discountMin,
      discountMax,
      hardwarePrice: hardware.price,
      procurementFee: hardware.fee,
      totalMin: Math.round(totalMin),
      totalMax: Math.round(totalMax),
      // Use config.global.weeksDivisor.min / .max
      weeksMin: Math.ceil(hoursMin / this.config.global.weeksDivisor.max), // Max hours per week = min total weeks
      weeksMax: Math.ceil(hoursMax / this.config.global.weeksDivisor.min)
    };
  });

private addVRHours(add: (v: { min: number, max: number }) => void) {
     const c = this.config.vr;
     const platforms = this.vrPlatforms(); 
     if (!platforms.length) return;
    
     let basePlatform = platforms[0];
     let baseRange = c.platformSupportMatrix[basePlatform][basePlatform];
    
     for (const p of platforms) {
       const r = c.platformSupportMatrix[p][p];
       if (r.max > baseRange.max) {
         basePlatform = p;
         baseRange = r;
       }
     }
    
     add(baseRange);
    
     for (const p of platforms) {
       if (p === basePlatform) continue;
       const extra = c.platformSupportMatrix[basePlatform][p];
       add(extra);
     }
    
     const interaction = c.interaction[this.vrInteractionType() as keyof typeof c.interaction];
     add(interaction);
    
     if (this.vrHasMultiplayer()) {
       add(c.multiplayer);
       if (this.vrHasVoiceChat()) add(c.voiceChat);
     }
    
     const graphics = c.graphics[this.vrGraphicsQuality() as keyof typeof c.graphics];
     add(graphics);
    
     if (this.vrNeedsCustomShaders()) add(c.shaders);
  }

  private addWebHours(add: (v: {min: number, max: number}) => void) {
    const c = this.config.web;
    if (this.webNeedsPWA()) add(c.pwa);
    if (this.webNeedsSSR()) add(c.ssr);
    if (this.webNeedsRealtime()) add(c.realtime);
    add(c.ui[this.webComplexUI()]);
    if (this.webNeedsMobile()) add(c.mobile);
    if (this.webNeedsAdmin()) add(c.admin);
  }

  private addDeskHours(add: (v: {min: number, max: number}) => void) {
    const c = this.config.desk;
    if (this.deskNeedsHardwareIO()) add(c.io[this.deskIOComplexity()]);
    if (this.deskNeedsDatabase()) add(c.db[this.deskDatabaseType()]);
    if (this.deskNeedsReporting()) add(c.reporting);
    if (this.deskNeedsInstaller()) add(c.installer);
  }

private addCppHours(add: (v: {min: number, max: number}) => void) {
    const c = this.config.cpp;
    const platformCount = this.cppTargetPlatform().length;
    if (platformCount > 1) {
      const extra = platformCount - 1;
      add({ min: c.platformPerExtra.min * extra, max: c.platformPerExtra.max * extra });
    }
    if (this.cppNeedsDrivers()) add(c.drivers);
    if (this.cppNeedsRealtime()) add(c.realtime);
    add(c.opt[this.cppOptimizationLevel() as keyof typeof c.opt]);
    if (this.cppNeedsThreading()) add(c.threading);
    if (this.cppNeedsGUI()) add(c.gui);
  }

 private calculateHardwareCost() {
    if (!this.needsHardware()) return { price: 0, fee: 0, total: 0 };
    const hwItem = this.config.hardware.find(h => h.id === this.hardwareType());
    const price = hwItem ? hwItem.price : 0;
    const fee = Math.round(price * this.config.global.procurementFeePct);
    return { price, fee, total: price + fee };
  }

  private getEmptyEstimate() {
    return {
      hoursMin: 0, hoursMax: 0, baseRate: 0,
      discountPct: 0, discountMin: 0, discountMax: 0,
      hardwarePrice: 0, procurementFee: 0,
      totalMin: 0, totalMax: 0, weeksMin: 0, weeksMax: 0
    };
  }
}
