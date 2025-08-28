#!/usr/bin/env node

/**
 * Test Runner Script
 * Comprehensive test runner for all test types with reporting
 */

const { spawn } = require('child_process')
const path = require('path')

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

function log(message, color = colors.reset) {
  // Log removed
}

function logHeader(message) {
  log(`\n${colors.bright}${colors.blue}🚀 ${message}${colors.reset}`)
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green)
}

function logError(message) {
  log(`❌ ${message}`, colors.red)
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow)
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.cyan)
}

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options,
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve(code)
      } else {
        reject(new Error(`Command failed with exit code ${code}`))
      }
    })

    child.on('error', reject)
  })
}

async function runUnitTests(options = {}) {
  logHeader('Running Unit Tests')

  try {
    const args = ['test', '--testPathPattern=tests/unit']

    if (options.watch) args.push('--watch')
    if (options.coverage) args.push('--coverage')
    if (options.verbose) args.push('--verbose')

    await runCommand('pnpm', args)
    logSuccess('Unit tests completed successfully')
  } catch (error) {
    logError(`Unit tests failed: ${error.message}`)
    throw error
  }
}

async function runIntegrationTests(options = {}) {
  logHeader('Running Integration Tests')

  try {
    const args = ['test', '--testPathPattern=tests/integration']

    if (options.watch) args.push('--watch')
    if (options.coverage) args.push('--coverage')
    if (options.verbose) args.push('--verbose')

    await runCommand('pnpm', args)
    logSuccess('Integration tests completed successfully')
  } catch (error) {
    logError(`Integration tests failed: ${error.message}`)
    throw error
  }
}

async function runE2ETests(options = {}) {
  logHeader('Running E2E Tests')

  try {
    const args = ['exec', 'playwright', 'test']

    if (options.headed) args.push('--headed')
    if (options.debug) args.push('--debug')
    if (options.browser) args.push(`--project=${options.browser}`)
    if (options.grep) args.push(`--grep=${options.grep}`)

    await runCommand('npx', args)
    logSuccess('E2E tests completed successfully')
  } catch (error) {
    logError(`E2E tests failed: ${error.message}`)
    throw error
  }
}

async function runAllTests(options = {}) {
  logHeader('Running All Tests')

  const results = {
    unit: false,
    integration: false,
    e2e: false,
  }

  try {
    // Run unit tests
    logInfo('Starting unit tests...')
    await runUnitTests(options)
    results.unit = true
  } catch (error) {
    logError('Unit tests failed, continuing with other tests...')
  }

  try {
    // Run integration tests
    logInfo('Starting integration tests...')
    await runIntegrationTests(options)
    results.integration = true
  } catch (error) {
    logError('Integration tests failed, continuing with E2E tests...')
  }

  try {
    // Run E2E tests
    logInfo('Starting E2E tests...')
    await runE2ETests(options)
    results.e2e = true
  } catch (error) {
    logError('E2E tests failed')
  }

  // Summary
  logHeader('Test Summary')
  log(`Unit Tests: ${results.unit ? '✅ Passed' : '❌ Failed'}`, results.unit ? colors.green : colors.red)
  log(`Integration Tests: ${results.integration ? '✅ Passed' : '❌ Failed'}`, results.integration ? colors.green : colors.red)
  log(`E2E Tests: ${results.e2e ? '✅ Passed' : '❌ Failed'}`, results.e2e ? colors.green : colors.red)

  const passedTests = Object.values(results).filter(Boolean).length
  const totalTests = Object.keys(results).length

  if (passedTests === totalTests) {
    logSuccess(`All ${totalTests} test suites passed!`)
    return true
  } else {
    logWarning(`${passedTests}/${totalTests} test suites passed`)
    return false
  }
}

async function generateTestReport() {
  logHeader('Generating Test Reports')

  try {
    // Generate coverage report
    logInfo('Generating coverage report...')
    await runCommand('pnpm', ['test', '--coverage', '--coverageReporters=html,lcov'])

    // Generate Playwright report
    logInfo('Generating Playwright report...')
    await runCommand('npx', ['playwright', 'show-report'])

    logSuccess('Test reports generated successfully')
    logInfo('Coverage report: ./coverage/lcov-report/index.html')
    logInfo('Playwright report: ./playwright-report/index.html')
  } catch (error) {
    logWarning(`Report generation failed: ${error.message}`)
  }
}

function showHelp() {
  logHeader('Test Runner Help')
  log('Usage: node tests/run-tests.js [command] [options]')
  log('')
  log('Commands:')
  log('  unit          Run unit tests only')
  log('  integration   Run integration tests only')
  log('  e2e           Run E2E tests only')
  log('  all           Run all test suites')
  log('  report        Generate test reports')
  log('  help          Show this help message')
  log('')
  log('Options:')
  log('  --watch       Run tests in watch mode')
  log('  --coverage    Generate coverage reports')
  log('  --verbose     Verbose output')
  log('  --headed      Run E2E tests in headed mode')
  log('  --debug       Run E2E tests in debug mode')
  log('  --browser=chrome|firefox|webkit  Run E2E tests on specific browser')
  log('  --grep="pattern"  Run tests matching pattern')
  log('')
  log('Examples:')
  log('  node tests/run-tests.js unit --coverage')
  log('  node tests/run-tests.js e2e --headed --browser=chrome')
  log('  node tests/run-tests.js all --watch')
}

// Main execution
async function main() {
  const args = process.argv.slice(2)
  const command = args[0] || 'help'

  // Parse options
  const options = {}
  args.slice(1).forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=')
      options[key] = value || true
    }
  })

  try {
    switch (command) {
      case 'unit':
        await runUnitTests(options)
        break

      case 'integration':
        await runIntegrationTests(options)
        break

      case 'e2e':
        await runE2ETests(options)
        break

      case 'all':
        const success = await runAllTests(options)
        if (success) {
          await generateTestReport()
        }
        process.exit(success ? 0 : 1)
        break

      case 'report':
        await generateTestReport()
        break

      case 'help':
      default:
        showHelp()
        break
    }
  } catch (error) {
    logError(`Test runner failed: ${error.message}`)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = {
  runUnitTests,
  runIntegrationTests,
  runE2ETests,
  runAllTests,
  generateTestReport,
}
