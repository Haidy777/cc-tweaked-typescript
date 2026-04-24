// cc-tweaked-typescript installer
// Bootstrap: wget https://raw.githubusercontent.com/Haidy777/cc-tweaked-typescript/refs/heads/main/build/scripts/installer.lua installer
//
// Self-contained — no imports from src/lib/ since this is the first thing downloaded.
// Avoids tstl runtime features (no Array methods, spread, Object.keys) to skip lualib_bundle.

const MANIFEST_URL =
  'https://raw.githubusercontent.com/Haidy777/cc-tweaked-typescript/refs/heads/main/manifest.json'
const MANIFEST_CACHE_PATH = '/.installer-manifest.json'
const INSTALLED_PATH = '/.installed.json'

// --- Types ---

interface ManifestRepo {
  owner: string
  name: string
  branch: string
}

interface ManifestFile {
  description: string
  type: string
  source: string
  target: string
}

interface Manifest {
  version: number
  repo: ManifestRepo
  files: Record<string, ManifestFile>
}

// --- Utility functions ---

function httpGet(url: string): string | null {
  const [response, err] = http.get(url)
  if (response === undefined) {
    printError(`HTTP error: ${err ?? 'unknown'}`)
    return null
  }
  const body = response.readAll()
  response.close()
  return body
}

function writeFile(path: string, content: string): boolean {
  // ensure parent directory exists
  const dir = fs.getDir(path)
  if (dir !== '' && !fs.exists(dir)) {
    fs.makeDir(dir)
  }

  const [handle, err] = fs.open(path, 'w')
  if (handle === null) {
    printError(`Cannot write ${path}: ${err ?? 'unknown'}`)
    return false
  }
  handle.write(content)
  handle.close()
  return true
}

function readFile(path: string): string | null {
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

function buildBaseUrl(repo: ManifestRepo): string {
  return (
    'https://raw.githubusercontent.com/' +
    repo.owner +
    '/' +
    repo.name +
    '/refs/heads/' +
    repo.branch +
    '/'
  )
}

// --- Manifest operations ---

function fetchManifest(): Manifest | null {
  print('Fetching manifest...')
  const body = httpGet(MANIFEST_URL)
  if (body === null) {
    print('Failed to fetch remote manifest, trying cache...')
    return loadCachedManifest()
  }

  const manifest = textutils.unserializeJSON(body) as Manifest | null
  if (manifest === null) {
    printError('Failed to parse manifest')
    return loadCachedManifest()
  }

  // cache for offline use
  writeFile(MANIFEST_CACHE_PATH, body)
  return manifest
}

function loadCachedManifest(): Manifest | null {
  const body = readFile(MANIFEST_CACHE_PATH)
  if (body === null) {
    printError('No cached manifest available')
    return null
  }
  return textutils.unserializeJSON(body) as Manifest | null
}

function loadInstalled(): Record<string, boolean> {
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

function saveInstalled(installed: Record<string, boolean>): void {
  const json = textutils.serializeJSON(installed)
  writeFile(INSTALLED_PATH, json)
}

// --- Core operations ---

function listFiles(manifest: Manifest): void {
  print()
  print('=== Available Files ===')
  print()

  // scripts
  let hasScripts = false
  for (const name in manifest.files) {
    const entry = manifest.files[name]
    if (entry.type === 'script') {
      if (!hasScripts) {
        print('Scripts:')
        hasScripts = true
      }
      print(`  ${name} - ${entry.description}`)
    }
  }

  // libraries
  let hasLibs = false
  for (const name in manifest.files) {
    const entry = manifest.files[name]
    if (entry.type === 'lib') {
      if (!hasLibs) {
        if (hasScripts) {
          print()
        }
        print('Libraries:')
        hasLibs = true
      }
      print(`  ${name} - ${entry.description}`)
    }
  }

  if (!hasScripts && !hasLibs) {
    print('No files available.')
  }

  print()
}

function ensureLualib(manifest: Manifest): void {
  const entry = manifest.files.lualib_bundle
  if (entry === undefined) {
    return
  }
  if (fs.exists(entry.target)) {
    return
  }

  print('  Installing required runtime library...')
  const url = buildBaseUrl(manifest.repo) + entry.source
  const content = httpGet(url)
  if (content !== null) {
    writeFile(entry.target, content)
  }
}

function installFile(manifest: Manifest, name: string): boolean {
  const file = manifest.files[name]
  if (file === undefined) {
    printError(`Unknown file: ${name}`)
    print('Run "installer list" to see available files.')
    return false
  }

  const url = buildBaseUrl(manifest.repo) + file.source
  print(`Downloading ${name}...`)
  const content = httpGet(url)
  if (content === null) {
    printError(`Failed to download ${name}`)
    return false
  }

  if (!writeFile(file.target, content)) {
    printError(`Failed to save ${name}`)
    return false
  }

  // auto-download lualib_bundle if this script needs it
  const [found] = string.find(content, 'lualib_bundle', 1, true)
  if (found !== undefined) {
    ensureLualib(manifest)
  }

  // track installation
  const installed = loadInstalled()
  installed[name] = true
  saveInstalled(installed)

  print(`  Saved to ${file.target}`)
  return true
}

function installAll(manifest: Manifest): void {
  let success = 0
  let failed = 0

  for (const name in manifest.files) {
    const entry = manifest.files[name]
    if (entry.type === 'system') {
      continue
    }
    if (installFile(manifest, name)) {
      success = success + 1
    } else {
      failed = failed + 1
    }
  }

  print()
  print(`Done: ${success} installed, ${failed} failed`)
}

function updateAll(manifest: Manifest): void {
  const installed = loadInstalled()
  let count = 0

  for (const name in installed) {
    if (manifest.files[name] !== undefined) {
      installFile(manifest, name)
      count = count + 1
    } else {
      print(`Warning: ${name} no longer in manifest, skipping`)
    }
  }

  if (count === 0) {
    print('Nothing installed to update.')
    print('Run "installer install <name>" first.')
  }
}

function selfUpdate(manifest: Manifest): void {
  const entry = manifest.files.installer
  if (entry === undefined) {
    printError('Installer not found in manifest')
    return
  }

  const url = buildBaseUrl(manifest.repo) + entry.source
  print('Downloading installer update...')
  const content = httpGet(url)
  if (content === null) {
    printError('Failed to download installer update')
    return
  }

  // resolve the path of the currently running program
  const currentProgram = shell.getRunningProgram()
  if (!writeFile(currentProgram, content)) {
    printError('Failed to write installer update')
    return
  }

  print('Installer updated!')
}

function printUsage(): void {
  print('cc-tweaked-typescript installer')
  print()
  print('Usage:')
  print('  installer list          Show available files')
  print('  installer install <n>   Install a specific file')
  print('  installer install all   Install everything')
  print('  installer update        Update all installed files')
  print('  installer self-update   Update the installer itself')
}

// --- Entry point ---

const args = [...$vararg] as string[]
const command = args[0] as string | undefined
const target = args[1] as string | undefined

if (command === undefined || command === 'help' || command === '--help') {
  printUsage()
} else if (command === 'list') {
  const manifest = fetchManifest()
  if (manifest !== null) {
    listFiles(manifest)
  }
} else if (command === 'install') {
  if (target === undefined) {
    printError('Usage: installer install <name|all>')
  } else {
    const manifest = fetchManifest()
    if (manifest !== null) {
      if (target === 'all') {
        installAll(manifest)
      } else {
        installFile(manifest, target)
      }
    }
  }
} else if (command === 'update') {
  const manifest = fetchManifest()
  if (manifest !== null) {
    updateAll(manifest)
  }
} else if (command === 'self-update') {
  const manifest = fetchManifest()
  if (manifest !== null) {
    selfUpdate(manifest)
  }
} else {
  printError(`Unknown command: ${command}`)
  printUsage()
}
