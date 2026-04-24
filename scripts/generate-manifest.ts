import {
  readFileSync,
  writeFileSync,
  readdirSync,
  existsSync,
  statSync,
} from 'node:fs'
import { join, relative, posix } from 'node:path'

const BUILD_DIR = 'build'
const MANIFEST_PATH = 'manifest.json'
const LUALIB_BUNDLE = 'lualib_bundle.lua'
const EXCLUDE = [LUALIB_BUNDLE]

interface ManifestFile {
  description: string
  type: string
  source: string
  target: string
}

interface Manifest {
  version: number
  repo: {
    owner: string
    name: string
    branch: string
  }
  files: Record<string, ManifestFile>
}

function scanDir(
  dir: string,
  type: string
): Array<{ name: string; entry: ManifestFile }> {
  const fullPath = join(BUILD_DIR, dir)
  if (!existsSync(fullPath)) return []

  const results: Array<{ name: string; entry: ManifestFile }> = []
  scanDirRecursive(fullPath, dir, type, results)
  return results
}

function scanDirRecursive(
  absDir: string,
  relDir: string,
  type: string,
  results: Array<{ name: string; entry: ManifestFile }>
): void {
  for (const entry of readdirSync(absDir)) {
    const absPath = join(absDir, entry)
    if (statSync(absPath).isDirectory()) {
      scanDirRecursive(absPath, `${relDir}/${entry}`, type, results)
      continue
    }
    if (!entry.endsWith('.lua') || EXCLUDE.includes(entry)) continue

    // Build a manifest name from the relative path within the category dir
    // e.g. build/scripts/turtle/miner.lua → "turtle/miner"
    const relPath = relative(join(BUILD_DIR, type === 'lib' ? 'lib' : 'scripts'), absPath)
    const name = relPath.replace(/\.lua$/, '').split('/').join('/')

    // Target path on the CC computer preserves subdirectory structure
    const target = type === 'lib'
      ? posix.join('lib', relPath)
      : name

    results.push({
      name,
      entry: {
        description: '',
        type,
        source: `${BUILD_DIR}/${relDir}/${entry}`,
        target,
      },
    })
  }
}

// Load existing manifest to preserve descriptions
let existing: Manifest = {
  version: 1,
  repo: {
    owner: 'Haidy777',
    name: 'cc-tweaked-typescript',
    branch: 'main',
  },
  files: {},
}
if (existsSync(MANIFEST_PATH)) {
  try {
    existing = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'))
  } catch {
    // ignore parse errors, start fresh
  }
}

// Scan build output
const libs = scanDir('lib', 'lib')
const scripts = scanDir('scripts', 'script')

// Mark installer as system type
for (const s of scripts) {
  if (s.name === 'installer') {
    s.entry.type = 'system'
  }
}

// Include lualib_bundle if it exists in build output
const lualibPath = join(BUILD_DIR, LUALIB_BUNDLE)
const hasLualib = existsSync(lualibPath)

// Merge: new files get added, existing descriptions are preserved
const files: Record<string, ManifestFile> = {}

if (hasLualib) {
  const prev = existing.files?.['lualib_bundle']
  files['lualib_bundle'] = {
    description: prev?.description || 'TypeScript runtime polyfills (auto-installed when needed)',
    type: 'system',
    source: `${BUILD_DIR}/${LUALIB_BUNDLE}`,
    target: LUALIB_BUNDLE,
  }
}

for (const { name, entry } of [...libs, ...scripts]) {
  const prev = existing.files?.[name]
  files[name] = {
    ...entry,
    description: prev?.description || entry.description,
  }
}

const manifest: Manifest = {
  version: existing.version || 1,
  repo: existing.repo,
  files,
}

writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n')
console.log(
  `manifest.json: ${Object.keys(files).length} files (${libs.length} libs, ${scripts.length} scripts)`
)
