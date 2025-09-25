import { Inject, Injectable, Optional, Type } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute, Params } from '@angular/router';
import { BehaviorSubject, distinctUntilChanged, filter, map, Observable } from 'rxjs';
import { PANEL_REGISTRY, PanelRegistry } from './panel-registry.token';

export interface SidePanelState {
  id: string | null;
  params?: Record<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class SidePanelService {
  private _openSubject = new BehaviorSubject<boolean>(false);
  public open$ = this._openSubject.asObservable().pipe(distinctUntilChanged());

  private _state$ = new BehaviorSubject<SidePanelState>({ id: null, params: {} });
  state$ = this._state$.asObservable();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    @Inject(PANEL_REGISTRY) private registry: PanelRegistry
  ) {
    this.route.queryParams.subscribe((params: Params) => {
      const panelId = params['side-panel'] ?? null;
      const panelParams = { ...params };
      delete panelParams['side-panel'];
      this._state$.next({ id: panelId, params: panelParams });
    });
  }
  param(key: string): Observable<any> {
    return this.state$.pipe(map(state => state.params?.[key]));
  }

  /** Synchronous getter if needed */
  getParamSync(key: string) {
    return this._state$.getValue().params?.[key];
  }

  getComponentType(id: string | null): Type<any> | null {
    return id ? this.registry[id] ?? null : null;
  }

  open(id: string, params?: Record<string, any>) {
    const queryParams: Record<string, any> = { 'side-panel': id, ...params };
    this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'merge' });
  }

  close() {
    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }

  get current(): SidePanelState {
    return this._state$.getValue();
  }
}
