/**
 * Type declarations for CC:Tweaked APIs missing from computercraft-types.
 * Covers: fs, textutils, shell, and Response augmentation.
 *
 * @see https://tweaked.cc/
 */

// --- Lua builtins ---

declare function error(message: string, level?: number): never
declare function assert<T>(
  value: T,
  message?: string
): asserts value is NonNullable<T>
declare function type(
  value: unknown
):
  | 'nil'
  | 'number'
  | 'string'
  | 'boolean'
  | 'table'
  | 'function'
  | 'thread'
  | 'userdata'
declare function tostring(value: unknown): string
declare function tonumber(value: unknown, base?: number): number | undefined
declare function pcall<T extends unknown[]>(
  fn: (...args: unknown[]) => LuaMultiReturn<T>,
  ...args: unknown[]
): LuaMultiReturn<[true, ...T]> | LuaMultiReturn<[false, string]>
declare function pairs<K extends string, V>(
  t: Record<K, V>
): LuaIterable<LuaMultiReturn<[K, V]>>
declare function ipairs<V>(t: V[]): LuaIterable<LuaMultiReturn<[number, V]>>
declare function rawget<T>(t: Record<string, T>, k: string): T | undefined
declare function rawset<T>(t: Record<string, T>, k: string, v: T): void
declare function select<T>(index: number, ...args: T[]): T
declare function select(...args: unknown[]): number
declare function unpack<T>(
  list: T[],
  i?: number,
  j?: number
): LuaMultiReturn<T[]>

// --- Lua string library ---
// @see https://www.lua.org/manual/5.1/manual.html#5.4

/** @noSelf */
declare namespace string {
  function find(
    s: string,
    pattern: string,
    init?: number,
    plain?: boolean
  ): LuaMultiReturn<[number, number, ...string[]]> | LuaMultiReturn<[undefined]>
  function format(fmt: string, ...args: unknown[]): string
  function gmatch(s: string, pattern: string): () => LuaMultiReturn<string[]>
  function gsub(
    s: string,
    pattern: string,
    repl: string | ((...captures: string[]) => string),
    n?: number
  ): LuaMultiReturn<[string, number]>
  function len(s: string): number
  function lower(s: string): string
  function upper(s: string): string
  function match(
    s: string,
    pattern: string,
    init?: number
  ): LuaMultiReturn<string[]> | undefined
  function rep(s: string, n: number): string
  function reverse(s: string): string
  function sub(s: string, i: number, j?: number): string
}

// --- HTTP / Response augmentation ---
// computercraft-types declares HTTP and Response but:
// - HTTP interface is missing @noSelf (generates colon syntax in Lua)
// - Response is missing file handle methods (readAll, close, etc.)

// Workaround: computercraft-types HTTP interface lacks @noSelf,
// causing tstl to generate http:get() (colon) instead of http.get() (dot).
// We declare standalone functions that compile to dot syntax.
/** @noSelf */
declare namespace http {
  function get(
    url: string,
    headers?: HTTPHeaders,
    binary?: boolean
  ): ResponseOrFail
  function get(request: HTTPRequestOptions): ResponseOrFail
  function post(
    url: string,
    body: string,
    headers?: HTTPHeaders,
    binary?: boolean
  ): ResponseOrFail
  function post(request: HTTPRequestOptions): ResponseOrFail
  function checkURL(
    url: string
  ): LuaMultiReturn<[true, undefined]> | LuaMultiReturn<[false, string]>
}

/** @noSelf */
declare interface Response {
  readAll(): string | null
  readLine(withTrailing?: boolean): string | null
  read(count?: number): string | null
  close(): void
}

// --- File System ---
// @see https://tweaked.cc/module/fs.html

/** @noSelf */
declare interface ReadHandle {
  readAll(): string | null
  readLine(withTrailing?: boolean): string | null
  read(count?: number): string | null
  close(): void
}

/** @noSelf */
declare interface WriteHandle {
  write(text: string): void
  writeLine(text: string): void
  flush(): void
  close(): void
}

/** @noSelf */
declare interface BinaryReadHandle {
  read(count?: number): number | string | null
  readAll(): string | null
  readLine(withTrailing?: boolean): string | null
  close(): void
  seek(whence?: string, offset?: number): number
}

/** @noSelf */
declare interface BinaryWriteHandle {
  write(value: number | string): void
  flush(): void
  close(): void
  seek(whence?: string, offset?: number): number
}

/** @noSelf */
declare namespace fs {
  function open(
    path: string,
    mode: 'r'
  ): LuaMultiReturn<[ReadHandle, undefined]> | LuaMultiReturn<[null, string]>
  function open(
    path: string,
    mode: 'w' | 'a'
  ): LuaMultiReturn<[WriteHandle, undefined]> | LuaMultiReturn<[null, string]>
  function open(
    path: string,
    mode: 'rb'
  ):
    | LuaMultiReturn<[BinaryReadHandle, undefined]>
    | LuaMultiReturn<[null, string]>
  function open(
    path: string,
    mode: 'wb' | 'ab'
  ):
    | LuaMultiReturn<[BinaryWriteHandle, undefined]>
    | LuaMultiReturn<[null, string]>

  function exists(path: string): boolean
  function isDir(path: string): boolean
  function isReadOnly(path: string): boolean
  function makeDir(path: string): void
  function list(path: string): string[]
  function getName(path: string): string
  function getDir(path: string): string
  function getSize(path: string): number
  function getFreeSpace(path: string): number
  function getDrive(path: string): string | null
  function combine(base: string, ...parts: string[]): string
  function move(from: string, to: string): void
  function copy(from: string, to: string): void

  /** @customName delete */
  function delete_(path: string): void

  function find(pattern: string): string[]
  function complete(
    partial: string,
    path: string,
    includeFiles?: boolean,
    includeDirs?: boolean
  ): string[]
  function isDriveRoot(path: string): boolean
  function getCapacity(path: string): number | null
  function attributes(path: string): {
    size: number
    isDir: boolean
    isReadOnly: boolean
    created: number
    modified: number
  }
}

// --- Text Utilities ---
// @see https://tweaked.cc/module/textutils.html

/** @noSelf */
declare namespace textutils {
  function serialize(
    value: unknown,
    options?: { compact?: boolean; allow_repetitions?: boolean }
  ): string
  function serialise(
    value: unknown,
    options?: { compact?: boolean; allow_repetitions?: boolean }
  ): string

  function unserialize(s: string): unknown
  function unserialise(s: string): unknown

  function serializeJSON(value: unknown, nbtStyle?: boolean): string
  function serialiseJSON(value: unknown, nbtStyle?: boolean): string

  function unserializeJSON(
    s: string,
    options?: { nbt_style?: boolean; parse_null?: boolean }
  ): unknown
  function unserialiseJSON(
    s: string,
    options?: { nbt_style?: boolean; parse_null?: boolean }
  ): unknown

  function formatTime(time: number, twentyFourHour?: boolean): string

  function tabulate(...args: (Record<string, unknown>[] | number)[]): void

  function pagedTabulate(...args: (Record<string, unknown>[] | number)[]): void

  function slowWrite(text: string, rate?: number): void
  function slowPrint(text: string, rate?: number): void

  function complete(searchText: string, searchTable?: string[]): string[]

  const empty_json_array: symbol
  const json_null: symbol
}

// --- Shell ---
// @see https://tweaked.cc/module/shell.html

/** @noSelf */
declare namespace shell {
  function run(command: string, ...args: string[]): boolean
  function execute(command: string, ...args: string[]): boolean
  function exit(): void

  function dir(): string
  function setDir(path: string): void

  function path(): string
  function setPath(path: string): void

  function resolve(path: string): string
  function resolveProgram(name: string): string | null

  function aliases(): Record<string, string>
  function setAlias(alias: string, program: string): void
  function clearAlias(alias: string): void

  function programs(showHidden?: boolean): string[]
  function getRunningProgram(): string

  function complete(prefix: string): string[]
  function completeProgram(prefix: string): string[]

  function openTab(command: string, ...args: string[]): number
  function switchTab(tabId: number): void
}

// --- Keys ---
// @see https://tweaked.cc/module/keys.html

/** @noSelf */
declare namespace keys {
  function getName(key: number): string | null

  const space: number
  const enter: number
  const tab: number
  const backspace: number
  const up: number
  const down: number
  const left: number
  const right: number

  const a: number
  const b: number
  const c: number
  const d: number
  const e: number
  const f: number
  const g: number
  const h: number
  const i: number
  const j: number
  const k: number
  const l: number
  const m: number
  const n: number
  const o: number
  const p: number
  const q: number
  const r: number
  const s: number
  const t: number
  const u: number
  const v: number
  const w: number
  const x: number
  const y: number
  const z: number

  const zero: number
  const one: number
  const two: number
  const three: number
  const four: number
  const five: number
  const six: number
  const seven: number
  const eight: number
  const nine: number

  const leftCtrl: number
  const rightCtrl: number
  const leftShift: number
  const rightShift: number
  const leftAlt: number
  const rightAlt: number

  const f1: number
  const f2: number
  const f3: number
  const f4: number
  const f5: number
  const f6: number
  const f7: number
  const f8: number
  const f9: number
  const f10: number
  const f11: number
  const f12: number

  const delete_: number
  const insert: number
  const home: number

  const numPad0: number
  const numPad1: number
  const numPad2: number
  const numPad3: number
  const numPad4: number
  const numPad5: number
  const numPad6: number
  const numPad7: number
  const numPad8: number
  const numPad9: number
}

// --- Settings ---
// @see https://tweaked.cc/module/settings.html

/** @noSelf */
declare namespace settings {
  function define(
    name: string,
    options?: {
      description?: string
      default?: unknown
      type?: string
    }
  ): void
  function undefine(name: string): void
  function set(name: string, value: unknown): void
  function get(name: string, defaultValue?: unknown): unknown
  function getDetails(name: string): {
    description?: string
    default?: unknown
    type?: string
    value?: unknown
    changed?: boolean
  }
  function unset(name: string): void
  function clear(): void
  function getNames(): string[]
  function load(path?: string): boolean
  function save(path?: string): boolean
}
