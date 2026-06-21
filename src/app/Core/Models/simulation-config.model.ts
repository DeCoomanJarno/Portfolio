export interface ConfigField<T> {
  value: T;
  type: 'slider' | 'toggle' | 'select';

  min?: number;
  max?: number;
  step?: number;

  options?: { label: string; value: any }[];
}
export type ConfigChange<T> = {
  key: keyof T;
  value: ConfigField<any>;
  full: Record<keyof T, ConfigField<any>>;
};