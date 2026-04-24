import { readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const MANIFEST_PATH = 'manifest.json'
const PACKAGE_PATH = 'package.json'

type BumpType = 'patch' | 'minor' | 'major'

function bumpVersion(version: string, type: BumpType): string {
  const [major, minor, patch] = version.split('.').map(Number)
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`
    case 'minor':
      return `${major}.${minor + 1}.0`
    case 'patch':
      return `${major}.${minor}.${patch + 1}`
  }
}

function run(cmd: string): void {
  console.log(`> ${cmd}`)
  execSync(cmd, { stdio: 'inherit' })
}

// Parse args
const bumpType = (process.argv[2] ?? 'patch') as BumpType
if (!['patch', 'minor', 'major'].includes(bumpType)) {
  console.error('Usage: tsx scripts/release.ts [patch|minor|major]')
  process.exit(1)
}

// Read current version from package.json
const pkg = JSON.parse(readFileSync(PACKAGE_PATH, 'utf-8'))
const oldVersion = pkg.version as string
const newVersion = bumpVersion(oldVersion, bumpType)

console.log(`Bumping version: ${oldVersion} → ${newVersion} (${bumpType})`)

// Update package.json
pkg.version = newVersion
writeFileSync(PACKAGE_PATH, JSON.stringify(pkg, null, 2) + '\n')

// Build (which also regenerates manifest.json)
run('npm run build')

// Increment manifest version (simple counter, not semver)
const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'))
manifest.version = (manifest.version as number) + 1
writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n')
console.log(`Manifest version: ${manifest.version}`)

// Git commit and tag
run('git add -A')
run(`git commit -m "release: v${newVersion}"`)
run(`git tag v${newVersion}`)

console.log()
console.log(`Released v${newVersion}`)
console.log('Run "git push && git push --tags" to publish.')
