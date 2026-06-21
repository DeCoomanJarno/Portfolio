import { CommonModule } from "@angular/common";
import { Component, Input, Output, EventEmitter } from "@angular/core";
import { ConfigChange, ConfigField } from "../../Models/simulation-config.model";

@Component({
  selector: 'app-game-config',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-config.html',
  styleUrls: ['./game-config.scss']
})
export class GameConfigComponent<T extends object> {
  @Input({ required: true })
  config!: Record<keyof T, ConfigField<any>>;

  @Output()
  configChange = new EventEmitter<ConfigChange<T>>();  
  
update(key: string, value: any): void {
  const field = this.config[key as keyof T];
  if (!field) return;

  const parsed = this.cast(value);

  const updatedField: ConfigField<any> = {
    ...field,
    value: parsed
  };

  this.config = {
    ...this.config,
    [key]: updatedField
  };

  this.configChange.emit({
    key: key as keyof T,
    value: updatedField,
    full: this.config
  });
}
  private cast(value: any): any {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value !== '' && !isNaN(value)) return Number(value);
    return value;
  }
}