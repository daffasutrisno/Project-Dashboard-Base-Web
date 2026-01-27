"""
AGGREGATE ALL WEB DATA
======================
Menjalankan semua agregasi data untuk web dashboard dalam satu file.

Output: outputs/*.csv → auto-copy ke ../public/web_data/

Files generated:
  - regional_statistics.csv
  - regional_comparison.csv
  - provinsi_statistics.csv
  - provinsi_comparison.csv
  - kabupaten_all_growth.csv
"""

import sys
import pandas as pd
from pathlib import Path


def aggregate_regional_statistics(output_dir):
    """Aggregate statistics untuk 3 regional"""
    
    print("Processing Regional Statistics...")
    
    # Use merged outputs only: split rows by Lower_Bound/Upper_Bound
    merged_dirs = [
        Path("../../merged_outputs/by_region"),
        Path("../public/merged_outputs/by_region"),
    ]
    
    regions = [
        {"name": "BALI NUSRA", "file": "bali_nusra"},
        {"name": "CENTRAL JAVA", "file": "central_java"},
        {"name": "EAST JAVA", "file": "east_java"}
    ]
    
    stats_data = []
    comparison_data = []
    
    for region in regions:
        # Find historical file in possible merged_dirs (case-insensitive match)
        hist_file = None
        for d in merged_dirs:
            if not d.exists():
                continue
            for p in d.glob("*.csv"):
                if region['file'].lower() in p.stem.lower():
                    hist_file = p
                    break
            if hist_file:
                break

        if hist_file is None or not hist_file.exists():
            print(f"  ⚠️  Historical file for {region['name']} not found in merged_outputs paths")
            continue

        df = pd.read_csv(hist_file)

        # Normalize column names for bounds
        if 'Lower_Bound' in df.columns and 'Upper_Bound' in df.columns:
            df['LB'] = df['Lower_Bound'].fillna(0)
            df['UB'] = df['Upper_Bound'].fillna(0)
        else:
            df['LB'] = 0
            df['UB'] = 0

        # Determine traffic column
        if 'Traffic_Total(TB)' in df.columns:
            traffic_col = 'Traffic_Total(TB)'
        else:
            # fallback: try second column
            traffic_col = df.columns[1]

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
        
        # Statistics table
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
        
        # Comparison table
        change = fore_mean - hist_mean
        change_pct = (change / hist_mean) * 100
        
        comparison_data.append({
            'Region': region['name'],
            'Historical_Avg': round(hist_mean, 2),
            'Forecast_Avg': round(fore_mean, 2),
            'Change': round(change, 2),
            'Change_Pct': round(change_pct, 2)
        })
        
        print(f"  ✓ {region['name']}")
    
    # Save statistics
    df_stats = pd.DataFrame(stats_data)
    stats_file = output_dir / "regional_statistics.csv"
    df_stats.to_csv(stats_file, index=False)
    
    # Save comparison
    df_comparison = pd.DataFrame(comparison_data)
    comparison_file = output_dir / "regional_comparison.csv"
    df_comparison.to_csv(comparison_file, index=False)
    
    print(f"  → regional_statistics.csv ({len(stats_data)} regions)")
    print(f"  → regional_comparison.csv")
    
    return True


def aggregate_provinsi_statistics(output_dir):
    """Aggregate statistics untuk 6 provinsi"""
    
    print("Processing Provinsi Statistics...")
    
    # Use merged outputs for provinsi (split by LB/UB)
    merged_dirs = [
        Path("../../merged_outputs/by_province"),
        Path("../public/merged_outputs/by_province"),
    ]
    
    provinces = [
        {"name": "Bali", "file": "bali"},
        {"name": "D.I. Yogyakarta", "file": "daerah_istimewa_yogyakarta"},
        {"name": "Jawa Tengah", "file": "jawa_tengah"},
        {"name": "Jawa Timur", "file": "jawa_timur"},
        {"name": "NTB", "file": "nusa_tenggara_barat"},
        {"name": "NTT", "file": "nusa_tenggara_timur"}
    ]
    
    stats_data = []
    comparison_data = []
    
    for province in provinces:
        # Find merged province file in possible merged_dirs
        prov_file = None
        for d in merged_dirs:
            if not d.exists():
                continue
            for p in d.glob("*.csv"):
                if province['file'].lower() in p.stem.lower():
                    prov_file = p
                    break
            if prov_file:
                break

        if prov_file is None or not prov_file.exists():
            print(f"  ⚠️  Merged file for {province['name']} not found in merged_outputs paths")
            continue

        df = pd.read_csv(prov_file)
        if 'Lower_Bound' in df.columns and 'Upper_Bound' in df.columns:
            df['LB'] = df['Lower_Bound'].fillna(0)
            df['UB'] = df['Upper_Bound'].fillna(0)
        else:
            df['LB'] = 0
            df['UB'] = 0

        if 'Traffic_Total(TB)' in df.columns:
            traffic_col = 'Traffic_Total(TB)'
        else:
            traffic_col = df.columns[1]

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
        
        # Statistics table
        stats_data.append({
            'Province': province['name'],
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
        
        # Comparison table
        change = fore_mean - hist_mean
        change_pct = (change / hist_mean) * 100
        
        comparison_data.append({
            'Province': province['name'],
            'Historical_Avg': round(hist_mean, 2),
            'Forecast_Avg': round(fore_mean, 2),
            'Change': round(change, 2),
            'Change_Pct': round(change_pct, 2)
        })
        
        print(f"  ✓ {province['name']}")
    
    # Save statistics
    df_stats = pd.DataFrame(stats_data)
    stats_file = output_dir / "provinsi_statistics.csv"
    df_stats.to_csv(stats_file, index=False)
    
    # Save comparison
    df_comparison = pd.DataFrame(comparison_data)
    comparison_file = output_dir / "provinsi_comparison.csv"
    df_comparison.to_csv(comparison_file, index=False)
    
    print(f"  → provinsi_statistics.csv ({len(stats_data)} provinces)")
    print(f"  → provinsi_comparison.csv")
    
    return True


def aggregate_kabupaten_ranking(output_dir):
    """Aggregate growth ranking untuk semua kabupaten"""
    
    print("Processing Kabupaten Ranking...")
    
    merged_dirs = [
        Path("../../merged_outputs/by_kabupaten"),
        Path("../public/merged_outputs/by_kabupaten"),
    ]
    forecast_dir = Path("../../forecast_results/04_kabupaten")
    
    # Load metadata
    try:
        # Try multiple possible locations
        excel_paths = [
            Path("../../forecast_programs/Traffic_VLR_Java_2024-2025.xlsx"),
            Path("../forecast_programs/Traffic_VLR_Java_2024-2025.xlsx"),
            Path("../../Traffic_VLR_Java_2024-2025.xlsx"),
        ]
        excel_file = None
        for path in excel_paths:
            if path.exists():
                excel_file = path
                break
        
        if excel_file is None:
            raise FileNotFoundError("Metadata file not found")
            
        df_meta = pd.read_excel(excel_file, sheet_name=0)
        kabupaten_meta = {}
        for _, row in df_meta.iterrows():
            kab = row.get('KABUPATEN IOH', '')
            if pd.notna(kab):
                kabupaten_meta[kab.lower().replace(' ', '_')] = {
                    'region': row.get('REGION IOH', 'Unknown'),
                    'province': row.get('PROVINCE', 'Unknown')
                }
    except Exception as e:
        print(f"  ⚠️  Cannot load metadata ({e}), region/province will be empty")
        kabupaten_meta = {}
    
    kabupaten_list = [
        "alor", "badung", "bangkalan", "bangli", "banjarnegara", "bantul",
        "banyumas", "banyuwangi", "batang", "belu", "bima", "blitar", "blora",
        "bojonegoro", "bondowoso", "boyolali", "brebes", "buleleng", "cilacap",
        "demak", "dompu", "ende", "flores_timur", "gianyar", "gresik", "grobogan",
        "gunungkidul", "jember", "jembrana", "jepara", "jombang", "karanganyar",
        "karangasem", "kebumen", "kediri", "kendal", "klaten", "klungkung",
        "kota_batu", "kota_bima", "kota_blitar", "kota_denpasar", "kota_kediri",
        "kota_kupang", "kota_madiun", "kota_magelang", "kota_malang", "kota_mataram",
        "kota_mojokerto", "kota_pasuruan", "kota_pekalongan", "kota_probolinggo",
        "kota_salatiga", "kota_semarang", "kota_surabaya", "kota_surakarta",
        "kota_tegal", "kota_yogyakarta", "kudus", "kulon_progo", "kupang",
        "lamongan", "lembata", "lombok_barat", "lombok_tengah", "lombok_timur",
        "lombok_utara", "lumajang", "madiun", "magelang", "magetan", "malaka",
        "malang", "manggarai", "manggarai_barat", "manggarai_timur", "mojokerto",
        "nagekeo", "ngada", "nganjuk", "ngawi", "pacitan", "pamekasan", "pasuruan",
        "pati", "pekalongan", "pemalang", "ponorogo", "probolinggo", "purbalingga",
        "purworejo", "rembang", "rote_ndao", "sabu_raijua", "sampang",
        "semarang", "sidoarjo", "sikka", "situbondo", "sleman", "sragen",
        "sukoharjo", "sumbawa", "sumbawa_barat", "sumba_barat", "sumba_barat_daya",
        "sumba_tengah", "sumba_timur", "sumenep", "tabanan", "tegal", "temanggung",
        "timor_tengah_selatan", "timor_tengah_utara", "trenggalek", "tuban",
        "tulungagung", "wonogiri", "wonosobo"
    ]
    
    growth_data = []
    processed = 0
    
    for kabupaten in kabupaten_list:
        # Find historical merged file (case-insensitive) across merged_dirs
        hist_file = None
        for d in merged_dirs:
            if not d.exists():
                continue
            for p in d.glob("*.csv"):
                if kabupaten.replace('_', ' ').lower() in p.stem.lower() or kabupaten.lower() in p.stem.lower():
                    hist_file = p
                    break
            if hist_file:
                break

        # If merged file not found, still include kabupaten with zeros
        if hist_file is None or not hist_file.exists():
            # append empty entry
            formatted_name = kabupaten.replace('_', ' ').title()
            meta = kabupaten_meta.get(kabupaten, {'region': 'Unknown', 'province': 'Unknown'})
            growth_data.append({
                'Kabupaten': formatted_name,
                'Region': meta['region'],
                'Province': meta['province'],
                'Hist_Mean': 0,
                'Fore_Mean': 0,
                'Absolute_Growth': 0,
                'Percentage_Growth': 0,
                'Has_Forecast': False
            })
            continue

        try:
            df = pd.read_csv(hist_file)
            if 'Lower_Bound' in df.columns and 'Upper_Bound' in df.columns:
                df['LB'] = df['Lower_Bound'].fillna(0)
                df['UB'] = df['Upper_Bound'].fillna(0)
            else:
                df['LB'] = 0
                df['UB'] = 0

            if 'Traffic_Total(TB)' in df.columns:
                traffic_col = 'Traffic_Total(TB)'
            else:
                traffic_col = df.columns[1]

            historical = df[(df['LB'] == 0) & (df['UB'] == 0)]
            forecast = df[(df['LB'] != 0) | (df['UB'] != 0)]

            hist_mean = historical[traffic_col].mean() if len(historical) > 0 else 0
            fore_mean = forecast[traffic_col].mean() if len(forecast) > 0 else 0
            # additional stats for kabupaten_statistics
            hist_std = historical[traffic_col].std() if len(historical) > 0 else 0
            hist_min = historical[traffic_col].min() if len(historical) > 0 else 0
            hist_max = historical[traffic_col].max() if len(historical) > 0 else 0
            hist_count = len(historical)

            fore_std = forecast[traffic_col].std() if len(forecast) > 0 else 0
            fore_min = forecast[traffic_col].min() if len(forecast) > 0 else 0
            fore_max = forecast[traffic_col].max() if len(forecast) > 0 else 0
            fore_count = len(forecast)
            
            absolute_growth = fore_mean - hist_mean
            percentage_growth = (absolute_growth / hist_mean) * 100 if hist_mean > 0 else 0
            
            # Get metadata
            meta = kabupaten_meta.get(kabupaten, {'region': 'Unknown', 'province': 'Unknown'})
            
            # Format name
            formatted_name = kabupaten.replace('_', ' ').title()
            
            growth_data.append({
                'Kabupaten': formatted_name,
                'Region': meta['region'],
                'Province': meta['province'],
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
                'Absolute_Growth': round(absolute_growth, 2),
                'Percentage_Growth': round(percentage_growth, 2),
                'Has_Forecast': len(forecast) > 0
            })
            
            processed += 1
            
        except Exception as e:
            print(f"  ⚠️  Error {kabupaten}: {e}")
            continue
    
    # Save results
    df_growth = pd.DataFrame(growth_data)

    # If no data was collected, create an empty DataFrame with expected columns
    expected_cols = [
        'Kabupaten', 'Region', 'Province',
        'Hist_Mean', 'Hist_Std', 'Hist_Min', 'Hist_Max',
        'Fore_Mean', 'Fore_Std', 'Fore_Min', 'Fore_Max',
        'Data_Points_Hist', 'Data_Points_Fore',
        'Absolute_Growth', 'Percentage_Growth', 'Has_Forecast'
    ]

    if df_growth.empty:
        print("  ⚠️  No kabupaten growth data found; writing empty CSV")
        df_growth = pd.DataFrame(columns=expected_cols)
    else:
        df_growth = df_growth[expected_cols].sort_values('Absolute_Growth', ascending=False)

    output_file = output_dir / "kabupaten_all_growth.csv"
    df_growth.to_csv(output_file, index=False)

    print(f"  ✓ Processed {processed} kabupaten")
    print(f"  → kabupaten_all_growth.csv")

    # Show top 3 (if any)
    if not df_growth.empty:
        print(f"  Top 3 Growth:")
        for rank, (_, row) in enumerate(df_growth.head(3).iterrows(), start=1):
            print(f"    {rank}. {row['Kabupaten']}: +{row['Absolute_Growth']:.2f} TB ({row['Percentage_Growth']:.2f}%)")

    return True


def aggregate_kabupaten_statistics(output_dir):
    """Write per-kabupaten statistics (hist/fore mean,std,min,max,counts,Has_Forecast)"""
    print("Processing Kabupaten Statistics...")
    merged_dirs = [
        Path("../../merged_outputs/by_kabupaten"),
        Path("../public/merged_outputs/by_kabupaten"),
    ]

    # Use the same kabupaten list as aggregate_kabupaten_ranking for consistency
    kabupaten_names = [
        "alor", "badung", "bangkalan", "bangli", "banjarnegara", "bantul",
        "banyumas", "banyuwangi", "batang", "belu", "bima", "blitar", "blora",
        "bojonegoro", "bondowoso", "boyolali", "brebes", "buleleng", "cilacap",
        "demak", "dompu", "ende", "flores_timur", "gianyar", "gresik", "grobogan",
        "gunungkidul", "jember", "jembrana", "jepara", "jombang", "karanganyar",
        "karangasem", "kebumen", "kediri", "kendal", "klaten", "klungkung",
        "kota_batu", "kota_bima", "kota_blitar", "kota_denpasar", "kota_kediri",
        "kota_kupang", "kota_madiun", "kota_magelang", "kota_malang", "kota_mataram",
        "kota_mojokerto", "kota_pasuruan", "kota_pekalongan", "kota_probolinggo",
        "kota_salatiga", "kota_semarang", "kota_surabaya", "kota_surakarta",
        "kota_tegal", "kota_yogyakarta", "kudus", "kulon_progo", "kupang",
        "lamongan", "lembata", "lombok_barat", "lombok_tengah", "lombok_timur",
        "lombok_utara", "lumajang", "madiun", "magelang", "magetan", "malaka",
        "malang", "manggarai", "manggarai_barat", "manggarai_timur", "mojokerto",
        "nagekeo", "ngada", "nganjuk", "ngawi", "pacitan", "pamekasan", "pasuruan",
        "pati", "pekalongan", "pemalang", "ponorogo", "probolinggo", "purbalingga",
        "purworejo", "rembang", "rote_ndao", "sabu_raijua", "sampang",
        "semarang", "sidoarjo", "sikka", "situbondo", "sleman", "sragen",
        "sukoharjo", "sumbawa", "sumbawa_barat", "sumba_barat", "sumba_barat_daya",
        "sumba_tengah", "sumba_timur", "sumenep", "tabanan", "tegal", "temanggung",
        "timor_tengah_selatan", "timor_tengah_utara", "trenggalek", "tuban",
        "tulungagung", "wonogiri", "wonosobo"
    ]

    kabupaten_list = []
    # Find files for each kabupaten in the list
    for kab_name in kabupaten_names:
        file_found = False
        for d in merged_dirs:
            if not d.exists():
                continue
            for p in d.glob("*.csv"):
                if kab_name.replace('_', ' ').lower() in p.stem.lower() or kab_name.lower() in p.stem.lower():
                    name = p.stem.replace('_', ' ').title()
                    kabupaten_list.append((name, p))
                    file_found = True
                    break
            if file_found:
                break

    stats_rows = []
    for name, p in sorted(kabupaten_list):
        try:
            df = pd.read_csv(p)
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

            stats_rows.append({
                'Kabupaten': name,
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
            print(f"  ⚠️  Could not read {p}: {e}")
            continue

    df_stats = pd.DataFrame(stats_rows)
    stats_file = output_dir / "kabupaten_statistics.csv"
    if df_stats.empty:
        df_stats = pd.DataFrame(columns=['Kabupaten','Hist_Mean','Hist_Std','Hist_Min','Hist_Max','Fore_Mean','Fore_Std','Fore_Min','Fore_Max','Data_Points_Hist','Data_Points_Fore','Has_Forecast'])
    df_stats.to_csv(stats_file, index=False)
    print(f"  → kabupaten_statistics.csv ({len(df_stats)} rows)")
    return True


def main():
    """Run all aggregations"""
    
    print("="*80)
    print(" WEB DATA AGGREGATION - GENERATE ALL CSV")
    print("="*80)
    print()
    
    # Create outputs directory
    output_dir = Path("outputs")
    output_dir.mkdir(exist_ok=True)
    
    success_count = 0
    total_count = 4
    
    # 1. Regional Statistics
    print("\n[1/3] REGIONAL STATISTICS")
    print("-"*80)
    try:
        aggregate_regional_statistics(output_dir)
        success_count += 1
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    
    # 2. Provinsi Statistics
    print("\n[2/3] PROVINSI STATISTICS")
    print("-"*80)
    try:
        aggregate_provinsi_statistics(output_dir)
        success_count += 1
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    
    # 3. Kabupaten Ranking
    print("\n[3/3] KABUPATEN RANKING")
    print("-"*80)
    try:
        aggregate_kabupaten_ranking(output_dir)
        success_count += 1
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    
    # 4. Kabupaten Statistics
    print("[4/4] KABUPATEN STATISTICS")
    print("-"*80)
    try:
        aggregate_kabupaten_statistics(output_dir)
        success_count += 1
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    
    # Summary
    print("\n" + "="*80)
    print(" SUMMARY")
    print("="*80)
    print(f"  Success: {success_count}/{total_count}")
    print(f"  Output Directory: {output_dir.absolute()}")
    print()
    
    # List generated files
    csv_files = list(output_dir.glob("*.csv"))
    if csv_files:
        print("  Generated Files:")
        for f in sorted(csv_files):
            size_kb = f.stat().st_size / 1024
            print(f"    ✓ {f.name} ({size_kb:.1f} KB)")
    else:
        print("  ⚠️  No CSV files generated")
    
    print()
    print("="*80)
    
    if success_count == total_count:
        print("✅ ALL AGGREGATIONS COMPLETED!")
        print()
        
        # Auto-copy to public/web_data/
        try:
            import shutil
            web_data_dir = Path("../public/web_data")
            web_data_dir.mkdir(parents=True, exist_ok=True)
            
            print("📦 Copying to web project...")
            for csv_file in csv_files:
                dest = web_data_dir / csv_file.name
                shutil.copy2(csv_file, dest)
                print(f"  ✓ Copied: {csv_file.name} → public/web_data/")
            
            print()
            print("Next steps:")
            print("  1. ✅ CSV files ready at: public/web_data/")
            print("  2. Update web components to read from /web_data/*.csv")
            print("  3. Remove calculation logic from frontend")
        except Exception as e:
            print(f"⚠️  Auto-copy failed: {e}")
            print("Please manually copy outputs/ to: public/web_data/")
    else:
        print("⚠️  Some aggregations failed. Check errors above.")
    
    print("="*80)
    
    return success_count == total_count


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
