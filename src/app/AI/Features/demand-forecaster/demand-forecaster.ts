import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

type Scenario = 'normal' | 'promotion' | 'seasonal' | 'supplier';
type StockStatus = 'healthy' | 'watch' | 'critical';

type Product = {
  id: string;
  nameKey: string;
  color: string;
  capacity: number;
  stock: number;
  baselineDemand: number;
  leadTime: number;
  orderQuantity: number;
  incoming: number;
  arrivalDay: number | null;
  demandHistory: number[];
  forecastHistory: number[];
  forecast: number;
  reorderPoint: number;
  status: StockStatus;
  fulfilled: number;
  missed: number;
  baselineStock: number;
  baselineIncoming: number;
  baselineArrivalDay: number | null;
  baselineOrders: number;
  aiOrders: number;
  manualOrders: number;
  baselineMissed: number;
};

type Activity = {
  id: number;
  day: number;
  type: 'forecast' | 'order' | 'delivery' | 'risk';
  messageKey: string;
  params: Record<string, string | number>;
};

type ChartPoint = {
  day: number;
  actual: number;
  forecast: number;
  actualHeight: number;
  forecastHeight: number;
};

@Component({
  selector: 'app-demand-forecaster',
  standalone: true,
  imports: [DecimalPipe, TranslateModule],
  templateUrl: './demand-forecaster.html',
  styleUrl: './demand-forecaster.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DemandForecasterComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fixedCadenceDays = 8;
  private timer: ReturnType<typeof setInterval> | null = null;
  private activityId = 0;

  readonly day = signal(1);
  readonly running = signal(false);
  readonly aiEnabled = signal(true);
  readonly speed = signal(700);
  readonly scenario = signal<Scenario>('normal');
  readonly selectedProductId = signal('filters');
  readonly products = signal<Product[]>(this.createProducts());
  readonly activity = signal<Activity[]>([]);

  readonly selectedProduct = computed(() =>
    this.products().find((product) => product.id === this.selectedProductId()) ?? this.products()[0]
  );

  readonly totalStock = computed(() => this.products().reduce((sum, product) => sum + product.stock, 0));
  readonly totalIncoming = computed(() => this.products().reduce((sum, product) => sum + product.incoming, 0));
  readonly criticalCount = computed(() => this.products().filter((product) => product.status === 'critical').length);
  readonly fulfilledOrders = computed(() => this.products().reduce((sum, product) => sum + product.fulfilled, 0));
  readonly missedOrders = computed(() => this.products().reduce((sum, product) => sum + product.missed, 0));
  readonly baselineMissed = computed(() => this.products().reduce((sum, product) => sum + product.baselineMissed, 0));
  readonly baselineOrdersPlaced = computed(() => this.products().reduce((sum, product) => sum + product.baselineOrders, 0));
  readonly adaptiveOrdersPlaced = computed(() => this.products().reduce((sum, product) => sum + product.aiOrders + product.manualOrders, 0));
  readonly serviceLevel = computed(() => {
    const total = this.fulfilledOrders() + this.missedOrders();
    return total === 0 ? 100 : Math.round((this.fulfilledOrders() / total) * 100);
  });
  readonly preventedStockouts = computed(() => Math.max(0, this.baselineMissed() - this.missedOrders()));
  readonly savedValue = computed(() => this.preventedStockouts() * 42);

  readonly chartPoints = computed<ChartPoint[]>(() => {
    const product = this.selectedProduct();
    const history = product.demandHistory.slice(-14);
    const forecastHistory = product.forecastHistory.slice(-14);
    const points = Math.min(history.length, forecastHistory.length);
    const demandSlice = history.slice(-points);
    const forecastSlice = forecastHistory.slice(-points);
    const max = Math.max(1, ...demandSlice, ...forecastSlice);
    const startDay = Math.max(1, this.day() - points + 1);

    return demandSlice.map((actual, index) => ({
      day: startDay + index,
      actual,
      forecast: forecastSlice[index],
      actualHeight: Math.max(8, Math.round((actual / max) * 100)),
      forecastHeight: Math.max(8, Math.round((forecastSlice[index] / max) * 100))
    }));
  });

  readonly nextFixedOrderDay = computed(() => {
    const product = this.selectedProduct();
    const index = this.products().findIndex((item) => item.id === product.id);
    return this.findNextFixedOrderDay(index);
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.stopTimer());
    this.recordActivity('forecast', 'ai.demandForecast.warehouse.activity.started', {});
  }

  toggleRunning(): void {
    this.running.update((running) => !running);
    if (this.running()) {
      this.startTimer();
    } else {
      this.stopTimer();
    }
  }

  toggleAi(): void {
    this.aiEnabled.update((enabled) => !enabled);
    this.recordActivity(
      'forecast',
      this.aiEnabled()
        ? 'ai.demandForecast.warehouse.activity.aiEnabled'
        : 'ai.demandForecast.warehouse.activity.aiDisabled',
      {}
    );
  }

  setSpeed(event: Event): void {
    this.speed.set(Number((event.target as HTMLSelectElement).value));
    if (this.running()) this.startTimer();
  }

  setScenario(scenario: Scenario): void {
    this.scenario.set(scenario);
    this.recordActivity('risk', `ai.demandForecast.warehouse.activity.scenario.${scenario}`, {});
  }

  selectProduct(id: string): void {
    this.selectedProductId.set(id);
  }

  stepDay(): void {
    const nextDay = this.day() + 1;
    const scenario = this.scenario();

    this.day.set(nextDay);

    this.products.update((products) =>
      products.map((product, index) => this.simulateProduct(product, index, nextDay, scenario))
    );
  }

  reset(): void {
    this.stopTimer();
    this.running.set(false);
    this.day.set(1);
    this.scenario.set('normal');
    this.products.set(this.createProducts());
    this.activity.set([]);
    this.recordActivity('forecast', 'ai.demandForecast.warehouse.activity.started', {});
  }

  private startTimer(): void {
    this.stopTimer();
    this.timer = setInterval(() => this.stepDay(), this.speed());
  }

  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private simulateProduct(product: Product, index: number, day: number, scenario: Scenario): Product {
    let stock = product.stock;
    let incoming = product.incoming;
    let arrivalDay = product.arrivalDay;
    let fulfilled = product.fulfilled;
    let missed = product.missed;
    let baselineStock = product.baselineStock;
    let baselineIncoming = product.baselineIncoming;
    let baselineArrivalDay = product.baselineArrivalDay;
    let baselineOrders = product.baselineOrders;
    let aiOrders = product.aiOrders;
    let manualOrders = product.manualOrders;
    let baselineMissed = product.baselineMissed;

    if (arrivalDay !== null && arrivalDay <= day) {
      stock = Math.min(product.capacity, stock + incoming);
      this.recordActivity('delivery', 'ai.demandForecast.warehouse.activity.delivery', {
        product: product.id,
        quantity: incoming
      });
      incoming = 0;
      arrivalDay = null;
    }

    const demand = this.generateDemand(product, index, day, scenario);
    const served = Math.min(stock, demand);
    stock -= served;
    fulfilled += served;
    missed += demand - served;

    const baselineServed = Math.min(baselineStock, demand);
    baselineStock -= baselineServed;
    baselineMissed += demand - baselineServed;

    const effectiveLeadTime = product.leadTime + (scenario === 'supplier' ? 3 : 0);

    if (baselineArrivalDay !== null && baselineArrivalDay <= day) {
      baselineStock = Math.min(product.capacity, baselineStock + baselineIncoming);
      baselineIncoming = 0;
      baselineArrivalDay = null;
    }

    if ((day + index) % this.fixedCadenceDays === 0 && baselineIncoming === 0) {
      baselineIncoming = Math.min(product.orderQuantity, product.capacity - baselineStock);
      baselineArrivalDay = day + effectiveLeadTime;
      baselineOrders += 1;
    }

    const demandHistory = [...product.demandHistory, demand].slice(-30);
    const forecast = this.calculateForecast(demandHistory, day, scenario);
    const safetyFactor = scenario === 'promotion' || scenario === 'seasonal' ? 1.45 : scenario === 'supplier' ? 1.7 : 1.25;
    const reorderPoint = Math.ceil(forecast * effectiveLeadTime * safetyFactor);
    const forecastHistory = [...product.forecastHistory, forecast].slice(-30);

    if (this.aiEnabled() && stock <= reorderPoint && incoming === 0) {
      incoming = Math.min(product.orderQuantity, product.capacity - stock);
      arrivalDay = day + effectiveLeadTime;
      aiOrders += 1;
      this.recordActivity('order', 'ai.demandForecast.warehouse.activity.order', {
        product: product.id,
        quantity: incoming,
        arrival: arrivalDay
      });
    }

    if (!this.aiEnabled() && (day + index) % this.fixedCadenceDays === 0 && incoming === 0) {
      incoming = Math.min(product.orderQuantity, product.capacity - stock);
      arrivalDay = day + effectiveLeadTime;
      manualOrders += 1;
      this.recordActivity('order', 'ai.demandForecast.warehouse.activity.manualOrder', {
        product: product.id,
        quantity: incoming,
        arrival: arrivalDay
      });
    }

    const status: StockStatus = stock <= forecast * 2 ? 'critical' : stock <= reorderPoint ? 'watch' : 'healthy';
    if (status === 'critical' && product.status !== 'critical') {
      this.recordActivity('risk', 'ai.demandForecast.warehouse.activity.risk', { product: product.id });
    }

    return {
      ...product,
      stock,
      incoming,
      arrivalDay,
      demandHistory,
      forecastHistory,
      forecast,
      reorderPoint,
      status,
      fulfilled,
      missed,
      baselineStock,
      baselineIncoming,
      baselineArrivalDay,
      baselineOrders,
      aiOrders,
      manualOrders,
      baselineMissed
    };
  }

  private generateDemand(product: Product, index: number, day: number, scenario: Scenario): number {
    const wave = Math.sin((day + index * 2) * 0.62) * product.baselineDemand * 0.22;
    const weekly = day % 7 === 5 || day % 7 === 6 ? product.baselineDemand * 0.18 : 0;
    let multiplier = 1;

    if (scenario === 'promotion') multiplier = day % 9 >= 3 && day % 9 <= 6 ? 1.75 : 1.15;
    if (scenario === 'seasonal') multiplier = 1 + Math.min(0.7, day * 0.018);
    if (scenario === 'supplier') multiplier = 1.08;

    const deterministicNoise = ((day * 17 + index * 29) % 9) - 4;
    return Math.max(1, Math.round((product.baselineDemand + wave + weekly + deterministicNoise) * multiplier));
  }

  private calculateForecast(history: number[], day: number, scenario: Scenario): number {
    const recent = history.slice(-7);
    const previous = history.slice(-14, -7);
    const recentAverage = recent.reduce((sum, value) => sum + value, 0) / Math.max(1, recent.length);
    const previousAverage = previous.reduce((sum, value) => sum + value, 0) / Math.max(1, previous.length);
    const trend = previous.length ? (recentAverage - previousAverage) * 0.6 : 0;
    const scenarioLift = scenario === 'promotion' ? 1.22 : scenario === 'seasonal' ? 1 + Math.min(0.35, day * 0.009) : 1;
    return Math.max(1, Math.round((recentAverage + trend) * scenarioLift));
  }

  private findNextFixedOrderDay(index: number): number {
    const day = this.day();
    let next = day + 1;
    while ((next + Math.max(0, index)) % this.fixedCadenceDays !== 0) {
      next += 1;
    }
    return next;
  }

  private recordActivity(
    type: Activity['type'],
    messageKey: string,
    params: Record<string, string | number>
  ): void {
    this.activityId += 1;
    this.activity.update((activity) => [
      { id: this.activityId, day: this.day(), type, messageKey, params },
      ...activity
    ].slice(0, 12));
  }

  private createProducts(): Product[] {
    const definitions = [
      { id: 'filters', nameKey: 'ai.demandForecast.warehouse.products.filters', color: '#2f80ed', capacity: 520, stock: 390, baselineDemand: 24, leadTime: 4, orderQuantity: 300 },
      { id: 'bearings', nameKey: 'ai.demandForecast.warehouse.products.bearings', color: '#15a36d', capacity: 420, stock: 285, baselineDemand: 18, leadTime: 6, orderQuantity: 260 },
      { id: 'sensors', nameKey: 'ai.demandForecast.warehouse.products.sensors', color: '#d88918', capacity: 310, stock: 210, baselineDemand: 13, leadTime: 8, orderQuantity: 190 },
      { id: 'belts', nameKey: 'ai.demandForecast.warehouse.products.belts', color: '#d94f70', capacity: 360, stock: 270, baselineDemand: 16, leadTime: 5, orderQuantity: 220 },
      { id: 'valves', nameKey: 'ai.demandForecast.warehouse.products.valves', color: '#7b61c9', capacity: 280, stock: 190, baselineDemand: 11, leadTime: 9, orderQuantity: 175 },
      { id: 'motors', nameKey: 'ai.demandForecast.warehouse.products.motors', color: '#168c9e', capacity: 220, stock: 160, baselineDemand: 8, leadTime: 10, orderQuantity: 130 }
    ];

    return definitions.map((definition, index) => {
      const history = Array.from({ length: 14 }, (_, day) =>
        Math.max(1, Math.round(definition.baselineDemand + Math.sin((day + index) * 0.7) * 4 + ((day * 11 + index) % 5) - 2))
      );
      const initialDemand = history[history.length - 1];
      const seedHistory = [initialDemand];
      const forecast = this.calculateForecast(seedHistory, 1, 'normal');
      return {
        ...definition,
        incoming: 0,
        arrivalDay: null,
        demandHistory: seedHistory,
        forecastHistory: [forecast],
        forecast,
        reorderPoint: Math.ceil(forecast * definition.leadTime * 1.25),
        status: 'healthy' as StockStatus,
        fulfilled: 0,
        missed: 0,
        baselineStock: definition.stock,
        baselineIncoming: 0,
        baselineArrivalDay: null,
        baselineOrders: 0,
        aiOrders: 0,
        manualOrders: 0,
        baselineMissed: 0
      };
    });
  }
}
