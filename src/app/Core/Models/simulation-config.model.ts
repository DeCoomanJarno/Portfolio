export interface SimulationConfig {
  rows: number;
  cols: number;
  updateTime: number;
  cellSize: number;
}

export type ConfigOptionType =
  | 'number'
  | 'select'
  | 'checkbox';

export interface ConfigOption {
  key: string;

  label: string;

  type: ConfigOptionType;

  value: any;

  min?: number;
  max?: number;
  step?: number;

  options?: {
    value: any;
    label: string;
  }[];
}

export interface SimulationConfigChange {
  config: SimulationConfig;
  options: ConfigOption[];
}