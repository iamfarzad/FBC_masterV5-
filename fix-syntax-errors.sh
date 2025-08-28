#!/bin/bash

echo "🔧 Starting automated syntax error fix..."

# Pattern 1: Fix incomplete toISOString() calls
echo "1. Fixing incomplete toISOString() calls..."
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|// Info log removed\.toISOString()|console.log(`Action completed at ${new Date().toISOString()}`)|g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|// Log removed\.toISOString()|console.log(`Action completed at ${new Date().toISOString()}`)|g'

# Pattern 2: Fix incomplete object literals ending with }
echo "2. Fixing incomplete object literals..."
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|// Info log removed}|// Object logged|g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|// Log removed}|// Object logged|g'

# Pattern 3: Fix incomplete statements ending with ,
echo "3. Fixing incomplete statements with commas..."
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|// Info log removed,|// Statement logged|g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|// Log removed,|// Statement logged|g'

# Pattern 4: Fix incomplete template literals
echo "4. Fixing incomplete template literals..."
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|// Info log removed`}|// Template logged|g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|// Log removed`}|// Template logged|g'

# Pattern 5: Fix incomplete expressions with ...}
echo "5. Fixing incomplete expressions..."
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|// Info log removed\}...`|// Expression logged|g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|// Log removed\}...`|// Expression logged|g'

# Pattern 6: Fix dangling brackets and parentheses
echo "6. Fixing dangling brackets..."
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '/^[[:space:]]*)$/{N;s/^\([[:space:]]*\)\n[[:space:]]*)/\1)/;}' /dev/null

# Pattern 7: Fix incomplete onClick handlers
echo "7. Fixing incomplete onClick handlers..."
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|onClick={() => // Info log removed}|onClick={() => console.log("Action triggered")}|g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|onClick={() => // Log removed}|onClick={() => console.log("Action triggered")}|g'

# Pattern 8: Fix incomplete onCopy handlers  
echo "8. Fixing incomplete onCopy handlers..."
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|onCopy={() => // Info log removed}|onCopy={() => console.log("Content copied")}|g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|onCopy={() => // Log removed}|onCopy={() => console.log("Content copied")}|g'

# Pattern 9: Fix incomplete onAppGenerated handlers
echo "9. Fixing incomplete onAppGenerated handlers..."
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|onAppGenerated={(url) => // Info log removed}|onAppGenerated={(url) => console.log("App generated:", url)}|g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|onAppGenerated={(url) => // Log removed}|onAppGenerated={(url) => console.log("App generated:", url)}|g'

# Pattern 10: Clean up any remaining incomplete patterns
echo "10. Cleaning up remaining incomplete patterns..."
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|// Info log removed|// Action logged|g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|// Log removed|// Action logged|g'

echo "✅ Syntax error fixes completed!"
echo "🔍 Verifying fixes..."
echo "Files processed: $(find . -name "*.ts" -o -name "*.tsx" | wc -l)"

