export enum IconSeverity {
    Error = 'error',
    Warning = 'warning',
    Info = 'info',
}

export enum SnackbarSeverity {
    Error = 'error',
    Warning = 'warning',
    Info = 'info',
    Success = 'success'
}
export type TitleSeverity = 'success' | 'warning' | 'error';

export type StateSeverity =
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'unavailable'
  | 'removed'
  | 'accent'
  | 'primary'
  | 'bodytext'
  | 'idle';
