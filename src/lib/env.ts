export function validateEnv(): string[] {
  const issues: string[] = []
  if (!process.env.DATABASE_URL) issues.push('DATABASE_URL: required but missing or empty')
  if (!process.env.WEBHOOK_SECRET) issues.push('WEBHOOK_SECRET: required but missing or empty')
  return issues
}

export function checkEnv(): boolean {
  const issues = validateEnv()
  if (issues.length > 0) {
    console.warn(`[env] ${issues.join('; ')}`)
    return false
  }
  return true
}
