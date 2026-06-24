"""
STEP 3: ANALYSIS — STATISTICS & COMPARISON
===========================================
Analisis data hasil merge untuk kebutuhan web dashboard:
  1. Regional statistics + comparison
  2. Provinsi statistics + comparison
  3. Kabupaten growth ranking + statistics

Input:
  - public/merged_outputs/by_region/*.csv
  - public/merged_outputs/by_province/*.csv
  - public/merged_outputs/by_kabupaten/*.csv
  - Traffic_VLR_Java_2024-2025.xlsx (metadata kabupaten)

Output (→ public/web_data/):
  - regional_statistics.csv
  - regional_comparison.csv
  - provinsi_statistics.csv
  - provinsi_comparison.csv
  - kabupaten_all_growth.csv
  - kabupaten_statistics.csv
"""

import pandas as pd
from pathlib import Path


def analyze_regional():
    """Analisis statistik + komparasi untuk 3 regional"""
    print("\n" + "=" * 60)
    print("  ANALISIS REGIONAL")
    print("=" * 60)

    merged_dir = Path("../public/merged_outputs/by_region")
    output_dir = Path("../public/web_data")
    output_dir.mkdir(parents=True, exist_ok=True)

    regions = [
        {"name": "BALI NUSRA", "file": "BALI_NUSRA"},
        {"name": "CENTRAL JAVA", "file": "CENTRAL_JAVA"},
        {"name": "EAST JAVA", "file": "EAST_JAVA"}
    ]

    stats_data = []
    comparison_data = []

    for region in regions:
        file_path = merged_dir / f"{region['file']}.csv"
        if not file_path.exists():
            print(f"  ⚠️  File not found: {file_path}")
            continue

        df = pd.read_csv(file_path)

        # Split historical vs forecast by Lower_Bound/Upper_Bound
        if 'Lower_Bound' in df.columns and 'Upper_Bound' in df.columns:
            df['LB'] = df['Lower_Bound'].fillna(0)
            df['UB'] = df['Upper_Bound'].fillna(0)
        else:
            df['LB'] = 0
            df['UB'] = 0

        traffic_col = 'Traffic_Total(TB)' if 'Traffic_Total(TB)' in df.columns else df.columns[1]

        historical = df[(df['LB'] == 0) & (df['UB'] == 0)]
        forecast = df[(df['LB'] != 0) | (df['UB'] != 0)]

        hist_mean = historical[traffic_col].mean() if len(historical) > 0 else 0
        hist_std = historical[traffic_col].std() if len(historical) > 0 else 0
        hist_min = historical[traffic_col].min() if len(historical) > 0 else 0
        hist_max = historical[traffic_col].max() if len(historical) > 0 else 0
        hist_count = len(historical)

        fore_mean = forecast[traffic_col].mean() if len(forecast) > 0 else 0
        fore_std = forecast[traffic_col].std() if len(forecast) > 0 else 0
        fore_min = forecast[traffic_col].min() if len(forecast) > 0 else 0
        fore_max = forecast[traffic_col].max() if len(forecast) > 0 else 0
        fore_count = len(forecast)

        stats_data.append({
            'Region': region['name'],
            'Hist_Mean': round(hist_mean, 2),
            'Hist_Std': round(hist_std, 2),
            'Hist_Min': round(hist_min, 2),
            'Hist_Max': round(hist_max, 2),
            'Fore_Mean': round(fore_mean, 2),
            'Fore_Std': round(fore_std, 2),
            'Fore_Min': round(fore_min, 2),
            'Fore_Max': round(fore_max, 2),
            'Data_Points_Hist': hist_count,
            'Data_Points_Fore': fore_count
        })

        change = fore_mean - hist_mean
        change_pct = (change / hist_mean) * 100 if hist_mean > 0 else 0
        comparison_data.append({
            'Region': region['name'],
            'Historical_Avg': round(hist_mean, 2),
            'Forecast_Avg': round(fore_mean, 2),
            'Change': round(change, 2),
            'Change_Pct': round(change_pct, 2)
        })

        print(f"  ✓ {region['name']}: {hist_count} hist + {fore_count} fore, Δ={change:+.2f} TB ({change_pct:+.2f}%)")

    # Save
    pd.DataFrame(stats_data).to_csv(output_dir / "regional_statistics.csv", index=False)
    pd.DataFrame(comparison_data).to_csv(output_dir / "regional_comparison.csv", index=False)
    print(f"  → regional_statistics.csv, regional_comparison.csv")

    return True


def analyze_provinsi():
    """Analisis statistik + komparasi untuk 6 provinsi"""
    print("\n" + "=" * 60)
    print("  ANALISIS PROVINSI")
    print("=" * 60)

    merged_dir = Path("../public/merged_outputs/by_province")
    output_dir = Path("../public/web_data")
    output_dir.mkdir(parents=True, exist_ok=True)

    provinces = [
        {"name": "Bali", "file": "BALI"},
        {"name": "D.I. Yogyakarta", "file": "DAERAH_ISTIMEWA_YOGYAKARTA"},
        {"name": "Jawa Tengah", "file": "JAWA_TENGAH"},
        {"name": "Jawa Timur", "file": "JAWA_TIMUR"},
        {"name": "NTB", "file": "NUSA_TENGGARA_BARAT"},
        {"name": "NTT", "file": "NUSA_TENGGARA_TIMUR"}
    ]

    stats_data = []
    comparison_data = []

    for prov in provinces:
        file_path = merged_dir / f"{prov['file']}.csv"
        if not file_path.exists():
            print(f"  ⚠️  File not found: {file_path}")
            continue

        df = pd.read_csv(file_path)

        if 'Lower_Bound' in df.columns and 'Upper_Bound' in df.columns:
            df['LB'] = df['Lower_Bound'].fillna(0)
            df['UB'] = df['Upper_Bound'].fillna(0)
        else:
            df['LB'] = 0
            df['UB'] = 0

        traffic_col = 'Traffic_Total(TB)' if 'Traffic_Total(TB)' in df.columns else df.columns[1]

        historical = df[(df['LB'] == 0) & (df['UB'] == 0)]
        forecast = df[(df['LB'] != 0) | (df['UB'] != 0)]

        hist_mean = historical[traffic_col].mean() if len(historical) > 0 else 0
        hist_std = historical[traffic_col].std() if len(historical) > 0 else 0
        hist_min = historical[traffic_col].min() if len(historical) > 0 else 0
        hist_max = historical[traffic_col].max() if len(historical) > 0 else 0
        hist_count = len(historical)

        fore_mean = forecast[traffic_col].mean() if len(forecast) > 0 else 0
        fore_std = forecast[traffic_col].std() if len(forecast) > 0 else 0
        fore_min = forecast[traffic_col].min() if len(forecast) > 0 else 0
        fore_max = forecast[traffic_col].max() if len(forecast) > 0 else 0
        fore_count = len(forecast)

        stats_data.append({
            'Province': prov['name'],
            'Hist_Mean': round(hist_mean, 2),
            'Hist_Std': round(hist_std, 2),
            'Hist_Min': round(hist_min, 2),
            'Hist_Max': round(hist_max, 2),
            'Fore_Mean': round(fore_mean, 2),
            'Fore_Std': round(fore_std, 2),
            'Fore_Min': round(fore_min, 2),
            'Fore_Max': round(fore_max, 2),
            'Data_Points_Hist': hist_count,
            'Data_Points_Fore': fore_count
        })

        change = fore_mean - hist_mean
        change_pct = (change / hist_mean) * 100 if hist_mean > 0 else 0
        comparison_data.append({
            'Province': prov['name'],
            'Historical_Avg': round(hist_mean, 2),
            'Forecast_Avg': round(fore_mean, 2),
            'Change': round(change, 2),
            'Change_Pct': round(change_pct, 2)
        })

        print(f"  ✓ {prov['name']}: {hist_count} hist + {fore_count} fore, Δ={change:+.2f} TB ({change_pct:+.2f}%)")

    # Save
    pd.DataFrame(stats_data).to_csv(output_dir / "provinsi_statistics.csv", index=False)
    pd.DataFrame(comparison_data).to_csv(output_dir / "provinsi_comparison.csv", index=False)
    print(f"  → provinsi_statistics.csv, provinsi_comparison.csv")

    return True


def load_kabupaten_metadata():
    """Load metadata kabupaten (region, province) dari Excel"""
    excel_paths = [
        Path("Traffic_VLR_Java_2024-2025.xlsx"),
        Path("../Traffic_VLR_Java_2024-2025.xlsx"),
    ]
    
    excel_file = None
    for path in excel_paths:
        if path.exists():
            excel_file = path
            break
    
    if excel_file is None:
        print("  ⚠️  Excel metadata not found, region/province will be 'Unknown'")
        return {}
    
    df = pd.read_excel(excel_file, sheet_name=0)
    kabupaten_meta = {}
    for _, row in df.iterrows():
        kab = row.get('KABUPATEN IOH', '')
        if pd.notna(kab):
            key = kab.lower().replace(' ', '_')
            kabupaten_meta[key] = {
                'region': row.get('REGION IOH', 'Unknown'),
                'province': row.get('PROVINCE', 'Unknown')
            }
    
    return kabupaten_meta


def analyze_kabupaten():
    """Analisis growth ranking + statistics untuk kabupaten"""
    print("\n" + "=" * 60)
    print("  ANALISIS KABUPATEN")
    print("=" * 60)

    merged_dir = Path("../public/merged_outputs/by_kabupaten")
    output_dir = Path("../public/web_data")
    output_dir.mkdir(parents=True, exist_ok=True)

    # Load metadata
    kabupaten_meta = load_kabupaten_metadata()

    # Get all CSV files
    csv_files = list(merged_dir.glob("*.csv")) if merged_dir.exists() else []
    print(f"  Ditemukan {len(csv_files)} file kabupaten")

    growth_data = []
    stats_data = []

    for csv_file in csv_files:
        kabupaten_name = csv_file.stem.replace('_', ' ').title()

        try:
            df = pd.read_csv(csv_file)

            if 'Lower_Bound' in df.columns and 'Upper_Bound' in df.columns:
                df['LB'] = df['Lower_Bound'].fillna(0)
                df['UB'] = df['Upper_Bound'].fillna(0)
            else:
                df['LB'] = 0
                df['UB'] = 0

            traffic_col = 'Traffic_Total(TB)' if 'Traffic_Total(TB)' in df.columns else df.columns[1]

            historical = df[(df['LB'] == 0) & (df['UB'] == 0)]
            forecast = df[(df['LB'] != 0) | (df['UB'] != 0)]

            hist_mean = historical[traffic_col].mean() if len(historical) > 0 else 0
            hist_std = historical[traffic_col].std() if len(historical) > 0 else 0
            hist_min = historical[traffic_col].min() if len(historical) > 0 else 0
            hist_max = historical[traffic_col].max() if len(historical) > 0 else 0
            hist_count = len(historical)

            fore_mean = forecast[traffic_col].mean() if len(forecast) > 0 else 0
            fore_std = forecast[traffic_col].std() if len(forecast) > 0 else 0
            fore_min = forecast[traffic_col].min() if len(forecast) > 0 else 0
            fore_max = forecast[traffic_col].max() if len(forecast) > 0 else 0
            fore_count = len(forecast)

            absolute_growth = fore_mean - hist_mean
            percentage_growth = (absolute_growth / hist_mean) * 100 if hist_mean > 0 else 0

            # Get metadata
            key = csv_file.stem.lower().replace('_', ' ')
            meta_key = key.replace(' ', '_')
            meta = kabupaten_meta.get(meta_key, {'region': 'Unknown', 'province': 'Unknown'})

            # Growth table (for ranking)
            growth_data.append({
                'Kabupaten': kabupaten_name,
                'Region': meta['region'],
                'Province': meta['province'],
                'Hist_Mean': round(hist_mean, 2),
                'Fore_Mean': round(fore_mean, 2),
                'Absolute_Growth': round(absolute_growth, 2),
                'Percentage_Growth': round(percentage_growth, 2),
                'Has_Forecast': len(forecast) > 0
            })

            # Statistics table (detailed)
            stats_data.append({
                'Kabupaten': kabupaten_name,
                'Hist_Mean': round(hist_mean, 2),
                'Hist_Std': round(hist_std, 2),
                'Hist_Min': round(hist_min, 2),
                'Hist_Max': round(hist_max, 2),
                'Fore_Mean': round(fore_mean, 2),
                'Fore_Std': round(fore_std, 2),
                'Fore_Min': round(fore_min, 2),
                'Fore_Max': round(fore_max, 2),
                'Data_Points_Hist': hist_count,
                'Data_Points_Fore': fore_count,
                'Has_Forecast': len(forecast) > 0,
            })

        except Exception as e:
            print(f"  ⚠️  Error {csv_file.name}: {e}")
            continue

    # Save growth ranking (sorted by absolute growth)
    df_growth = pd.DataFrame(growth_data)
    if not df_growth.empty:
        df_growth = df_growth.sort_values('Absolute_Growth', ascending=False)
    df_growth.to_csv(output_dir / "kabupaten_all_growth.csv", index=False)
    print(f"  → kabupaten_all_growth.csv ({len(df_growth)} kabupaten)")

    # Save statistics
    df_stats = pd.DataFrame(stats_data)
    df_stats.to_csv(output_dir / "kabupaten_statistics.csv", index=False)
    print(f"  → kabupaten_statistics.csv ({len(df_stats)} kabupaten)")

    # Show top 5
    if not df_growth.empty and len(df_growth) >= 5:
        print(f"\n  Top 5 Growth:")
        for rank, (_, row) in enumerate(df_growth.head(5).iterrows(), 1):
            print(f"    {rank}. {row['Kabupaten']}: +{row['Absolute_Growth']:.2f} TB ({row['Percentage_Growth']:.2f}%)")

    return True


def main():
    """Run all analysis"""
    print("=" * 60)
    print("  STEP 3: ANALYSIS — STATISTICS & COMPARISON")
    print("=" * 60)

    analyze_regional()
    analyze_provinsi()
    analyze_kabupaten()

    print("\n" + "=" * 60)
    print("  ✅ STEP 3 SELESAI!")
    print("=" * 60)
    print("\nOutput di: public/web_data/")
    print("  - regional_statistics.csv")
    print("  - regional_comparison.csv")
    print("  - provinsi_statistics.csv")
    print("  - provinsi_comparison.csv")
    print("  - kabupaten_all_growth.csv")
    print("  - kabupaten_statistics.csv")
    print("=" * 60)


if __name__ == "__main__":
    main()
