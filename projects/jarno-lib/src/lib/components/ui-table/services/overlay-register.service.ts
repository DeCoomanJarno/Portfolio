import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class OverlayRegisterService {
  private _overlays: Set<() => void> = new Set();

  /** Register a function to close an overlay */
  public register(closeFn: () => void) {
    this._overlays.add(closeFn);
  }

  /** Unregister a function */
  public unregister(closeFn: () => void) {
    this._overlays.delete(closeFn);
  }

  /** Close all registered overlays */
  public closeAll() {
    this._overlays.forEach(fn => fn());
  }
}
