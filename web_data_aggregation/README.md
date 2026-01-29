# Web Data Aggregation Scripts

Folder ini berisi script Python untuk pre-agregasi data sebelum digunakan di web dashboard.

## 📁 Struktur

```
web_data_aggregation/
├── aggregate_all.py        # Agregasi data FORECAST
├── aggregate_kpi.py         # Agregasi data KPI (NEW)
├── requirements.txt         # Python dependencies
├── README.md               # Dokumentasi ini
├── forecast_outputs/       # Output forecast (local)
│   ├── regional_statistics.csv
│   ├── provinsi_statistics.csv
│   └── ...
└── kpi_outputs/            # Output KPI (local)
    ├── 5g/
    │   ├── availability.csv
    │   └── ... (14 files)
    └── 4g/
        ├── availability.csv
        └── ... (13 files)
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Run Forecast Aggregation

```bash
python aggregate_all.py
```

Output: `forecast_outputs/` → auto-copy ke `../public/web_data/`

### 3. Run KPI Aggregation

```bash
python aggregate_kpi.py
```

Output: `kpi_outputs/` → auto-copy ke `../public/kpi_results/`

## 📊 Script Details

### `aggregate_all.py` - Forecast Data

**Input:**

- `../merged_outputs/by_region/*.csv` (Regional data)
- `../merged_outputs/by_province/*.csv` (Provinsi data)
- `../merged_outputs/by_kabupaten/*.csv` (Kabupaten data)

**Output:**

- `regional_statistics.csv` - Summary statistik 3 regional
- `regional_comparison.csv` - Perbandingan regional
- `provinsi_statistics.csv` - Summary statistik 5 provinsi
- `provinsi_comparison.csv` - Perbandingan provinsi
- `kabupaten_all_growth.csv` - Top 10 kabupaten by growth
- `kabupaten_statistics.csv` - Summary statistik 119 kabupaten

**Processing:**

- Aggregate historical vs forecast data
- Calculate mean, std, min, max
- Growth rate calculation
- Ranking by absolute value & percentage

---

### `aggregate_kpi.py` - KPI Data

**Input:**

- `../public/kpi_data/data_5g.csv` (4592 rows × 16 columns)
- `../public/kpi_data/data_4g.csv` (similar size)

**Output 5G (14 files):**

- `5g/availability.csv`
- `5g/accessibility.csv`
- `5g/cdr.csv`
- `5g/sgnb_addition.csv`
- `5g/traffic.csv`
- `5g/eut.csv`
- `5g/dl_user_thp.csv`
- `5g/user.csv`
- `5g/dl_prb_util.csv`
- `5g/dl_prb_util_count.csv`
- `5g/inter_esgnb.csv`
- `5g/intra_esgnb.csv`
- `5g/intra_sgnb_intrafreq.csv`
- `5g/inter_sgnb_intrafreq.csv`

**Output 4G (13 files):**

- `4g/availability.csv`
- `4g/s1_failure.csv`
- `4g/rrc_ue.csv`
- `4g/traffic.csv`
- `4g/eut.csv`
- `4g/eut_count_less_31.csv`
- `4g/dl_prb_util.csv`
- `4g/dl_prb_util_count.csv`
- `4g/cqi.csv`
- `4g/cqi_less_7.csv`
- `4g/dl_user_thp.csv`
- `4g/traffic_5g.csv` (for stacked charts)
- `4g/da_5g.csv` (for stacked charts)

**Processing:**

1. **MAX Aggregation** per date (multiple rows → 1 row per date)
2. **Transform Percent** (0-1 → 0-100 for applicable metrics)
3. **Filter Positive** (remove zero/negative values)
4. **Interval Sampling** dari END:
   - Interval 1 = all days
   - Interval 2 = every 2nd day from end
   - Interval 3 = every 3rd day from end

**Example Output Format:**

```csv
date,value
2025-07-01,98.5
2025-07-02,99.2
2025-07-03,97.8
...
```

## ⚡ Performance Comparison

### Before (Raw CSV):

```
Browser downloads: 500KB × 12 charts = 6MB
Parse + Aggregate: 4592 rows × 12 = 55,104 operations
Loading time: 5-10 seconds
```

### After (Pre-aggregated):

```
Browser downloads: 20KB × 12 charts = 240KB
Just render: 60 rows × 12 = 720 operations
Loading time: 500ms - 1 second ⚡
```

**Improvement: 10-20× faster!**

## 🔄 When to Run

Run aggregation scripts when:

- ✅ New forecast data available
- ✅ KPI raw data updated (data_4g.csv / data_5g.csv)
- ✅ Before deploying to production
- ✅ Weekly/monthly data refresh

## 📝 Notes

### Forecast Script

- Uses existing merged_outputs from forecast programs
- Maintains backward compatibility
- Auto-copies to public/web_data/

### KPI Script

- Reduces frontend processing by 99%
- Each chart gets its own optimized CSV
- Follows same pattern as forecast (consistent architecture)
- Auto-copies to public/kpi_results/

## 🐛 Troubleshooting

**Error: File not found**

- Ensure input CSV files exist in correct locations
- Check paths in script (relative to web_data_aggregation/)

**Error: Column not found**

- Verify column names in source CSV
- Update CHARTS_5G/CHARTS_4G configs if needed

**Empty output files**

- Check filter_positive setting
- Verify data has non-zero values
- Check transform_percent logic

## 🔧 Customization

To add new KPI chart:

```python
# In aggregate_kpi.py, add to CHARTS_5G or CHARTS_4G:
{
    "name": "new_metric",
    "title": "New Metric Title",
    "column": "column_name_in_csv",
    "transform_percent": False,
    "interval": 2,
    "filter_positive": True
}
```

Then run: `python aggregate_kpi.py`
