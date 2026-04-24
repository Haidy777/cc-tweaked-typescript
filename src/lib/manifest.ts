// Shared types, constants, and utilities for the manifest/installer system.
// Note: installer.ts does NOT import this — it must stay self-contained.
// This lib is for updater.ts and any other scripts that need manifest access.

export const MANIFEST_URL =
  'https://raw.githubusercontent.com/Haidy777/cc-tweaked-typescript/refs/heads/main/manifest.json'
export const LOCAL_MANIFEST_PATH = '/.installer-manifest.json'
export const INSTALLED_PATH = '/.installed.json'

export interface ManifestRepo {
  owner: string
  name: string
  branch: string
}

export interface ManifestFile {
  description: string
  type: string
  source: string
  target: string
}

export interface Manifest {
  version: number
  repo: ManifestRepo
  files: Record<string, ManifestFile>
}

export function httpGet(url: string): string | null {
  const [response] = http.get(url)
  if (response === undefined) {
    return null
  }
  const body = response.readAll()
  response.close()
  return body
}

export function readFile(path: string): string | null {
  if (!fs.exists(path)) {
    return null
  }
  const [handle] = fs.open(path, 'r')
  if (handle === null) {
    return null
  }
  const content = handle.readAll()
  handle.close()
  return content
}

export function writeFile(path: string, content: string): boolean {
  const dir = fs.getDir(path)
  if (dir !== '' && !fs.exists(dir)) {
    fs.makeDir(dir)
  }
  const [handle] = fs.open(path, 'w')
  if (handle === null) {
    return false
  }
  handle.write(content)
  handle.close()
  return true
}

export function buildBaseUrl(repo: ManifestRepo): string {
  return `https://raw.githubusercontent.com/${repo.owner}/${repo.name}/refs/heads/${repo.branch}/`
}

export function loadInstalledFiles(): Record<string, boolean> {
  const body = readFile(INSTALLED_PATH)
  if (body === null) {
    return {}
  }
  const data = textutils.unserializeJSON(body) as Record<string, boolean> | null
  if (data === null) {
    return {}
  }
  return data
}

export function saveInstalledFiles(installed: Record<string, boolean>): void {
  const json = textutils.serializeJSON(installed)
  writeFile(INSTALLED_PATH, json)
}

export function fetchManifest(url: string = MANIFEST_URL): Manifest | null {
  const body = httpGet(url)
  if (body === null) {
    return null
  }
  return textutils.unserializeJSON(body) as Manifest | null
}

export function loadCachedManifest(): Manifest | null {
  const body = readFile(LOCAL_MANIFEST_PATH)
  if (body === null) {
    return null
  }
  return textutils.unserializeJSON(body) as Manifest | null
}

export function cacheManifest(manifestBody: string): void {
  writeFile(LOCAL_MANIFEST_PATH, manifestBody)
}

export function ensureLualib(baseUrl: string, content: string): void {
  if (string.find(content, 'lualib_bundle', 1, true)[0] !== undefined) {
    if (!fs.exists('lualib_bundle.lua')) {
      const libContent = httpGet(`${baseUrl}build/lualib_bundle.lua`)
      if (libContent !== null) {
        writeFile('lualib_bundle.lua', libContent)
      }
    }
  }
}
