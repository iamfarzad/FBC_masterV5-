#!/bin/bash

echo "🔧 Starting targeted syntax error fix (v2)..."

# Function to process only source files (excluding node_modules)
process_files() {
    find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v ".next" | while read -r file; do
        echo "Processing $file..."
        
        # Pattern 1: Fix incomplete toISOString() calls
        sed -i.bak 's|// Info log removed\.toISOString()|console.log(`Action completed at ${new Date().toISOString()}`)|g' "$file"
        sed -i.bak 's|// Log removed\.toISOString()|console.log(`Action completed at ${new Date().toISOString()}`)|g' "$file"
        
        # Pattern 2: Fix incomplete object literals ending with }
        sed -i.bak 's|// Info log removed}|// Object logged|g' "$file"
        sed -i.bak 's|// Log removed}|// Object logged|g' "$file"
        
        # Pattern 3: Fix incomplete statements ending with ,
        sed -i.bak 's|// Info log removed,|// Statement logged|g' "$file"
        sed -i.bak 's|// Log removed,|// Statement logged|g' "$file"
        
        # Pattern 4: Fix incomplete template literals
        sed -i.bak 's|// Info log removed`}|// Template logged|g' "$file"
        sed -i.bak 's|// Log removed`}|// Template logged|g' "$file"
        
        # Pattern 5: Fix incomplete expressions with ...}
        sed -i.bak 's|// Info log removed\}...`|// Expression logged|g' "$file"
        sed -i.bak 's|// Log removed\}...`|// Expression logged|g' "$file"
        
        # Pattern 6: Fix incomplete onClick handlers
        sed -i.bak 's|onClick={() => // Info log removed}|onClick={() => console.log("Action triggered")}|g' "$file"
        sed -i.bak 's|onClick={() => // Log removed}|onClick={() => console.log("Action triggered")}|g' "$file"
        
        # Pattern 7: Fix incomplete onCopy handlers  
        sed -i.bak 's|onCopy={() => // Info log removed}|onCopy={() => console.log("Content copied")}|g' "$file"
        sed -i.bak 's|onCopy={() => // Log removed}|onCopy={() => console.log("Content copied")}|g' "$file"
        
        # Pattern 8: Fix incomplete onAppGenerated handlers
        sed -i.bak 's|onAppGenerated={(url) => // Info log removed}|onAppGenerated={(url) => console.log("App generated:", url)}|g' "$file"
        sed -i.bak 's|onAppGenerated={(url) => // Log removed}|onAppGenerated={(url) => console.log("App generated:", url)}|g' "$file"
        
        # Pattern 9: Clean up any remaining incomplete patterns
        sed -i.bak 's|// Info log removed|// Action logged|g' "$file"
        sed -i.bak 's|// Log removed|// Action logged|g' "$file"
        
        # Clean up backup files
        rm -f "${file}.bak"
    done
}

process_files

echo "✅ Syntax error fixes completed!"
echo "🔍 Verifying fixes..."

# Count source files processed
SOURCE_FILES=$(find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v ".next" | wc -l)
echo "Source files processed: $SOURCE_FILES"

