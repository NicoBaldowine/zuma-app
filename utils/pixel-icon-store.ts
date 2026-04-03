let _pixelData: number[][] | null = null;
let _listeners: (() => void)[] = [];

export function setPixelIcon(data: number[][]) {
  _pixelData = data;
  _listeners.forEach((fn) => fn());
}

export function getPixelIcon(): number[][] | null {
  return _pixelData;
}

export function clearPixelIcon() {
  _pixelData = null;
}

export function onPixelIconChange(fn: () => void) {
  _listeners.push(fn);
  return () => {
    _listeners = _listeners.filter((l) => l !== fn);
  };
}

export const GRID_SIZE = 16;

export function createEmptyGrid(): number[][] {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
}
