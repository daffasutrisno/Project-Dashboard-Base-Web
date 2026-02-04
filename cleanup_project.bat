@echo off
echo ========================================
echo PROJECT CLEANUP SCRIPT
echo Removing template components and unused files
echo ========================================
echo.

echo [Step 1/6] Removing template component folders...
if exist "src\components\auth" rmdir /s /q "src\components\auth"
if exist "src\components\ecommerce" rmdir /s /q "src\components\ecommerce"
if exist "src\components\UserProfile" rmdir /s /q "src\components\UserProfile"
if exist "src\components\charts" rmdir /s /q "src\components\charts"
if exist "src\components\ui" rmdir /s /q "src\components\ui"
if exist "src\components\form" rmdir /s /q "src\components\form"
if exist "src\components\tables" rmdir /s /q "src\components\tables"
echo    ✓ Deleted 7 template component folders

echo.
echo [Step 2/6] Removing template page folders...
if exist "src\pages\AuthPages" rmdir /s /q "src\pages\AuthPages"
if exist "src\pages\Dashboard" rmdir /s /q "src\pages\Dashboard"
if exist "src\pages\Charts" rmdir /s /q "src\pages\Charts"
if exist "src\pages\Forms" rmdir /s /q "src\pages\Forms"
if exist "src\pages\Tables" rmdir /s /q "src\pages\Tables"
if exist "src\pages\UiElements" rmdir /s /q "src\pages\UiElements"
echo    ✓ Deleted 6 template page folders

echo.
echo [Step 3/6] Removing unused standalone pages...
if exist "src\pages\UserProfiles.tsx" del /q "src\pages\UserProfiles.tsx"
if exist "src\pages\Blank.tsx" del /q "src\pages\Blank.tsx"
if exist "src\pages\Calendar.tsx" del /q "src\pages\Calendar.tsx"
if exist "src\pages\ForecastResult.tsx" del /q "src\pages\ForecastResult.tsx"
if exist "src\pages\Forecast\Analysis.tsx" del /q "src\pages\Forecast\Analysis.tsx"
echo    ✓ Deleted 5 unused page files

echo.
echo [Step 4/6] Removing unused component files...
if exist "src\components\common\ThemeTogglerTwo.tsx" del /q "src\components\common\ThemeTogglerTwo.tsx"
if exist "src\components\common\PageBreadCrumb.tsx" del /q "src\components\common\PageBreadCrumb.tsx"
if exist "src\components\common\ComponentCard.tsx" del /q "src\components\common\ComponentCard.tsx"
if exist "src\components\common\GridShape.tsx" del /q "src\components\common\GridShape.tsx"
if exist "src\components\common\ChartTab.tsx" del /q "src\components\common\ChartTab.tsx"
if exist "src\components\forecast\MonthlyIndexChart.tsx" del /q "src\components\forecast\MonthlyIndexChart.tsx"
if exist "src\components\forecast\ForecastStatisticsChart.tsx" del /q "src\components\forecast\ForecastStatisticsChart.tsx"
if exist "src\components\forecast\ForecastChart.tsx.backup" del /q "src\components\forecast\ForecastChart.tsx.backup"
if exist "src\layout\SidebarWidget.tsx" del /q "src\layout\SidebarWidget.tsx"
if exist "src\components\header\Header.tsx" del /q "src\components\header\Header.tsx"
echo    ✓ Deleted 10 unused component files

echo.
echo [Step 5/6] Removing unused hooks...
if exist "src\hooks\useModal.ts" del /q "src\hooks\useModal.ts"
if exist "src\hooks\useGoBack.ts" del /q "src\hooks\useGoBack.ts"
echo    ✓ Deleted 2 unused hooks

echo.
echo [Step 6/6] Removing temporary data and documentation...
if exist "forecast_results" rmdir /s /q "forecast_results"
if exist "merged_outputs" rmdir /s /q "merged_outputs"
if exist "KPI_CHARTS_README.md" del /q "KPI_CHARTS_README.md"
if exist "KPI_IMPLEMENTATION_GUIDE.md" del /q "KPI_IMPLEMENTATION_GUIDE.md"
if exist "KPI_IMPLEMENTATION_SUMMARY.md" del /q "KPI_IMPLEMENTATION_SUMMARY.md"
if exist "kabupaten_list.txt" del /q "kabupaten_list.txt"
if exist "CHART_IMPROVEMENTS.md" del /q "CHART_IMPROVEMENTS.md"
echo    ✓ Deleted temporary folders and documentation files

echo.
echo ========================================
echo CLEANUP COMPLETED!
echo ========================================
echo.
echo Next steps:
echo 1. Run: npm run build
echo 2. Test all 5 pages to verify no broken imports
echo 3. If everything works, commit the changes
echo.
pause
