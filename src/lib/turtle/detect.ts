// Detection utilities for CC:Tweaked computers and turtles

export type PeripheralSide =
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'front'
  | 'back'

export interface TurtleInfo {
  id: number
  label: string | null
  fuelLevel: number | 'unlimited'
  fuelLimit: number | 'unlimited'
  fuelEnabled: boolean
  selectedSlot: number
  leftUpgrade: string | null
  rightUpgrade: string | null
}

export function isTurtle(): boolean {
  return turtle !== undefined
}

export function requireTurtle(): Turtle {
  if (turtle === undefined) {
    error('This program requires a turtle')
  }
  return turtle
}

function getUpgradeType(side: string): string | null {
  const types = peripheral.getType(side)
  if (types === undefined) {
    return null
  }
  return types[0] ?? null
}

export function getTurtleInfo(): TurtleInfo | null {
  if (turtle === undefined) {
    return null
  }

  const fuelLevel = turtle.getFuelLevel()
  const fuelLimit = turtle.getFuelLimit()

  return {
    id: os.getComputerID(),
    label: os.getComputerLabel() ?? null,
    fuelLevel,
    fuelLimit,
    fuelEnabled: fuelLevel !== 'unlimited',
    selectedSlot: turtle.getSelectedSlot(),
    leftUpgrade: getUpgradeType('left'),
    rightUpgrade: getUpgradeType('right'),
  }
}

export function printTurtleInfo(): void {
  const info = getTurtleInfo()
  if (info === null) {
    print('Not a turtle')
    return
  }

  print(`Turtle #${info.id}`)
  if (info.label !== null) {
    print(`  Label: ${info.label}`)
  }
  if (info.fuelEnabled) {
    print(`  Fuel: ${info.fuelLevel}/${info.fuelLimit}`)
  } else {
    print('  Fuel: unlimited')
  }
  print(`  Selected slot: ${info.selectedSlot}`)
  if (info.leftUpgrade !== null) {
    print(`  Left upgrade: ${info.leftUpgrade}`)
  }
  if (info.rightUpgrade !== null) {
    print(`  Right upgrade: ${info.rightUpgrade}`)
  }
}
