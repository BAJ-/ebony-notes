export interface KeyNote {
  hex: string;
  note: string;
}

export interface SheetMusicState {
  trebleClef?: boolean;
  bassClef?: boolean;
  notes?: KeyNote[];
}