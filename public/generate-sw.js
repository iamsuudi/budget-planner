import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs'
import { join, relative } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST_DIR = join(__dirname, '../dist')
const SW_TEMPLATE = join(__dirname, '../src/sw-template.js')

// 1. Read version from package.json
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'))
const VERSION = 'v' + pkg.version

let swContent = readFileSync(SW_TEMPLATE, 'utf8')
swContent = swContent.replace('// [[CACHE_NAME]]', `CACHE_NAME = "${VERSION}";`)

// 2. Recursively get all files from dist
function getFiles(dir, allFiles = []) {
  const files = readdirSync(dir)
  files.forEach((file) => {
    const name = join(dir, file)
    if (statSync(name).isDirectory()) {
      getFiles(name, allFiles)
    } else {
      allFiles.push('/' + relative(DIST_DIR, name).replace(/\\/g, '/'))
    }
  })
  return allFiles
}

const assets = getFiles(DIST_DIR).filter((asset) => asset !== '/version.json')
const assetsList = JSON.stringify(['/', ...assets], null, 2)

// 3. Inject the list
swContent = swContent.replace(
  '// [[ASSETS_LIST]]',
  `ASSETS_TO_CACHE = ${assetsList};`,
)

// 4. Write version manifest for client-side update checks
const VERSION_MANIFEST = join(__dirname, '../dist/version.json')
const manifest = {
  version: pkg.version,
  minSupportedVersion: pkg.minSupportedVersion || '0.0.0',
  generatedAt: new Date().toISOString(),
}
writeFileSync(VERSION_MANIFEST, JSON.stringify(manifest, null, 2))

// 5. Write versioned SW file
const VERSIONED_OUTPUT = join(__dirname, '../dist/sw-v' + pkg.version + '.js')
writeFileSync(VERSIONED_OUTPUT, swContent)

console.log(
  `✅ Service Worker generated with:\nID: ${VERSION}\nTotal Assets: ${assets.length}`,
)
