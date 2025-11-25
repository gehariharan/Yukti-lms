import { cp, rm, mkdir, copyFile, readdir } from 'fs/promises'
import { dirname, resolve, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const sourceDir = resolve(__dirname, '..', '..', 'product', 'content', 'me-in-my-team')
const destinationDir = resolve(__dirname, '..', 'public', 'content', 'me-in-my-team')

async function copyDirectory() {
  await rm(destinationDir, { recursive: true, force: true })
  await mkdir(destinationDir, { recursive: true })
  await cp(sourceDir, destinationDir, { recursive: true })
}

async function ensureFrameworkAliases() {
  const frameworksDir = join(destinationDir, 'frameworks')
  const files = await readdir(frameworksDir)

  const aliasMap = [
    { pattern: /Self-in Leadership and Others-in Leadership/i, target: 'self_vs_others.png' },
    { pattern: /Value Recognition Framework/i, target: 'values_recognition.png' },
    { pattern: /Value Response Framework/i, target: 'values_response.png' },
    { pattern: /Case Study reference/i, target: 'case_study_reference.png' }
  ]

  for (const alias of aliasMap) {
    const match = files.find(file => alias.pattern.test(file))
    if (match) {
      const sourcePath = join(frameworksDir, match)
      const targetPath = join(frameworksDir, alias.target)
      if (sourcePath !== targetPath) {
        await copyFile(sourcePath, targetPath)
      }
    }
  }
}

async function ensureBaseCaseAlias() {
  const aliasSource = join(destinationDir, 'basecasestudy.txt.txt')
  const aliasTarget = join(destinationDir, 'case_study_base.txt')
  try {
    await copyFile(aliasSource, aliasTarget)
  } catch {
    // ignore if file missing
  }
}

try {
  await copyDirectory()
  await ensureFrameworkAliases()
  await ensureBaseCaseAlias()
  console.log('Synced Me in My Team content to public/content/me-in-my-team')
} catch (error) {
  console.error('Failed to sync content:', error)
  process.exit(1)
}
