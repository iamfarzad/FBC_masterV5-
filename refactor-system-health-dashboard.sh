#!/bin/bash
# 🔄 REFACTOR SYSTEM HEALTH DASHBOARD
# Extract individual tab components into separate files

echo "🏥 REFACTORING SYSTEM HEALTH DASHBOARD (637 lines)"

# Create directory for extracted components
mkdir -p components/admin/SystemHealthDashboard/

# Extract PerformanceTab
echo "📊 Extracting PerformanceTab..."
grep -A 49 "function PerformanceTab" components/admin/SystemHealthDashboard.tsx > temp_performance_tab.tsx
sed -i '' '1,250d; 51,$d' temp_performance_tab.tsx
mv temp_performance_tab.tsx components/admin/SystemHealthDashboard/PerformanceTab.tsx

# Extract MemoryTab
echo "🧠 Extracting MemoryTab..."
grep -A 57 "function MemoryTab" components/admin/SystemHealthDashboard.tsx > temp_memory_tab.tsx
sed -i '' '1,300d; 58,$d' temp_memory_tab.tsx
mv temp_memory_tab.tsx components/admin/SystemHealthDashboard/MemoryTab.tsx

# Extract CacheTab
echo "💾 Extracting CacheTab..."
grep -A 59 "function CacheTab" components/admin/SystemHealthDashboard.tsx > temp_cache_tab.tsx
sed -i '' '1,358d; 60,$d' temp_cache_tab.tsx
mv temp_cache_tab.tsx components/admin/SystemHealthDashboard/CacheTab.tsx

# Extract StreamingTab
echo "🌊 Extracting StreamingTab..."
grep -A 66 "function StreamingTab" components/admin/SystemHealthDashboard.tsx > temp_streaming_tab.tsx
sed -i '' '1,418d; 67,$d' temp_streaming_tab.tsx
mv temp_streaming_tab.tsx components/admin/SystemHealthDashboard/StreamingTab.tsx

# Extract StorageTab
echo "💽 Extracting StorageTab..."
grep -A 61 "function StorageTab" components/admin/SystemHealthDashboard.tsx > temp_storage_tab.tsx
sed -i '' '1,485d; 62,$d' temp_storage_tab.tsx
mv temp_storage_tab.tsx components/admin/SystemHealthDashboard/StorageTab.tsx

# Extract SystemTab
echo "⚙️  Extracting SystemTab..."
grep -A 51 "function SystemTab" components/admin/SystemHealthDashboard.tsx > temp_system_tab.tsx
sed -i '' '1,549d; 52,$d' temp_system_tab.tsx
mv temp_system_tab.tsx components/admin/SystemHealthDashboard/SystemTab.tsx

# Extract MetricCard
echo "📈 Extracting MetricCard..."
grep -A 38 "function MetricCard" components/admin/SystemHealthDashboard.tsx > temp_metric_card.tsx
sed -i '' '1,211d; 39,$d' temp_metric_card.tsx
mv temp_metric_card.tsx components/admin/SystemHealthDashboard/MetricCard.tsx

echo "✅ Components extracted successfully!"
echo "📝 Next: Update imports in main SystemHealthDashboard.tsx"
echo "📝 Then: Create index.ts for clean imports"
