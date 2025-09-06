#!/usr/bin/env node

/**
 * 🔧 MASTER FLOW: CI Environment Checker
 * Ensures missing Supabase/envs don't crash build
 */

const requiredEnvs = {
  production: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'GEMINI_API_KEY',
    'RESEND_API_KEY'
  ],
  development: [
    'GEMINI_API_KEY'
  ]
}

const optionalEnvs = [
  'NEXT_PUBLIC_BASE_URL',
  'RESEND_FROM_EMAIL',
  'EMBEDDINGS_ENABLED',
  'LIVE_ENABLED'
]

function checkEnv() {
  const env = process.env.NODE_ENV || 'development'
  const required = requiredEnvs[env] || requiredEnvs.development
  const missing = []
  const present = []

  console.log(`🔍 Checking environment for: ${env}`)

  // Check required envs
  for (const envVar of required) {
    if (process.env[envVar]) {
      present.push(envVar)
      console.log(`✅ ${envVar}: present`)
    } else {
      missing.push(envVar)
      console.log(`❌ ${envVar}: missing`)
    }
  }

  // Check optional envs
  console.log('\n📋 Optional environment variables:')
  for (const envVar of optionalEnvs) {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar}: ${process.env[envVar]}`)
    } else {
      console.log(`⚪ ${envVar}: not set (optional)`)
    }
  }

  // Summary
  console.log(`\n📊 Environment Summary:`)
  console.log(`✅ Present: ${present.length}/${required.length} required`)
  console.log(`❌ Missing: ${missing.length}/${required.length} required`)

  if (missing.length > 0) {
    console.log(`\n🚨 Missing required environment variables:`)
    missing.forEach(env => console.log(`   - ${env}`))
    
    if (env === 'production') {
      console.log('\n💥 Build will fail in production without these variables!')
      process.exit(1)
    } else {
      console.log('\n⚠️  Development build may have reduced functionality')
      console.log('🔧 Soft-gating enabled: missing envs will use fallbacks')
    }
  } else {
    console.log('\n🎉 All required environment variables present!')
  }

  return { missing, present, env }
}

// Run check if called directly
if (require.main === module) {
  checkEnv()
}

module.exports = { checkEnv }