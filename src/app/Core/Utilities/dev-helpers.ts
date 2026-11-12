/**
 * Development Utilities and Helpers
 * 
 * This file contains utility functions and constants for developer convenience
 * and code organization across the portfolio application.
 */

// ============================================================================
// ANIMATION TIMING CONSTANTS
// ============================================================================

export const ANIMATION_TIMING = {
  short: 300,      // 300ms - Quick interactions (hover, click)
  medium: 600,     // 600ms - Standard animations
  long: 1000,      // 1s - Page transitions
  veryLong: 1500   // 1.5s - Complex sequences
} as const;

export const EASE_TYPES = {
  smooth: 'power2.inOut',
  fast: 'power2.out',
  slow: 'power2.in',
  bounce: 'back.out',
  elastic: 'elastic.out(1, 0.5)'
} as const;

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const BREAKPOINTS = {
  xs: 480,      // Extra small devices (phones)
  sm: 768,      // Small devices (tablets, larger phones)
  md: 900,      // Medium devices (tablets, small desktops)
  lg: 1280,     // Large devices (desktops)
  xl: 1920      // Extra large devices (large desktops)
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

// ============================================================================
// PRICING CONSTANTS
// ============================================================================

export const PRICING = {
  MIN_PROJECT_PRICE: 1000,    // Minimum starting price
  MIN_SMALL_PROJECT: 1000,    // Small projects: €1K-€2.5K
  MIN_MEDIUM_PROJECT: 2500,   // Medium projects: €2.5K-€5K
  MIN_LARGE_PROJECT: 5000,    // Large projects: €5K+
  
  // Service-specific minimums
  WEB_MIN: 1200,
  DESKTOP_MIN: 1500,
  CPP_MIN: 1800,
  VR_MIN: 2500,
  AI_MIN: 2000
} as const;

// ============================================================================
// FORM VALIDATION HELPERS
// ============================================================================

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates minimum project budget
 */
export function isValidBudget(budget: string | number): boolean {
  const amount = typeof budget === 'string' ? parseFloat(budget) : budget;
  return amount >= PRICING.MIN_PROJECT_PRICE;
}

/**
 * Sanitizes user input for XSS prevention
 */
export function sanitizeInput(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

// ============================================================================
// NAVIGATION HELPERS
// ============================================================================

/**
 * Smooth scroll to element with offset
 * @param elementId - ID of target element
 * @param offset - Offset from top (default: 100px for header)
 */
export function smoothScroll(elementId: string, offset: number = 100): void {
  const element = document.getElementById(elementId);
  if (!element) {
    return;
  }

  const elementPosition = element.getBoundingClientRect().top + window.scrollY;
  const offsetPosition = elementPosition - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
}

/**
 * Scroll to top of page
 */
export function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Get current scroll position
 */
export function getScrollPosition(): number {
  return window.scrollY || window.pageYOffset;
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top < window.innerHeight &&
    rect.bottom > 0 &&
    rect.left < window.innerWidth &&
    rect.right > 0
  );
}

// ============================================================================
// DEVICE DETECTION
// ============================================================================

/**
 * Detect if device is mobile
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Detect if device is tablet
 */
export function isTabletDevice(): boolean {
  return /iPad|Android/.test(navigator.userAgent) && !/iPhone/.test(navigator.userAgent);
}

/**
 * Detect if touch device
 */
export function isTouchDevice(): boolean {
  return (
    (typeof window !== 'undefined' && 'ontouchstart' in window) ||
    (typeof navigator !== 'undefined' && !!navigator.maxTouchPoints)
  );
}

/**
 * Detect current breakpoint
 */
export function getCurrentBreakpoint(): Breakpoint {
  const width = window.innerWidth;
  
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
}

// ============================================================================
// STORAGE HELPERS (localStorage)
// ============================================================================

/**
 * Get value from localStorage with type safety
 */
export function getFromStorage<T>(key: string, defaultValue?: T): T | null {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue ?? null;
    return JSON.parse(item) as T;
  } catch (error) {
    return defaultValue ?? null;
  }
}

/**
 * Set value to localStorage
 */
export function setToStorage<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Remove value from localStorage
 */
export function removeFromStorage(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Clear all localStorage data (use with caution!)
 */
export function clearStorage(): void {
  try {
    localStorage.clear();
  } catch (error) {
    // silently fail
  }
}

// ============================================================================
// FORMATTING HELPERS
// ============================================================================

/**
 * Format number as currency (EUR)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format date in a readable way
 */
export function formatDate(date: Date, locale: string = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

// ============================================================================
// PERFORMANCE HELPERS
// ============================================================================

/**
 * Debounce function calls
 */
/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function throttled(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Measure performance of a function
 */
export function measurePerformance<T>(
  name: string,
  func: () => T
): T {
  const start = performance.now();
  const result = func();
  const end = performance.now();
  return result;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Log error with context
 */
export function logError(context: string, error: Error | unknown): void {
  // No-op in production
}

/**
 * Retry operation with exponential backoff
 */
export async function retryWithExponentialBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let delay = initialDelay;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
  
  throw new Error('Max retries exceeded');
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  ANIMATION_TIMING,
  EASE_TYPES,
  BREAKPOINTS,
  PRICING,
  isValidEmail,
  isValidBudget,
  sanitizeInput,
  smoothScroll,
  scrollToTop,
  getScrollPosition,
  isInViewport,
  isMobileDevice,
  isTabletDevice,
  isTouchDevice,
  getCurrentBreakpoint,
  getFromStorage,
  setToStorage,
  removeFromStorage,
  clearStorage,
  formatCurrency,
  formatDate,
  truncateText,
  throttle,
  measurePerformance,
  logError,
  retryWithExponentialBackoff
};
