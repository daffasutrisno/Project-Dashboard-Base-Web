"""
FETCH DATA KPI — FETCH PARENT CSVs
====================================
Program 2: Fetch data dari database PostgreSQL (cluster_5g) dan
menghasilkan 2 file parent CSV: data_4g.csv dan data_5g.csv.

Output:
  - ../public/kpi_data/data_4g.csv
  - ../public/kpi_data/data_5g.csv
  - ../hasil/data_4g.csv
  - ../hasil/data_5g.csv
"""

import psycopg2
import pandas as pd
from pathlib import Path

# ============================================================
# DATABASE CONFIGURATION
# ============================================================
DB_CONFIG = {
    'host': '1.tcp.ap.ngrok.io',
    'port': 21039,
    'database': 'postgres',
    'user': 'postgres',
    'password': 'option88'
}

# ============================================================
# KOLOM UNTUK MASING-MASING PARENT CSV
# ============================================================
COLUMNS_4G = [
    'date_column', 'nc_5g',
    'g4_avail_auto', 's1_failure', 'rrc_ue',
    'traffic_4g', 'eut_4g_bh', 'eut_4g_bh_count_less_31',
    'dl_prb_util', 'dl_prb_util_count_gt_09',
    'cqi_bh', 'cqi_less_than_7', 'dl_user_thp_bhv',
    'traffic_5g', 'da_5g'
]

COLUMNS_5G = [
    'date_column', 'nc_5g',
    'avail_auto_5g', 'da_5g', 'g5_cdr',
    'sgnb_addition_sr', 'traffic_5g',
    'g5_eut_bhv', 'g5_userdl_thp', 'sum_en_dc_user_5g_wd',
    'g5_dlprb_util', 'dl_prb_util_5g_count_gt_085',
    'inter_esgnb', 'intra_esgnb',
    'intra_sgnb_intrafreq', 'inter_sgnb_intrafreq'
]


def fetch_from_db(days_back=None):
    """Fetch semua data dari tabel cluster_5g"""
    conn = psycopg2.connect(**DB_CONFIG)

    if days_back:
        query = f"""
        SELECT *
        FROM cluster_5g
        WHERE date_column >= (SELECT MAX(date_column)::date - INTERVAL '{days_back} days' FROM cluster_5g)
        ORDER BY date_column ASC, nc_5g
        """
    else:
        query = "SELECT * FROM cluster_5g ORDER BY date_column ASC, nc_5g"

    print(f"  Executing query...")
    df = pd.read_sql(query, conn)
    conn.close()

    df['date_column'] = pd.to_datetime(df['date_column'])
    print(f"  Fetched {len(df):,} rows, {len(df.columns)} columns")
    print(f"  Date range: {df['date_column'].min().date()} to {df['date_column'].max().date()}")

    return df


def extract_parent_csv(df, columns, name, output_dirs):
    """Extract kolom tertentu dari dataframe, simpan ke CSV"""
    # Filter hanya kolom yang tersedia di dataframe
    available_cols = [c for c in columns if c in df.columns]
    missing_cols = [c for c in columns if c not in df.columns]

    if missing_cols:
        print(f"  ⚠️  Missing columns for {name}: {missing_cols}")
        # Add missing columns with default 0
        for col in missing_cols:
            df[col] = 0

    df_out = df[columns].copy()

    for output_dir in output_dirs:
        output_dir.mkdir(parents=True, exist_ok=True)
        output_file = output_dir / f"{name}.csv"
        df_out.to_csv(output_file, index=False)
        print(f"  ✓ Saved: {output_file} ({len(df_out):,} rows)")

    return df_out


def main():
    """Main fetch process"""
    print("=" * 60)
    print("  FETCH KPI PARENT DATA")
    print("=" * 60)

    # Fetch from database
    print("\n📡 Connecting to database...")
    df = fetch_from_db(days_back=None)

    # Output directories
    output_dirs = [
        Path("../public/kpi_data"),
        Path("hasil"),
    ]

    # Extract data_4g.csv
    print("\n📦 Extracting data_4g.csv...")
    extract_parent_csv(df, COLUMNS_4G, "data_4g", output_dirs)

    # Extract data_5g.csv
    print("\n📦 Extracting data_5g.csv...")
    extract_parent_csv(df, COLUMNS_5G, "data_5g", output_dirs)

    print("\n" + "=" * 60)
    print("  ✅ PARENT CSVs GENERATED!")
    print("=" * 60)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
