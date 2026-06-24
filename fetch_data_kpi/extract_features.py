"""
FETCH DATA KPI — EXTRACT PER-FEATURE CSVs
===========================================
Program 3: Membaca parent CSV (data_4g.csv, data_5g.csv) dan
mengekstrak masing-masing fitur menjadi file CSV individual
dengan format date,value yang siap dibaca web dashboard.

Processing:
  - MAX aggregation per date
  - Transform percent (0-1 → 0-100) jika diperlukan
  - Interval sampling dari END
  - Filter positive values

Output:
  - ../public/kpi_results/4g/*.csv  (13 files)
  - ../public/kpi_results/5g/*.csv  (14 files)
  - ../hasil/features/4g/*.csv
  - ../hasil/features/5g/*.csv
"""

import pandas as pd
from pathlib import Path


# ============================================================
# CHART CONFIGURATIONS — 5G
# ============================================================
CHARTS_5G = [
    {
        "name": "availability",
        "title": "Availability 5G",
        "column": "avail_auto_5g",
        "transform_percent": True,
        "interval": 1,
        "filter_positive": True
    },
    {
        "name": "accessibility",
        "title": "Accessibility 5G",
        "column": "da_5g",
        "transform_percent": True,
        "interval": 2,
        "filter_positive": True
    },
    {
        "name": "cdr",
        "title": "Call Drop Rate 5G",
        "column": "g5_cdr",
        "transform_percent": False,
        "interval": 2,
        "filter_positive": False
    },
    {
        "name": "sgnb_addition",
        "title": "Sgnb Addition SR 5G",
        "column": "sgnb_addition_sr",
        "transform_percent": True,
        "interval": 2,
        "filter_positive": True
    },
    {
        "name": "traffic",
        "title": "Total Traffic 5G",
        "column": "traffic_5g",
        "transform_percent": False,
        "interval": 2,
        "filter_positive": True
    },
    {
        "name": "eut",
        "title": "EUT 5G",
        "column": "g5_eut_bhv",
        "transform_percent": False,
        "interval": 1,
        "filter_positive": True
    },
    {
        "name": "dl_user_thp",
        "title": "DL User Throughput 5G",
        "column": "g5_userdl_thp",
        "transform_percent": False,
        "interval": 1,
        "filter_positive": True
    },
    {
        "name": "user",
        "title": "User 5G",
        "column": "sum_en_dc_user_5g_wd",
        "transform_percent": False,
        "interval": 2,
        "filter_positive": True
    },
    {
        "name": "dl_prb_util",
        "title": "DL PRB Utilization 5G",
        "column": "g5_dlprb_util",
        "transform_percent": True,
        "interval": 2,
        "filter_positive": True
    },
    {
        "name": "dl_prb_util_count",
        "title": "DL PRB Util Count >85%",
        "column": "dl_prb_util_5g_count_gt_085",
        "transform_percent": False,
        "interval": 2,
        "filter_positive": True
    },
    {
        "name": "inter_esgnb",
        "title": "Inter esgNB HO SR 5G",
        "column": "inter_esgnb",
        "transform_percent": True,
        "interval": 2,
        "filter_positive": True
    },
    {
        "name": "intra_esgnb",
        "title": "Intra esgNB HO SR 5G",
        "column": "intra_esgnb",
        "transform_percent": True,
        "interval": 2,
        "filter_positive": True
    },
    {
        "name": "intra_sgnb_intrafreq",
        "title": "Intra sgNB Intrafreq HO SR 5G",
        "column": "intra_sgnb_intrafreq",
        "transform_percent": True,
        "interval": 2,
        "filter_positive": True
    },
    {
        "name": "inter_sgnb_intrafreq",
        "title": "Inter sgNB Intrafreq HO SR 5G",
        "column": "inter_sgnb_intrafreq",
        "transform_percent": True,
        "interval": 2,
        "filter_positive": True
    }
]

# ============================================================
# CHART CONFIGURATIONS — 4G
# ============================================================
CHARTS_4G = [
    {
        "name": "availability",
        "title": "Availability 4G",
        "column": "g4_avail_auto",
        "transform_percent": False,
        "interval": 3,
        "filter_positive": True
    },
    {
        "name": "s1_failure",
        "title": "S1 Failure Rate 4G",
        "column": "s1_failure",
        "transform_percent": False,
        "interval": 3,
        "filter_positive": True
    },
    {
        "name": "rrc_ue",
        "title": "RRC Connection User 4G",
        "column": "rrc_ue",
        "transform_percent": False,
        "interval": 3,
        "filter_positive": True
    },
    {
        "name": "traffic",
        "title": "Total Traffic 4G",
        "column": "traffic_4g",
        "transform_percent": False,
        "interval": 3,
        "filter_positive": True
    },
    {
        "name": "eut",
        "title": "EUT 4G",
        "column": "eut_4g_bh",
        "transform_percent": False,
        "interval": 3,
        "filter_positive": True
    },
    {
        "name": "eut_count_less_31",
        "title": "EUT Count <31 Mbps",
        "column": "eut_4g_bh_count_less_31",
        "transform_percent": False,
        "interval": 3,
        "filter_positive": True
    },
    {
        "name": "dl_prb_util",
        "title": "DL PRB Utilization 4G",
        "column": "dl_prb_util",
        "transform_percent": True,
        "interval": 1,
        "filter_positive": True
    },
    {
        "name": "dl_prb_util_count",
        "title": "DL PRB Util Count >90%",
        "column": "dl_prb_util_count_gt_09",
        "transform_percent": False,
        "interval": 1,
        "filter_positive": True
    },
    {
        "name": "cqi",
        "title": "CQI 4G",
        "column": "cqi_bh",
        "transform_percent": False,
        "interval": 1,
        "filter_positive": True
    },
    {
        "name": "cqi_less_7",
        "title": "CQI Count <7",
        "column": "cqi_less_than_7",
        "transform_percent": False,
        "interval": 1,
        "filter_positive": True
    },
    {
        "name": "dl_user_thp",
        "title": "DL User Throughput 4G",
        "column": "dl_user_thp_bhv",
        "transform_percent": False,
        "interval": 1,
        "filter_positive": True
    },
    {
        "name": "traffic_5g",
        "title": "Traffic 5G (for stacked)",
        "column": "traffic_5g",
        "transform_percent": False,
        "interval": 1,
        "filter_positive": True
    },
    {
        "name": "da_5g",
        "title": "DA 5G (for stacked)",
        "column": "da_5g",
        "transform_percent": False,
        "interval": 1,
        "filter_positive": True
    }
]


def aggregate_single_chart(df, config):
    """
    Aggregate single chart data:
    1. MAX aggregation per date
    2. Transform percent jika diperlukan
    3. Interval sampling dari END
    4. Filter positive values
    """
    date_col = 'date_column'
    param_col = config['column']

    # Check if column exists
    if param_col not in df.columns:
        print(f"    ⚠️  Column '{param_col}' not found, skipping...")
        return None

    # Step 1: MAX aggregation per date
    grouped = df.groupby(date_col)[param_col].max().reset_index()
    grouped.columns = ['date', 'value']

    # Step 2: Transform percent (0-1 → 0-100)
    if config['transform_percent']:
        grouped['value'] = grouped['value'] * 100

    # Step 3: Filter positive (or include zero for CDR)
    if config['filter_positive']:
        grouped = grouped[grouped['value'] > 0]

    # Step 4: Sort by date
    grouped['date'] = pd.to_datetime(grouped['date'])
    grouped = grouped.sort_values('date')

    # Step 5: Interval sampling dari END
    interval = config['interval']
    if interval > 1:
        reversed_df = grouped.iloc[::-1].reset_index(drop=True)
        sampled = reversed_df.iloc[::interval]
        grouped = sampled.iloc[::-1].reset_index(drop=True)

    # Format date back to string (yyyy-mm-dd)
    grouped['date'] = grouped['date'].dt.strftime('%Y-%m-%d')

    return grouped[['date', 'value']]


def process_category(df, charts_config, category_name, output_dirs):
    """Process semua chart untuk satu kategori (4G atau 5G)"""
    print(f"\n{'='*60}")
    print(f"  PROCESSING {category_name}")
    print(f"{'='*60}")
    print(f"  Rows: {len(df):,}, Columns: {len(df.columns)}")

    success_count = 0

    for chart in charts_config:
        print(f"\n  → {chart['title']} ({chart['column']})")
        result = aggregate_single_chart(df, chart)

        if result is not None and len(result) > 0:
            for output_dir in output_dirs:
                cat_dir = output_dir / category_name.lower()
                cat_dir.mkdir(parents=True, exist_ok=True)
                output_file = cat_dir / f"{chart['name']}.csv"
                result.to_csv(output_file, index=False)

            print(f"    ✅ Saved ({len(result)} rows)")
            success_count += 1
        else:
            print(f"    ⚠️  No data generated")

    print(f"\n  ✅ {category_name}: {success_count}/{len(charts_config)} charts processed")
    return success_count


def main():
    """Main extraction process"""
    print("=" * 60)
    print("  EXTRACT KPI PER-FEATURE CSVs")
    print("=" * 60)

    # Input files
    data_4g_path = Path("../public/kpi_data/data_4g.csv")
    data_5g_path = Path("../public/kpi_data/data_5g.csv")

    # Output directories
    output_dirs = [
        Path("../public/kpi_results"),
        Path("hasil/features"),
    ]

    # Process 5G
    if data_5g_path.exists():
        print(f"\n📂 Reading: {data_5g_path}")
        df_5g = pd.read_csv(data_5g_path)
        process_category(df_5g, CHARTS_5G, "5G", output_dirs)
    else:
        print(f"\n❌ File not found: {data_5g_path}")
        print("   Run extract_parents.py first")

    # Process 4G
    if data_4g_path.exists():
        print(f"\n📂 Reading: {data_4g_path}")
        df_4g = pd.read_csv(data_4g_path)
        process_category(df_4g, CHARTS_4G, "4G", output_dirs)
    else:
        print(f"\n❌ File not found: {data_4g_path}")
        print("   Run extract_parents.py first")

    print("\n" + "=" * 60)
    print("  ✅ PER-FEATURE CSVs GENERATED!")
    print("=" * 60)
    print("\nOutput:")
    for d in output_dirs:
        print(f"  {d}/4g/  (13 files)")
        print(f"  {d}/5g/  (14 files)")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
