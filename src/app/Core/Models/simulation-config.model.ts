export interface ConfigField<T> {
  value: T;
  type: 'slider' | 'toggle' | 'select';

  descriptionKey?: string;
  labelKey?: string;

  unit?: string;

  min?: number;
  max?: number;
  step?: number;

  options?: { labelKey: string; value: T }[];
}

export interface ConfigAction {
  labelKey: string;
  icon?: string;

  visible?: () => boolean;
  disabled?: () => boolean;

  variant?: 'primary' | 'secondary' | 'danger' | 'warning';

  execute: () => void;
}

export type ConfigChange<T> = {
  key: keyof T;
  value: ConfigField<any>;
  full: Record<keyof T, ConfigField<any>>;
};
