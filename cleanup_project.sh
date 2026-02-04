#!/bin/bash

echo "========================================"
echo "PROJECT CLEANUP SCRIPT"
echo "Removing template components and unused files"
echo "========================================"
echo ""

echo "[Step 1/6] Removing template component folders..."
rm -rf src/components/auth
rm -rf src/components/ecommerce
rm -rf src/components/UserProfile
rm -rf src/components/charts
rm -rf src/components/ui
rm -rf src/components/form
rm -rf src/components/tables
echo "   ✓ Deleted 7 template component folders"

echo ""
echo "[Step 2/6] Removing template page folders..."
rm -rf src/pages/AuthPages
rm -rf src/pages/Dashboard
rm -rf src/pages/Charts
rm -rf src/pages/Forms
rm -rf src/pages/Tables
rm -rf src/pages/UiElements
echo "   ✓ Deleted 6 template page folders"

echo ""
echo "[Step 3/6] Removing unused standalone pages..."
rm -f src/pages/UserProfiles.tsx
rm -f src/pages/Blank.tsx
rm -f src/pages/Calendar.tsx
rm -f src/pages/ForecastResult.tsx
rm -f src/pages/Forecast/Analysis.tsx
echo "   ✓ Deleted 5 unused page files"

echo ""
echo "[Step 4/6] Removing unused component files..."
rm -f src/components/common/ThemeTogglerTwo.tsx
rm -f src/components/common/PageBreadCrumb.tsx
rm -f src/components/common/ComponentCard.tsx
rm -f src/components/common/GridShape.tsx
rm -f src/components/common/ChartTab.tsx
rm -f src/components/forecast/MonthlyIndexChart.tsx
rm -f src/components/forecast/ForecastStatisticsChart.tsx
rm -f src/components/forecast/ForecastChart.tsx.backup
rm -f src/layout/SidebarWidget.tsx
rm -f src/components/header/Header.tsx
echo "   ✓ Deleted 10 unused component files"

echo ""
echo "[Step 5/6] Removing unused hooks..."
rm -f src/hooks/useModal.ts
rm -f src/hooks/useGoBack.ts
echo "   ✓ Deleted 2 unused hooks"

echo ""
echo "[Step 6/6] Removing temporary data and documentation..."
rm -rf forecast_results
rm -rf merged_outputs
rm -f KPI_CHARTS_README.md
rm -f KPI_IMPLEMENTATION_GUIDE.md
rm -f KPI_IMPLEMENTATION_SUMMARY.md
rm -f kabupaten_list.txt
rm -f CHART_IMPROVEMENTS.md
echo "   ✓ Deleted temporary folders and documentation files"

echo ""
echo "========================================"
echo "CLEANUP COMPLETED!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Run: npm run build"
echo "2. Test all 5 pages to verify no broken imports"
echo "3. If everything works, commit the changes"
echo ""
