// Auto-updater library
// Call checkForUpdates() at the start of any script to keep files current.

import type { ManifestFile } from './manifest'
import {
  buildBaseUrl,
  cacheManifest,
  ensureLualib,
  httpGet,
  loadCachedManifest,
  loadInstalledFiles,
  MANIFEST_URL,
  writeFile,
} from './manifest'

function downloadFile(baseUrl: string, file: ManifestFile): boolean {
  const content = httpGet(baseUrl + file.source)
  if (content === null) {
    return false
  }
  ensureLualib(baseUrl, content)
  return writeFile(file.target, content)
}

export interface UpdateResult {
  updated: boolean
  fromVersion: number
  toVersion: number
  filesUpdated: number
}

function doUpdate(silent: boolean): UpdateResult | null {
  const cached = loadCachedManifest()
  const localVersion = cached?.version ?? 0

  const manifestBody = httpGet(MANIFEST_URL)
  if (manifestBody === null) {
    if (!silent) {
      printError('[updater] Could not reach update server')
    }
    return null
  }

  const remoteManifest = textutils.unserializeJSON(manifestBody) as ReturnType<
    typeof loadCachedManifest
  >
  if (remoteManifest === null) {
    if (!silent) {
      printError('[updater] Failed to parse remote manifest')
    }
    return null
  }

  if (remoteManifest.version <= localVersion) {
    if (!silent) {
      print('[updater] Already up to date')
    }
    return {
      updated: false,
      fromVersion: localVersion,
      toVersion: remoteManifest.version,
      filesUpdated: 0,
    }
  }

  if (!silent) {
    print(
      `[updater] Update available: v${localVersion} -> v${remoteManifest.version}`
    )
  }

  const installed = loadInstalledFiles()
  const baseUrl = buildBaseUrl(remoteManifest.repo)
  let filesUpdated = 0

  for (const name in installed) {
    const file = remoteManifest.files[name]
    if (file === undefined) {
      continue
    }
    if (!silent) {
      print(`[updater] Updating ${name}...`)
    }
    if (downloadFile(baseUrl, file)) {
      filesUpdated += 1
    } else if (!silent) {
      printError(`[updater] Failed to update ${name}`)
    }
  }

  // Cache the new manifest
  cacheManifest(manifestBody)

  if (!silent) {
    print(`[updater] Done, ${filesUpdated} files updated`)
  }

  return {
    updated: true,
    fromVersion: localVersion,
    toVersion: remoteManifest.version,
    filesUpdated,
  }
}

/**
 * Check for updates and download newer versions of all installed files.
 * Call this at the start of your scripts to keep them current.
 * Never throws — logs errors and returns null on failure.
 *
 * @param silent - If true, don't print any status messages (default: false)
 * @returns Update result, or null if the check failed
 */
export function checkForUpdates(silent = false): UpdateResult | null {
  const [ok, result] = (
    pcall as (
      fn: unknown,
      ...args: unknown[]
    ) => LuaMultiReturn<[boolean, unknown]>
  )(doUpdate, silent)
  if (!ok) {
    if (!silent) {
      printError(`[updater] Update check failed: ${result}`)
    }
    return null
  }
  return result as UpdateResult | null
}
