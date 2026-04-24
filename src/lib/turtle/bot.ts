// Turtle Bot — wrapper around CC:Tweaked turtle API with position tracking,
// fuel management, movement history, and pathfinding.
//
// Ported from atm9-cctweaked with bug fixes and cleaner design.
// Uses navigation.ts for direction math.

import { requireTurtle } from './detect'
import type { Position } from './navigation'
import {
  copyPosition,
  Direction,
  manhattanDistance,
  moveDelta,
  opposite,
  turnLeft,
  turnRight,
} from './navigation'

export type VerticalDir = 'up' | 'down'

interface Movement {
  dir?: Direction
  backward?: boolean
  up?: boolean
  down?: boolean
}

export interface BotOptions {
  position?: Position
  homePosition?: Position
  trackMovement?: boolean
  debug?: boolean
}

class Bot {
  position: Position
  homePosition: Position
  fuelEnabled: boolean
  debug: boolean
  movementTracking: boolean
  movements: Movement[] = []

  private t: Turtle

  constructor(options: BotOptions = {}) {
    this.t = requireTurtle()

    this.position = options.position
      ? copyPosition(options.position)
      : { x: 0, y: 0, z: 0, dir: Direction.North }

    this.homePosition = options.homePosition
      ? copyPosition(options.homePosition)
      : copyPosition(this.position)

    this.fuelEnabled = this.t.getFuelLevel() !== 'unlimited'
    this.debug = options.debug ?? false
    this.movementTracking = options.trackMovement ?? false
  }

  // --- Fuel ---

  getFuelLevel(): number {
    if (!this.fuelEnabled) {
      return 1
    }
    return this.t.getFuelLevel() as number
  }

  getMaxFuelLevel(): number {
    if (!this.fuelEnabled) {
      return 1
    }
    return this.t.getFuelLimit() as number
  }

  needsRefueling(): boolean {
    if (!this.fuelEnabled) {
      return false
    }
    return this.getFuelLevel() === 0
  }

  refuelAll(): void {
    if (!this.fuelEnabled) {
      return
    }

    for (let slot = 1; slot <= 16; slot++) {
      this.t.select(slot)
      const itemCount = this.t.getItemCount()
      if (itemCount > 0) {
        this.t.refuel(itemCount)
      }
    }
    this.t.select(1)
  }

  // --- Logging ---

  private log(msg: string): void {
    if (this.debug) {
      const p = this.position
      print(`[Bot] ${msg} @ ${p.x},${p.y},${p.z} facing ${p.dir}`)
    }
  }

  private trackMove(move: Movement): void {
    if (this.movementTracking) {
      this.movements.push(move)
    }
  }

  // --- Movement ---

  forward(): boolean {
    if (this.fuelEnabled && this.getFuelLevel() === 0) {
      return false
    }

    const [ok] = this.t.forward()
    if (!ok) {
      return false
    }

    const delta = moveDelta(this.position.dir)
    this.position.x += delta.dx
    this.position.y += delta.dy
    this.trackMove({ dir: this.position.dir })
    this.log('forward')
    return true
  }

  back(): boolean {
    if (this.fuelEnabled && this.getFuelLevel() === 0) {
      return false
    }

    const [ok] = this.t.back()
    if (!ok) {
      return false
    }

    const delta = moveDelta(this.position.dir)
    this.position.x -= delta.dx
    this.position.y -= delta.dy
    this.trackMove({ dir: this.position.dir, backward: true })
    this.log('back')
    return true
  }

  up(): boolean {
    if (this.fuelEnabled && this.getFuelLevel() === 0) {
      return false
    }

    const [ok] = this.t.up()
    if (!ok) {
      return false
    }

    this.position.z += 1
    this.trackMove({ up: true })
    this.log('up')
    return true
  }

  down(): boolean {
    if (this.fuelEnabled && this.getFuelLevel() === 0) {
      return false
    }

    const [ok] = this.t.down()
    if (!ok) {
      return false
    }

    this.position.z -= 1
    this.trackMove({ down: true })
    this.log('down')
    return true
  }

  // --- Turning ---

  left(): void {
    this.t.turnLeft()
    this.position.dir = turnLeft(this.position.dir)
  }

  right(): void {
    this.t.turnRight()
    this.position.dir = turnRight(this.position.dir)
  }

  /** Rotate to face the given direction. Returns number of turns taken. */
  rotate(target: Direction): number {
    if (this.position.dir === target) {
      return 0
    }

    // Check if a single left turn gets us there (more efficient)
    if (turnLeft(this.position.dir) === target) {
      this.left()
      return 1
    }

    // Otherwise turn right until we face the target
    let turns = 0
    while (this.position.dir !== target) {
      this.right()
      turns += 1
    }
    return turns
  }

  // --- Digging / Detection / Inspection ---

  dig(dir?: VerticalDir): SuccessOrError {
    if (dir === 'up') {
      return this.t.digUp()
    }
    if (dir === 'down') {
      return this.t.digDown()
    }
    return this.t.dig()
  }

  detect(dir?: VerticalDir): boolean {
    if (dir === 'up') {
      return this.t.detectUp()
    }
    if (dir === 'down') {
      return this.t.detectDown()
    }
    return this.t.detect()
  }

  inspect(
    dir?: VerticalDir
  ): LuaMultiReturn<[true, BlockData]> | LuaMultiReturn<[false, string]> {
    if (dir === 'up') {
      return this.t.inspectUp()
    }
    if (dir === 'down') {
      return this.t.inspectDown()
    }
    return this.t.inspect()
  }

  // --- Inventory ---

  drop(dir?: VerticalDir, count?: number): SuccessOrError {
    if (dir === 'up') {
      return this.t.dropUp(count)
    }
    if (dir === 'down') {
      return this.t.dropDown(count)
    }
    return this.t.drop(count)
  }

  dropAll(dir?: VerticalDir): void {
    for (let slot = 1; slot <= 16; slot++) {
      this.t.select(slot)
      if (this.t.getItemCount() > 0) {
        if (dir === 'up') {
          this.t.dropUp()
        } else if (dir === 'down') {
          this.t.dropDown()
        } else {
          this.t.drop()
        }
      }
    }
    this.t.select(1)
  }

  suck(dir?: VerticalDir, count?: number): SuccessOrError {
    if (dir === 'up') {
      return this.t.suckUp(count)
    }
    if (dir === 'down') {
      return this.t.suckDown(count)
    }
    return this.t.suck(count)
  }

  selectSlot(slot: number): boolean {
    return this.t.select(slot)
  }

  isInventoryFull(): boolean {
    for (let slot = 1; slot <= 16; slot++) {
      if (this.t.getItemCount(slot) === 0) {
        return false
      }
    }
    return true
  }

  // --- Navigation ---

  /** Navigate to a target position. Returns total movements made. */
  goTo(target: Position): number {
    let movements = 0

    // Move on X axis
    while (this.position.x !== target.x) {
      const dir = this.position.x < target.x ? Direction.East : Direction.West
      this.rotate(dir)
      if (!this.forward()) {
        break
      }
      movements += 1
    }

    // Move on Y axis
    while (this.position.y !== target.y) {
      const dir = this.position.y < target.y ? Direction.North : Direction.South
      this.rotate(dir)
      if (!this.forward()) {
        break
      }
      movements += 1
    }

    // Move on Z axis
    while (this.position.z !== target.z) {
      if (this.position.z < target.z) {
        if (!this.up()) {
          break
        }
      } else {
        if (!this.down()) {
          break
        }
      }
      movements += 1
    }

    return movements
  }

  goHome(): number {
    return this.goTo(this.homePosition)
  }

  /** Retrace recorded movements in reverse to return home. */
  backTrackHome(): boolean {
    if (!this.movementTracking) {
      error('Movement tracking is not enabled')
    }

    // Reverse the movements array and replay in opposite
    const reversed = this.movements
    reversed.reverse()

    for (const move of reversed) {
      if (move.up) {
        this.down()
      } else if (move.down) {
        this.up()
      } else if (move.dir !== undefined) {
        // To undo a forward move in direction D, face opposite and go forward
        // To undo a backward move in direction D, face D and go forward
        const faceDir = move.backward ? move.dir : opposite(move.dir)
        this.rotate(faceDir)
        this.forward()
      }
    }

    this.movements = []
    return true
  }

  // --- Distance / Reachability ---

  calculateDistance(target: Position): number {
    return manhattanDistance(this.position, target)
  }

  destinationReachable(target: Position, backtracking = false): boolean {
    const fuel = this.getFuelLevel()
    if (backtracking) {
      return this.movements.length <= fuel
    }
    return this.calculateDistance(target) <= fuel
  }
}

export default Bot
