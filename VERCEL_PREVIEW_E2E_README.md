# Vercel Preview E2E Testing Setup

This guide explains how to automatically run E2E tests against Vercel preview deployments for feature branches.

## 🎯 Overview

When working on feature branches, Vercel automatically creates preview deployments. This setup ensures your E2E tests run against the correct preview URL instead of hardcoded production URLs.

## 📋 URL Pattern

For branch `cursor/analyze-chat-flow-and-ai-functions-6c91`:
```
https://fbc-master-v5-git-cursor-analyze-chat-flow-and-ai-functions-6c91.vercel.app/
```

## 🚀 Quick Start

### Method 1: Node.js Script (Recommended)
```bash
# Automatically sets E2E_BASE_URL and runs tests
pnpm run test:preview-e2e
```

### Method 2: Manual Setup
```bash
# Generate and set the preview URL
node scripts/setup-preview-e2e.js

# Run tests (E2E_BASE_URL is now set)
pnpm test:e2e
```

### Method 3: Shell Script
```bash
# Source the script to set environment variables
source scripts/setup-preview-e2e.sh

# Run tests
pnpm test:e2e
```

### Method 4: Direct Command
```bash
# One-liner for bash/zsh
BRANCH_NAME=$(git branch --show-current) && \
CLEAN_BRANCH=$(echo "$BRANCH_NAME" | sed 's/[^a-zA-Z0-9]/-/g' | sed 's/^-*//' | sed 's/-*$//') && \
export E2E_BASE_URL="https://fbc-master-v5-git-${CLEAN_BRANCH}.vercel.app/" && \
pnpm test:e2e
```

## 📁 Files Created

- `.cursor/rules/vercel-preview-e2e-deployment.mdc` - Cursor rule documentation
- `scripts/setup-preview-e2e.js` - Node.js automation script
- `scripts/setup-preview-e2e.sh` - Bash automation script
- `.github/workflows/e2e-preview.yml` - GitHub Actions workflow
- `package.json` - Updated with new test scripts

## 🔧 Available Scripts

```json
{
  "test:preview-e2e": "node scripts/setup-preview-e2e.js && playwright test",
  "test:branch-e2e": "BRANCH_NAME=$(git branch --show-current) && CLEAN_BRANCH=$(echo \"$BRANCH_NAME\" | sed 's/[^a-zA-Z0-9]/-/g' | sed 's/^-*//' | sed 's/-*$//') && export E2E_BASE_URL=\"https://fbc-master-v5-git-${CLEAN_BRANCH}.vercel.app/\" && playwright test"
}
```

## 🎯 GitHub Actions Integration

The workflow automatically:
1. Detects the branch name
2. Generates the correct Vercel preview URL
3. Waits for Vercel deployment to be ready (up to 5 minutes)
4. Runs E2E tests against the preview URL
5. Comments on the PR with test results

### Trigger Conditions
- Pull requests to `main` or `develop` branches
- Manual workflow dispatch (with optional branch override)

## 🧪 Testing Examples

### Current Branch Testing
```bash
$ git branch --show-current
cursor/analyze-chat-flow-and-ai-functions-6c91

$ pnpm run test:preview-e2e
🌿 Branch: cursor/analyze-chat-flow-and-ai-functions-6c91
🔗 Preview URL: https://fbc-master-v5-git-cursor-analyze-chat-flow-and-ai-functions-6c91.vercel.app/
✅ Setting E2E_BASE_URL=https://fbc-master-v5-git-cursor-analyze-chat-flow-and-ai-functions-6c91.vercel.app/
Running tests...
```

### Main Branch (Production)
```bash
$ git checkout main
$ pnpm run test:preview-e2e
🌿 Branch: main
🔗 Preview URL: https://www.farzadbayat.com
✅ Setting E2E_BASE_URL=https://www.farzadbayat.com
```

## 🔍 How URL Generation Works

1. **Get Branch Name**: `git branch --show-current`
2. **Clean Branch Name**:
   - Replace non-alphanumeric characters with hyphens
   - Remove leading/trailing hyphens
   - Example: `feature/user-auth` → `feature-user-auth`
3. **Generate URL**: `https://fbc-master-v5-git-{clean-branch}.vercel.app/`
4. **Set Environment**: `export E2E_BASE_URL="{generated-url}"`

## 🛠️ Manual URL Generation

If you need to generate URLs manually:

```javascript
function generatePreviewUrl(branchName) {
  if (branchName === 'main') {
    return 'https://www.farzadbayat.com';
  }

  const cleanBranch = branchName
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/^-+|-+$/g, '');

  return `https://fbc-master-v5-git-${cleanBranch}.vercel.app/`;
}
```

## 🎯 Best Practices

### Branch Naming
- Use descriptive branch names
- Avoid special characters that need URL encoding
- Keep names reasonably short

### Testing Strategy
- Run E2E tests on every PR
- Test critical user flows
- Verify responsive design
- Check cross-browser compatibility

### CI/CD Integration
- Use GitHub Actions for automated testing
- Set up proper timeouts for deployment waits
- Archive test artifacts for debugging

## 🐛 Troubleshooting

### Common Issues

**"Failed to get current branch"**
- Ensure you're in a git repository
- Make sure there are commits on the branch

**"Vercel deployment not ready"**
- Wait longer for deployment (can take 2-5 minutes)
- Check Vercel dashboard for deployment status
- Verify branch name doesn't contain invalid characters

**"Tests failing on preview"**
- Ensure preview deployment is working
- Check browser console for JavaScript errors
- Verify environment variables are set correctly

### Debug Mode
```bash
# See what URL will be generated without running tests
node scripts/setup-preview-e2e.js

# Check current environment variables
echo $E2E_BASE_URL
```

## 📊 Monitoring & Results

### GitHub Actions Results
- Test status visible on PR checks
- Detailed logs available in Actions tab
- Test artifacts automatically uploaded

### Local Testing
- Use `pnpm test:e2e --debug` for verbose output
- Check `test-results/` directory for reports
- Browser screenshots saved on test failures

## 🔄 Integration with Existing Workflows

This setup works alongside your existing:
- `pnpm test:production-qa` - Production testing
- `pnpm test:e2e` - Local development testing
- `pnpm preflight` - Pre-deployment checks

## 📝 Contributing

When updating this setup:
1. Test on multiple branch name formats
2. Verify URL generation handles edge cases
3. Update documentation
4. Test GitHub Actions workflow

---

## 🎉 Success!

Now your E2E tests automatically run against the correct Vercel preview deployment for every feature branch. No more manual URL updates required!

**Happy testing! 🚀**
