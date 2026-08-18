import { readFileSync, writeFileSync } from "fs"
import { fileURLToPath } from "url"
import { join, dirname } from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(readFileSync(join(__dirname, "package.json"), "utf8"))
const version = pkg.version

writeFileSync(
  join(__dirname, "src/version.ts"),
  `export const APP_VERSION = "${version}"\n`,
)
console.log(`✅ Generated src/version.ts with version ${version}`)
