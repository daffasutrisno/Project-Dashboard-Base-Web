"""
STEP 2: MERGE FORECAST + HISTORICAL → merged_outputs
=====================================================
Menggabungkan data forecast dari forecast_results/ dengan data historis
dari Excel, menghasilkan file merged di public/merged_outputs/ yang
siap dibaca oleh web dashboard.

Format output: Date,Traffic_Total(TB),Lower_Bound,Upper_Bound
  - Lower_Bound=0 & Upper_Bound=0 → data historis
  - Lower_Bound>0 & Upper_Bound>0 → data forecast

Input:
  - forecast_results/01_main/forecast_data.csv
  - forecast_results/02_regional/*.csv
  - forecast_results/03_provinsi/*.csv
  - forecast_results/04_kabupaten/*.csv
  - Traffic_VLR_Java_2024-2025.xlsx (untuk data historis)

Output:
  - public/merged_outputs/by_region/*.csv
  - public/merged_outputs/by_province/*.csv
  - public/merged_outputs/by_kabupaten/*.csv
"""

import pandas as pd
import numpy as np
from pathlib import Path
from datetime import timedelta


def load_excel_data():
    """Load data historis dari Excel"""
    excel_path = Path("Traffic_VLR_Java_2024-2025.xlsx")
    if not excel_path.exists():
        raise FileNotFoundError(f"Excel file not found: {excel_path}")
    
    df = pd.read_excel(excel_path, sheet_name=0)
    df['Date'] = pd.to_datetime(df['Date'])
    return df


def merge_historical_forecast(historical_df, forecast_df, name, output_path):
    """
    Gabungkan data historis dan forecast, simpan ke CSV.
    
    historical_df: DataFrame dengan kolom Date, Traffic_Total(TB)
    forecast_df: DataFrame dengan kolom Date, Traffic_Total(TB), Lower_Bound, Upper_Bound
    """
    # Prepare historical: Lower_Bound=0, Upper_Bound=0
    hist = historical_df[['Date', 'Traffic_Total(TB)']].copy()
    hist['Lower_Bound'] = 0
    hist['Upper_Bound'] = 0
    
    # Prepare forecast: keep Lower_Bound and Upper_Bound
    fore = forecast_df[['Date', 'Traffic_Total(TB)', 'Lower_Bound', 'Upper_Bound']].copy()
    
    # Combine
    merged = pd.concat([hist, fore], ignore_index=True)
    merged = merged.sort_values('Date').reset_index(drop=True)
    
    # Save
    output_path.parent.mkdir(parents=True, exist_ok=True)
    merged.to_csv(output_path, index=False)
    
    return merged


def merge_regional(df_historical):
    """Merge data regional: 3 regional"""
    print("\n" + "=" * 60)
    print("  MERGE REGIONAL (3 regional)")
    print("=" * 60)
    
    forecast_dir = Path("forecast_results/02_regional")
    output_dir = Path("../public/merged_outputs/by_region")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Regional mapping: filename → REGION IOH name
    regions = {
        'bali_nusra': 'BALI NUSRA',
        'central_java': 'CENTRAL JAVA',
        'east_java': 'EAST JAVA'
    }
    
    for filename, region_name in regions.items():
        forecast_file = forecast_dir / f"{filename}.csv"
        if not forecast_file.exists():
            print(f"  ⚠️  Forecast file not found: {forecast_file}")
            continue
        
        # Load forecast
        df_forecast = pd.read_csv(forecast_file)
        df_forecast['Date'] = pd.to_datetime(df_forecast['Date'])
        
        # Get historical data for this region
        df_region = df_historical[df_historical['REGION IOH'] == region_name].copy()
        daily_hist = df_region.groupby('Date').agg({
            'Traffic_Total(TB)': 'sum'
        }).reset_index()
        
        # Merge and save
        output_file = output_dir / f"{region_name.upper().replace(' ', '_')}.csv"
        merged = merge_historical_forecast(daily_hist, df_forecast, region_name, output_file)
        
        hist_count = len(daily_hist)
        fore_count = len(df_forecast)
        print(f"  ✓ {region_name}: {hist_count} historis + {fore_count} forecast → {output_file.name}")
    
    return True


def merge_provinsi(df_historical):
    """Merge data provinsi: 6 provinsi"""
    print("\n" + "=" * 60)
    print("  MERGE PROVINSI (6 provinsi)")
    print("=" * 60)
    
    forecast_dir = Path("forecast_results/03_provinsi")
    output_dir = Path("../public/merged_outputs/by_province")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Province mapping
    provinces = {
        'bali': 'BALI',
        'daerah_istimewa_yogyakarta': 'DAERAH ISTIMEWA YOGYAKARTA',
        'jawa_tengah': 'JAWA TENGAH',
        'jawa_timur': 'JAWA TIMUR',
        'nusa_tenggara_barat': 'NUSA TENGGARA BARAT',
        'nusa_tenggara_timur': 'NUSA TENGGARA TIMUR'
    }
    
    for filename, province_name in provinces.items():
        forecast_file = forecast_dir / f"{filename}.csv"
        if not forecast_file.exists():
            print(f"  ⚠️  Forecast file not found: {forecast_file}")
            continue
        
        # Load forecast
        df_forecast = pd.read_csv(forecast_file)
        df_forecast['Date'] = pd.to_datetime(df_forecast['Date'])
        
        # Get historical data
        df_prov = df_historical[df_historical['PROVINCE'] == province_name].copy()
        daily_hist = df_prov.groupby('Date').agg({
            'Traffic_Total(TB)': 'sum'
        }).reset_index()
        
        # Merge and save
        output_file = output_dir / f"{province_name.upper().replace(' ', '_')}.csv"
        merged = merge_historical_forecast(daily_hist, df_forecast, province_name, output_file)
        
        hist_count = len(daily_hist)
        fore_count = len(df_forecast)
        print(f"  ✓ {province_name}: {hist_count} historis + {fore_count} forecast → {output_file.name}")
    
    return True


def merge_kabupaten(df_historical):
    """Merge data kabupaten: semua kabupaten yang ada forecast-nya"""
    print("\n" + "=" * 60)
    print("  MERGE KABUPATEN")
    print("=" * 60)
    
    forecast_dir = Path("forecast_results/04_kabupaten")
    output_dir = Path("../public/merged_outputs/by_kabupaten")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    if not forecast_dir.exists():
        print("  ⚠️  forecast_results/04_kabupaten/ not found, skipping kabupaten")
        return False
    
    csv_files = list(forecast_dir.glob("*.csv"))
    print(f"  Ditemukan {len(csv_files)} file forecast kabupaten")
    
    success = 0
    for csv_file in csv_files:
        # Extract kabupaten name from filename
        kabupaten_name_slug = csv_file.stem  # e.g., "alor" or "alor_forecast"
        if kabupaten_name_slug.endswith('_forecast'):
            kabupaten_name_slug = kabupaten_name_slug[:-9]  # remove _forecast suffix
        
        # Convert slug to display name
        kabupaten_display = kabupaten_name_slug.replace('_', ' ').upper()
        
        # Load forecast
        df_forecast = pd.read_csv(csv_file)
        df_forecast['Date'] = pd.to_datetime(df_forecast['Date'])
        
        # Match with Excel kabupaten name (case-insensitive)
        df_kab = pd.DataFrame()
        for unique_kab in df_historical['KABUPATEN IOH'].unique():
            if unique_kab.lower().replace(' ', '_') == kabupaten_name_slug.lower():
                df_kab = df_historical[df_historical['KABUPATEN IOH'] == unique_kab].copy()
                kabupaten_display = unique_kab
                break
        
        if len(df_kab) == 0:
            print(f"  ⚠️  {kabupaten_name_slug}: no historical data found in Excel")
            continue
        
        # Aggregate historical
        daily_hist = df_kab.groupby('Date').agg({
            'Traffic_Total(TB)': 'sum'
        }).reset_index()
        
        # Output filename in uppercase
        output_name = kabupaten_display.upper().replace(' ', '_')
        output_file = output_dir / f"{output_name}.csv"
        
        merged = merge_historical_forecast(daily_hist, df_forecast, kabupaten_display, output_file)
        success += 1
        
        if success <= 5 or success % 20 == 0:
            print(f"  [{success}/{len(csv_files)}] ✓ {kabupaten_display}")
    
    print(f"  ✓ Berhasil merge {success}/{len(csv_files)} kabupaten")
    return True


def main():
    """Main merge process"""
    print("=" * 60)
    print("  STEP 2: MERGE FORECAST + HISTORICAL")
    print("=" * 60)
    
    # Load Excel data
    print("\n📂 Loading Excel data...")
    df = load_excel_data()
    print(f"  ✓ Loaded {len(df):,} rows, {len(df['Date'].unique())} unique dates")
    
    # Merge per level
    merge_regional(df)
    merge_provinsi(df)
    merge_kabupaten(df)
    
    print("\n" + "=" * 60)
    print("  ✅ STEP 2 SELESAI!")
    print("=" * 60)
    print("\nOutput di: public/merged_outputs/")
    print("  - by_region/    (3 file)")
    print("  - by_province/  (6 file)")
    print("  - by_kabupaten/ (119 file)")
    print("=" * 60)


if __name__ == "__main__":
    main()
