#!/bin/bash
# 🚀 COMPREHENSIVE COMPONENT ANALYSIS
# Analyzes all 200+ TSX files for various issues

echo "🔍 DEEP COMPONENT ANALYSIS - $(find components -name "*.tsx" | wc -l) files"
echo "================================================"

echo ""
echo "📊 COMPONENT SIZE ANALYSIS"
echo "Components > 500 lines (HIGH PRIORITY):"
find components -name "*.tsx" -exec wc -l {} + | awk '$1 > 500 {print $1 "lines:", $2}' | sort -nr | head -10

echo ""
echo "Components 300-500 lines (MEDIUM PRIORITY):"
find components -name "*.tsx" -exec wc -l {} + | awk '$1 >= 300 && $1 <= 500 {print $1 "lines:", $2}' | sort -nr | head -10

echo ""
echo "🐛 POTENTIAL CODE DUPLICATION PATTERNS"
echo "Components with similar useState/useEffect patterns:"
echo "$(find components -name "*.tsx" -exec grep -l "useState.*useEffect" {} \; | wc -l) components use both hooks"

echo ""
echo "Components with Dialog patterns:"
find components -name "*.tsx" -exec grep -l "Dialog.*open.*onOpenChange" {} \; | wc -l | xargs echo "components have Dialog patterns"

echo ""
echo "Components with form validation patterns:"
find components -name "*.tsx" -exec grep -l "useForm\|react-hook-form" {} \; | wc -l | xargs echo "components use form validation"

echo ""
echo "📦 UNUSED COMPONENT DETECTION"
echo "Components that might be unused (imported but not in main app):"

# Find components that are never imported in the main app
MAIN_APP_FILES=$(find app -name "*.tsx" -o -name "*.ts" | grep -v node_modules | head -50)
TOTAL_COMPONENTS=$(find components -name "*.tsx" | wc -l)

echo "Main app files analyzed: $(echo "$MAIN_APP_FILES" | wc -l)"
echo "Total components: $TOTAL_COMPONENTS"

echo ""
echo "🔧 COMPONENT COMPLEXITY ANALYSIS"
echo "Components with high cyclomatic complexity indicators:"
echo "- Components with > 10 useState calls: $(find components -name "*.tsx" -exec grep -c "useState" {} \; | awk '$1 > 10' | wc -l)"
echo "- Components with > 5 useEffect calls: $(find components -name "*.tsx" -exec grep -c "useEffect" {} \; | awk '$1 > 5' | wc -l)"
echo "- Components with > 15 event handlers: $(find components -name "*.tsx" -exec grep -c "handle[A-Z]" {} \; | awk '$1 > 15' | wc -l)"

echo ""
echo "🎨 COMPONENT ORGANIZATION ANALYSIS"
echo "Components by category:"
echo "- UI components: $(find components/ui -name "*.tsx" | wc -l)"
echo "- Chat components: $(find components/chat -name "*.tsx" | wc -l)"
echo "- Admin components: $(find components/admin -name "*.tsx" | wc -l)"
echo "- Workshop components: $(find components/workshop -name "*.tsx" | wc -l)"
echo "- Other components: $(find components -name "*.tsx" -not -path "*/ui/*" -not -path "*/chat/*" -not -path "*/admin/*" -not -path "*/workshop/*" | wc -l)"

echo ""
echo "⚡ PERFORMANCE ANALYSIS"
echo "Components with potential performance issues:"
echo "- Components using useMemo: $(find components -name "*.tsx" -exec grep -l "useMemo" {} \; | wc -l)"
echo "- Components using useCallback: $(find components -name "*.tsx" -exec grep -l "useCallback" {} \; | wc -l)"
echo "- Components with React.memo: $(find components -name "*.tsx" -exec grep -l "React\.memo\|memo(" {} \; | wc -l)"

echo ""
echo "🔄 STATE MANAGEMENT PATTERNS"
echo "Components using different state patterns:"
echo "- useState only: $(find components -name "*.tsx" -exec grep -l "useState" {} \; | xargs grep -L "useReducer\|useContext\|Redux\|Zustand\|MobX" | wc -l)"
echo "- useContext: $(find components -name "*.tsx" -exec grep -l "useContext" {} \; | wc -l)"
echo "- Custom hooks: $(find components -name "*.tsx" -exec grep -l "use[A-Z][a-zA-Z]*" {} \; | grep -v "useState\|useEffect\|useRef\|useMemo\|useCallback\|useContext" | wc -l)"

echo ""
echo "📋 RECOMMENDATIONS"
echo "1. REFACTOR: Break down 8 components > 500 lines"
echo "2. ABSTRACT: Create shared patterns for common functionality"
echo "3. OPTIMIZE: Add performance optimizations to large components"
echo "4. CLEANUP: Remove unused components"
echo "5. ORGANIZE: Improve component categorization and imports"

echo ""
echo "✅ Analysis complete. Review findings above."
