"""
AGGREGATE KPI DATA
==================
Pre-agregasi data KPI untuk optimasi loading di web dashboard.

Input: 
  - ../public/kpi_data/data_5g.csv (raw data)
  - ../public/kpi_data/data_4g.csv (raw data)

Output: kpi_outputs/
  - 5g/*.csv (12 files, 1 per chart)
  - 4g/*.csv (12 files, 1 per chart)

Processing:
  - MAX aggregation per date
  - Transform percent (0-1 → 0-100)
  - Interval sampling dari END
  - Filter positive values

Auto-copy ke ../public/kpi_results/
"""

import pandas as pd
from pathlib import Path
import shutil


# Chart configurations untuk 5G
CHARTS_5G = [
    {
        "name": "availability",
        "title": "Availability 5G",
        "column": "avail_auto_5g",
        "transform_percent": True,
        "interval": 1,  # all days
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
        "filter_positive": False  # include zero
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

# Chart configurations untuk 4G
CHARTS_4G = [
    {
        "name": "availability",
        "title": "Availability 4G",
        "column": "g4_avail_auto",
        "transform_percent": False,  # sudah dalam percent
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
        "interval": 1,  # all days
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
    Aggregate single chart data dengan rule:
    1. MAX aggregation per date
    2. Transform percent jika diperlukan
    3. Interval sampling dari END
    4. Filter positive values
    """
    
    date_col = 'date_column'
    param_col = config['column']
    
    # Check if column exists
    if param_col not in df.columns:
        print(f"  ⚠️  Column {param_col} not found, skipping...")
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
        # Reverse → sample every N-th → reverse back
        reversed_df = grouped.iloc[::-1].reset_index(drop=True)
        sampled = reversed_df.iloc[::interval]
        grouped = sampled.iloc[::-1].reset_index(drop=True)
    
    # Format date back to string (yyyy-mm-dd for consistency)
    grouped['date'] = grouped['date'].dt.strftime('%Y-%m-%d')
    
    return grouped[['date', 'value']]


def process_5g_data(input_file, output_dir):
    """Process data 5G dan generate 14 CSV files"""
    
    print("\n" + "="*60)
    print("PROCESSING 5G DATA")
    print("="*60)
    
    if not input_file.exists():
        print(f"❌ File not found: {input_file}")
        return
    
    print(f"Reading: {input_file}")
    df = pd.read_csv(input_file)
    print(f"  Rows: {len(df):,}, Columns: {len(df.columns)}")
    
    output_5g = output_dir / "5g"
    output_5g.mkdir(parents=True, exist_ok=True)
    
    success_count = 0
    
    for chart in CHARTS_5G:
        print(f"\n  Processing: {chart['title']}")
        result = aggregate_single_chart(df, chart)
        
        if result is not None and len(result) > 0:
            output_file = output_5g / f"{chart['name']}.csv"
            result.to_csv(output_file, index=False)
            print(f"    ✅ Saved: {output_file.name} ({len(result)} rows)")
            success_count += 1
        else:
            print(f"    ⚠️  No data generated")
    
    print(f"\n✅ 5G: {success_count}/{len(CHARTS_5G)} charts processed")


def process_4g_data(input_file, output_dir):
    """Process data 4G dan generate 13 CSV files"""
    
    print("\n" + "="*60)
    print("PROCESSING 4G DATA")
    print("="*60)
    
    if not input_file.exists():
        print(f"❌ File not found: {input_file}")
        return
    
    print(f"Reading: {input_file}")
    df = pd.read_csv(input_file)
    print(f"  Rows: {len(df):,}, Columns: {len(df.columns)}")
    
    output_4g = output_dir / "4g"
    output_4g.mkdir(parents=True, exist_ok=True)
    
    success_count = 0
    
    for chart in CHARTS_4G:
        print(f"\n  Processing: {chart['title']}")
        result = aggregate_single_chart(df, chart)
        
        if result is not None and len(result) > 0:
            output_file = output_4g / f"{chart['name']}.csv"
            result.to_csv(output_file, index=False)
            print(f"    ✅ Saved: {output_file.name} ({len(result)} rows)")
            success_count += 1
        else:
            print(f"    ⚠️  No data generated")
    
    print(f"\n✅ 4G: {success_count}/{len(CHARTS_4G)} charts processed")


def copy_to_public(output_dir, public_dir):
    """Copy hasil agregasi ke public folder"""
    
    print("\n" + "="*60)
    print("COPYING TO PUBLIC FOLDER")
    print("="*60)
    
    if public_dir.exists():
        shutil.rmtree(public_dir)
    
    shutil.copytree(output_dir, public_dir)
    print(f"✅ Copied: {output_dir} → {public_dir}")
    
    # Count files
    file_count = sum(1 for _ in public_dir.rglob('*.csv'))
    print(f"   Total files: {file_count}")


def main():
    """Main execution"""
    
    print("\n" + "="*60)
    print("KPI DATA AGGREGATION SCRIPT")
    print("="*60)
    
    # Paths
    script_dir = Path(__file__).parent
    input_5g = script_dir / ".." / "public" / "kpi_data" / "data_5g.csv"
    input_4g = script_dir / ".." / "public" / "kpi_data" / "data_4g.csv"
    output_dir = script_dir / "kpi_outputs"
    public_dir = script_dir / ".." / "public" / "kpi_results"
    
    # Create output directory
    output_dir.mkdir(exist_ok=True)
    
    # Process both datasets
    process_5g_data(input_5g, output_dir)
    process_4g_data(input_4g, output_dir)
    
    # Copy to public
    copy_to_public(output_dir, public_dir)
    
    print("\n" + "="*60)
    print("✅ AGGREGATION COMPLETE!")
    print("="*60)
    print(f"\nOutput location:")
    print(f"  Local:  {output_dir}")
    print(f"  Public: {public_dir}")
    print("\nNext steps:")
    print("  1. Update frontend components to use aggregated data")
    print("  2. Change csvPath from /kpi_data/*.csv to /kpi_results/*/*.csv")
    print("  3. Remove aggregation logic from frontend components")


if __name__ == "__main__":
    main()
