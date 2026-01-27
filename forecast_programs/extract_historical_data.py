"""
EXTRACT HISTORICAL DATA TO CSV
================================
Script untuk mengekstrak data historical dari Excel dan menyimpannya
dalam format CSV yang bisa diakses oleh frontend React.

Input:
  - Traffic_VLR_Java_2024-2025.xlsx

Output:
  - public/forecast_data/regional/[regional]_historical.csv
  - public/forecast_data/provinsi/[provinsi]_historical.csv
  - public/forecast_data/kabupaten/[kabupaten]_historical.csv

Fungsi:
  - Extract dan aggregate historical data per regional/provinsi/kabupaten
  - Save dalam format CSV yang sama dengan forecast data
"""

import pandas as pd
import numpy as np
from pathlib import Path
import warnings

warnings.filterwarnings('ignore')

def extract_regional_historical():
    """Extract historical data untuk regional"""
    print("📂 Extracting Regional Historical Data...")
    
    # Load data
    df = pd.read_excel("Traffic_VLR_Java_2024-2025.xlsx", sheet_name=0)
    df['Date'] = pd.to_datetime(df['Date'])
    
    # Regional mapping (sesuai dengan nama di Excel: huruf kapital)
    regions = {
        'bali_nusra': 'BALI NUSRA',
        'central_java': 'CENTRAL JAVA',
        'east_java': 'EAST JAVA'
    }
    
    output_dir = Path('../public/forecast_data/regional')
    output_dir.mkdir(parents=True, exist_ok=True)
    
    for filename, region_name in regions.items():
        print(f"  → Processing {region_name}...")
        
        # Filter by region
        df_region = df[df['REGION IOH'] == region_name].copy()
        
        # Aggregate per hari
        daily_data = df_region.groupby('Date').agg({
            'Traffic_H3I (TB)': 'sum',
            'Traffic_IM3 (TB)': 'sum',
            'Traffic_Total(TB)': 'sum'
        }).reset_index()
        
        daily_data = daily_data.sort_values('Date').reset_index(drop=True)
        
        # Save to CSV
        output_file = output_dir / f"{filename}_historical.csv"
        daily_data.to_csv(output_file, index=False)
        print(f"    ✓ Saved to {output_file}")

def extract_provinsi_historical():
    """Extract historical data untuk provinsi"""
    print("\n📂 Extracting Provinsi Historical Data...")
    
    # Load data
    df = pd.read_excel("Traffic_VLR_Java_2024-2025.xlsx", sheet_name=0)
    df['Date'] = pd.to_datetime(df['Date'])
    
    # Provinsi mapping (sesuai dengan nama di Excel: huruf kapital)
    provinces = {
        'bali': 'BALI',
        'daerah_istimewa_yogyakarta': 'DAERAH ISTIMEWA YOGYAKARTA',
        'jawa_tengah': 'JAWA TENGAH',
        'jawa_timur': 'JAWA TIMUR',
        'nusa_tenggara_barat': 'NUSA TENGGARA BARAT',
        'nusa_tenggara_timur': 'NUSA TENGGARA TIMUR'
    }
    
    output_dir = Path('../public/forecast_data/provinsi')
    output_dir.mkdir(parents=True, exist_ok=True)
    
    for filename, province_name in provinces.items():
        print(f"  → Processing {province_name}...")
        
        # Filter by province
        df_province = df[df['PROVINCE'] == province_name].copy()
        
        if len(df_province) == 0:
            print(f"    ⚠️  No data found for {province_name}")
            continue
        
        # Aggregate per hari
        daily_data = df_province.groupby('Date').agg({
            'Traffic_H3I (TB)': 'sum',
            'Traffic_IM3 (TB)': 'sum',
            'Traffic_Total(TB)': 'sum'
        }).reset_index()
        
        daily_data = daily_data.sort_values('Date').reset_index(drop=True)
        
        # Save to CSV
        output_file = output_dir / f"{filename}_historical.csv"
        daily_data.to_csv(output_file, index=False)
        print(f"    ✓ Saved to {output_file}")

def extract_kabupaten_historical():
    """Extract historical data untuk top kabupaten"""
    print("\n📂 Extracting Kabupaten Historical Data (Top 20)...")
    
    # Load data
    df = pd.read_excel("Traffic_VLR_Java_2024-2025.xlsx", sheet_name=0)
    df['Date'] = pd.to_datetime(df['Date'])
    
    # Get top 20 kabupaten berdasarkan total traffic
    kabupaten_totals = df.groupby('KABUPATEN IOH')['Traffic_Total(TB)'].sum().sort_values(ascending=False)
    top_kabupaten = kabupaten_totals.head(20).index.tolist()
    
    output_dir = Path('../public/forecast_data/kabupaten')
    output_dir.mkdir(parents=True, exist_ok=True)
    
    for kabupaten in top_kabupaten:
        filename = kabupaten.lower().replace(' ', '_')
        print(f"  → Processing {kabupaten}...")
        
        # Filter by kabupaten
        df_kab = df[df['KABUPATEN IOH'] == kabupaten].copy()
        
        # Aggregate per hari
        daily_data = df_kab.groupby('Date').agg({
            'Traffic_H3I (TB)': 'sum',
            'Traffic_IM3 (TB)': 'sum',
            'Traffic_Total(TB)': 'sum'
        }).reset_index()
        
        daily_data = daily_data.sort_values('Date').reset_index(drop=True)
        
        # Save to CSV
        output_file = output_dir / f"{filename}_historical.csv"
        daily_data.to_csv(output_file, index=False)
        print(f"    ✓ Saved to {output_file}")

def main():
    """Main function"""
    print("=" * 60)
    print("EXTRACT HISTORICAL DATA TO CSV")
    print("=" * 60)
    
    try:
        extract_regional_historical()
        extract_provinsi_historical()
        extract_kabupaten_historical()
        
        print("\n" + "=" * 60)
        print("✅ HISTORICAL DATA EXTRACTION COMPLETED!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
