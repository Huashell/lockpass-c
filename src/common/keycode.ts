export enum KEY_MAP {
  commandorcontrol = 'ctrl',
  ctrl = 'ctrl',
  control = 'ctrl',
  shift = 'shift',
  alt = 'alt',
  meta = 'meta',
  space = 'space',
  capsLock = 'capslock',
  esc = 'esc',
  escape = 'esc',
  backspace = 'backspace',
  enter = 'enter',
  arrowleft = 'left',
  left = 'left',
  arrowright = 'right',
  right = 'right',
  arrowup = 'up',
  up = 'up',
  down = 'down',
  arrowdown = 'down'
}

export interface PlatformKeyDisplay {
  ctrl: string
  shift: string
  alt: string
}

export function getPlatformKeyDisplay(platform?: string): PlatformKeyDisplay {
  const isMac = platform
    ? platform === 'darwin'
    : typeof window !== 'undefined' && window.electron?.process?.platform === 'darwin'
  if (isMac) {
    return { ctrl: 'Cmd', shift: 'Shift', alt: 'Opt' }
  }
  return { ctrl: 'Ctrl', shift: 'Shift', alt: 'Alt' }
}

export function isMacPlatform(): boolean {
  if (typeof window !== 'undefined' && window.electron?.process?.platform) {
    return window.electron.process.platform === 'darwin'
  }
  if (typeof process !== 'undefined') {
    return process.platform === 'darwin'
  }
  return false
}

export enum ControlKey {
  control = 'commandorcontrol',
  ctrl = 'ctrl',
  shift = 'shift',
  alt = 'alt',
  meta = 'meta',
  space = 'space'
}

export function GetTrueKey(event: KeyboardEvent) {
  const key = event.key.toLowerCase()
  if (event.code.toLowerCase() == 'space') return KEY_MAP.space
  if (KEY_MAP[key]) {
    return KEY_MAP[key]
  }
  return key
}

export function IsControlKey(key_src: string) {
  const key = key_src.toLowerCase()
  return key in ControlKey
}

export const KEY_CODE = {
  8: 'backspace',
  9: 'tab',
  13: 'enter',
  16: 'shift',
  17: 'ctrl',
  18: 'alt',
  20: 'capslock',
  27: 'esc',
  32: 'space',
  33: 'pageup',
  34: 'pagedown',
  35: 'end',
  36: 'home',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  45: 'ins',
  46: 'del',
  91: 'meta',
  93: 'meta',
  224: 'meta',
  106: '*',
  107: '+',
  109: '-',
  110: '.',
  111: '/',
  186: ';',
  187: '=',
  188: ',',
  189: '-',
  190: '.',
  191: '/',
  192: '`',
  219: '[',
  220: '\\',
  221: ']',
  222: "'"
}
