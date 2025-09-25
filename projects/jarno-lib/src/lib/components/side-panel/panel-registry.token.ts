// projects/jarno-lib/src/lib/webpage/panel-registry.token.ts
import { InjectionToken, Type } from '@angular/core';

export interface PanelRegistry {
  [id: string]: Type<any>;
}

export const PANEL_REGISTRY = new InjectionToken<PanelRegistry>('PANEL_REGISTRY');