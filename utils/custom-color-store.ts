let _customColor: string | null = null;
let _listeners: (() => void)[] = [];

export function setCustomColor(hex: string) {
  _customColor = hex;
  _listeners.forEach((fn) => fn());
}

export function getCustomColor(): string | null {
  return _customColor;
}

export function clearCustomColor() {
  _customColor = null;
}

export function onCustomColorChange(fn: () => void) {
  _listeners.push(fn);
  return () => {
    _listeners = _listeners.filter((l) => l !== fn);
  };
}
