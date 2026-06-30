# 🚀 KPI Monitoring & Traffic Forecasting — IOH

> **Satu monorepo, lima sub-proyek.**  
> Monitoring KPI jaringan (4G & 5G) dan forecasting traffic Tahun Baru  
> untuk Indosat Ooredoo Hutchison — Jawa & Bali Nusra.

---

## 📦 Daftar Sub-Proyek

| # | Sub-Proyek | Folder Inti | Output | Source Data |
|---|-----------|------------|--------|-------------|
| 1 | [Web Dashboard](#1-web-dashboard-react--apexcharts) | `src/`, `public/` | React SPA | CSV dari `public/` |
| 2 | [Forecast Pipeline](#2-forecast-pipeline-python) | `forecast_programs/` | CSV + PNG + Web data | `Traffic_VLR_Java_2024-2025.xlsx` |
| 3 | [Grafana Dashboard](#3-grafana-dashboard-postgresql) | `fetch_data_kpi/grafana/` | `.json` dashboard | PostgreSQL `cluster_5g` |
| 4 | [PPT Generator](#4-ppt-generator-python) | `fetch_data_kpi/generate_ppt.py` | `.pptx` | PostgreSQL `cluster_5g` |
| 5 | [KPI Data Pipeline](#5-kpi-data-pipeline-python) | `fetch_data_kpi/`, `web_data_aggregation/` | 27 CSV | PostgreSQL → parent CSV → per-feature CSV |

---

## 1. Web Dashboard (React + ApexCharts)

### Struktur File

```
src/
├── pages/
│   ├── KPI/
│   │   ├── FourG.tsx         ← 12 chart 4G — panggil 7 komponen kpi/
│   │   └── FiveG.tsx         ← 12 chart 5G — panggil 7 komponen kpi/
│   └── Forecast/
│       ├── Regional.tsx      ← dropdown region + ForecastChart + RegionalComparisonChart
│       ├── Provinsi.tsx      ← dropdown provinsi + ForecastChart + ProvinsiComparisonChart
│       └── Kabupaten.tsx     ← dropdown kabupaten + ForecastChart + KabupatenGrowthTable
├── components/
│   ├── kpi/                  ← 7 chart component types (semua baca CSV via fetch)
│   │   ├── KPILineChart.tsx
│   │   ├── KPIAreaChart.tsx
│   │   ├── KPIBarChart.tsx
│   │   ├── KPIDualAxisChart.tsx      ← 2 CSV, left Y + right Y
│   │   ├── KPIDualLineChart.tsx      ← 2 CSV, shared left Y
│   │   ├── KPIStackedChart.tsx       ← 2 CSV, stacked bars (absolute)
│   │   └── KPIStackedPercentChart.tsx ← 2 CSV, 100% stacked bars
│   └── forecast/
│       ├── ForecastChart.tsx              ← time-series: historical + forecast + confidence band
│       ├── RegionalComparisonChart.tsx    ← bar chart 3 region
│       ├── ProvinsiComparisonChart.tsx    ← bar chart 6 provinsi
│       ├── KabupatenGrowthTable.tsx       ← sortable table 119 kabupaten
│       └── ComparisonTable.tsx            ← reusable stats table (hist vs fore)
└── layout/
    ├── AppLayout.tsx          ← sidebar + header wrapper
    ├── AppSidebar.tsx         ← navigasi: KPI 4G, KPI 5G, Forecast (Regional/Provinsi/Kabupaten)
    └── AppHeader.tsx
```

### Arsitektur & Rute

```
Browser → http://localhost:5173
│
├── /kpi-monitoring/4g       → FourG.tsx
│   └── fetch("/kpi_results/4g/{chart}.csv") × 12
│
├── /kpi-monitoring/5g       → FiveG.tsx
│   └── fetch("/kpi_results/5g/{chart}.csv") × 12
│
├── /forecast/regional       → Regional.tsx
│   └── fetch("/merged_outputs/by_region/{region}.csv")
│
├── /forecast/provinsi       → Provinsi.tsx
│   └── fetch("/merged_outputs/by_province/{provinsi}.csv")
│
└── /forecast/kabupaten      → Kabupaten.tsx
    └── fetch("/merged_outputs/by_kabupaten/{kabupaten}.csv")
    └── fetch("/web_data/kabupaten_all_growth.csv")
```

### Implementasi Utama — Cara Kerja Tiap Komponen KPI

#### `KPILineChart` (line chart tunggal)
```
Props: csvPath, yAxisFormat, fixedYRange?, color?, multiplyBy100?, simplifyXAxis?

1. useEffect → fetch(csvPath) → parse CSV "date,value"
2. MultiplyBy100: if true → value = value * 100 (konversi desimal → persen)
3. Filter: hanya value > 0
4. ApexCharts config:
   - type: "line"
   - yaxis.labels.formatter: sesuai yAxisFormat ("percent" → `${v}%`, "comma" → toLocaleString())
   - xaxis.labels.formatter: simplifyXAxis → "Jan 2025", else → "01 Jan"
   - fixedYRange → yaxis.min, yaxis.max
```

#### `KPIAreaChart` (area chart)
```
Props: csvPath, color?, simplifyXAxis?, yAxisFormat?
Sama seperti KPILineChart, beda:
  - type: "area"
  - fill.type: "gradient"
```

#### `KPIBarChart` (bar chart)
```
Props: csvPath, color?, simplifyXAxis?
Sama seperti KPILineChart, beda:
  - type: "bar"
  - plotOptions.bar.borderRadius: 4
```

#### `KPIDualAxisChart` (dual Y-axis — EUT vs Cells, PRB vs Count, CQI vs Count)
```
Props: csvPathLeft, csvPathRight, leftLabel, rightLabel, leftIsPercent?, leftColor?, rightColor?

1. useEffect → Promise.all([fetch(left), fetch(right)])
2. Parse kedua CSV → gabung per date
3. Filter: optional filterLeftGreaterThanZero → hanya date dengan left > 0
4. ApexCharts config:
   - 2 series: [{name: leftLabel, data: leftValues}, {name: rightLabel, data: rightValues}]
   - yaxis: [{title: leftLabel}, {opposite: true, title: rightLabel}]
   - leftIsPercent → yaxis[0].labels.formatter: v => `${v}%`
```

#### `KPIDualLineChart` (dual line, shared left Y — EUT vs DL Thp)
```
Sama seperti KPIDualAxisChart, tapi KEDUA series pakai yaxis kiri (tidak ada opposite).
Digunakan untuk: EUT vs DL User Throughput (keduanya dalam Mbps).
```

#### `KPIStackedChart` (stacked bars, absolute values — Traffic 4G vs 5G, RRC User)
```
Props: csvPathBottom, csvPathTop, bottomLabel, topLabel, filterMode?, simplifyXAxis?

1. useEffect → Promise.all([fetch(bottom), fetch(top)])
2. Parse CSV → gabung data per date
3. Filter: filterMode="bottom-only" → hanya date dengan bottom > 0
4. ApexCharts config:
   - chart.stacked: true (TANPA stackType → absolute stacking)
   - yaxis.labels.formatter: toLocaleString() (format "comma")
```

#### `KPIStackedPercentChart` (100% stacked bars — Ratio Traffic, Ratio RRC User)
```
Props: csvPathBottom, csvPathTop, bottomLabel, topLabel, filterMode?, simplifyXAxis?

1. useEffect → Promise.all([fetch(bottom), fetch(top)])
2. Parse CSV → untuk tiap date:
     total = bottom + top
     bottomPercent = (bottom / total) * 100
     topPercent = (top / total) * 100
3. Filter: filterMode="bottom-only" → hanya date dengan bottom > 0
4. ApexCharts config:
   - chart.stacked: true, chart.stackType: "100%"
   - yaxis.min: 0, yaxis.max: 110, tickAmount: 5
   - yaxis.labels.formatter: v => v <= 100 ? `${v.toFixed(0)}%` : ""
```

### Implementasi Utama — Cara Kerja ForecastChart

```
Props: type ("regional"|"provinsi"|"kabupaten"), options[], selectedOption, onOptionChange

1. useEffect → fetch merged CSV:
     - type="regional" → /merged_outputs/by_region/{region}.csv
     - type="provinsi" → /merged_outputs/by_province/{provinsi}.csv
     - type="kabupaten" → /merged_outputs/by_kabupaten/{kabupaten}.csv

2. Parse CSV → kolom: Date, Traffic_Total(TB), Lower_Bound, Upper_Bound
     - Lower_Bound=0 & Upper_Bound=0 → data HISTORIS
     - Lower_Bound>0 → data FORECAST

3. View mode: "both" (tampilkan semua) | "forecast" (hanya forecast)

4. ApexCharts config:
   - 3 series: [Historical (solid line), Forecast (dashed), Confidence Band (area range)]
   - Confidence band: {x: date, y: [Lower_Bound, Upper_Bound]}
   - Anotasi garis vertikal di batas historical↔forecast
```

### Menjalankan

```bash
npm install
npm run dev          # → http://localhost:5173
```

### Tech Stack
- React 19 + TypeScript + Vite
- Tailwind CSS 4 (TailAdmin template)
- ApexCharts (`react-apexcharts`)
- **Tidak ada backend API** — semua data dibaca sebagai static CSV via `fetch()`

---

## 2. Forecast Pipeline (Python)

### Struktur File

```
forecast_programs/
├── run_all.py                    ← orchestrator: jalankan 6 script berurutan
├── step1_forecast_total.py       ← forecast total traffic (71 hari)
├── step1_forecast_regional.py    ← forecast 3 regional (75 hari)
├── step1_forecast_provinsi.py    ← forecast 6 provinsi (75 hari)
├── step1_forecast_kabupaten.py   ← forecast 119 kabupaten (75 hari)
├── step2_merge_outputs.py        ← gabung historis + forecast → merged_outputs/
├── step3_analysis.py             ← statistik → web_data/
├── PRESENTATION_DECK.md          ← slide presentasi (18 slide)
└── forecast_results/             ← OUTPUT
    ├── 01_main/                  ← forecast_data.csv + Excel + comparison
    ├── 02_regional/              ← 3 CSV + 3 PNG
    ├── 03_provinsi/              ← 6 CSV + 6 PNG + 1 Excel
    └── 04_kabupaten/             ← 119 CSV + 119 PNG
```

### Flow Pipeline (6 Langkah)

```
Traffic_VLR_Java_2024-2025.xlsx
  kolom: Date, Traffic_Total(TB), REGION IOH, PROVINCE, KABUPATEN IOH
  baris: ~386 hari × 119 kabupaten ≈ 45,934 baris
        │
        ▼
┌──────────────────────────────────────────────────────────────────┐
│ STEP 1a: step1_forecast_total.py                                 │
│                                                                  │
│ Fungsi kunci:                                                    │
│   load_and_prepare_data("Traffic_VLR_Java_2024-2025.xlsx")       │
│     → groupby('Date').sum() → 386 baris (agregat nasional)      │
│                                                                  │
│   analyze_new_year_pattern(df)                                   │
│     → hitung baseline (1-24 Des), factor per hari (25 Des-7 Jan) │
│     → return {baseline, nye_ratio, ny_ratio, daily_pattern}      │
│                                                                  │
│   moving_average_forecast(df, window=7)                          │
│     → np.mean(recent_7)                                          │
│     → np.polyfit → slope trend                                   │
│     → return (ma_base, trend)                                    │
│                                                                  │
│   weighted_moving_average(df, window=14)                         │
│     → bobot = exp(linspace(-1,0,14)) → normalize                │
│     → sum(data × bobot)                                          │
│     → np.polyfit → slope trend                                   │
│     → return (wma_base, trend)                                   │
│                                                                  │
│   exponential_smoothing(df, alpha=0.3)                           │
│     → S[t] = α·x[t] + (1-α)·S[t-1] rekursif sepanjang history   │
│     → np.polyfit(S[-30:]) → slope trend                          │
│     → return (ses_base, trend)                                   │
│                                                                  │
│   create_forecast(df, ny_pattern, forecast_days=71)              │
│     → ensemble: base = (ma+wma+ses)/3, trend = rata2 3 trend    │
│     → loop 71 hari:                                              │
│         if date in ny_event_factors:                             │
│           forecast = baseline × factor                           │
│         else:                                                    │
│           forecast = base + trend×d×0.5 + noise                  │
│         weekly_factor = 1.05 (Jumat-Minggu)                      │
│         forecast *= weekly_factor                                │
│     → output: Date, Traffic_Total(TB), Type, Lower_Bound,        │
│               Upper_Bound                                        │
│                                                                  │
│ OUTPUT: forecast_results/01_main/forecast_data.csv               │
│         forecast_results/01_main/comparison_statistics*.csv      │
└──────────────────┬───────────────────────────────────────────────┘
                   │
┌──────────────────┴───────────────────────────────────────────────┐
│ STEP 1b-d: step1_forecast_regional / provinsi / kabupaten        │
│                                                                  │
│ SAMA PERSIS dengan 1a, bedanya:                                  │
│   1b: filter df['REGION IOH'] == region_name                     │
│   1c: filter df['PROVINCE'] == province_name                     │
│   1d: filter df['KABUPATEN IOH'] == kabupaten_name               │
│   forecast_days = 75 (fixed), output + chart PNG                 │
│                                                                  │
│ OUTPUT:                                                          │
│   forecast_results/02_regional/{bali_nusra,central_java,         │
│                                 east_java}.csv + .png            │
│   forecast_results/03_provinsi/{6 provinsi}.csv + .png           │
│   forecast_results/04_kabupaten/{119 kabupaten}.csv + .png       │
└──────────────────┬───────────────────────────────────────────────┘
                   ▼
┌──────────────────────────────────────────────────────────────────┐
│ STEP 2: step2_merge_outputs.py                                   │
│                                                                  │
│ Fungsi kunci:                                                    │
│   load_excel_data()                                              │
│     → baca Traffic_VLR_Java_2024-2025.xlsx                       │
│                                                                  │
│   merge_historical_forecast(historical_df, forecast_df, name,    │
│                             output_path)                         │
│     → historical: Lower_Bound=0, Upper_Bound=0                   │
│     → forecast:   Lower_Bound>0, Upper_Bound>0                   │
│     → concat + sort by Date                                      │
│                                                                  │
│   merge_regional(df)    → 3 file di by_region/                   │
│   merge_provinsi(df)    → 6 file di by_province/                 │
│   merge_kabupaten(df)   → 119 file di by_kabupaten/              │
│                                                                  │
│ OUTPUT: public/merged_outputs/by_region/*.csv                    │
│         public/merged_outputs/by_province/*.csv                  │
│         public/merged_outputs/by_kabupaten/*.csv                 │
│                                                                  │
│ Format output: Date,Traffic_Total(TB),Lower_Bound,Upper_Bound    │
│   LB=0 & UB=0 → historical                                       │
│   LB>0 & UB>0 → forecast (LB = forecast×0.9, UB = forecast×1.1) │
└──────────────────┬───────────────────────────────────────────────┘
                   ▼
┌──────────────────────────────────────────────────────────────────┐
│ STEP 3: step3_analysis.py                                        │
│                                                                  │
│ Fungsi kunci:                                                    │
│   analyze_regional() → baca merged CSV, split hist vs fore       │
│     → compute: Hist_Mean, Hist_Std, Hist_Min, Hist_Max,          │
│                Fore_Mean, Fore_Std, Fore_Min, Fore_Max,          │
│                Absolute_Growth, Percentage_Growth                │
│     → regional_statistics.csv + regional_comparison.csv          │
│                                                                  │
│   analyze_provinsi() → sama untuk 6 provinsi                     │
│     → provinsi_statistics.csv + provinsi_comparison.csv          │
│                                                                  │
│   analyze_kabupaten() → sama untuk 119 kabupaten                 │
│     → kabupaten_statistics.csv + kabupaten_all_growth.csv        │
│       (di-sort by Absolute_Growth DESC)                          │
│                                                                  │
│ OUTPUT: public/web_data/                                         │
│   regional_comparison.csv    (3 row)                             │
│   regional_statistics.csv    (3 row)                             │
│   provinsi_comparison.csv    (6 row)                             │
│   provinsi_statistics.csv    (6 row)                             │
│   kabupaten_all_growth.csv   (119 row, 16 kolom)                 │
│   kabupaten_statistics.csv   (119 row)                           │
└──────────────────────────────────────────────────────────────────┘
```

### Detail Algoritma Ensemble

| Algoritma | Window | Fungsi | Rumus | Trend |
|-----------|--------|--------|-------|-------|
| **SMA** | 7 hari | `moving_average_forecast(df, 7)` | `mean(recent_7)` | `polyfit(x, recent_7, 1)[0]` |
| **WMA** | 14 hari | `weighted_moving_average(df, 14)` | `sum(data × exp_weights)` | `polyfit(x, recent_14, 1)[0]` |
| **SES** | α=0.3 | `exponential_smoothing(df, 0.3)` | `S[t] = 0.3x[t] + 0.7S[t-1]` | `polyfit(S[-30:], 1)[0]` |

**Formula Ensemble:**
```python
base_ens  = (ma_base + wma_base + ses_base) / 3
trend_ens = (ma_trend + wma_trend + ses_trend) / 3
forecast  = base_ens + trend_ens × d × 0.5     # d = hari ke depan
```

**Event-based logic (dalam `create_forecast`):**
```python
# Hari biasa:
forecast = base_ens + trend_ens × 0.5 × d + noise
forecast *= 1.05 if weekend else 1.0

# Hari event (25 Des – 7 Jan):
forecast = baseline × ny_event_factors[date]
# BUKAN pakai ensemble — ensemble tidak tahu ini malam tahun baru!
```

### Menjalankan

```bash
cd forecast_programs
python run_all.py          # Full pipeline (~5-10 menit)

# Atau per langkah:
python step1_forecast_total.py       # → forecast_results/01_main/
python step1_forecast_regional.py    # → forecast_results/02_regional/
python step1_forecast_provinsi.py    # → forecast_results/03_provinsi/
python step1_forecast_kabupaten.py   # → forecast_results/04_kabupaten/
python step2_merge_outputs.py        # → public/merged_outputs/
python step3_analysis.py             # → public/web_data/
```

---

## 3. Grafana Dashboard (PostgreSQL)

```
fetch_data_kpi/grafana/
├── gen_dashboard_pg.py               ← generator utama (PostgreSQL direct)
├── gen_dashboard.py                  ← backup (Infinity plugin via API)
├── grafana_dashboard_postgres.json   ← OUTPUT: import ke Grafana
├── grafana_dashboard.json            ← backup: versi Infinity
├── serve_kpi_api.py                  ← HTTP server CSV→JSON untuk Infinity
└── check_ranges.py                   ← util: cek date range data
```

### Arsitektur Generator

```
gen_dashboard_pg.py
│
├── Fungsi utilitas:
│   sql(query, ref="A")
│     → return {"datasource": {"type":"postgres","uid":"${DS_POSTGRES}"},
│               "format":"time_series", "rawSql": query, "refId": ref}
│
│   field(draw, unit, dec, vmin, vmax, stack)
│     → return fieldConfig defaults (drawStyle, fillOpacity, unit, min, max, stacking)
│
│   pnl(pid, title, targets, fieldConfig, x, y, w=8, h=8, overrides=[])
│     → return panel object lengkap (type:"timeseries", gridPos, fieldConfig, targets)
│
│   tfilter(col)
│     → return "$__timeFilter(date_column) AND {col} > 0"
│       (Grafana macro + positive-only filter)
│
├── Definisi chart 5G (c5): list of tuple
│   Format: (type, title, unit, decimals, vmin, vmax, sql_a, sql_b?)
│
│   Loop → untuk tiap tuple:
│     if type in (line,area,bar):   pnl(1 query, field(draw, unit, dec, min, max))
│     if type == "dualL":           pnl(2 query, field("line", unit, dec))
│     if type == "dualR":           pnl(2 query, field(...), overrides=[right-axis])
│
├── Definisi chart 4G (c4): sama seperti 5G
│
├── Definisi stacked charts:
│   Format: (stack|stackP, title, query_4g, query_5g)
│
│   Loop → untuk tiap tuple:
│     if "stackP":  field("bars", "percent", 0, min=0, max=110, stack="percent")
│     if "stack":   field("bars", "short"|"locale", 0, stack="normal")
│
├── Variable dashboard: ${DS_POSTGRES}
│   type: datasource, query: postgres
│   → user bisa switch Data KPI Local (localhost) ↔ Data KPI (remote ngrok)
│
└── Output: 24 panel timeseries (12 5G + 12 4G)
```

### Jenis Panel

| Kode | Panel Grafana | Setting Kunci | Contoh |
|------|-------------|--------------|--------|
| `line` | Time series, drawStyle:line | `unit: percent` | Availability, HO SR |
| `area` | Time series, drawStyle:bars + fillOpacity:70 | `unit: short` | Call Drop Rate, Traffic |
| `bar` | Time series, drawStyle:bars | `unit: percent/short` | Sgnb Addition, User |
| `dualL` | 2 target, drawStyle:line | shared left Y | EUT vs DL Thp |
| `dualR` | 2 target + override axisPlacement:right | unit:short di kanan | EUT vs Cells, PRB, CQI |
| `stack` | drawStyle:bars + stacking:normal | `unit: short/locale` | Traffic 4G-5G, RRC User |
| `stackP` | drawStyle:bars + stacking:percent | `min:0, max:110` | Ratio Traffic, Ratio RRC |

### Dual-Axis Override (dualR)

```python
right_label = c[7].split('AS "')[1].split('"')[0]  # ekstrak alias dari SQL
overrides = [{
    "matcher": {"id": "byName", "options": right_label},
    "properties": [
        {"id": "unit", "value": "short"},
        {"id": "custom.axisPlacement", "value": "right"}
    ]
}]
```

### Menjalankan

```bash
cd fetch_data_kpi/grafana
python gen_dashboard_pg.py
# → Import grafana_dashboard_postgres.json ke Grafana
#   Dashboards → New → Import → Upload JSON
#   Pilih datasource PostgreSQL via dropdown "Database"
```

---

## 4. PPT Generator (Python)

### File

```
fetch_data_kpi/
├── generate_ppt.py    ← single script
└── hasil/
    └── KPI_Monitoring_Dashboard_[timestamp].pptx
```

### Implementasi Utama

```python
# generate_ppt.py — Fungsi kunci:

# 1. Koneksi database
DB_CONFIG = {'host': '1.tcp.ap.ngrok.io', 'port': 21039, ...}
conn = psycopg2.connect(**DB_CONFIG)

# 2. Query per chart (5G: 14 chart, 4G: 13 chart)
#    SELECT date_column, MAX(avail_auto_5g)*100
#    FROM cluster_5g
#    WHERE date_column >= ... AND avail_auto_5g > 0
#    GROUP BY date_column ORDER BY date_column

# 3. matplotlib → chart image (in-memory BytesIO)
#    - scipy.interpolate.make_interp_spline → smoothing
#    - plt.fill_between → area chart
#    - plt.twinx() → dual axis

# 4. python-pptx → slide
#    prs = Presentation()
#    slide = prs.slides.add_slide(prs.slide_layouts[6])  # blank
#    slide.shapes.add_picture(BytesIO, Inches(x), Inches(y), ...)

# 5. Output
#    prs.save(f"../hasil/KPI_Monitoring_Dashboard_{timestamp}.pptx")
```

### Flow

```
PostgreSQL → psycopg2 query (27 query)
  → pandas DataFrame (per chart)
    → matplotlib: smoothing + styling
      → BytesIO (PNG in memory)
        → python-pptx: add_picture() ke slide
          → .pptx (~28 slide: cover + 14 5G + 13 4G)
```

### Menjalankan

```bash
cd fetch_data_kpi
python generate_ppt.py
# → ../hasil/KPI_Monitoring_Dashboard_YYYYMMDD_HHMMSS.pptx
```

---

## 5. KPI Data Pipeline (Python)

### File

```
fetch_data_kpi/
├── extract_parents.py     ← PostgreSQL → data_4g.csv + data_5g.csv (parent CSVs)
├── extract_features.py    ← parent CSV → per-feature CSV (27 file)
└── hasil/                 ← output folder lokal (backup)

web_data_aggregation/
└── aggregate_kpi.py       ← alternatif: baca parent CSV → generate semua langsung
```

### Implementasi Utama — extract_parents.py

```python
# Koneksi → query → extract → save

DB_CONFIG = {'host': '1.tcp.ap.ngrok.io', 'port': 21039, ...}

COLUMNS_4G = ['date_column', 'nc_5g', 'g4_avail_auto', 's1_failure', 'rrc_ue',
              'traffic_4g', 'eut_4g_bh', 'eut_4g_bh_count_less_31',
              'dl_prb_util', 'dl_prb_util_count_gt_09',
              'cqi_bh', 'cqi_less_than_7', 'dl_user_thp_bhv',
              'traffic_5g', 'da_5g']

COLUMNS_5G = ['date_column', 'nc_5g', 'avail_auto_5g', 'da_5g', 'g5_cdr',
              'sgnb_addition_sr', 'traffic_5g', 'g5_eut_bhv',
              'g5_userdl_thp', 'sum_en_dc_user_5g_wd',
              'g5_dlprb_util', 'dl_prb_util_5g_count_gt_085',
              'inter_esgnb', 'intra_esgnb',
              'intra_sgnb_intrafreq', 'inter_sgnb_intrafreq']

def fetch_from_db(days_back=None):
    """SELECT * FROM cluster_5g ORDER BY date_column ASC, nc_5g"""
    conn = psycopg2.connect(**DB_CONFIG)
    query = "SELECT * FROM cluster_5g ..."
    df = pd.read_sql(query, conn)
    conn.close()
    return df  # ~4590 rows

def extract_parent_csv(df, columns, name, output_dirs):
    """Filter kolom → simpan CSV ke public/kpi_data/ + hasil/"""
    available_cols = [c for c in columns if c in df.columns]
    subset = df[available_cols]
    for d in output_dirs:
        subset.to_csv(d / f"{name}.csv", index=False)
```

### Implementasi Utama — extract_features.py / aggregate_kpi.py

```python
# Config per chart:
CHARTS_5G = [
    {"name": "availability", "column": "avail_auto_5g",
     "transform_percent": True, "interval": 1, "filter_positive": True},
    {"name": "cdr", "column": "g5_cdr",
     "transform_percent": False, "interval": 2, "filter_positive": False},
    # ... 14 charts total
]

CHARTS_4G = [
    {"name": "availability", "column": "g4_avail_auto",
     "transform_percent": False, "interval": 3, "filter_positive": True},
    # ... 13 charts total
]

def aggregate_single_chart(df, config):
    """Pipeline per chart:"""
    # 1. MAX aggregation per date
    grouped = df.groupby('date_column')[param_col].max().reset_index()

    # 2. Transform percent (0-1 → 0-100)
    if config['transform_percent']:
        grouped['value'] = grouped['value'] * 100

    # 3. Filter positive values
    if config['filter_positive']:
        grouped = grouped[grouped['value'] > 0]

    # 4. Interval sampling dari END (reverse → sample → reverse)
    if interval > 1:
        reversed_df = grouped.iloc[::-1]
        sampled = reversed_df.iloc[::interval]
        grouped = sampled.iloc[::-1]

    # Output: date,value (2 kolom)
    return grouped[['date', 'value']]
```

### Pipeline Per Chart

```
data_5g.csv (parent, 15 kolom, ~4590 row)
  → aggregate_single_chart × 14
    → MAX(column) GROUP BY date  →  aggregate
    → ×100 (jika percent)       →  transform
    → filter value > 0          →  clean
    → sample every N from END   →  downsample
  → kpi_results/5g/{name}.csv   (date,value — 2 kolom)

data_4g.csv (parent, 15 kolom)
  → aggregate_single_chart × 13
  → kpi_results/4g/{name}.csv
```

### Perbedaan extract_features vs aggregate_kpi

| | extract_features.py | aggregate_kpi.py |
|---|---|---|
| **Lokasi** | `fetch_data_kpi/` | `web_data_aggregation/` |
| **Input** | parent CSV (fetch_data_kpi) | parent CSV (public/kpi_data) |
| **Output** | `public/kpi_results/` + `hasil/features/` | `kpi_outputs/` → auto-copy ke `public/kpi_results/` |
| **Config** | Hardcoded di script | Hardcoded di script (sama) |
| **Fungsi** | Sama | Sama (`aggregate_single_chart`) |

### Menjalankan

```bash
# Opsi A: Pipeline 2 langkah
cd fetch_data_kpi
python extract_parents.py       # Step 1: PostgreSQL → data_4g.csv + data_5g.csv
python extract_features.py      # Step 2: parent → 27 per-feature CSV

# Opsi B: Aggregator langsung
cd web_data_aggregation
python aggregate_kpi.py         # Baca parent CSV → generate semua + copy ke public/
```

---

## 📁 Struktur Folder Lengkap

```
Last/
├── src/                          ← React web dashboard
│   ├── pages/KPI/               ← FourG.tsx, FiveG.tsx
│   ├── pages/Forecast/          ← Regional.tsx, Provinsi.tsx, Kabupaten.tsx
│   ├── components/kpi/          ← 7 chart components
│   ├── components/forecast/     ← 5 forecast components
│   └── layout/                  ← AppLayout, AppSidebar, AppHeader
│
├── public/                       ← Static data (dibaca fetch() oleh React)
│   ├── kpi_data/                ← data_4g.csv, data_5g.csv (parent, ~4590 row)
│   ├── kpi_results/4g/          ← 13 CSV (date,value) — per chart 4G
│   ├── kpi_results/5g/          ← 14 CSV (date,value) — per chart 5G
│   ├── forecast_data/           ← regional/provinsi/kabupaten CSVs
│   ├── merged_outputs/          ← historical + forecast merged (LB/UB convention)
│   └── web_data/                ← statistics + comparison + growth CSVs
│
├── forecast_programs/            ← Python forecast pipeline
│   ├── run_all.py               ← orchestrator
│   ├── step1_forecast_*.py      ← ensemble forecasting (4 script)
│   ├── step2_merge_outputs.py   ← merge historical + forecast
│   ├── step3_analysis.py        ← statistics & growth analysis
│   └── forecast_results/        ← OUTPUT (CSV + PNG + Excel)
│
├── fetch_data_kpi/               ← KPI data + Grafana + PPT
│   ├── grafana/                 ← Dashboard JSON generator
│   │   ├── gen_dashboard_pg.py  ← generator utama (PostgreSQL)
│   │   └── gen_dashboard.py     ← backup (Infinity)
│   ├── generate_ppt.py          ← PPT generator
│   ├── extract_parents.py       ← PostgreSQL → data_4g.csv + data_5g.csv
│   ├── extract_features.py      ← parent → per-feature CSV
│   └── hasil/                   ← output folder lokal
│
├── web_data_aggregation/         ← Alt. KPI aggregator
│   └── aggregate_kpi.py
│
├── package.json                  ← React deps (React 19, ApexCharts, Tailwind)
├── vite.config.ts
├── tsconfig.json
└── README.md                     ← FILE INI
```

---

## 🔗 Data Flow Antar Sub-Proyek

```
                    PostgreSQL (cluster_5g)
                    Tabel: cluster_5g, ~4590 row
                   ┌──────────┬──────────┐
                   ▼          ▼          ▼
            extract_    generate_   gen_dashboard
            parents.py  ppt.py      _pg.py
                   │          │          │
                   ▼          ▼          ▼
            data_4g.csv   *.pptx    grafana_
            data_5g.csv             dashboard_
            (~4590 row)             postgres.json
                   │                     │
                   ▼                     ▼
            extract_features.py     Grafana UI
            / aggregate_kpi.py     (import JSON,
                   │                pilih datasource)
                   ▼
            kpi_results/
            4g/ (13 CSV)   5g/ (14 CSV)
            per chart: date,value
                   │
                   ▼
            Web Dashboard (React SPA)
            fetch() CSV → ApexCharts

Traffic_VLR_Java_2024-2025.xlsx
  (~45,934 row: 386 hari × 119 kabupaten)
                   │
                   ▼
            forecast_programs/
            step1 (4 script) → step2 → step3
                   │
                   ▼
            public/merged_outputs/  (128 CSV)
            public/web_data/        (6 CSV)
                   │
                   ▼
            Web Dashboard (Forecast tab)
```

---

## 🛠️ Tech Stack Lengkap

| Layer | Teknologi | Spesifik |
|-------|----------|----------|
| **Frontend** | React 19, TypeScript, Vite | TailAdmin template |
| **CSS** | Tailwind CSS 4 | PostCSS |
| **Charts (web)** | ApexCharts 4 | `react-apexcharts` |
| **Charts (python)** | Matplotlib, scipy | spline smoothing |
| **Forecast Engine** | NumPy, Pandas | pure, no ML libs |
| **Database** | PostgreSQL 16 | `psycopg2` connector |
| **Grafana** | Dashboard JSON schema v39 | timeseries panels |
| **PPT** | `python-pptx` | in-memory chart images |
| **Excel I/O** | `openpyxl` | read `.xlsx` |
| **HTTP Server** | Python `http.server` | serve CSV as JSON (Infinity backup) |

---

## ⚡ Quick Start

```bash
# 1. Install & run web dashboard
npm install && npm run dev            # → http://localhost:5173

# 2. Fetch KPI data dari PostgreSQL
cd fetch_data_kpi
python extract_parents.py             # → public/kpi_data/data_4g.csv + data_5g.csv
python extract_features.py            # → public/kpi_results/4g/*.csv + 5g/*.csv

# 3. Generate Grafana dashboard
cd grafana
python gen_dashboard_pg.py            # → grafana_dashboard_postgres.json
#    Import ke Grafana UI (Dashboards → New → Import)

# 4. Run forecast pipeline
cd forecast_programs
python run_all.py                     # → ~5-10 menit, 128 CSV + 119 PNG

# 5. Generate PPT
cd fetch_data_kpi
python generate_ppt.py                # → hasil/KPI_Monitoring_Dashboard_*.pptx
```
