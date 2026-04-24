// Position tracking and direction math for turtle navigation

export enum Direction {
  North = 'n',
  South = 's',
  East = 'e',
  West = 'w',
}

export interface Position {
  x: number
  y: number
  z: number
  dir: Direction
}

const LEFT_TURN: Record<Direction, Direction> = {
  [Direction.North]: Direction.West,
  [Direction.West]: Direction.South,
  [Direction.South]: Direction.East,
  [Direction.East]: Direction.North,
}

const RIGHT_TURN: Record<Direction, Direction> = {
  [Direction.North]: Direction.East,
  [Direction.East]: Direction.South,
  [Direction.South]: Direction.West,
  [Direction.West]: Direction.North,
}

const OPPOSITE: Record<Direction, Direction> = {
  [Direction.North]: Direction.South,
  [Direction.South]: Direction.North,
  [Direction.East]: Direction.West,
  [Direction.West]: Direction.East,
}

// How x/y change when moving forward in a given direction
const MOVE_DELTA: Record<Direction, { dx: number; dy: number }> = {
  [Direction.North]: { dx: 0, dy: 1 },
  [Direction.South]: { dx: 0, dy: -1 },
  [Direction.East]: { dx: 1, dy: 0 },
  [Direction.West]: { dx: -1, dy: 0 },
}

export function turnLeft(dir: Direction): Direction {
  return LEFT_TURN[dir]
}

export function turnRight(dir: Direction): Direction {
  return RIGHT_TURN[dir]
}

export function opposite(dir: Direction): Direction {
  return OPPOSITE[dir]
}

export function moveDelta(dir: Direction): { dx: number; dy: number } {
  return MOVE_DELTA[dir]
}

export function manhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z)
}

export function copyPosition(pos: Position): Position {
  return { x: pos.x, y: pos.y, z: pos.z, dir: pos.dir }
}
